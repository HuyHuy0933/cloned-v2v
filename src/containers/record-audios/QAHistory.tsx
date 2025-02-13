import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
  RefObject,
} from "react";
import {
  Button,
  TextWritter,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  BackdropOverlay,
} from "@/components";
import { RootState } from "@/main";
import { useSelector } from "react-redux";
import {
  fetchQAHistoriesOffline,
  mapResponsedQAHistoriesToQAMessages,
} from "@/features/meeting/queries";
import {
  useCreateMeetingMutation,
  useSendQAMessageMutation,
} from "@/features/meeting/mutations";
import {
  QAMessage,
  QAMessageReceivedEvent,
  QAMessageSentEvent,
} from "@/features/qa-messages/types";
import { RecordedAudio } from "@/features/record-audios/types";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEY } from "@/lib/constaints";
import QAMessageBox from "../meeting/qa-chat/QAMessageBox";
import { useCurrentUser } from "@/hooks";
import { v4 as uuidv4 } from "uuid";
import { produce } from "immer";
import { decodeHtmlEntities } from "@/lib/utils";
import {
  Microphone52x40Icon,
  OrangeRecording40x40Icon,
} from "@/components/icons";
import { AutoHeightInput } from "@/components/shared/AutoHeightInput";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";
import { useCustomSpeechRecognition } from "@/hooks";
import { SOCKET_EVENT, useSocketClient } from "@/features/socket/socketClient";
import { CreateMeetingRequest, StopSpeakingEvent } from "@/features/meeting/types";
import { catchError } from "@/lib/trycatch";

type QAHistoryProps = {
  audio: RecordedAudio;
  detailedDivRef?: RefObject<HTMLDivElement>;
};

export const BOT_NAME = "bot";

const TAB_LIST_HEIGHT = 60;
const LOCATION_HEIGHT = 18;
const EXTRA_PADDING = 26;
const ANSWER_TABS_HEIGHT = 36;
const INPUT_QUESTION_HEIGHT = 92;

const QAHistory: React.FC<QAHistoryProps> = ({ audio, detailedDivRef }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { currentUser, setting: userSetting } = useCurrentUser();
  const translationMode = useSelector(
    (state: RootState) => state.setting.translationMode,
  );
  const sttMode = useSelector((state: RootState) => state.setting.sttMode);

  const createMeetingMutation = useCreateMeetingMutation();
  const sendQAMessageMutation = useSendQAMessageMutation();
  const socket = useSocketClient();

  const [processing, setProcessing] = useState(false);
  const [question, setQuestion] = useState("");
  const [questions, setQuestions] = useState<QAMessage[]>([]);
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  const meetingIdRef = useRef<string>("");
  const languageRef = useRef<string>(audio.language!);
  const inputDivRef = useRef<HTMLDivElement>(null);
  const notAnsweredDivRef = useRef<HTMLDivElement>(null);

  // Dimension calculation
  const DETAILED_DIV_HEIGHT = detailedDivRef?.current?.offsetHeight || 0;

  const qaContentHeight = useMemo(() => {
    return (
      DETAILED_DIV_HEIGHT -
      (TAB_LIST_HEIGHT +
        ANSWER_TABS_HEIGHT +
        LOCATION_HEIGHT +
        EXTRA_PADDING +
        INPUT_QUESTION_HEIGHT)
    );
  }, [DETAILED_DIV_HEIGHT]);

  const { startRecognition, stopRecognition, transcript, finalTranscript } =
    useCustomSpeechRecognition({
      stream: true,
    });

  useEffect(() => {
    const fetchMeetingQAHistories = async () => {
      setLoading(true);
      try {
        const data = await queryClient.fetchQuery({
          queryKey: [QUERY_KEY.MEETING_QA_HISTORIES_OFFLINE],
          queryFn: () => fetchQAHistoriesOffline(audio.meeting_id!),
        });

        const _questions = mapResponsedQAHistoriesToQAMessages(
          data,
          languageRef.current,
        );

        setQuestions(_questions);
      } catch (error) {
        console.error("Error fetching QA Histories:", error);
      } finally {
        setLoading(false);
      }
    };

    if (audio) {
      fetchMeetingQAHistories();
    }

    return () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.MEETING_QA_HISTORIES_OFFLINE],
        refetchType: "none",
      });
    };
  }, [audio]);

  const unanswereds = useMemo(() => {
    return questions.filter(
      (q) => q.answers.filter((a) => a.username !== BOT_NAME).length === 0,
    );
  }, [questions]);

  const answereds = useMemo(() => {
    return questions.filter(
      (q) => q.answers.filter((a) => a.username !== BOT_NAME).length > 0,
    );
  }, [questions]);

  const scrollToLastItem = () => {
    if (notAnsweredDivRef.current) {
      notAnsweredDivRef.current.scrollTop =
        notAnsweredDivRef.current.scrollHeight;
    }
  };

  const hanelSendQuestionMessage = async (message: QAMessageSentEvent) => {
    try {
      // Render it immediately as the last item in the list
      setQuestions((prev) => [
        ...prev,
        {
          id: message.id,
          text: message.originText,
          userId: message.userId,
          username: message.username,
          meetingId: message.meetingId,
          answers: [],
          type: message.type,
          originLang: message.originLang,
          parentId: message.parentId,
          botAnswering: message.type == "question",
        },
      ]);

      setTimeout(() => {
        scrollToLastItem();
      }, 100);

      // Handling the bot response
      const response = await sendQAMessageMutation.mutateAsync(message);
      if (response && response.result) {
        if (message.type == "question") {
          updateBotResponse(response.bot_response);
        }
      }
    } catch (error) {
      console.log("Error while sending the question message: ", error);
    }
  };

  const hanelSendAnswerMessage = (message: QAMessageSentEvent) => {
    try {
      // Render the answer message
      updateAnswerMessage(message);

      // Send the answer message to db
      sendQAMessageMutation.mutateAsync(message);
    } catch (error) {
      console.log("Error while sending the answer message: ", error);
    }
  };

  const updateBotResponse = (data: QAMessageReceivedEvent) => {
    if (!data) return;
    setQuestions(
      produce((prev) => {
        let _parents = prev;

        if (data.parentId) {
          const _msg = _parents.find((x) => x.id === data.parentId);
          if (!_msg) return prev;
          _msg.botAnswering = false;
          _parents = _msg.answers;
        }

        _parents.push({
          id: data.id,
          text:
            decodeHtmlEntities(
              data.translatedData[languageRef.current]?.text || "",
            ) || data.originText,
          userId: data.userId,
          username: data.username,
          meetingId: data.meetingId,
          answers: [],
          type: data.type,
          originLang: data.originLang,
          parentId: data.parentId,
          botAnswering: false,
        });
      }),
    );
  };

  const updateAnswerMessage = (data: QAMessageSentEvent) => {
    setQuestions(
      produce((prev) => {
        let _parents = prev;
        if (data.parentId) {
          const _msg = _parents.find((x) => x.id === data.parentId);
          if (!_msg) return;
          _parents = _msg.answers;
        }

        _parents.push({
          id: data.id,
          text: data.originText,
          userId: data.userId,
          username: data.username,
          meetingId: data.meetingId,
          answers: [],
          type: data.type,
          originLang: data.originLang,
          parentId: data.parentId,
          botAnswering: false,
        });
      }),
    );
  };

  const sendMessage = () => {
    setQuestion("");
    const message = {
      id: uuidv4(),
      originText: question,
      answers: [],
      meetingId: audio.meeting_id!,
      originLang: audio.language!,
      type: "question",
      userId: currentUser.id,
      username: currentUser.name,
      translationMode,
    } as QAMessageSentEvent;

    hanelSendQuestionMessage(message);
  };

  const onSendAnswer = (parentId: string, answer: string) => {
    const message = {
      id: uuidv4(),
      originText: answer,
      meetingId: audio.meeting_id!,
      originLang: audio.language!,
      type: "answer",
      userId: currentUser.id,
      username: currentUser.name,
      translationMode,
      parentId,
    } as QAMessageSentEvent;

    hanelSendAnswerMessage(message);
  };

  useEffect(() => {
    if (finalTranscript?.text) {
      setQuestion((prev) => prev + " " + finalTranscript.text);
    }
  }, [finalTranscript]);

  const onClickMicrophone = useCallback(() => {
    if (!recording) {
      startSpeak();
    } else {
      stopSpeak();
    }
  }, [recording]);

  const startSpeak = async () => {
    setRecording(true);
    let meetingId = meetingIdRef.current;
    if (!meetingId) {
      meetingId = await createMeeting();
    }

    if (meetingId) {
      startRecognition({
        meetingId: meetingIdRef.current,
        userId: currentUser.id,
        language: userSetting.language,
        stream: true,
        stt_model: sttMode,
      });
    }
  };

  const createMeeting = async () => {
    const payload: CreateMeetingRequest = {
      meetingId: "",
      meetingName: `qa_offline_${audio.meeting_id}`,
      private: true,
      userId: currentUser.id,
      username: currentUser.name,
      language: userSetting.language,
      createdAt: new Date().getTime(),
      hidden: true,
      stt_model: sttMode,
    };

    const [_, createdMeeting] = await catchError(
      createMeetingMutation.mutateAsync(payload),
    );

    let meetingId = "";
    if (createdMeeting) {
      meetingIdRef.current = createdMeeting.meetingId;
      socket.emit(SOCKET_EVENT.join_channel, {
        meetingId: createdMeeting.meetingId,
        userId: currentUser.id,
        username: currentUser.name,
        email: currentUser.email,
        language: userSetting.language,
      });

      meetingId = createdMeeting.meetingId;
    }
    return meetingId;
  };

  const stopSpeak = () => {
    setRecording(false);
    stopRecognition();
    if (meetingIdRef.current) {
      socket.emit(SOCKET_EVENT.stop_speaking, {
        meetingId: meetingIdRef.current,
        user: {
          userId: currentUser.id,
        },
        stt_model: sttMode
      } as StopSpeakingEvent);
    }
  };

  return (
    <>
      <div
        className="flex w-full flex-col items-center justify-center gap-4"
        style={{
          height: questions.length === 0 ? `${qaContentHeight}px` : "auto",
        }}
      >
        {loading && <Spinner />}
        <div className="flex w-full flex-col gap-2">
          {questions.length > 0 ? (
            <Tabs defaultValue="question" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="question">
                  {t(tMessages.common.notAnswered())}
                  {unanswereds.length > 0 ? ` (${unanswereds.length})` : ""}
                </TabsTrigger>
                <TabsTrigger value="answer">
                  {t(tMessages.common.answered())}
                  {answereds.length > 0 ? ` (${answereds.length})` : ""}
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="question"
                className="overflow-y-auto"
                style={{ height: `${qaContentHeight}px` }}
                ref={notAnsweredDivRef}
              >
                {/* unanswered questions */}
                {unanswereds.map((item: QAMessage) => (
                  <QAMessageBox
                    key={item.id}
                    question={item}
                    onSendAnswer={onSendAnswer}
                    currentUserId={currentUser.id}
                  />
                ))}
              </TabsContent>
              <TabsContent
                value="answer"
                className="overflow-y-auto"
                style={{ height: `${qaContentHeight}px` }}
              >
                {/* answered questions */}
                {answereds.map((item: QAMessage) => (
                  <QAMessageBox
                    key={item.id}
                    question={item}
                    onSendAnswer={onSendAnswer}
                    currentUserId={currentUser.id}
                  />
                ))}
              </TabsContent>
            </Tabs>
          ) : (
            !processing &&
            !loading && (
              <ul className="text-center text-xs text-primary-foreground sm:text-sm">
                <li className="text-white">
                  {t(tMessages.questionTab.header())}
                </li>
                <li>{t(tMessages.questionTab.desc1())}</li>
                <li>{t(tMessages.questionTab.desc2())}</li>
                <li>{t(tMessages.questionTab.desc3())}</li>
              </ul>
            )
          )}
        </div>
        {/* Input */}
        <div
          ref={inputDivRef}
          className="absolute bottom-0 left-0 flex w-full items-end gap-2 bg-background pt-4"
        >
          {recording ? (
            <div className="max-h-[80px] min-h-[76px] grow gap-1 overflow-auto rounded-md border border-primary-foreground px-3 py-2 text-white">
              <span className="float-left text-sm">{question}</span>
              {transcript && (
                <TextWritter className="float-left text-sm" text={transcript} />
              )}
            </div>
          ) : (
            <AutoHeightInput
              className="max-h-[80px] min-h-[76px] grow border border-primary-foreground focus-visible:ring-0"
              rows={1}
              placeholder={t(tMessages.common.meetingQAPlaceholder())}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onEnterSubmit={sendMessage}
              disabled={recording}
            />
          )}

          <div className="flex flex-col gap-1">
            <Button className="h-9 w-16 rounded-sm" onClick={onClickMicrophone}>
              {!recording ? (
                <Microphone52x40Icon />
              ) : (
                <OrangeRecording40x40Icon />
              )}
            </Button>
            <Button
              className="h-9 w-16 rounded-sm"
              onClick={sendMessage}
              disabled={recording}
            >
              {t(tMessages.common.send())}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default QAHistory;
