import {
  AutoLinearProgress,
  Button,
  Checkbox,
  ConfirmationModal,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Label,
  Spinner,
  StatusToast,
  ToastDescription,
  ToastTitle,
} from "@/components";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AddNextSpeakersQueueEvent,
  BotTeamsRaiseHandUsersEvent,
  BotTeamsRaiseUnmuteCountEvent,
  ComputedMeetingUser,
  GetTranslatedDataRequest,
  JoinMeetingEvent,
  LeaveMeetingEvent,
  MeetingRoom,
  MeetingUser,
  SendMessageEvent,
  StartSpeakingEvent,
  StopSpeakingEvent,
  StreamingEvent,
  UpdateMessageEvent,
} from "@/features/meeting/types";
import {
  fetchMeetingDetails,
  fetchMeetingUsers,
  generateTranslateData,
  genTranslateDataTop5Messages,
  mapMeetingDetailsToMessages,
} from "@/features/meeting/queries";
import { QUERY_KEY } from "@/lib/constaints";
import { useQueryClient } from "@tanstack/react-query";
import { SOCKET_EVENT, useSocketClient } from "@/features/socket/socketClient";
import { produce } from "immer";
import { v4 as uuidv4 } from "uuid";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/main";
import { config } from "@/lib/config";
import {
  useDiscardMeetingMutation,
  useRemoveMeetingMutation,
  useSaveMeetingMutation,
} from "@/features/meeting/mutations";
import {
  HighlightedRange,
  Message,
  HighlightedData,
  ReplyMessage,
} from "@/features/messages/types";
import { CircleWarning } from "@/components/icons";
import { base64ToBlobUrl, decodeHtmlEntities } from "@/lib/utils";
import { MEETING_USER_ROLE } from "./MeetingSetting";
import { debounce } from "lodash";
import {
  FINE_TUNED_MODEL,
  SUMMARY_AI_TEMPLATE,
} from "@/features/record-audios/types";
import SoftNoticeSound from "@/assets/sounds/soft-notice.mp3";
import JoinMeetingSound from "@/assets/sounds/join_room.mp3";
import LeaveMeetingSound from "@/assets/sounds/leave_room.mp3";
import { RecognitionOptions, useCustomSpeechRecognition } from "@/hooks";
import { hideMetLgRecordBtn } from "@/features/ui/uiSlice";
import { useEventListener } from "usehooks-ts";
import { Trans, useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";
import { catchError } from "@/lib/trycatch";
import SpeakSlowlyRemindModal from "./SpeakSlowlyRemindModal";
import { useToast } from "@/components/ui/use-toast";
import { useTrackUserUsageMutation } from "@/features/current-user/mutations";
import { STT_MODE } from "@/features/settings/types";
import AudioOptionsSelect from "../record-audios/AudioOptionsSelect";

const PCMeeting = lazy(() => import("./pc/PCMeeting"));
const MobileMeeting = lazy(() => import("./mobile/MobileMeeting"));
const TeamsParticipantsSelectModal = lazy(
  () => import("./TeamsParticipantsSelectModal"),
);

export type MeetingRouteState = {
  currentUser: MeetingUser;
  meeting: MeetingRoom;
};

export const BLUR_MEETING_TIMEOUT = 3 * 60 * 1000; // 180 seconds
export const KICK_OUT_MEETING_TIMEOUT = 10 * 1000; // 10 seconds
export const BOT_NAME = "bot";

const StreamingMeeting = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const socket = useSocketClient();
  const { toast, dismiss } = useToast();
  const { currentUser, meeting } = location.state as MeetingRouteState;

  const removeMeetingMutation = useRemoveMeetingMutation();
  const saveMeetingMutation = useSaveMeetingMutation();
  const trackUserUsageMutation = useTrackUserUsageMutation();
  const discardMeetingMutation = useDiscardMeetingMutation();

  const clonedVoice = useSelector(
    (state: RootState) => state.setting.meetingVoice,
  );
  const ttsMode = useSelector((state: RootState) => state.setting.ttsMode);
  const translationMode = useSelector(
    (state: RootState) => state.setting.translationMode,
  );
  // play translated audio until user presses stop recorder button when false, otherwise when true
  const realtimeMode = useSelector(
    (state: RootState) => state.setting.realtimeMeetingMode,
  );
  const styleBertVits2 = useSelector(
    (state: RootState) => state.setting.styleBertVits2,
  );
  const audioSetting = useSelector(
    (state: RootState) => state.meeting.audioSetting,
  );
  const device = useSelector((state: RootState) => state.device);

  const dispatch = useDispatch();

  const [meetingUsers, setMeetingUsers] = useState<MeetingUser[]>([]);
  const [recording, setRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [speakingUserId, setSpeakingUserId] = useState<string | undefined>(
    undefined,
  );
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [nextSpeakersQueue, setNextSpeakersQueue] = useState<string[]>([]);
  const [openEndMeetingModal, setOpenEndMeetingModal] = useState(false);
  const [openSaveMeetingModal, setOpenSaveMeetingModal] = useState(false);
  const [openRemoveNoiseAndModelSetting, setOpenRemoveNoiseAndModelSetting] =
    useState(false);
  const [removeNoise, setRemoveNoise] = useState<boolean>(false);
  const [model, setModel] = useState<string>(FINE_TUNED_MODEL.GENERAL);
  const [masking, setMasking] = useState<boolean>(false);
  const [numSpeakers, setNumSpeakers] = useState<number>(0);
  const [analyzeSentiment, setAnalyzeSentiment] = useState<boolean>(false);
  const [enableSummaryAI, setEnableSummaryAI] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [fetchingMessages, setFetchingMessages] = useState(false);
  const [realtimeAudioMsgIdQueue, setRealtimeAudioMsgIdQueue] = useState<
    string[]
  >([]);
  const [summaryAITemplate, setSummaryAITemplate] = useState<string>(
    SUMMARY_AI_TEMPLATE.MEETING,
  );
  const [realtimePlayingMsgId, setRealtimePlayingMsgId] = useState<string>("");
  const [botJoined, setBotJoined] = useState(false);
  const [botUnmuteMoreThan1, setBotUnmuteMoreThan1] = useState(false);
  const [botHasLeft, setBotHasLeft] = useState(false);
  const [sttMode, setSTTMode] = useState<string>(STT_MODE.AZURE);

  const transcriptChunkIdx = useRef(0);
  const blurTimeout = useRef<any>(null);
  const speakingDurInterval = useRef<any>(null);
  const kickoutTimeout = useRef<any>(null);
  const fetchedUsers = useRef<boolean>(false);
  const fetchedDetails = useRef<boolean>(false);
  const meetingDurInterval = useRef<any>(null);
  const translatedAudioRef = useRef<HTMLAudioElement | null>(null);
  const originAudioRef = useRef<HTMLAudioElement | null>(null);
  const softNoticeRef = useRef<HTMLAudioElement>(null);
  const joinSoundRef = useRef<HTMLAudioElement>(null);
  const leaveSoundRef = useRef<HTMLAudioElement>(null);
  const hasBlurRef = useRef<any>(false);
  const lastFinalMsgChunkRef = useRef<Date | null>(null);
  const hasToastSpeakSlowlyIdRef = useRef<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>();
  const originGainRef = useRef<GainNode | null>(null);
  const translatedGainRef = useRef<GainNode | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const currentMsgIdRef = useRef<string | null>(null);

  const isAdmin = currentUser.role === MEETING_USER_ROLE.ADMIN;
  const showPCLayout = currentUser.role === MEETING_USER_ROLE.SECRETARY;
  const isStream = sttMode === STT_MODE.AZURE || sttMode === STT_MODE.MANUFACTURING;
  const botId = `bot_${meeting.meetingId}`;
  const notBotUsers = meetingUsers.filter((x) => x.userId !== botId);
  const hasBotUser = meetingUsers.some((x) => x.userId === botId);
  const isBotMeeting = !!meeting.bot_url;
  const isWaitingBot = isBotMeeting && !botJoined;
  const hasMultiLanguages =
    [...new Set(meetingUsers.map((x) => x.language))].length > 1;
  const notBotUsersLengthRef = useRef(notBotUsers.length);

  useEventListener("beforeunload", (event) => {
    event.preventDefault();
    event.returnValue = "";
  });
  useEventListener("unload", (event) => {
    console.log("User leaving the page.");
    socket.emit(SOCKET_EVENT.leave_channel, {
      meetingId: meeting.meetingId,
      userId: currentUser.userId,
      user: {
        userId: currentUser.userId,
        username: currentUser.username,
        language: currentUser.language,
      },
      stt_model: sttMode
    } as LeaveMeetingEvent);
  });
  useEventListener("focus", (event) => {
    if (blurTimeout.current) {
      clearTimeout(blurTimeout.current);
      blurTimeout.current = null;
      hasBlurRef.current = false;
    }
  });
  useEventListener("blur", (event) => {
    console.log("blur");
    hasBlurRef.current = true;
    if (hasBotUser) return;
    startBlurTimeout();
  });
  useEventListener("mousemove", (event) => {
    clearKickoutTimeout();
  });
  useEventListener("click", (event) => {
    clearKickoutTimeout();
  });
  useEventListener("keydown", (event) => {
    if (isBotMeeting || currentUser.role === MEETING_USER_ROLE.OBSERVER) {
      return;
    }
    if (isBotMeeting) return;
    const element = event.target as any;

    const notSpeakingCurrentUser =
      !!speakingUserId && speakingUserId !== currentUser.userId;
    if (event.code === "Space" && element.nodeName !== "TEXTAREA") {
      if (notSpeakingCurrentUser) {
        toggleHandReaction();
      } else {
        if (recording) {
          stopRecording();
        } else {
          startRecording();
        }
      }

      event.preventDefault();
    }
  });

  const {
    startRecognition,
    stopRecognition,
    transcript,
    finalTranscript,
    mediaRecorder,
  } = useCustomSpeechRecognition({
    stream: isStream,
    audioInputDeviceId: device.inputDevice.deviceId,
  });

  const initTwoChannelsAudio = async () => {
    const context = new AudioContext({ sampleRate: 16000 });
    audioCtxRef.current = context;
    originGainRef.current = context.createGain();
    originGainRef.current.gain.value = audioSetting.originVolume;
    translatedGainRef.current = context.createGain();
    translatedGainRef.current.gain.value = audioSetting.translatedVolume;
    const merger = context.createChannelMerger(2);
    originGainRef.current.connect(merger, 0, 0); // Left channel
    translatedGainRef.current.connect(merger, 0, 1); // Right channel

    const destination = context.createMediaStreamDestination();
    merger.connect(destination);

    const originOutput = new Audio();
    originOutput.crossOrigin = "anonymous";
    originOutput.srcObject = destination.stream;
    if (
      originOutput.setSinkId &&
      typeof originOutput.setSinkId === "function"
    ) {
      await originOutput.setSinkId(device.outputDevice.deviceId);
    }
    const originSource =
      audioCtxRef.current.createMediaElementSource(originOutput);
    originOutput.play();
    originAudioRef.current = originOutput;

    const translatedOutput = new Audio();
    translatedOutput.crossOrigin = "anonymous";
    if (
      translatedOutput.setSinkId &&
      typeof translatedOutput.setSinkId === "function"
    ) {
      await translatedOutput.setSinkId(device.outputDevice.deviceId);
    }
    const translatedSource =
      audioCtxRef.current.createMediaElementSource(translatedOutput);
    translatedAudioRef.current = translatedOutput;
    translatedSource.connect(translatedGainRef.current);

    // Load AudioWorkletProcessor for origin audio
    try {
      await context.audioWorklet.addModule(
        `${config.basename}/worklet/stream-audio-converter.js`,
      );

      workletNodeRef.current = new AudioWorkletNode(
        context,
        "stream-audio-converter",
      );
      workletNodeRef.current.connect(originGainRef.current);

      originSource.connect(workletNodeRef.current);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const heartBeatInterval = setInterval(() => {
      // if (!socket.connected) {
      //   socket.connect();
      //   return;
      // }

      socket.emit(SOCKET_EVENT.heart_beat, "heart_beat");
      trackUserUsageMutation.mutateAsync({
        key: "meeting_time_minutes",
        count: 60,
      });
    }, 1000 * 60);

    return () => {
      clearTimeout(blurTimeout.current);
      clearInterval(meetingDurInterval.current);
      clearInterval(speakingDurInterval.current);
      clearInterval(heartBeatInterval);
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.MEETING_DETAIL],
        refetchType: "none",
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.MEETING_TRANSLATED_DATA],
        refetchType: "none",
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.MEETING_TEAMS_PARTICIPANTS],
        refetchType: "none",
      });

      audioCtxRef.current && audioCtxRef.current.close();
      workletNodeRef.current && workletNodeRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!!speakingUserId) {
      dispatch(hideMetLgRecordBtn());
    }
  }, [speakingUserId]);

  useEffect(() => {
    const speakingMsg = messages.find((x) => x.id === currentMsgIdRef.current);
    if (!transcript || !speakingMsg) {
      return;
    }

    const messageEvent: SendMessageEvent = {
      meetingId: meeting.meetingId,
      userId: currentUser.userId,
      username: currentUser.username,
      email: currentUser.email,
      messageId: speakingMsg.id,
      chunkIndex: transcriptChunkIdx.current,
      originText: transcript,
      originLang: currentUser.language,
      speaking: true,
      createdAt: speakingMsg.createdAt,
    };
    socket.emit(SOCKET_EVENT.send_message, messageEvent);
  }, [transcript]);

  useEffect(() => {
    const speakingMsg = messages.find((x) => x.id === currentMsgIdRef.current);
    if (!finalTranscript || !speakingMsg) {
      return;
    }

    const messageEvent: SendMessageEvent = {
      meetingId: meeting.meetingId,
      userId: currentUser.userId,
      username: currentUser.username,
      email: currentUser.email,
      messageId: speakingMsg.id,
      chunkIndex: transcriptChunkIdx.current,
      originText: finalTranscript.text,
      originLang: currentUser.language,
      speaking: false,
      voiceId: clonedVoice.id,
      ttsMode,
      translationMode,
      originChunk: finalTranscript.audioChunk,
      createdAt: speakingMsg.createdAt,
      styleBertVits2,
    };

    // transcriptChunkIdx.current;
    socket.emit(SOCKET_EVENT.send_message, messageEvent);

    const newMsgId = uuidv4();
    currentMsgIdRef.current = newMsgId;
    setMessages(
      produce((prev) => {
        prev.push({
          id: newMsgId,
          originTexts: [],
          correctedTexts: [],
          audios: [],
          translatedAudios: [],
          translatedTexts: [],
          originLang: currentUser.language,
          targetLang: "",
          voiceId: clonedVoice.id,
          completed: true,
          userId: currentUser.userId,
          username: currentUser.username,
          createdAt: new Date().getTime(),
        });
      }),
    );
  }, [finalTranscript]);

  useEffect(() => {
    if (!meeting || !currentUser) return;

    const fetchMeetingMessages = async () => {
      // get message history
      setFetchingMessages(true);
      const [err, data] = await catchError(
        queryClient.fetchQuery({
          queryKey: [QUERY_KEY.MEETING_DETAIL],
          queryFn: () => fetchMeetingDetails(meeting.meetingId),
          staleTime: Infinity,
        }),
      );

      if (!data) {
        setFetchingMessages(false);
        return;
      }

      if(data.stt_model) {
        setSTTMode(data.stt_model);
      }

      const botUser = data.users[botId];
      if (botUser) {
        setBotJoined(true);
        if (botUser.left) {
          setBotHasLeft(true);
        }
      }

      const _messages = mapMeetingDetailsToMessages(data, currentUser.language);
      setMessages(_messages);
      setFetchingMessages(false);
      fetchedDetails.current = true;

      // get translated data for user's language that doesn't have
      let top5Messages = _messages.filter((x) => x.noTranslatedData).slice(-5);
      if (top5Messages.length === 0) return;

      const top5MessagesReq = top5Messages.map(
        (x) =>
          ({
            meetingId: meeting.meetingId,
            messageId: x.id,
            originText: x.correctedTexts[0],
            targetLang: currentUser.language,
            translationMode,
            ttsMode,
            voiceId: clonedVoice.id,
            userId: currentUser.userId,
            username: currentUser.username,
            styleBertVits2,
          }) as GetTranslatedDataRequest,
      );

      const [_, result] = await catchError(
        queryClient.fetchQuery({
          queryKey: [QUERY_KEY.MEETING_TRANSLATED_DATA, top5Messages],
          queryFn: () => genTranslateDataTop5Messages(top5MessagesReq),
          staleTime: Infinity,
        }),
      );

      if (!result) return;
      result.forEach((data) => {
        setMessages(
          produce((prev) => {
            const _item = prev.find((x) => x.id === data.messageId);
            if (!_item) return;
            const translatedText =
              data.translatedText[currentUser.language].text;
            const translatedAudio = `${config.apiBaseUrl}/audio/${data.translatedAudio}`;
            _item.translatedTexts = [decodeHtmlEntities(translatedText)];
            _item.translatedAudios = [[translatedAudio]];
            _item.translatedAudioDuration = data.translatedDuration;
            _item.noTranslatedData = false;
          }),
        );
      });
    };

    const countMeetingDuration = () => {
      meetingDurInterval.current = setInterval(() => {
        setMeetingDuration((prev) => prev + 1);
      }, 1000);
    };

    fetchMeetingMessages().then(() => {
      socket.emit(SOCKET_EVENT.join_channel, {
        meetingId: meeting.meetingId,
        ...currentUser,
      } as JoinMeetingEvent);
    });

    if (meeting.createdAt) {
      const dur = new Date().getTime() - meeting.createdAt;
      setMeetingDuration(Math.round(dur / 1000));
    }
    countMeetingDuration();
  }, [meeting, currentUser]);

  // to trigger play translated audio in order
  useEffect(() => {
    if (!realtimeMode && !!speakingUserId) {
      return;
    }

    if (!translatedAudioRef.current) {
      return;
    }

    if (!realtimeAudioMsgIdQueue[0] || realtimePlayingMsgId) {
      return;
    }

    const msgId = realtimeAudioMsgIdQueue[0];
    const msg = messages.find((x) => x.id === msgId);
    if (!msg || !msg.translatedAudios[0][0]) {
      realtimeAudioMsgIdQueue.shift();
      setRealtimeAudioMsgIdQueue([...realtimeAudioMsgIdQueue]);
      return;
    }

    translatedAudioRef.current.src = msg.translatedAudios[0][0];
    translatedAudioRef.current.play();
    setRealtimePlayingMsgId(msgId);
  }, [
    realtimeAudioMsgIdQueue,
    realtimePlayingMsgId,
    messages,
    realtimeMode,
    speakingUserId,
    device.outputDevice,
  ]);

  useEffect(() => {
    const audioElement = translatedAudioRef.current;
    if (!audioElement) return;

    const onRealtimeAudioEnd = () => {
      console.log("audio end");
      setRealtimePlayingMsgId("");
      if (realtimeAudioMsgIdQueue.length > 0) {
        realtimeAudioMsgIdQueue.shift();
        setRealtimeAudioMsgIdQueue([...realtimeAudioMsgIdQueue]);
      }
    };

    audioElement.addEventListener("ended", onRealtimeAudioEnd);
    audioElement.addEventListener("error", onRealtimeAudioEnd);

    return () => {
      audioElement.removeEventListener("ended", onRealtimeAudioEnd);
      audioElement.removeEventListener("error", onRealtimeAudioEnd);
    };
  }, [realtimeAudioMsgIdQueue, translatedAudioRef.current]);

  useEffect(() => {
    if (!translatedGainRef.current || !originGainRef.current) {
      return;
    }

    if (audioSetting.muted) {
      translatedGainRef.current.gain.value = 0;
      originGainRef.current.gain.value = 0;
    } else {
      translatedGainRef.current.gain.value = audioSetting.translatedVolume;
      originGainRef.current.gain.value = audioSetting.originVolume;
    }
  }, [audioSetting]);

  useEffect(() => {
    notBotUsersLengthRef.current = notBotUsers.length;
  }, [notBotUsers]);

  const countSpeakingDuration = useCallback((userId: string) => {
    if (speakingDurInterval.current) return;
    speakingDurInterval.current = setInterval(() => {
      setMeetingUsers(
        produce((prev) => {
          const user = prev.find((x) => x.userId === userId);

          if (!user) return;
          user.speakingDurationTime = (user.speakingDurationTime || 0) + 1;

          if (userId === currentUser.userId) {
            currentUser.speakingDurationTime = user.speakingDurationTime;
          }
        }),
      );
    }, 1000);
  }, []);

  const setSpeakingUserAndCountTime = useCallback(
    (userId: string) => {
      console.log("set speaking user and count time", userId);
      setSpeakingUserId(userId);
      countSpeakingDuration(userId);
    },
    [countSpeakingDuration],
  );

  const onStartSpeaking = useCallback(
    (data: StartSpeakingEvent) => {
      console.log("on start speaking", data);
      setMeetingUsers(
        produce((prev) => {
          const user = prev.find((x) => x.userId === data.user.userId);
          if (!user) return;

          user.startSpeakingTime = data.user.startSpeakingTime;
        }),
      );
      setSpeakingUserAndCountTime(data.user.userId);
    },
    [setSpeakingUserAndCountTime],
  );

  const onHandsReaction = useCallback((data: AddNextSpeakersQueueEvent) => {
    setNextSpeakersQueue(
      produce((prev) => {
        const index = prev.findIndex((x) => x === data.userId);
        // handle down hand when click raise hand again
        if (index > -1) {
          prev.splice(index, 1);
          return;
        }

        prev.push(data.userId);
      }),
    );
  }, []);

  const onBotRaiseHandUser = useCallback(
    (event: BotTeamsRaiseHandUsersEvent) => {
      if (!isBotMeeting) return;
      setNextSpeakersQueue(event.userIds);
    },
    [isBotMeeting],
  );

  const onBotUnmuteCount = useCallback(
    (event: BotTeamsRaiseUnmuteCountEvent) => {
      if (!isBotMeeting) return;
      setBotUnmuteMoreThan1(event.more_than_1);
    },
    [isBotMeeting],
  );

  // audioData is ArrayBuffer in normal meeting, base64 in bot meeting
  const playOriginStreamingAudio = useCallback(
    (audioData: any, isBot: boolean) => {
      if (!workletNodeRef.current) return;

      let int16Buffer = audioData;
      // if (isBot) {
      //   int16Buffer = base64ToInt16Array(audioData);
      // }

      workletNodeRef.current.port.postMessage(int16Buffer);
    },
    [],
  );

  const onHandleOriginAudio = useCallback(
    (data: StreamingEvent) => {
      if (data.userId === currentUser.userId) return;
      playOriginStreamingAudio(data.audioData, isBotMeeting);
    },
    [currentUser, isBotMeeting],
  );

  const onMessage = useCallback(
    async (data: SendMessageEvent) => {
      let audioPath = "";
      let audioDuration = 0;
      const isCurrentUser = data.userId === currentUser.userId;

      // Hightlight speaking user in Bot meeting
      if (data.userId && isBotMeeting && speakingUserId !== data.userId) {
        setSpeakingUserId(data.userId);
      }

      // check then toast if user speaks 15 seconds without stop in multi languages meeting
      if (isCurrentUser && data.originText.length > 0 && hasMultiLanguages) {
        // speaking flag is about to detect whether the msg chunk is final or not
        if (data.speaking) {
          if (!lastFinalMsgChunkRef.current) {
            lastFinalMsgChunkRef.current = new Date();
          } else {
            const diff =
              new Date().getTime() - lastFinalMsgChunkRef.current.getTime();

            if (diff >= 15000 && !hasToastSpeakSlowlyIdRef.current) {
              const { id } = toast({
                title: `⚠️ ${t(tMessages.common.speakSlowly())}`,
                duration: 0,
              });
              hasToastSpeakSlowlyIdRef.current = id;
            }
          }
        } else {
          lastFinalMsgChunkRef.current = null;
          hasToastSpeakSlowlyIdRef.current &&
            dismiss(hasToastSpeakSlowlyIdRef.current);
          hasToastSpeakSlowlyIdRef.current = null;
        }
      }

      // handle audio when data has user's language audio
      if (data.audioData?.language === currentUser.language) {
        // get audioPath to save in message item
        audioPath = `${config.apiBaseUrl}/audio/${data.audioData.path}`;
        audioDuration = data.audioData.translated_duration;
        if (data.audioData.translated_audio_data) {
          audioPath = base64ToBlobUrl(data.audioData.translated_audio_data);
        }

        if (!isCurrentUser && !data.editted) {
          // Add audio to queue to play in order for user whose's language is different from speaker
          if (data.audioData.origin_language !== currentUser.language) {
            setRealtimeAudioMsgIdQueue((prev) => [...prev, data.messageId]);
          }
        }
      }

      setMessages(
        produce((prevMessages) => {
          const msgIdx = prevMessages.findIndex((x) => x.id === data.messageId);
          let msg = prevMessages[msgIdx];
          if (!msg) {
            msg = {
              id: data.messageId,
              originTexts: [],
              correctedTexts: [],
              translatedAudios: [],
              translatedTexts: [],
              originLang: data.originLang,
              targetLang: "",
              voiceId: data.voiceId || "",
              completed: true,
              userId: data.userId,
              username: data.username,
              createdAt: data.createdAt || new Date().getTime(),
            };

            // handle in case receicing msg from last speaker while current user is speaking
            if (speakingUserId === data.userId) {
              prevMessages.push(msg);
            }
          }

          if (data.editted) {
            msg.originTexts = [];
            msg.correctedTexts = [];
            msg.translatedTexts = [];
          }

          msg.originTexts[data.chunkIndex] = data.originText;

          if (
            data.translatedData &&
            data.translatedData[currentUser.language]
          ) {
            msg.translatedTexts[data.chunkIndex] = decodeHtmlEntities(
              data.translatedData[currentUser.language].text,
            );
          }

          if (data.correctedText) {
            msg.correctedTexts[data.chunkIndex] = decodeHtmlEntities(
              data.correctedText,
            );
          }

          if (audioPath) {
            if (data.editted) {
              msg.translatedAudios = [];
            }

            msg.translatedAudios[data.chunkIndex] = [audioPath];
            msg.translatedAudioDuration =
              (msg.translatedAudioDuration || 0) + audioDuration;
          }
        }),
      );
    },
    [currentUser, isBotMeeting, hasMultiLanguages, speakingUserId],
  );

  const onUpdateMessage = useCallback(
    (data: UpdateMessageEvent) => {
      const user = meetingUsers.find((x) => x.userId === data.user_id);
      setMessages(
        produce((prev) => {
          const msg = prev.find((x) => x.id === data.message_id);
          if (!msg) return;

          // handle update message emojis
          if (data.emoji) {
            if (!msg.emojis) msg.emojis = [];
            const emojiIndex = msg.emojis.findIndex(
              (x) => x.name === data.emoji,
            );
            if (emojiIndex < 0) {
              msg.emojis.push({
                name: data.emoji,
                userIds: [data.user_id],
              });
              return;
            }

            const userIds = msg.emojis[emojiIndex].userIds;
            const userIdIndex = userIds.findIndex((x) => x === data.user_id);
            if (userIdIndex < 0) {
              userIds.push(data.user_id);
              return;
            }

            if (userIds.length === 1) {
              msg.emojis.splice(emojiIndex, 1);
            }
            userIds.splice(userIdIndex, 1);
          }

          // handle update message replies
          if (data.reply) {
            if (!msg.replies) {
              msg.replies = [];
            }

            const newReply: ReplyMessage = {
              id: data.reply.id,
              originTexts: [data.reply.message],
              correctedTexts: [data.reply.message],
              translatedTexts: [],
              translatedAudios: [],
              parent_id: msg.id,
              userId: data.user_id,
              username: data.username,
              originLang: user?.language || "",
              targetLang: "",
              createdAt: data.reply.createdAt,
            };
            msg.replies.push(newReply);
          }

          // handle update message annotations
          if (data.highlights) {
            console.log("update message annotations", data.highlights);
            msg.highlights = {
              origins: data.highlights.origins,
              translations: data.highlights.translations,
            };
          }
        }),
      );
    },
    [meetingUsers],
  );

  const fetchUsers = useCallback(
    async (meetingId: string) => {
      try {
        const data = await queryClient.fetchQuery({
          queryKey: [QUERY_KEY.MEETING_USERS, meetingId],
          queryFn: ({ queryKey }) => fetchMeetingUsers(queryKey[1]),
          staleTime: 0,
        });

        if (data) {
          // handle when an new user join after another user starting speak
          const speakingUserIndex = data.findIndex(
            (x) => x.isSpeaking && x.isSpeaking === true,
          );
          if (speakingUserIndex > -1) {
            const speakingItem = data[speakingUserIndex];
            if (speakingItem.startSpeakingTime) {
              const pastDurationSeconds = Math.floor(
                (new Date().getTime() - speakingItem.startSpeakingTime) / 1000,
              );
              speakingItem.speakingDurationTime =
                (speakingItem.speakingDurationTime || 0) + pastDurationSeconds;
            }
            data.splice(speakingUserIndex, 1);
            data.unshift(speakingItem);
            setSpeakingUserAndCountTime(speakingItem.userId);
          }

          // check meeting users includes bot user
          if (data.find((x) => x.userId === botId)) {
            setBotJoined(true);
          }

          setMeetingUsers([...data]);
        }
      } catch (err) {
      } finally {
        fetchedUsers.current = true;
      }
    },
    [setSpeakingUserAndCountTime],
  );

  const addActiveUserCenterMsg = useCallback(
    (username: string, status: boolean) => {
      const msg: Message = {
        id: uuidv4(),
        originTexts: [],
        correctedTexts: [],
        translatedAudios: [],
        translatedTexts: [],
        originLang: "",
        targetLang: "",
        voiceId: "",
        createdAt: new Date().getTime(),
        centerData: {
          activeUser: {
            username,
            status,
          },
        },
      };
      setMessages((prev) => [...prev, msg]);
    },
    [],
  );

  const onJoinChannel = useCallback(
    debounce(async (data: JoinMeetingEvent) => {
      if (data.meetingId !== meeting.meetingId) return;
      console.log("join channel", data);

      if (joinSoundRef.current) {
        joinSoundRef.current.play();
      }
      addActiveUserCenterMsg(data.username, true);

      if (!fetchedUsers.current) {
        await fetchUsers(meeting.meetingId);
        return;
      }

      if (meetingUsers.find((x) => x.userId === data.userId)) return;
      setMeetingUsers(
        produce((prev) => {
          prev.push({
            userId: data.userId,
            email: data.email,
            username: data.username,
            language: data.language,
            role: data.role,
          });
        }),
      );
      if (data.userId === botId) {
        setBotJoined(true);
        setBotHasLeft(false);
      }
    }, 500),
    [meetingUsers, fetchUsers, addActiveUserCenterMsg],
  );

  const startRecording = useCallback(async () => {
    setRecording(true);
    const options: RecognitionOptions = {
      meetingId: meeting.meetingId,
      userId: currentUser.userId,
      language: currentUser.language,
      silentThreshold: clonedVoice.silentThresholdSec,
      stream: isStream,
      stt_model: sttMode
    };
    startRecognition(options);

    currentUser.startSpeakingTime = new Date().getTime();
    const msgId = uuidv4();
    currentMsgIdRef.current = msgId;
    socket.emit(SOCKET_EVENT.start_speaking, {
      meetingId: meeting.meetingId,
      messageId: msgId,
      user: {
        ...currentUser,
        startSpeakingTime: currentUser.startSpeakingTime,
      },
    } as StartSpeakingEvent);

    transcriptChunkIdx.current = 0;
    setMessages(
      produce((prev) => {
        prev.push({
          id: msgId,
          originTexts: [],
          correctedTexts: [],
          audios: [],
          translatedAudios: [],
          translatedTexts: [],
          originLang: currentUser.language,
          targetLang: "",
          voiceId: clonedVoice.id,
          completed: true,
          userId: currentUser.userId,
          username: currentUser.username,
          createdAt: new Date().getTime(),
        });
      }),
    );
  }, [meeting, currentUser, clonedVoice, sttMode]);

  const handleStopSpeaking = useCallback(() => {
    setSpeakingUserId(undefined);
    clearInterval(speakingDurInterval.current);
    speakingDurInterval.current = null;

    // handle start speaking for next speaker
    const nextSpeakerId = nextSpeakersQueue[0];
    if (nextSpeakerId === currentUser.userId) {
      setTimeout(() => {
        startRecording();
      }, 200);
      if (softNoticeRef.current) {
        softNoticeRef.current.play();
      }
    }
    if (nextSpeakerId) {
      setNextSpeakersQueue((prev) => [...prev.slice(1)]);
    }
  }, [nextSpeakersQueue]);

  const onStopSpeaking = useCallback(
    (data: StopSpeakingEvent) => {
      console.log("on stop speaking", data);
      handleStopSpeaking();
    },
    [handleStopSpeaking],
  );

  const handleRemoveMeetingUser = useCallback((userId: string) => {
    console.log("handle remove meeting user");
    setMeetingUsers(
      produce((prev) => {
        const index = prev.findIndex((x) => x.userId === userId);
        if (index > -1) {
          prev.splice(index, 1);
        }
      }),
    );
  }, []);

  const handleRemoveNextSpeaker = useCallback(
    (userId: string) => {
      const nextSpeakerIndex = nextSpeakersQueue.findIndex((x) => x === userId);
      if (nextSpeakerIndex > -1) {
        setNextSpeakersQueue(
          produce((prev) => {
            prev.splice(nextSpeakerIndex, 1);
          }),
        );
      }
    },
    [nextSpeakersQueue],
  );

  const handleLeaveOrDisconnect = useCallback(
    (userId: string) => {
      handleRemoveMeetingUser(userId);
      if (speakingUserId === userId) {
        handleStopSpeaking();
      } else {
        handleRemoveNextSpeaker(userId);
      }
    },
    [
      speakingUserId,
      handleStopSpeaking,
      handleRemoveMeetingUser,
      handleRemoveNextSpeaker,
    ],
  );

  const onLeaveChannel = useCallback(
    (data: LeaveMeetingEvent) => {
      if (data.meetingId !== meeting.meetingId) return;
      console.log("leave channel");

      if (data.userId) {
        if (leaveSoundRef.current) {
          leaveSoundRef.current.play();
        }

        handleLeaveOrDisconnect(data.userId);
        if (data.userId === botId) {
          if (hasBlurRef.current) {
            startBlurTimeout();
          }
          setBotHasLeft(true);
        }

        addActiveUserCenterMsg(data.user?.username || "", false);
      }

      if (data.removeMeeting || data.userId === currentUser.userId) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY.MEETING_LIST],
        });
        navigate("/meeting-setting");
        return;
      }
    },
    [handleLeaveOrDisconnect, meeting, addActiveUserCenterMsg],
  );

  const onSocketReconnect = useCallback(() => {
    console.log("socket reconnect");
    if (!fetchedDetails.current) return;
    console.log("join channel after fetch meeting details");
    socket.emit(SOCKET_EVENT.join_channel, {
      meetingId: meeting.meetingId,
      ...currentUser,
    } as JoinMeetingEvent);
  }, [meeting, currentUser]);

  const onMeetingStopAlert = useCallback(() => {
    toast({
      title: t(tMessages.common.meetingStopAlert()),
      duration: 5000,
    });
  }, []);

  useEffect(() => {
    socket.on(SOCKET_EVENT.connect, onSocketReconnect);
    socket.on(SOCKET_EVENT.send_message, onMessage);
    socket.on(SOCKET_EVENT.update_message, onUpdateMessage);
    socket.on(SOCKET_EVENT.join_channel, onJoinChannel);
    socket.on(SOCKET_EVENT.leave_channel, onLeaveChannel);
    socket.on(SOCKET_EVENT.start_speaking, onStartSpeaking);
    socket.on(SOCKET_EVENT.stop_speaking, onStopSpeaking);
    socket.on(SOCKET_EVENT.hands_reaction, onHandsReaction);
    socket.on(SOCKET_EVENT.bot_teams_raise_hand_users, onBotRaiseHandUser);
    socket.on(SOCKET_EVENT.bot_teams_unmute_count, onBotUnmuteCount);
    socket.on(SOCKET_EVENT.real_audio_streaming, onHandleOriginAudio);
    socket.on(SOCKET_EVENT.meeting_stop_alert, onMeetingStopAlert);

    return () => {
      socket.off(SOCKET_EVENT.connect, onSocketReconnect);
      socket.off(SOCKET_EVENT.send_message, onMessage);
      socket.off(SOCKET_EVENT.update_message, onUpdateMessage);
      socket.off(SOCKET_EVENT.join_channel, onJoinChannel);
      socket.off(SOCKET_EVENT.leave_channel, onLeaveChannel);
      socket.off(SOCKET_EVENT.start_speaking, onStartSpeaking);
      socket.off(SOCKET_EVENT.stop_speaking, onStopSpeaking);
      socket.off(SOCKET_EVENT.hands_reaction, onHandsReaction);
      socket.off(SOCKET_EVENT.bot_teams_raise_hand_users, onBotRaiseHandUser);
      socket.off(SOCKET_EVENT.bot_teams_unmute_count, onBotUnmuteCount);
      socket.off(SOCKET_EVENT.real_audio_streaming, onHandleOriginAudio);
      socket.off(SOCKET_EVENT.meeting_stop_alert, onMeetingStopAlert);
    };
  }, [
    socket,
    onMessage,
    onUpdateMessage,
    onJoinChannel,
    onLeaveChannel,
    onStartSpeaking,
    onStopSpeaking,
    onHandsReaction,
    onBotRaiseHandUser,
    onBotUnmuteCount,
    onHandleOriginAudio,
    onMeetingStopAlert,
  ]);

  const leaveMeeting = useCallback(async () => {
    try {
      const event: LeaveMeetingEvent = {
        meetingId: meeting.meetingId,
        userId: currentUser.userId,
        removeMeeting: false,
        language: currentUser.language,
        user: {
          userId: currentUser.userId,
          username: currentUser.username,
          language: currentUser.language,
        },
        stt_model: sttMode
      };

      if (notBotUsers.length === 1 || isAdmin) {
        event.removeMeeting = true;
      }

      socket.emit(SOCKET_EVENT.leave_channel, event);
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.MEETING_LIST],
      });
      if (leaveSoundRef.current) {
        leaveSoundRef.current.play();
      }

      trackUserUsageMutation.mutateAsync({
        key: "meeting_time_minutes",
        count: meetingDuration % 60,
      });
      navigate("/meeting-setting");
    } catch (err) {}
  }, [notBotUsers, sttMode]);

  const stopRecording = useCallback(() => {
    setRecording(false);
    stopRecognition();
    socket.emit(SOCKET_EVENT.stop_speaking, {
      meetingId: meeting.meetingId,
      user: currentUser,
      stt_model: sttMode
    } as StopSpeakingEvent);
  }, [sttMode]);

  const setKickoutTimeout = () => {
    kickoutTimeout.current = setTimeout(() => {
      console.log("kickout", notBotUsersLengthRef.current);
      if (notBotUsersLengthRef.current == 1) {
        setOpenSaveMeetingModal(true);
      } else {
        recording && stopRecording();
        leaveMeeting();
      }
    }, KICK_OUT_MEETING_TIMEOUT);
  };

  const clearKickoutTimeout = () => {
    clearTimeout(kickoutTimeout.current);
    kickoutTimeout.current = null;
    setShowToast(false);
  };

  const startBlurTimeout = () => {
    blurTimeout.current = setTimeout(() => {
      console.log("show toast");
      setShowToast(true);
      setKickoutTimeout();
    }, BLUR_MEETING_TIMEOUT);
  };

  const clickLeaveMeeting = useCallback(async () => {
    if (notBotUsers.length === 1 || isAdmin) {
      setOpenEndMeetingModal(true);
      return;
    }

    leaveMeeting();
  }, [notBotUsers]);

  const confirmEndMeeting = useCallback(() => {
    setOpenEndMeetingModal(false);
    setOpenSaveMeetingModal(true);
  }, []);

  const confirmSaveMeeting = useCallback(async () => {
    try {
      setSaving(true);
      const saved = await saveMeetingMutation.mutateAsync({
        meetingId: meeting.meetingId,
        removeNoise,
        model,
        masking,
        analyze_sentiment: analyzeSentiment,
        enableAISummary: enableSummaryAI,
        summaryAITemplate: summaryAITemplate,
        numSpeakers: numSpeakers,
      });
      setOpenSaveMeetingModal(false);

      removeMeetingMutation.mutateAsync(meeting.meetingId);
      leaveMeeting();
    } catch (err) {
    } finally {
      setSaving(false);
    }
  }, [removeNoise, model, masking, leaveMeeting]);

  const dontSaveMeeting = useCallback(async () => {
    setOpenSaveMeetingModal(false);
    catchError(discardMeetingMutation.mutateAsync(meeting.meetingId));
    leaveMeeting();
  }, [leaveMeeting]);

  const toggleHandReaction = useCallback(() => {
    const event: AddNextSpeakersQueueEvent = {
      meetingId: meeting.meetingId,
      userId: currentUser.userId,
    };
    socket.emit(SOCKET_EVENT.hands_reaction, event);
  }, []);

  const onReactEmoji = useCallback((messageId: string, emoji: string) => {
    socket.emit(SOCKET_EVENT.update_message, {
      meeting_id: meeting.meetingId,
      user_id: currentUser.userId,
      username: currentUser.username,
      message_id: messageId,
      emoji,
    } as UpdateMessageEvent);
  }, []);

  const onReplyMessage = useCallback((messageId: string, text: string) => {
    socket.emit(SOCKET_EVENT.update_message, {
      meeting_id: meeting.meetingId,
      user_id: currentUser.userId,
      username: currentUser.username,
      message_id: messageId,
      reply: {
        id: uuidv4(),
        message: text,
        createdAt: new Date().getTime(),
      },
    } as UpdateMessageEvent);
  }, []);

  const onEditMessage = useCallback(
    (messageId: string, text: string) => {
      const msg = messages.find((x) => x.id === messageId);
      if (!msg) return;
      const messageEvent: SendMessageEvent = {
        meetingId: meeting.meetingId,
        userId: currentUser.userId,
        username: currentUser.username,
        email: currentUser.email,
        messageId: messageId,
        chunkIndex: 0,
        originText: text,
        originLang: currentUser.language,
        speaking: false,
        voiceId: clonedVoice.id,
        ttsMode,
        translationMode,
        editted: true,
        createdAt: msg.createdAt,
      };
      socket.emit(SOCKET_EVENT.send_message, messageEvent);
    },
    [messages],
  );

  const onGetTranslatedData = useCallback(
    async (messageId: string) => {
      const msgIdx = messages.findIndex((x) => x.id === messageId);
      const msg = messages[msgIdx];
      if (!msg) return;

      const payload: GetTranslatedDataRequest = {
        meetingId: meeting.meetingId,
        messageId,
        originText: msg.correctedTexts[0],
        targetLang: currentUser.language,
        translationMode,
        ttsMode,
        voiceId: clonedVoice.id,
        userId: currentUser.userId,
        username: currentUser.username,
        styleBertVits2,
      };

      const [_, result] = await catchError(
        queryClient.fetchQuery({
          queryKey: [QUERY_KEY.MEETING_TRANSLATED_DATA, messageId],
          queryFn: () => generateTranslateData(payload),
          staleTime: Infinity,
        }),
      );

      if (!result) return;

      const translatedText = result.translatedText[currentUser.language].text;
      const translatedAudio = `${config.apiBaseUrl}/audio/${result.translatedAudio}`;

      if (translatedText && translatedAudio) {
        setMessages(
          produce((prev) => {
            prev[msgIdx].translatedTexts = [decodeHtmlEntities(translatedText)];
            prev[msgIdx].translatedAudios = [[translatedAudio]];
            prev[msgIdx].translatedAudioDuration = result.translatedDuration;
            prev[msgIdx].noTranslatedData = false;
          }),
        );
      }
    },
    [messages],
  );

  const onHighlightMessage = useCallback(
    (messageId: string, key: keyof HighlightedData, data: HighlightedRange) => {
      const msg = messages.find((x) => x.id === messageId);
      if (!msg) return;

      let highlightedItems: HighlightedRange[] = [];
      if (msg.highlights && msg.highlights[key]) {
        if (key === "origins") {
          highlightedItems = Array.from(msg.highlights[key]) || [];
        } else {
          highlightedItems = Array.from(
            msg.highlights.translations[currentUser.language] || [],
          );
        }
      }

      const existIndex = highlightedItems.findIndex(
        (x) => x.start === data.start,
      );
      if (existIndex > -1) {
        highlightedItems.splice(existIndex, 1);
      } else {
        highlightedItems.push(data);
      }

      let highlights = {};
      if (key === "origins") {
        highlights = { ...msg.highlights, origins: highlightedItems };
      } else {
        highlights = {
          ...msg.highlights,
          translations: {
            ...msg.highlights?.translations,
            [currentUser.language]: highlightedItems,
          },
        };
      }

      socket.emit(SOCKET_EVENT.update_message, {
        meeting_id: meeting.meetingId,
        user_id: currentUser.userId,
        username: currentUser.username,
        message_id: messageId,
        highlights,
      } as UpdateMessageEvent);
    },
    [messages],
  );

  const computedUsers: ComputedMeetingUser[] = useMemo(() => {
    const result: ComputedMeetingUser[] = [];
    const users = Array.from(meetingUsers);

    for (const speakerId of nextSpeakersQueue) {
      const index = users.findIndex((x) => x.userId === speakerId);
      if (index > -1) {
        result.push({ ...users[index], isNextSpeaker: true });
        users.splice(index, 1);
      }
    }

    const speakingUserIndex = users.findIndex(
      (user) => user.userId === speakingUserId,
    );
    if (speakingUserIndex > -1) {
      result.push(users[speakingUserIndex]);
      users.splice(speakingUserIndex, 1);
    }

    result.push(...users);
    return result;
  }, [meetingUsers, nextSpeakersQueue, speakingUserId]);

  return (
    <Suspense fallback={<></>}>
      {showPCLayout ? (
        <PCMeeting
          fetchingMessages={fetchingMessages}
          messages={messages}
          computedUsers={computedUsers}
          recording={recording}
          speakingUserId={speakingUserId}
          realtimePlayingMsgId={realtimePlayingMsgId}
          startRecording={startRecording}
          stopRecording={stopRecording}
          toggleHandReaction={toggleHandReaction}
          clickLeaveMeeting={clickLeaveMeeting}
          meetingDuration={meetingDuration}
          meetingUsers={meetingUsers}
          mediaRecorder={mediaRecorder || undefined}
          onReactEmoji={onReactEmoji}
          onReplyMessage={onReplyMessage}
          onEditMessage={onEditMessage}
          onHighlight={onHighlightMessage}
        />
      ) : (
        <MobileMeeting
          fetchingMessages={fetchingMessages}
          messages={messages}
          computedUsers={computedUsers}
          recording={recording}
          speakingUserId={speakingUserId}
          realtimePlayingMsgId={realtimePlayingMsgId}
          botUnmuteMoreThan1={botUnmuteMoreThan1}
          isWaitingBot={isWaitingBot}
          botHasLeft={botHasLeft}
          startRecording={startRecording}
          stopRecording={stopRecording}
          toggleHandReaction={toggleHandReaction}
          clickLeaveMeeting={clickLeaveMeeting}
          mediaRecorder={mediaRecorder || undefined}
          onReactEmoji={onReactEmoji}
          onReplyMessage={onReplyMessage}
          onEditMessage={onEditMessage}
          onGetTranslatedData={onGetTranslatedData}
          onHighlight={onHighlightMessage}
        />
      )}

      <audio
        src={SoftNoticeSound}
        ref={softNoticeRef}
        className="hidden"
      ></audio>
      <audio
        src={JoinMeetingSound}
        ref={joinSoundRef}
        className="hidden"
      ></audio>
      <audio
        src={LeaveMeetingSound}
        ref={leaveSoundRef}
        className="hidden"
      ></audio>

      <ConfirmationModal
        open={openEndMeetingModal}
        onOpenChange={setOpenEndMeetingModal}
        onConfirm={confirmEndMeeting}
        onClose={() => setOpenEndMeetingModal(false)}
        title={
          isAdmin
            ? t(tMessages.common.chairPersonEndMeetingConfirm())
            : t(tMessages.common.endMeetingConfirm())
        }
        confirmTitle={t(tMessages.common.end())}
        closeTitle={t(tMessages.common.cancel())}
      />

      <ConfirmationModal
        open={openSaveMeetingModal}
        onOpenChange={setOpenSaveMeetingModal}
        onConfirm={() => {
          setOpenSaveMeetingModal(false);
          setOpenRemoveNoiseAndModelSetting(true);
        }}
        onClose={dontSaveMeeting}
        title={t(tMessages.common.saveMeetingConfirm())}
        closeTitle={t(tMessages.common.noSave())}
        confirmTitle={t(tMessages.common.save())}
        confirmClasses="bg-success/90 hover:bg-success transition duration-200 hover:shadow-success"
      />

      <ConfirmationModal
        open={openRemoveNoiseAndModelSetting}
        onClose={() => setOpenRemoveNoiseAndModelSetting(false)}
      >
        <div className="w-full space-y-2">
          <AudioOptionsSelect
            removeNoise={removeNoise}
            setRemoveNoise={setRemoveNoise}
            masking={masking}
            setMasking={setMasking}
            model={model}
            setModel={setModel}
            analyzeSentiment={analyzeSentiment}
            setAnalyzeSentiment={setAnalyzeSentiment}
            enableSummaryAI={enableSummaryAI}
            setEnableSummaryAI={setEnableSummaryAI}
            summaryAITemplate={summaryAITemplate}
            setSummaryAITemplate={setSummaryAITemplate}
            numSpeakers={numSpeakers}
            setNumSpeakers={setNumSpeakers}
          />

          <div className="mt-6 flex justify-end gap-2">
            <Button
              className="border bg-transparent"
              onClick={() => {
                setOpenRemoveNoiseAndModelSetting(false);
                setOpenSaveMeetingModal(true);
              }}
              disabled={saving}
            >
              {t(tMessages.common.return())}
            </Button>
            <Button
              className="bg-success/90 transition duration-200 hover:bg-success hover:shadow-success"
              onClick={confirmSaveMeeting}
              disabled={saving}
            >
              {saving ? (
                <Spinner className="size-4" />
              ) : (
                t(tMessages.common.save())
              )}
            </Button>
          </div>
        </div>
      </ConfirmationModal>

      {isBotMeeting && (
        <TeamsParticipantsSelectModal openWhenBotJoined={botJoined} />
      )}

      <SpeakSlowlyRemindModal
        onClose={leaveMeeting}
        onConfirm={initTwoChannelsAudio}
      />

      {showToast && (
        <StatusToast duration={10000} variant="alert">
          <div className="flex items-center gap-2">
            <CircleWarning fill="#ffc233" />
            <div className="grid w-full gap-1">
              <ToastTitle className="text-alert-60">
                {t(tMessages.common.kickoutIn10Sec())}
              </ToastTitle>

              <ToastDescription className="text-alert-40">
                {t(tMessages.common.tapToStay())}
              </ToastDescription>
            </div>
          </div>

          <AutoLinearProgress
            duration={KICK_OUT_MEETING_TIMEOUT}
            className="absolute -left-2 bottom-0 h-[3px] bg-alert-90"
            progressClassName="bg-alert-60"
          />
        </StatusToast>
      )}
    </Suspense>
  );
};

export default StreamingMeeting;
