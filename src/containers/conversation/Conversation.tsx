import {
  Container,
  Header,
  HorizontalTransition,
  IconButton,
  Separator,
  Spinner,
} from "@/components";
import { useCurrentUser, useCustomSpeechRecognition } from "@/hooks";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import MessageItem from "../messages/MessageItem";
import LanguageRecorder from "./LanguageRecorder";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/main";
import {
  addConversationMessage,
  setConversationMessages,
  toggleFaceToFaceMode,
  updateConversationMessage,
  updateRecorder,
} from "@/features/conversation/conversationSlice";
import {
  useCleanTranslationMutation,
  useCreateAudioMutation,
  useReverseTranslateTextMutation,
  useTranslateTextMutation,
} from "@/features/conversation/mutations";
import {
  hideConvLgRecordBtn,
  hideNavTab,
  showNavTab,
} from "@/features/ui/uiSlice";
import {
  LEFT_POSITION,
  RIGHT_POSITION,
} from "@/features/settings/settingSlice";
import { decodeHtmlEntities, splitSentenceByPunctuation } from "@/lib/utils";
import { produce } from "immer";
import InstructionText from "./InstructionText";
import ConversationMessages from "./ConversationMessages";
import "./styles/conversation.scss";
import { config } from "@/lib/config";
import {
  CreateAudioRequest,
  ReverseTranslatedTextRequest,
  TranslateTextRequest,
  TranslateTextResponse,
} from "@/features/conversation/types";
import ProfileDropdown from "../account-setting/ProfileDropdown";
import SlidingNavbar from "./SlidingNavBar";
import { allLanguages, LanguageOption } from "@/lib/constaints";
import { Message } from "@/features/messages/types";
import { tMessages } from "@/locales/messages";
import { useTrackUserUsageMutation } from "@/features/current-user/mutations";
import { differenceInSeconds } from "date-fns";
import { CircleLeftArrowIcon } from "@/components/icons";
import { cloneDeep } from "lodash";
import { catchError } from "@/lib/trycatch";
import { useCreateMeetingMutation } from "@/features/meeting/mutations";
import { STT_MODE } from "@/features/settings/types";
import { CreateMeetingRequest } from "@/features/meeting/types";
import { SOCKET_EVENT, useSocketClient } from "@/features/socket/socketClient";
import { useTranslation } from "react-i18next";

export type RecorderPosition = "left" | "right";

export type RecorderItem = {
  language: string;
  position: RecorderPosition;
};

const menuItems = [
  tMessages.common.face2FaceMode,
  tMessages.common.parallelMode,
];

const Conversation = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const socket = useSocketClient();
  const { currentUser } = useCurrentUser();

  const setting = useSelector((state: RootState) => state.setting);
  const conversation = useSelector((state: RootState) => state.conversation);
  const showLargeRecorderBtn = useSelector(
    (state: RootState) => state.ui.convShowLgRecordBtn,
  );

  const transcriptChunkIdx = useRef(0);
  const startRecordAtRef = useRef<Date>(new Date());
  const meetingIdRef = useRef<string>("");

  // const translateTextMutation = useTranslateTextMutation();
  // const reverseTranslatedTextMutation = useReverseTranslateTextMutation();
  // const createTranslatedAudioMutation = useCreateAudioMutation();
  // const trackUserUsageMutation = useTrackUserUsageMutation();
  // const cleanTranslationMutation = useCleanTranslationMutation();
  // const createMeetingMutation = useCreateMeetingMutation();

  const [recordingLanguage, setRecordingLanguage] = useState<
    RecorderItem | undefined
  >(undefined);
  const leftRecorder: RecorderItem = conversation.leftRecorder;
  const rightRecorder: RecorderItem = conversation.rightRecorder;
  const isStream =
    setting.sttMode === STT_MODE.AZURE || setting.sttMode === STT_MODE.MANUFACTURING;

  const [messages, setMessages] = useState<Message[]>(() =>
    conversation.messages.map((x) => ({
      ...x,
      isTranslating: false,
      completed: true,
    })),
  );
  const [playingMessageId, setPlayingMessageId] = useState<string>("");
  const [creating, setCreating] = useState(false);

  const {
    startRecognition,
    stopRecognition,
    transcript,
    finalTranscript,
    mediaRecorder,
  } = useCustomSpeechRecognition({
    stream: isStream,
  });

  const isRecording = !!recordingLanguage;
  const isLeftRecording =
    isRecording && recordingLanguage.position === leftRecorder.position;
  const isRightRecording =
    isRecording && recordingLanguage.position === rightRecorder.position;

  const filterLanguages = allLanguages.filter(
    (x: LanguageOption) =>
      x.code !== leftRecorder.language && x.code !== rightRecorder.language,
  );
  const leftComputedlanguages: LanguageOption[] = useMemo(() => {
    const result = [...filterLanguages];
    const lang = allLanguages.find((x) => x.code === leftRecorder.language);

    if (lang) {
      result.unshift({ ...lang });
    }
    return result;
  }, [filterLanguages, leftRecorder]);

  const rightComputedlanguages: LanguageOption[] = useMemo(() => {
    const result = [...filterLanguages];
    const lang = allLanguages.find((x) => x.code === rightRecorder.language);

    if (lang) {
      result.unshift({ ...lang });
    }
    return result;
  }, [filterLanguages, rightRecorder]);

  useEffect(() => {
    const last = messages.length - 1;
    if (!transcript || !messages[last]) return;
    setMessages(
      produce((prevMessages) => {
        const lastMessage = prevMessages[last];
        lastMessage.originTexts[transcriptChunkIdx.current] = transcript;
      }),
    );
  }, [transcript]);

  useEffect(() => {
    const last = messages.length - 1;
    if (!finalTranscript || !messages[last]) return;
    console.log("finalTranscript", finalTranscript);

    const chunkIndex = transcriptChunkIdx.current;
    setMessages(
      produce((prevMessages) => {
        const lastMessage = prevMessages[last];
        console.log("index", transcriptChunkIdx.current);
        lastMessage.originTexts[chunkIndex] = finalTranscript.text;
        lastMessage.isTranslating = true;
      }),
    );

    const cloneMessage = cloneDeep(messages[last]);
    cloneMessage.originTexts[chunkIndex] = finalTranscript.text;
    // getTranslatedText(cloneMessage, transcriptChunkIdx.current++);
  }, [finalTranscript]);

  const startRecording = async (recoder: RecorderItem) => {
    if (!meetingIdRef.current && isStream) {
      await createMeeting();
    }
    startRecordAtRef.current = new Date();
    dispatch(hideNavTab());
    dispatch(hideConvLgRecordBtn());
    setRecordingLanguage(recoder);
    transcriptChunkIdx.current = 0;
    const speaker = {
      [LEFT_POSITION]: setting.leftVoice,
      [RIGHT_POSITION]: setting.rightVoice,
    };
    // startRecognition({
    //   meetingId: meetingIdRef.current,
    //   userId: currentUser.id,
    //   language: recoder.language,
    //   silentThreshold: speaker[recoder.position].silentThresholdSec,
    //   stream: isStream,
    //   stt_model: setting.sttMode,
    // });

    const originLang = recoder.language;
    const targetLang =
      recoder.language === leftRecorder.language
        ? rightRecorder.language
        : leftRecorder.language;
    const voiceId = speaker[recoder.position].id;

    setMessages(
      produce((prev) => {
        prev.push({
          id: uuidv4(),
          originTexts: [],
          correctedTexts: [],
          audios: [],
          reversedTexts: [],
          translatedAudios: [],
          translatedTexts: [],
          originLang,
          targetLang,
          voiceId: voiceId,
          speakerPosition: recoder.position,
          isTranslating: false,
          completed: !setting.autoPlay, // completed flag for auto play audio, won't trigger play audo when true
          createdAt: -1,
        });
      }),
    );
  };

  const stopRecording = () => {
    dispatch(showNavTab());
    // stopRecognition();

    const last = messages.length - 1;
    if (messages[last] && messages[last].originTexts.length === 0) {
      setMessages(
        produce((prev: Message[]) => {
          prev.splice(last, 1);
        }),
      );
    } else {
      // save to store to load again when back to this route
      const cloneMsg = cloneDeep(messages[last]);
      dispatch(
        addConversationMessage({
          ...cloneMsg,
          isTranslating: false,
        }),
      );
    }

    // if (meetingIdRef.current) {
    //   socket.emit(SOCKET_EVENT.stop_speaking, {
    //     meetingId: meetingIdRef.current,
    //     user: {
    //       userId: currentUser.id,
    //       username: currentUser.name,
    //       email: currentUser.email,
    //       language: leftRecorder.language,
    //     },
    //     stt_model: setting.sttMode,
    //   });
    // }

    setRecordingLanguage(undefined);

    const sttDuration = differenceInSeconds(
      new Date(),
      startRecordAtRef.current,
    );
    // trackUserUsageMutation.mutateAsync({
    //   key: "translate_stt_time_minutes",
    //   count: sttDuration,
    // });
  };

  const updateMessageToStore = (
    mesageId: string,
    updatedData: Partial<Message>,
  ) => {
    // save to store to load again when back to this route
    dispatch(
      updateConversationMessage({
        id: mesageId,
        ...updatedData,
      }),
    );
  };

  const onLanguageChange = (value: RecorderItem) => {
    dispatch(updateRecorder({ ...value }));
  };

  // const getTranslatedText = async (messageData: Message, textOrder: number) => {
  //   try {
  //     if (!messageData.originTexts[textOrder]) return;

  //     const payload: TranslateTextRequest = {
  //       translation_mode: setting.translationMode,
  //       tts_mode: setting.ttsMode,
  //       voice_id: messageData.voiceId || "",
  //       text: messageData.originTexts[textOrder],
  //       lang: messageData.originLang,
  //       target_lang: messageData.targetLang,
  //       names: setting.customNames,
  //       contexts: setting.contexts,
  //       position: messageData.speakerPosition === LEFT_POSITION ? 1 : 2,
  //       dialog_id: setting.dialogId,
  //       prompt: setting.prompt,
  //       sys_prompt: setting.systemPrompt,
  //     };

  //     const translatedData: TranslateTextResponse =
  //       await translateTextMutation.mutateAsync(payload);

  //     if (!translatedData.translated_text) {
  //       throw new Error("Translated text empty");
  //     }

  //     const decodedTranslatedText = decodeHtmlEntities(
  //       translatedData.translated_text,
  //     );
  //     const decodedCorrectedText = decodeHtmlEntities(
  //       translatedData.corrected_text,
  //     );

  //     const translatedAll =
  //       textOrder === transcriptChunkIdx.current - 1 || messageData.completed;
  //     setMessages(
  //       produce((prev: Message[]) => {
  //         const msg = prev.find((x) => x.id === messageData.id);
  //         if (!msg) return;
  //         msg.translatedTexts[textOrder] = decodedTranslatedText;
  //         msg.correctedTexts[textOrder] = decodedCorrectedText;
  //         msg.isTranslating = !translatedAll;

  //         updateMessageToStore(messageData.id, {
  //           originTexts: [...messageData.originTexts],
  //           translatedTexts: [...msg.translatedTexts],
  //           correctedTexts: [...msg.correctedTexts],
  //         });
  //       }),
  //     );

  //     const splittedTranslatedTexts = splitSentenceByPunctuation(
  //       decodedTranslatedText,
  //     );

  //     // create this variable to keep track the reference
  //     // this will be assign to translatedAudios at textOrder index
  //     const splittedTranslatedAudios: string[] = [];
  //     const getTranslatedAudioPromises = splittedTranslatedTexts.map(
  //       (splittedText: string, splittedTextIndex: number) => {
  //         splittedTranslatedAudios[splittedTextIndex] = "";

  //         return getTranslatedAudio(
  //           messageData,
  //           splittedText,
  //           textOrder,
  //           splittedTextIndex,
  //           splittedTranslatedAudios,
  //         );
  //       },
  //     );
  //     Promise.all(getTranslatedAudioPromises);

  //     if (setting.isReversedText) {
  //       getReversedText(
  //         messageData,
  //         decodedTranslatedText,
  //         decodedCorrectedText,
  //         textOrder,
  //       );
  //     }
  //   } catch (err) {
  //     setMessages(
  //       produce((prev) => {
  //         const msg = prev.find((x) => x.id === messageData.id);
  //         if (!msg) return;
  //         msg.isTranslating = false;
  //         msg.completed = true;
  //       }),
  //     );
  //   }
  // };

  // const getTranslatedAudio = async (
  //   messageData: Message,
  //   translatedText: string,
  //   textOrder: number,
  //   splittedAudioOrder: number,
  //   splittedTranslatedAudios: string[],
  // ) => {
  //   try {
  //     const payload: CreateAudioRequest = {
  //       id: messageData.id,
  //       text: translatedText,
  //       tts_mode: setting.ttsMode,
  //       voice_id: messageData.voiceId || "",
  //       target_lang: messageData.targetLang,
  //       order: splittedAudioOrder,
  //       styleBertVits2: setting.styleBertVits2,
  //     };

  //     const data = await createTranslatedAudioMutation.mutateAsync(payload);

  //     if (data.output === "N/A") {
  //       return;
  //     }

  //     const audioPath = `${config.apiBaseUrl}/audio/${data.output}`;
  //     setMessages(
  //       produce((prev: Message[]) => {
  //         const msg = prev.find((x) => x.id === messageData.id);
  //         if (!msg) return;
  //         splittedTranslatedAudios[splittedAudioOrder] = audioPath;
  //         msg.translatedAudios[textOrder] = [...splittedTranslatedAudios];

  //         updateMessageToStore(messageData.id, {
  //           translatedAudios: cloneDeep(msg.translatedAudios),
  //         });
  //       }),
  //     );
  //   } catch (err) {}
  // };

  // const getReversedText = async (
  //   messageData: Message,
  //   translatedText: string,
  //   correctedText: string,
  //   textOrder: number,
  // ) => {
  //   const payload: ReverseTranslatedTextRequest = {
  //     id: messageData.id,
  //     text: translatedText,
  //     sample_text: correctedText,
  //     tgt_lang: messageData.originLang,
  //     names: setting.customNames,
  //     contexts: setting.contexts,
  //   };

  //   const data = await reverseTranslatedTextMutation.mutateAsync(payload);

  //   setMessages(
  //     produce((prev: Message[]) => {
  //       const msg = prev.find((x) => x.id === messageData.id);
  //       if (!msg || !msg.reversedTexts) return;
  //       msg.reversedTexts[textOrder] = decodeHtmlEntities(data.reversed_text);

  //       updateMessageToStore(messageData.id, {
  //         reversedTexts: [...msg.reversedTexts],
  //       });
  //     }),
  //   );
  // };

  const onEditConfirm = useCallback(
    (messageId: string, newTranscript: string) => {
      const msgIdx = messages.findIndex((x) => x.id === messageId);
      if (!messages[msgIdx]) return;

      setMessages(
        produce((prev: Message[]) => {
          const _msg = prev[msgIdx];
          _msg.originTexts = [newTranscript];
          _msg.correctedTexts = [newTranscript];
          _msg.translatedTexts = [];
          _msg.translatedAudios = [];
          _msg.reversedTexts = [];
          _msg.isTranslating = true;
          _msg.completed = true;
        }),
      );

      const clone: Message = {
        ...messages[msgIdx],
        originTexts: [newTranscript],
        correctedTexts: [newTranscript],
        translatedTexts: [],
        translatedAudios: [],
        reversedTexts: [],
        completed: true,
      };
      // getTranslatedText(clone, 0);
    },
    [messages],
  );

  const resetConversation = () => {
    setMessages([]);
    dispatch(setConversationMessages([]));
    let audios: string[] = [];

    // push all translated audio from conversation.messages to audios
    conversation.messages.forEach((msg) => {
      const translatedAudios: string[] = msg.translatedAudios.flat(1);
      translatedAudios.forEach((audio) => {
        const audioName = audio.split("/").pop();
        audioName && audios.push(audioName);
      });
    });

    // catchError(
    //   cleanTranslationMutation.mutateAsync({
    //     audios: audios.join(","),
    //   }),
    // );
  };

  const createMeeting = async () => {
    setCreating(true);
    const payload: CreateMeetingRequest = {
      meetingId: "",
      meetingName: `translation_${currentUser.id}`,
      contexts: setting.contexts,
      customNames: setting.customNames,
      userPrompt: setting.prompt,
      systemPrompt: setting.systemPrompt,
      censoredWords: setting.censoredWords,
      private: true,
      userId: currentUser.id,
      username: currentUser.name,
      language: leftRecorder.language,
      createdAt: new Date().getTime(),
      hidden: true,
      stt_model: setting.sttMode,
    };

    // const [_, createdMeeting] = await catchError(
    //   createMeetingMutation.mutateAsync(payload),
    // );

    // if (createdMeeting) {
      // meetingIdRef.current = createdMeeting.meetingId;
      // socket.emit(SOCKET_EVENT.join_channel, {
      //   meetingId: createdMeeting.meetingId,
      //   userId: currentUser.id,
      //   username: currentUser.name,
      //   email: currentUser.email,
      //   language: leftRecorder.language,
      // });
    // }

    setCreating(false);
  };

  const centerHeader = (
    <div className="p-4">
      <SlidingNavbar
        items={menuItems}
        onChange={() => dispatch(toggleFaceToFaceMode())}
        activeIndex={conversation.faceToFaceMode ? 0 : 1}
      />
    </div>
  );

  let rightHeader = <ProfileDropdown disabled={isRecording} />;

  const showClearMessageBtn =
    messages.length > 1 ||
    (messages.length === 1 && messages[0].originTexts.length > 0);

  let leftHeader = <></>;
  if (showClearMessageBtn) {
    leftHeader = (
      <IconButton
        className="z-10"
        onClick={resetConversation}
        disabled={isRecording}
      >
        <CircleLeftArrowIcon className="size-8 transition duration-200 hover:scale-[1.2]" />
      </IconButton>
    );
  }

  const leftRecorderComp = (
    <LanguageRecorder
      recording={isLeftRecording}
      recorder={leftRecorder}
      startRecording={startRecording}
      stopRecording={stopRecording}
      onLanguageChange={onLanguageChange || creating}
      disabledRecord={isRightRecording}
      faceToFaceMode={conversation.faceToFaceMode}
      mediaRecorder={mediaRecorder || undefined}
      languages={leftComputedlanguages}
      showLargeRecorderBtn={showLargeRecorderBtn}
    />
  );

  const rightRecorderComp = (
    <LanguageRecorder
      recording={isRightRecording}
      recorder={rightRecorder}
      startRecording={startRecording}
      stopRecording={stopRecording}
      onLanguageChange={onLanguageChange}
      disabledRecord={isLeftRecording || creating}
      modalDirection={conversation.faceToFaceMode ? "top" : "bottom"}
      faceToFaceMode={conversation.faceToFaceMode}
      mediaRecorder={mediaRecorder || undefined}
      languages={rightComputedlanguages}
      showLargeRecorderBtn={showLargeRecorderBtn}
    />
  );

  const onPlayAudio = (messageId: string) => {
    setMessages(
      produce((prev) => {
        const msg = prev.find((x) => x.id === messageId);
        if (msg) {
          msg.completed = true;
        }
      }),
    );
    setPlayingMessageId(messageId);
  };

  const renderMessageItem = (
    message: Message,
    index: number,
    position?: string,
  ) => {
    const hideOrigin =
      conversation.faceToFaceMode && message.speakerPosition !== position;
    const hideTranslated =
      conversation.faceToFaceMode && message.speakerPosition === position;
    return (
      <MessageItem
        key={message.id}
        message={message}
        onPlayAudio={onPlayAudio}
        disabledPlay={!!playingMessageId && playingMessageId !== message.id}
        onEditConfirm={onEditConfirm}
        isRecording={isRecording}
        isLastMessage={index === messages.length - 1}
        hideOrigin={hideOrigin}
        hideTranslated={hideTranslated}
        allowHoverEdit={!conversation.faceToFaceMode}
        noPlayingHighlight={true}
        hideVolume={hideTranslated}
      />
    );
  };

  const creatingSpinner = (
    <div className="flex h-full items-center justify-center space-x-2">
      <span>{t(tMessages.common.startingSession())}</span>
      <Spinner className="size-4" />
    </div>
  );

  return (
    <HorizontalTransition>
      {/* header */}
      <Header
        leftItem={leftHeader}
        centerItem={centerHeader}
        rightItem={rightHeader}
        recording={isRecording}
      />
      <Container
        className={`z-10 flex-col gap-0 overflow-hidden ${isRecording ? "pb-[68px]" : ""}`}
      >
        {/* Conversation content */}
        {conversation.faceToFaceMode ? (
          <>
            <ConversationMessages
              messages={messages}
              renderMessage={(msg: Message, index: number) =>
                renderMessageItem(msg, index, "right")
              }
              languageRecorders={[rightRecorderComp]}
              rotate180={true}
            />

            {messages.length > 0 ? (
              <Separator className="my-2 bg-primary-foreground" />
            ) : null}

            <ConversationMessages
              messages={messages}
              renderMessage={(msg: Message, index: number) =>
                renderMessageItem(msg, index, "left")
              }
              languageRecorders={[leftRecorderComp]}
              intructionText={creating ? creatingSpinner : <InstructionText />}
            />
          </>
        ) : (
          <ConversationMessages
            messages={messages}
            renderMessage={renderMessageItem}
            languageRecorders={[leftRecorderComp, rightRecorderComp]}
            intructionText={creating ? creatingSpinner : <InstructionText />}
          />
        )}
      </Container>
    </HorizontalTransition>
  );
};

export default Conversation;
