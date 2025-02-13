import { ChatBotIcon } from "@/components/icons";
import { useAskChatBotMutation, useSaveAIChatHistory } from "@/features/record-audios/mutations";
import {
  groupResponsedByMeetingIdThenMapToRecordedAudio,
  useRecordAudiosQuery,
} from "@/features/record-audios/queries";
import { useAIChatHistoriesQuery } from "@/features/record-audios/queries";
import {
  AskChatBotRequest,
  RecordedAudio,
} from "@/features/record-audios/types";
import { useCurrentUser } from "@/hooks";
import { tMessages } from "@/locales/messages";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { v4 as uuidv4 } from "uuid";
import { convertDateToMilliseconds } from "@/lib/utils";

export enum ChatHistoryType {
  CHATBOT,
  USER,
}

export enum ChatHistoryContentType {
  DROPDOWN,
  TEXT,
  BUTTON,
  TYPING,
}

export type ChatHistory = {
  id: string;
  type: ChatHistoryType;
  contentType: ChatHistoryContentType;
  context?: string;
};

const AIChatMessages = () => {
  const { t } = useTranslation();
  const { data: fetchedAudios } = useRecordAudiosQuery();
  const [recordAudios, setRecordAudios] = useState<RecordedAudio[]>([]);
  const [selectedRecordAudioId, setSelectedRecordAudioId] = useState<string>("");
  const [chatId, setChatId] = useState<string>();
  const [questionContent, setQuestionContent] = useState<string>();
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const askChatBotMutation = useAskChatBotMutation();
  const messagesEndRef = useRef(null);
  const lastItemRef = useRef<HTMLDivElement>(null);
  const { setting } = useCurrentUser();
  const saveAIChatHistory = useSaveAIChatHistory();
  const { data: fetchedChatHistories, isFetching } = useAIChatHistoriesQuery(
    convertDateToMilliseconds()
  );

  useEffect(() => {
    if (fetchedAudios) {
      const top10Records = groupResponsedByMeetingIdThenMapToRecordedAudio(
        fetchedAudios,
      ).slice(0, 10);
      setRecordAudios([...top10Records]);
      setChatId(uuidv4());
    }
  }, [fetchedAudios]);

  useEffect(() => {
    if (fetchedChatHistories?.chatHistory) {
      setChatHistories(fetchedChatHistories.chatHistory);
    } else {
      setChatHistories([
        {
          id: uuidv4(),
          type: ChatHistoryType.CHATBOT,
          contentType: ChatHistoryContentType.TEXT,
          context: t(tMessages.common.askChatBotMeeting()),
        },
        {
          id: uuidv4(),
          type: ChatHistoryType.CHATBOT,
          contentType: ChatHistoryContentType.DROPDOWN,
        },
      ]);
    }

    setSelectedRecordAudioId(fetchedChatHistories?.recordAudioId || "");

  }, [fetchedChatHistories]);

  const saveChatHistories = async () => {
    if(!isFetching && chatHistories) {      
      const hasUserAsking = chatHistories.some((item) => item.type == ChatHistoryType.USER);
      if(hasUserAsking) {
        // Add context props if each chat item does not have it
        const processedChatHistories = chatHistories.map((item) => ({
          ...item,
          context: item.context || ''
        }));         

        // Exclude the last item if it is a TYPING type
        const filteredChatHistories = chatHistories.slice(
          0,
          chatHistories[chatHistories.length - 1]?.contentType === ChatHistoryContentType.TYPING ? -1 : undefined
        );        
        
        await saveAIChatHistory.mutateAsync({
          date: convertDateToMilliseconds(),
          recordAudioId: selectedRecordAudioId,
          chatHistory: processedChatHistories
        });
      }
    }
  }

  useEffect(() => {    

    scrollToBottom();
    saveChatHistories();   
     
  }, [chatHistories]);

  const handleOnChangeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRecordAudioId(e.target.value);
    setChatHistories((prevState) => [
      ...prevState,
      {
        id: uuidv4(),
        type: ChatHistoryType.CHATBOT,
        contentType: ChatHistoryContentType.TEXT,
        context: t(tMessages.common.askChatBotTopicToTalk()),
      },
    ]);
  };

  const handleOnChangeQuestion = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setQuestionContent(e.target.value);
  };

  const scrollToBottom = () => {
    if (lastItemRef.current) {
      lastItemRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleOnSubmit = async () => {
    setChatHistories((prevState) => [
      ...prevState,
      {
        id: uuidv4(),
        type: ChatHistoryType.USER,
        contentType: ChatHistoryContentType.TEXT,
        context: questionContent,
      },
    ]);
    setQuestionContent("");
    if (!selectedRecordAudioId) {
      return;
    }
    setChatHistories((prevState) => [
      ...prevState,
      {
        id: uuidv4(),
        type: ChatHistoryType.CHATBOT,
        contentType: ChatHistoryContentType.TYPING,
        context: t(tMessages.common.aiChatTyping()),
      },
    ]);

    const result = await askChatBotMutation.mutateAsync({
      meetingId: selectedRecordAudioId || "",
      chatId: chatId || "",
      question: questionContent,
      language: setting.language
    } as AskChatBotRequest);

    setChatHistories((prevState) => [
      ...prevState.filter(
        (item) => item.contentType !== ChatHistoryContentType.TYPING,
      ),
      {
        id: uuidv4(),
        type: ChatHistoryType.CHATBOT,
        contentType: ChatHistoryContentType.TEXT,
        context: (result as any).answer,
      },
    ]);
    setChatHistories((prevState) => [
      ...prevState,
      {
        id: uuidv4(),
        type: ChatHistoryType.CHATBOT,
        contentType: ChatHistoryContentType.BUTTON,
      },
    ]);
  };

  const handleToAsk = () => {
    setChatHistories((prevState) => [
      ...prevState.filter(
        (x) => x.contentType !== ChatHistoryContentType.BUTTON,
      ),
      {
        id: uuidv4(),
        type: ChatHistoryType.CHATBOT,
        contentType: ChatHistoryContentType.TEXT,
        context: t(tMessages.common.pleaseAsk()),
      },
    ]);
  };

  const handleOnReset = () => {
    setChatHistories((prevState) => [
      ...prevState.filter(
        (x) => x.contentType !== ChatHistoryContentType.BUTTON,
      ),
      {
        id: uuidv4(),
        type: ChatHistoryType.CHATBOT,
        contentType: ChatHistoryContentType.DROPDOWN,
      },
    ]);
    setSelectedRecordAudioId("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleOnSubmit();
    }
  };

  const disabledInput =
    chatHistories.length > 0 &&
    chatHistories[chatHistories.length - 1].contentType !==
    ChatHistoryContentType.TEXT;

  return (
    <>
      <div className="chat">
        <div className="flex h-[400px] w-[70dvw] flex-col justify-between overflow-hidden rounded-[20px] bg-black/50 sm:w-[300px]">
          <div className="chat-title">
            <h1>v2v</h1>
            <h2>{t(tMessages.common.aiChat())}</h2>
            <p className="text-[8px] text-primary-foreground normal-case">{t(tMessages.common.autoDeletedChat())}</p>
            <figure className="avatar rounded-full bg-white">
              <ChatBotIcon />
            </figure>
          </div>
          <div className="messages">
            <div className="messages-content">
              {chatHistories.map((item: ChatHistory, index: number) => {
                const isChatBot = item.type === ChatHistoryType.CHATBOT;
                return (
                  <div
                    className={`message ${isChatBot ? "new" : "message-personal"}`}
                    key={item.id}
                    ref={index == chatHistories.length - 1 ? lastItemRef : null}
                  >
                    {isChatBot && (
                      <figure className="avatar rounded-full bg-white">
                        <ChatBotIcon />
                      </figure>
                    )}

                    {item.contentType === ChatHistoryContentType.DROPDOWN ? (
                      <select
                        className="custom-select"
                        value={selectedRecordAudioId}
                        onChange={handleOnChangeSelect}
                        disabled={index !== chatHistories.length - 1}
                      >
                        <option disabled value="">
                          {t(tMessages.common.selectMeeting())}
                        </option>
                        {recordAudios.map((audio) => (
                          <option key={audio.id} value={audio.id}>
                            {audio.name}
                          </option>
                        ))}
                      </select>
                    ) : item.contentType === ChatHistoryContentType.BUTTON ? (
                      <div className="button-group">
                        <button
                          className="message-button"
                          onClick={handleToAsk}
                        >
                          {t(tMessages.common.askAnother())}
                        </button>
                        <button
                          className="message-button"
                          onClick={handleOnReset}
                        >
                          {t(tMessages.common.changeMeeting())}
                        </button>
                      </div>
                    ) : (
                      item.context
                    )}
                  </div>
                );
              })}
            </div>
            <div ref={messagesEndRef}></div>
          </div>
          <div className="message-box">
            <textarea
              className="message-input disabled:cursor-none"
              placeholder={t(tMessages.common.enterMessage())}
              value={questionContent}
              onChange={handleOnChangeQuestion}
              onKeyDown={handleKeyDown}
              disabled={disabledInput}
            ></textarea>
            <button
              type="submit"
              className="message-submit disabled:cursor-none"
              onClick={handleOnSubmit}
              disabled={disabledInput || !questionContent}
            >
              {t(tMessages.common.send())}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChatMessages;
