import {
  BackdropOverlay,
  Button,
  Container,
  Header,
  HorizontalTransition,
  IconButton,
  Spinner,
  BlinkingDot,
} from "@/components";
import { format, fromUnixTime } from "date-fns";
import WaveForm from "./waveform.png";
import { useAudioRecorder } from "react-audio-voice-recorder";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  secondsToTimer,
  timerToSeconds,
  secondsToDurationFormat,
} from "@/lib/utils";
import { useDispatch, useSelector } from "react-redux";
import { hideNavTab, showNavTab } from "@/features/ui/uiSlice";
import {
  CircleLeftArrowIcon,
  PauseCircle,
  CircleCheckIcon,
  ShareNetworkIcon,
  TwoArrowsInIcon,
  FourArrowsOutIcon,
} from "@/components/icons";

import { add } from "date-fns";
import { useNavigate } from "react-router-dom";
//@ts-ignore
import { LiveAudioVisualizer, AudioVisualizer } from "react-audio-visualize";
import {
  useUploadAiPlatformAudioMutation,
  useUploadRecordAudioMutation,
  useUploadAIPlatformAgentMutation,
} from "@/features/record-audios/mutations";
import {
  FINE_TUNED_MODEL,
  RECORDED_AUDIO_TYPE,
  UploadAIPlatformHistoryRequest,
  UploadAudioRequest,
  UploadAIPlatformAgentRequest,
  SUMMARY_AI_TEMPLATE,
} from "@/features/record-audios/types";
import { motion, AnimatePresence } from "motion/react";
import {
  DownloadIcon,
} from "@radix-ui/react-icons";
import ProfileDropdown from "../account-setting/ProfileDropdown";
import { ConfirmationModal } from "@/components";
import { RootState } from "@/main";
import StartRecordingSound from "@/assets/sounds/start_recording.mp3";
import { useEventListener } from "usehooks-ts";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";
import PlayPauseRecord from "./PlayPauseRecord";
import {
  LocationErrorType,
  useCurrentUser,
  useFFmpegConverter,
  useUserLocation,
} from "@/hooks";
import ButtonHoldStop from "./ButtonHoldStop";
import UserMetadataModal from "./UserMetadataModal";
import { SOCKET_EVENT, useSocketClient } from "@/features/socket/socketClient";
import { v4 as uuidv4 } from "uuid";
import { MEETING_USER_ROLE } from "../meeting/MeetingSetting";
import { JoinMeetingEvent, LeaveMeetingEvent, MeetingUser } from "@/features/meeting/types";
import { config } from "@/lib/config";
import { useToast } from "@/components/ui/use-toast";
import {
  useCreateMeetingRecordingMutation,
  useSaveRecordingMeetingMutation,
} from "@/features/recording-meeting/mutations";
import {
  RECORDING_STATUS_ENUM,
  SaveRecordingMeetingRequest,
} from "@/features/recording-meeting/types";
import { useDiscardMeetingMutation } from "@/features/meeting/mutations";
import { catchError } from "@/lib/trycatch";
import AudioOptionsSelect from "../record-audios/AudioOptionsSelect";
import { TUTORIAL_TARGET } from "../tutorials/steps";
import RecordingMeetingSettingModal from "../record-audios/RecordingMeetingSettingModal";

enum RECORD_STEP {
  IDLE = "IDLE",
  RECORDING = "RECORDING",
  SELECTING = "SELECTING",
}

enum REMOVE_NOISE_ENUM {
  YES = "yes",
  NO = "no",
}

const Recorder = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useCurrentUser();
  const socket = useSocketClient();
  const invervalRef = useRef<any>(null);
  const waveformRef = useRef<any>(null);
  const customNames = useSelector(
    (state: RootState) => state.setting.customNames,
  );
  const censoredWords = useSelector(
    (state: RootState) => state.setting.censoredWords,
  );
  const recorderSetting = useSelector(
    (state: RootState) => state.setting.recorderMeeting,
  );
  const sttMode = useSelector((state: RootState) => state.setting.sttMode);

  // const uploadRecordAudioMutation = useUploadRecordAudioMutation();
  // const saveAIPlatformHistoryMutation = useUploadAiPlatformAudioMutation();
  // const createMeetingRecordingMutation = useCreateMeetingRecordingMutation();
  // const saveRecordingMeetingMutation = useSaveRecordingMeetingMutation();
  // const saveAIPlatformAgentMutation = useUploadAIPlatformAgentMutation();
  // const discardMeetingMutation = useDiscardMeetingMutation();

  const { load, convertWebmToMp3, loaded } = useFFmpegConverter();
  const { location, address, isLoading, error } = useUserLocation();
  const { currentUser, setting: userSetting } = useCurrentUser();

  const {
    startRecording,
    stopRecording,
    recordingBlob,
    isRecording,
    recordingTime,
    mediaRecorder,
    togglePauseResume,
  } = useAudioRecorder();

  const [downloading, setDownloading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [startedAt, setStartedAt] = useState(new Date());
  const [timer, setTimer] = useState("00:00:00");
  const [step, setStep] = useState(RECORD_STEP.IDLE);
  const [model, setModel] = useState<string>(FINE_TUNED_MODEL.GENERAL);
  const [numSpeakers, setNumSpeakers] = useState<number>(0);
  const [removeNoise, setRemoveNoise] = useState(false);
  const [isBack, setIsBack] = useState(true);
  const [openSaveRecordModal, setOpenSaveRecordModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pause, setPause] = useState(false);
  const [showRecordElems, setShowRecordElems] = useState(true);
  const [showPlayPauseBtn, setShowPlayPauseBtn] = useState(false);
  const [masking, setMasking] = useState<boolean>(false);
  const [analyzeSentiment, setAnalyzeSentiment] = useState<boolean>(false);
  const [enableSummaryAI, setEnableSummaryAI] = useState<boolean>(true);
  const [summaryAITemplate, setSummaryAITemplate] = useState<string>(
    SUMMARY_AI_TEMPLATE.MEETING,
  );
  const [openCreateMeetingSettingModal, setOpenCreateMeetingSettingModal] =
    useState(false);

  const recordingSoundRef = useRef<HTMLAudioElement>(null);
  const recordingBlobRef = useRef<Blob | undefined>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const meetingIdRef = useRef<string>("");
  const recordingIdRef = useRef<string>("");
  const meetingUserRef = useRef<MeetingUser | undefined>(undefined);
  const numSpeakersRef = useRef<number>(1);
  const seletecLanguage = useRef<string>(userSetting.language);

  const whisperSTTMode = false;
  const canCreateMeeting = recorderSetting.entityExtraction;
  const canTranscriptSharing = recorderSetting.transcriptSharing;
  const showShareLink = canCreateMeeting && canTranscriptSharing && isRecording;
  const shareAiPlatform = canCreateMeeting && canTranscriptSharing;
  const showBackdropLoading = uploading || downloading;

  useEffect(() => {
    console.log("numSpeakers=", numSpeakers);
  }, [numSpeakers]);

  useEventListener("beforeunload", (event) => {
    if (step === RECORD_STEP.IDLE) {
      return;
    }
    event.preventDefault();
    event.returnValue = "";
  });

  useEventListener("unload", (event) => {
    if (step === RECORD_STEP.IDLE) {
      return;
    }

    if (canCreateMeeting) {
      leaveMeeting();
    }
  });

  useEffect(() => {
    return () => {
      if (invervalRef.current) {
        clearInterval(invervalRef.current);
        dispatch(showNavTab());
      }

      if (isRecording) {
        stopRecording();

        if (canCreateMeeting) {
          stopStreaming();
          leaveMeeting();
        }
      }
    };
  }, [isRecording, canCreateMeeting]);

  useEffect(() => {
    if (step === RECORD_STEP.IDLE) {
      setIsBack(true);
    } else {
      setIsBack(false);
    }
  }, [step]);

  useEffect(() => {
    if (recordingTime) {
      setTimer(secondsToTimer(recordingTime));
    }
  }, [recordingTime]);

  useEffect(() => {
    if (recordingBlob) {
      recordingBlobRef.current = recordingBlob;
    }
  }, [recordingBlob]);

  const onSocketReconnect = useCallback(() => {
    if (!meetingIdRef.current || !meetingUserRef.current) return;
    console.log("socket reconnect");
    socket.emit(SOCKET_EVENT.join_channel, {
      meetingId: meetingIdRef.current,
      ...meetingUserRef.current,
    } as JoinMeetingEvent);
  }, []);

  const onJoinChannel = useCallback(() => {
    console.log("User joined the channel.");

    if (!isRecording) {
      socket.emit(SOCKET_EVENT.recording_meeting_status, {
        meetingId: meetingIdRef.current,
        status: RECORDING_STATUS_ENUM.STOPPED,
        duration: timerToSeconds(timer),
      });
      return;
    }

    if (pause) {
      socket.emit(SOCKET_EVENT.recording_meeting_status, {
        meetingId: meetingIdRef.current,
        status: RECORDING_STATUS_ENUM.PAUSED,
        duration: recordingTime,
      });
      return;
    }

    socket.emit(SOCKET_EVENT.recording_meeting_status, {
      meetingId: meetingIdRef.current,
      status: RECORDING_STATUS_ENUM.RECORDING,
      duration: recordingTime,
    });
  }, [isRecording, pause, recordingTime, timer]);

  const onWhisperWhoSpeakModelReady = async (data: any) => {
    if (meetingIdRef.current === data.meetingId) {
      await startStreaming();
      startAudioRecording();
      handleCloseCreateMeetingSettingModal();
    }
  };

  useEffect(() => {
    if (canCreateMeeting) {
      socket.on(SOCKET_EVENT.connect, onSocketReconnect);
      socket.on(SOCKET_EVENT.join_channel, onJoinChannel);
      if (whisperSTTMode) {
        socket.on(SOCKET_EVENT.whospeaks_ready, onWhisperWhoSpeakModelReady);
      }

      return () => {
        socket.off(SOCKET_EVENT.connect, onSocketReconnect);
        socket.off(SOCKET_EVENT.join_channel, onJoinChannel);
        socket.off(SOCKET_EVENT.whospeaks_ready, onWhisperWhoSpeakModelReady);
      };
    }
  }, [
    canCreateMeeting,
    onSocketReconnect,
    onJoinChannel,
    onWhisperWhoSpeakModelReady,
  ]);

  const startRecord = async () => {
    if (canCreateMeeting) {
      handleOpenCreateMeetingSettingModal();
    } else {
      startAudioRecording();
    }
  };

  const startAudioRecording = () => {
    startRecording();

    setStep(RECORD_STEP.RECORDING);
    setTimer("00:00:00");
    const startTime = new Date();
    startTime.setMilliseconds(0);
    startTime.setSeconds(0);
    setStartedAt(startTime);
    dispatch(hideNavTab());

    if (recordingSoundRef.current) {
      recordingSoundRef.current.play();
    }
  };

  // const createRecordingMeeting = async () => {
  //   recordingIdRef.current = uuidv4();
  //   const data = await createMeetingRecordingMutation.mutateAsync({
  //     recording_id: recordingIdRef.current,
  //     email: currentUser.email,
  //     userId: currentUser.id,
  //     username: currentUser.name,
  //     language: seletecLanguage.current,
  //     meetingName: `Recording_${currentUser.name}_${format(new Date().getTime(), "yyyyMMdd_HHmm")}`,
  //     createdAt: new Date().getTime(),
  //     custom_entities: recorderSetting.customEntities.filter(
  //       (x) => !!x.entity && x.values.length > 0,
  //     ),
  //     shared_ai_platform: shareAiPlatform,
  //     censoredWords,
  //     customNames,
  //     stt_mode: sttMode,
  //     num_speakers: numSpeakersRef.current,
  //     entity_extracted: true,
  //   });

  //   meetingIdRef.current = data.meetingId;
  //   meetingUserRef.current = {
  //     userId: currentUser.id,
  //     email: currentUser.email,
  //     username: currentUser.name,
  //     language: seletecLanguage.current,
  //     role: MEETING_USER_ROLE.SPEAKER,
  //   };
  //   socket.emit(SOCKET_EVENT.join_channel, {
  //     meetingId: meetingIdRef.current,
  //     ...meetingUserRef.current,
  //   });
  // };

  const startStreaming = async () => {
    try {
      let constraints: MediaStreamConstraints = { audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      streamMediaRecorderRef.current = mediaRecorder;

      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      await audioContext.audioWorklet.addModule(
        `${config.basename}/worklet/pcm-512-audio-converter.js`,
      );

      const mediaStreamSource = audioContext.createMediaStreamSource(stream);

      const workletNode = new AudioWorkletNode(
        audioContext,
        "pcm-512-audio-converter",
      );
      workletNodeRef.current = workletNode;
      workletNode.port.onmessage = (event) => {
        const int16Array = event.data;
        let eventName = SOCKET_EVENT.recording_streaming;
        // if (whisperSTTMode) {
        //   eventName = SOCKET_EVENT.recording_streaming_whisper;
        // }

        socket.emit(eventName, {
          audioData: int16Array.buffer,
          meetingId: meetingIdRef.current,
          userId: currentUser.id,
          userName: currentUser.name,
          language: meetingUserRef.current!.language,
          num_speakers: numSpeakersRef.current,
          stt_model: sttMode
        });
      };

      mediaStreamSource.connect(workletNode);
      mediaRecorder.start();
    } catch (err) {
      console.error("Error accessing the microphone:", err);
    }
  };

  const stopRecord = async () => {
    stopRecording();
    clearInterval(invervalRef.current);

    if (canCreateMeeting) {
      stopStreaming();
      leaveMeeting();
    }

    if (!user.currentUser.isRecordingStrict) {
      setStep(RECORD_STEP.SELECTING);
    } else {
      setUploading(true);
      await delay(500);
      // await uploadToAiPlatformHistory();
      reset();
      setUploading(false);
    }
  };

  const stopStreaming = (isWhisperAndPause: boolean = false) => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }

    if (streamRef.current) {
      // Stop all tracks from the media stream (microphone)
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (streamMediaRecorderRef.current) {
      streamMediaRecorderRef.current.stop();
      streamMediaRecorderRef.current = null;
    }

    if (meetingUserRef.current && !isWhisperAndPause) {
      let eventName = SOCKET_EVENT.stop_recording_streaming;
      // if (whisperSTTMode) {
      //   eventName = SOCKET_EVENT.stop_recording_streaming_whisper;
      // }
      socket.emit(eventName, {
        meetingId: meetingIdRef.current,
        user: {
          userId: meetingUserRef.current.userId,
          language: meetingUserRef.current.language,
        },
        stt_model: sttMode,
      });
    }
  };

  const delay = (duration: number) =>
    new Promise((resolve) => setTimeout(() => resolve(true), duration));

  // const uploadToAiPlatformHistory = async () => {
  //   if (recordingBlobRef.current) {
  //     const uploadReq: UploadAIPlatformHistoryRequest = {
  //       audio: recordingBlobRef.current,
  //       title: `${user.currentUser.email.split("@")[0]}_${format(
  //         fromUnixTime(new Date().getTime() / 1000),
  //         "yyyyMMdd_HHmm",
  //       )}`,
  //       meeting_id: meetingIdRef.current,
  //     };

  //     if (shareAiPlatform) {
  //       saveAIPlatformAgent();
  //     }
  //     await saveAIPlatformHistoryMutation.mutateAsync(uploadReq);
  //   }
  // };

  // const saveAIPlatformAgent = async () => {
  //   if (recordingBlobRef.current) {
  //     const recordingReq: UploadAIPlatformAgentRequest = {
  //       audio: recordingBlobRef.current,
  //       recording_id: recordingIdRef.current,
  //       stop_time: new Date().getTime(),
  //       shared_ai_platform: shareAiPlatform,
  //     };
  //     await saveAIPlatformAgentMutation.mutateAsync(recordingReq);
  //   }
  // };

  const togglePlayPause = () => {
    togglePauseResume();
    const newPause = !pause;
    setPause(newPause);

    if (canCreateMeeting) {
      if (newPause) {
        stopStreaming(whisperSTTMode);
        socket.emit(SOCKET_EVENT.recording_meeting_status, {
          meetingId: meetingIdRef.current,
          status: RECORDING_STATUS_ENUM.PAUSED,
        });
      } else {
        startStreaming();
        socket.emit(SOCKET_EVENT.recording_meeting_status, {
          meetingId: meetingIdRef.current,
          status: RECORDING_STATUS_ENUM.RECORDING,
        });
      }
    }
  };

  const toggleRecordElems = () => {
    setShowRecordElems(!showRecordElems);
  };

  const confirm = async () => {
    if (recordingBlob) {
      const durationSeconds = timerToSeconds(timer);

      setSaving(true);
      if (canCreateMeeting) {
        const saveMeetingReq: SaveRecordingMeetingRequest = {
          recording_id: recordingIdRef.current,
          removeNoise,
          model,
          masking,
          type: RECORDED_AUDIO_TYPE.RECORDER,
          location:
            [address.city, address.country].filter(Boolean).join(", ") || "",
          analyze_sentiment: analyzeSentiment,
          enableAISummary: enableSummaryAI,
          summaryAITemplate,
        };

        if (whisperSTTMode) {
          saveMeetingReq.audio = recordingBlob;
        }

        // Upload the recored audio to ai-platform agent
        // if (shareAiPlatform) {
        //   saveAIPlatformAgent();
        // }

        // await saveRecordingMeetingMutation.mutateAsync(saveMeetingReq);
      } else {
        const uploadReq: UploadAudioRequest = {
          audio: recordingBlob,
          duration: durationSeconds,
          startDateTime: startedAt.getTime(),
          endDateTime: add(startedAt, { seconds: durationSeconds }).getTime(),
          removeNoise,
          model,
          type: RECORDED_AUDIO_TYPE.RECORDER,
          masking,
          customNames,
          censoredWords,
          location:
            [address.city, address.country].filter(Boolean).join(", ") || "",
          analyze_sentiment: analyzeSentiment,
          enableAISummary: enableSummaryAI,
          summaryAITemplate,
          numSpeakers: numSpeakers,
        };
        // await uploadRecordAudioMutation.mutateAsync(uploadReq);
      }

      setTimeout(() => {
        setSaving(false);
        dispatch(showNavTab());
        navigate("/audios");
      }, 1500);
    }
  };

  const onSave = async (isDownload: boolean) => {
    setDownloading(true);
    if (recordingBlob) {
      try {
        if (!isDownload) {
          setOpenSaveRecordModal(false);
        }
        if (!loaded) {
          await load();
        }
        const datetime = format(
          fromUnixTime(startedAt.getTime() / 1000),
          "yyyyMMdd_HHmm",
        );
        const durationSeconds = timerToSeconds(timer);
        const duration = secondsToDurationFormat(durationSeconds);
        const filename = `${datetime}_"V2Vrecording"_${duration}`;
        const mp3Blob = await convertWebmToMp3(recordingBlob, filename);

        const blobUrl = URL.createObjectURL(mp3Blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.target = "_blank";
        link.download = `${filename}.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error("Error during download:", error);
      } finally {
        setDownloading(false);
        if (!isDownload) {
          reset();
        }
      }
    } else {
      console.error("No audio record data found");
    }

    // meetingIdRef.current &&
    //   catchError(discardMeetingMutation.mutateAsync(meetingIdRef.current));
  };

  const reset = () => {
    setStep(RECORD_STEP.IDLE);
    setTimer("00:00:00");
    setRemoveNoise(false);
    setModel(FINE_TUNED_MODEL.GENERAL);
    setSaving(false);
    setPause(false);
    setShowPlayPauseBtn(false);
    dispatch(showNavTab());
    recordingBlobRef.current = undefined;
  };

  const copyRecordingMeetingLink = async () => {
    await navigator.clipboard.writeText(
      `${config.clientBaseUrl}/recording-meeting/${recordingIdRef.current}`,
    );
    toast({
      title: "",
      description: t(tMessages.common.copiedMeetingLink()),
      duration: 1000,
    });
  };

  const leaveMeeting = () => {
    if (!meetingIdRef.current || !meetingUserRef.current) return;
    console.log("User leaving the page.");
    socket.emit(SOCKET_EVENT.recording_meeting_status, {
      meetingId: meetingIdRef.current,
      status: RECORDING_STATUS_ENUM.STOPPED,
    });
    socket.emit(SOCKET_EVENT.leave_channel, {
      meetingId: meetingIdRef.current,
      userId: meetingUserRef.current.userId,
      user: {
        userId: meetingUserRef.current.userId,
        username: meetingUserRef.current.username,
        language: meetingUserRef.current.language,
      },
      stt_model: sttMode,
    } as LeaveMeetingEvent);
  };

  let bottom = <></>;
  let leftHeader: JSX.Element | undefined = undefined;

  const toggleRecording = () => {
    if (step === RECORD_STEP.IDLE) {
      startRecord();
    } else if (step === RECORD_STEP.RECORDING) {
      stopRecord();
    }
  };

  const handleOpenCreateMeetingSettingModal = () => {
    setOpenCreateMeetingSettingModal(true);
  };

  const handleCloseCreateMeetingSettingModal = () => {
    setOpenCreateMeetingSettingModal(false);
  };

  const onCreateRecordingMeeting = async (
    language: string,
    numSpeakers: number,
  ) => {
    numSpeakersRef.current = numSpeakers;
    seletecLanguage.current = language;
    // await createRecordingMeeting();
    if (!whisperSTTMode) {
      await startStreaming();
      startAudioRecording();
      handleCloseCreateMeetingSettingModal();
    }
  };

  bottom = (
    <div className="flex w-full grow flex-col items-center justify-center space-y-2">
      <AnimatePresence onExitComplete={() => setShowPlayPauseBtn(true)}>
        {!isRecording ? (
          <motion.div
            id={TUTORIAL_TARGET.start_recording}
            className="flex h-[80px] w-[80px] items-center justify-center rounded-full border-[5px] border-solid border-white p-[6px] shadow-md transition-all duration-300 hover:scale-[1.1] hover:shadow-[0_0_12px_4px_rgba(255,255,255,0.3)]"
            onClick={toggleRecording}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="h-full w-full rounded-full bg-[#DE3648]"></div>
          </motion.div>
        ) : (
          showPlayPauseBtn && (
            <motion.div
              className="transition-all duration-300 hover:scale-[1.1] hover:animate-pause-pulse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, ease: "easeIn" }}
            >
              <PlayPauseRecord
                pause={pause}
                togglePlayPause={togglePlayPause}
              />
            </motion.div>
          )
        )}
      </AnimatePresence>
      <audio
        src={StartRecordingSound}
        ref={recordingSoundRef}
        className="hidden"
      />
      {!isRecording ? (
        <div
          className="flex flex-col items-center justify-center"
          style={{ visibility: isRecording ? "hidden" : "visible" }}
        >
          <span>{t(tMessages.common.startRecording())}</span>
          <span className="text-center text-sm text-primary-foreground">
            {t(tMessages.common.startRecordingNote())}
          </span>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1, ease: "easeIn" }}
        >
          <ButtonHoldStop stopRecord={() => stopRecord()} />
        </motion.div>
      )}
    </div>
  );

  const isSelecting = step === RECORD_STEP.SELECTING;
  if (isSelecting) {
    bottom = (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ deplay: 1.5, duration: 1, ease: "easeInOut" }}
        className="flex w-full grow flex-col items-center justify-end gap-4 sm:w-2/3"
      >
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

        <Button className="w-full rounded-2xl px-2" disabled={saving}>
          <div
            className="flex h-[48px] w-full items-center justify-center rounded-sm bg-success shadow-success"
            onClick={confirm}
          >
            {saving ? (
              <Spinner className="size-4" />
            ) : (
              t(tMessages.common.complete())
            )}
          </div>
        </Button>
      </motion.div>
    );

    leftHeader = (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      >
        <IconButton
          className="z-10"
          onClick={() => setOpenSaveRecordModal(true)}
        >
          <CircleLeftArrowIcon className="size-8 transition duration-200 hover:scale-[1.2]" />
        </IconButton>
      </motion.div>
    );
  }

  let centerItem = <></>;

  if (isRecording) {
    centerItem = <BlinkingDot />;
  }

  if (pause) {
    centerItem = (
      <div className="flex items-center gap-2">
        <PauseCircle className="h-5 w-5" />
        <span>{t(tMessages.common.pause())}</span>
      </div>
    );
  }

  if (isSelecting) {
    centerItem = (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: "easeIn" }}
        className="flex w-full items-center justify-center"
      >
        <CircleCheckIcon className="mr-2" />{" "}
        {t(tMessages.common.doneRecording())}
      </motion.div>
    );
  }

  centerItem = (
    <AnimatePresence>
      {showRecordElems && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          {centerItem}
        </motion.div>
      )}
    </AnimatePresence>
  );

  let dropdownProfile = <ProfileDropdown />;
  if (isRecording) {
    dropdownProfile = (
      <AnimatePresence>
        {showRecordElems && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            <ProfileDropdown disabled={true} />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  let liveAudioItem = mediaRecorder ? (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: showRecordElems ? 1 : 0 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      style={{ visibility: showRecordElems ? "visible" : "hidden" }}
    >
      <LiveAudioVisualizer
        mediaRecorder={mediaRecorder}
        width={waveformRef.current.clientWidth}
        height={170}
        barColor="hsla(0, 0%, 100%, 0.5)"
        barWidth={3}
        gap={3}
      />
    </motion.div>
  ) : null;

  const rightHeader = (
    <div className="flex items-center justify-end gap-2">
      {showShareLink && (
        <motion.div
          key="share"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <IconButton
            className="h-9 flex-col justify-between hover:text-success"
            onClick={copyRecordingMeetingLink}
          >
            <ShareNetworkIcon className="size-5" />
            <span className="text-[8px] leading-3">
              {t(tMessages.common.share())}
            </span>
          </IconButton>
        </motion.div>
      )}

      {isRecording &&
        (showRecordElems ? (
          <motion.div
            key="hide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <IconButton
              className="h-9 flex-col justify-between hover:text-success"
              onClick={toggleRecordElems}
            >
              <TwoArrowsInIcon />
              <span className="text-[8px] leading-3">
                {t(tMessages.common.hide())}
              </span>
            </IconButton>
          </motion.div>
        ) : (
          <motion.div
            key="show"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <IconButton
              className="h-9 flex-col justify-between hover:text-success"
              onClick={toggleRecordElems}
            >
              <FourArrowsOutIcon />
              <span className="text-[8px] leading-3">
                {t(tMessages.common.show())}
              </span>
            </IconButton>
          </motion.div>
        ))}
      {isSelecting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <IconButton
            className="h-9 flex-col justify-between hover:text-success"
            onClick={() => onSave(true)}
          >
            <DownloadIcon className="mr-1 size-5" />
            <span className="text-[8px] leading-3">
              {t(tMessages.common.download())}
            </span>
          </IconButton>
        </motion.div>
      )}
      <div className="h-8 w-8">{dropdownProfile}</div>
    </div>
  );

  let locationInfo;

  if (isLoading) {
    locationInfo = (
      <div className="flex items-center justify-center gap-1 text-[12px] text-primary-foreground">
        <Spinner className="size-3" />
        {t(tMessages.common.findingLocation())}
      </div>
    );
  } else if (
    error === LocationErrorType.OK &&
    location.latitude &&
    location.longitude
  ) {
    const addressInfo = [address.city, address.country]
      .filter(Boolean)
      .join(", ");
    locationInfo = (
      <p className="text-[12px] text-primary-foreground">{addressInfo}</p>
    );
  } else {
    locationInfo = <p className="h-[18px]"></p>;
  }

  return (
    <HorizontalTransition>
      <Header
        leftItem={leftHeader}
        rightItem={rightHeader}
        centerItem={centerItem}
      />

      <Container className="p-0">
        <div
          className={`relative mt-4 flex w-full flex-col items-center gap-4 ${step !== RECORD_STEP.IDLE ? "pb-[68px]" : "pb-0"}`}
        >
          <div className="h-[170px] w-full" ref={waveformRef}>
            {(!mediaRecorder && !recordingBlob) || isBack ? (
              <img
                src={WaveForm}
                alt="waveform"
                className="h-[170px] w-full object-cover"
              />
            ) : null}
            {liveAudioItem}
            {recordingBlob && isSelecting ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              >
                <AudioVisualizer
                  blob={recordingBlob}
                  width={waveformRef.current.clientWidth}
                  height={170}
                  barWidth={3}
                  gap={3}
                  barColor={"hsla(0, 0%, 100%, 0.5)"}
                />
              </motion.div>
            ) : null}
          </div>
          <span
            className={`text-[40px] ${isRecording ? "text-white" : "text-white/35"}`}
          >
            {isSelecting ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              >
                {timer}
              </motion.div>
            ) : (
              timer
            )}
          </span>

          {locationInfo}

          {bottom}
        </div>
      </Container>

      <UserMetadataModal />

      {/* NumberOfSpeakersModal */}
      {openCreateMeetingSettingModal && (
        <RecordingMeetingSettingModal
          isOpen={openCreateMeetingSettingModal}
          onClose={handleCloseCreateMeetingSettingModal}
          onCreateRecordingMeeting={onCreateRecordingMeeting}
          sttMode={sttMode}
        />
      )}

      <ConfirmationModal
        open={openSaveRecordModal}
        onOpenChange={setOpenSaveRecordModal}
        onConfirm={() => onSave(false)}
        onClose={() => {
          setOpenSaveRecordModal(false);
          reset();
          // meetingIdRef.current &&
          //   catchError(
          //     discardMeetingMutation.mutateAsync(meetingIdRef.current),
          //   );
        }}
        title={t(tMessages.common.saveToDeviceConfirm())}
        closeTitle={t(tMessages.common.noSave())}
        confirmTitle={t(tMessages.common.save())}
        confirmClasses="bg-success/90 hover:bg-success transition duration-200 hover:shadow-success"
      />

      {showBackdropLoading && (
        <BackdropOverlay className="bg-transparent">
          <div className="flex h-full w-full items-center justify-center gap-2">
            <Spinner className="size-4" />
            {t(
              downloading
                ? tMessages.common.downloading()
                : tMessages.common.uploading(),
            )}
            ...
          </div>
        </BackdropOverlay>
      )}
    </HorizontalTransition>
  );
};

export default Recorder;
