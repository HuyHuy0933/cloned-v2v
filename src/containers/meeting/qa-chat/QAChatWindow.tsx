import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TextWritter,
} from "@/components";
import { RootState } from "@/main";
import { useSelector } from "react-redux";
import {
  QAMessage,
  QAMessageSentEvent,
  QAMessageReceivedEvent,
} from "@/features/qa-messages/types";
import QAMessageBox from "./QAMessageBox";
import { v4 as uuidv4 } from "uuid";
import { AutoHeightInput } from "@/components/shared/AutoHeightInput";
import {
  Microphone52x40Icon,
  OrangeRecording40x40Icon,
} from "@/components/icons";
import { RecognitionOptions, useCustomSpeechRecognition } from "@/hooks";
import { produce } from "immer";
import { SOCKET_EVENT, useSocketClient } from "@/features/socket/socketClient";
import { useQueryClient } from "@tanstack/react-query";
import {
  fetchQAHistories,
  mapResponsedQAHistoriesToQAMessages,
} from "@/features/meeting/queries";
import { useLocation } from "react-router-dom";
import { BOT_NAME, MeetingRouteState } from "../Meeting";
import { QUERY_KEY } from "@/lib/constaints";
import { decodeHtmlEntities } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";

type QAChatWindowProps = {
  className?: string;
  parentRef?: any;
};

const QAChatWindow: React.FC<QAChatWindowProps> = memo(
  ({ className, parentRef }) => {
    const { t } = useTranslation();
    const socket = useSocketClient();
    const queryClient = useQueryClient();
    const location = useLocation();

    const { currentUser, meeting } = location.state as MeetingRouteState;
    const translationMode = useSelector(
      (state: RootState) => state.setting.translationMode,
    );
    const sttMode = useSelector((state: RootState) => state.setting.sttMode);

    const [question, setQuestion] = useState("");
    const [questions, setQuestions] = useState<QAMessage[]>([]);
    const [recording, setRecording] = useState(false);

    const { startRecognition, stopRecognition, transcript, finalTranscript } =
      useCustomSpeechRecognition({
        stream: true,
        sent_event: SOCKET_EVENT.qa_streaming,
        received_event: SOCKET_EVENT.qa_streaming_received,
        stopped_event: SOCKET_EVENT.qa_stop_stream,
      });

    useEffect(() => {
      const fetchMeetingQAHistories = async () => {
        const data = await queryClient.fetchQuery({
          queryKey: [QUERY_KEY.MEETING_QA_HISTORIES, meeting.meetingId],
          queryFn: () => fetchQAHistories(meeting.meetingId),
          staleTime: Infinity,
        });
        const _questions = mapResponsedQAHistoriesToQAMessages(
          data,
          currentUser.language,
        );
        setQuestions(_questions);
      };

      if (meeting && currentUser) {
        fetchMeetingQAHistories();
      }

      return () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY.MEETING_QA_HISTORIES, meeting.meetingId],
          refetchType: "none",
        });
      };
    }, [meeting, currentUser]);

    useEffect(() => {
      const onQAMessage = (data: QAMessageReceivedEvent) => {
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
              text:
                decodeHtmlEntities(
                  data.translatedData[currentUser.language]?.text || "",
                ) || data.originText,
              userId: data.userId,
              username: data.username,
              meetingId: data.meetingId,
              answers: [],
              type: data.type,
              originLang: data.originLang,
              parentId: data.parentId,
            });
          }),
        );
      };

      socket.on(SOCKET_EVENT.qa_message, onQAMessage);
      return () => {
        socket.off(SOCKET_EVENT.qa_message, onQAMessage);
      };
    }, []);

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

    const startSpeak = useCallback(async () => {
      setRecording(true);
      const options: RecognitionOptions = {
        meetingId: meeting.meetingId,
        userId: currentUser.userId,
        language: currentUser.language,
        stream: true,
        stt_model: sttMode
      };
      startRecognition(options);
    }, [startRecognition]);

    const stopSpeak = useCallback(() => {
      setRecording(false);
      stopRecognition();
    }, [stopRecognition, transcript]);

    const sendMessage = useCallback(() => {
      setQuestion("");
      socket.emit(SOCKET_EVENT.qa_message, {
        id: uuidv4(),
        originText: question,
        answers: [],
        meetingId: meeting.meetingId,
        originLang: currentUser.language,
        type: "question",
        userId: currentUser.userId,
        username: currentUser.username,
        translationMode,
        stt_model: sttMode
      } as QAMessageSentEvent);
    }, [question]);

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

    const onSendAnswer = useCallback((parentId: string, answer: string) => {
      socket.emit(SOCKET_EVENT.qa_message, {
        id: uuidv4(),
        originText: answer,
        meetingId: meeting.meetingId,
        originLang: currentUser.language,
        type: "answer",
        userId: currentUser.userId,
        username: currentUser.username,
        translationMode,
        parentId,
        stt_model: sttMode
      } as QAMessageSentEvent);
    }, []);

    return (
      <Sheet>
        <SheetTrigger className="size-10 rounded-full bg-[#078fb4] text-white hover:bg-[#21b2da]">
          ?
          {unanswereds.length > 0 && (
            <span className="absolute -top-1 right-0 flex size-4 items-center justify-center rounded-full bg-red-500 text-xs">
              {unanswereds.length}
            </span>
          )}
        </SheetTrigger>
        <SheetContent className="flex w-[80%] flex-col bg-background p-4 py-6 text-white sm:max-w-none">
          <SheetHeader>
            <SheetTitle className="text-left text-white">
              {t(tMessages.common.question())}
            </SheetTitle>
            <SheetDescription></SheetDescription>
          </SheetHeader>
          <div className="mb-24 flex h-full w-full flex-col gap-2 overflow-y-auto">
            {questions.length > 0 && (
              <div className="w-full rounded-md bg-primary">
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
                  <TabsContent value="question">
                    {/* unanswered questions */}
                    {unanswereds.map((item: QAMessage) => (
                      <QAMessageBox
                        key={item.id}
                        question={item}
                        onSendAnswer={onSendAnswer}
                        currentUserId={currentUser.userId}
                      />
                    ))}
                  </TabsContent>
                  <TabsContent value="answer">
                    {/* answered questions */}
                    {answereds.map((item: QAMessage) => (
                      <QAMessageBox
                        key={item.id}
                        question={item}
                        onSendAnswer={onSendAnswer}
                        currentUserId={currentUser.userId}
                      />
                    ))}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="absolute bottom-4 left-0 flex w-full items-end gap-2 px-4">
            {recording ? (
              <div className="max-h-[80px] min-h-[76px] grow gap-1 overflow-auto rounded-md border border-primary-foreground px-3 py-2 text-white">
                <span className="float-left text-sm">{question}</span>
                {transcript && (
                  <TextWritter
                    className="float-left text-sm"
                    text={transcript}
                  />
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
              <Button
                className="h-9 w-16 rounded-sm"
                onClick={onClickMicrophone}
              >
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
        </SheetContent>
      </Sheet>
    );
  },
);

export default QAChatWindow;
