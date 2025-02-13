import {
  BackdropOverlay,
  Button,
  Container,
  FontSizeSlider,
  Header,
  IconButton,
  Spinner,
} from "@/components";
import {
  HighlightedData,
  HighlightedRange,
  Message,
} from "@/features/messages/types";
import {
  ComputedMeetingUser,
  MeetingRoom,
  MeetingUser,
} from "@/features/meeting/types";
import React, {
  lazy,
  Suspense,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import MessageItem from "../../messages/MessageItem";
import { MEETING_USER_ROLE } from "../MeetingSetting";
import LanguageRecorder from "../../conversation/LanguageRecorder";
import { LEFT_POSITION } from "@/features/settings/settingSlice";
import { RecorderItem } from "../../conversation/Conversation";
import { allLanguages } from "@/lib/constaints";
import {
  CircleLeftArrowIcon,
  RaiseHandIcon,
  ShareNetworkIcon,
  TeamsIcon,
} from "@/components/icons";
import ProfileDropdown from "@/containers/account-setting/ProfileDropdown";
import MobileUserList from "./MobileUserList";
import MessageList from "@/containers/messages/MessageList";
import { remCalc } from "@/lib/utils";
import { useSelector } from "react-redux";
import { RootState } from "@/main";
import QAChatWindow from "../qa-chat/QAChatWindow";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";
import { config } from "@/lib/config";
import { useToast } from "@/components/ui/use-toast";
import VolumeSettings from "../VolumeSettings";
import NetworkIndicator from "../NetworkIndicator";
import { format } from "date-fns";
import { useLocation } from "react-router-dom";
import { MeetingRouteState } from "../Meeting";

const ReplyThreadChat = lazy(() => import("../ReplyThreadChat"));

type MobileMeetingProps = {
  fetchingMessages: boolean;
  recording: boolean;
  messages: Message[];
  realtimePlayingMsgId?: string;
  speakingUserId?: string;
  mediaRecorder?: MediaRecorder;
  computedUsers: ComputedMeetingUser[];
  botUnmuteMoreThan1?: boolean;
  isWaitingBot?: boolean;
  botHasLeft?: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  toggleHandReaction: () => void;
  clickLeaveMeeting: () => Promise<void>;
  onReactEmoji?: (messageId: string, emoji: string) => void;
  onReplyMessage?: (messageId: string, text: string) => void;
  onEditMessage?: (messageId: string, text: string) => void;
  onGetTranslatedData?: (messageId: string) => Promise<void>;
  onHighlight?: (
    messageId: string,
    key: keyof HighlightedData,
    payload: HighlightedRange,
  ) => void;
};

const MobileMeeting: React.FC<MobileMeetingProps> = React.memo(
  ({
    fetchingMessages,
    recording,
    messages,
    realtimePlayingMsgId = "",
    speakingUserId,
    mediaRecorder,
    computedUsers,
    botUnmuteMoreThan1 = false,
    isWaitingBot = false,
    botHasLeft = false,
    startRecording,
    stopRecording,
    toggleHandReaction,
    clickLeaveMeeting,
    onReactEmoji,
    onReplyMessage,
    onEditMessage,
    onGetTranslatedData,
    onHighlight,
  }) => {
    const { t } = useTranslation();
    const { toast } = useToast();
    const location = useLocation();
    const { currentUser, meeting } = location.state as MeetingRouteState;
    const showLargeRecorderBtn = useSelector(
      (state: RootState) => state.ui.metShowLgRecordBtn,
    );

    const scrollTimeoutRef = useRef<any>(null);
    const [openReplyInThread, setOpenReplyInThread] = useState(false);
    const [selectedMessageId, setSelectedMessageId] = useState<string>("");
    const [playingMessageId, setPlayingMessageId] = useState<string>("");
    const [fontSize, setFontSize] = useState<number>(14);
    const [scrolling, setScrolling] = useState(false);

    const selectedLanguage = allLanguages.find(
      (x) => x.code === currentUser.language,
    );
    const leftRecorder: RecorderItem = {
      language: currentUser.language,
      position: LEFT_POSITION,
    };
    const isBotMeeting = !!meeting.bot_url;
    const hideMicrophone = currentUser.role === MEETING_USER_ROLE.OBSERVER;
    const selectedMessage = messages.find((x) => x.id === selectedMessageId);
    const notSpeakingCurrentUser =
      !!speakingUserId && speakingUserId !== currentUser.userId;

    const onOpenReplyInThread = useCallback((messageId: string) => {
      setOpenReplyInThread(true);
      setSelectedMessageId(messageId);
    }, []);

    const replyMessage = useCallback(
      (text: string) => {
        if (!selectedMessageId || !onReplyMessage) return;
        onReplyMessage(selectedMessageId, text);
      },
      [selectedMessageId, onReplyMessage],
    );

    const copyMeetingLink = async () => {
      await navigator.clipboard.writeText(
        `${config.clientBaseUrl}/meeting/${meeting.meetingId}/invitation`,
      );
      toast({
        title: "",
        description: t(tMessages.common.copiedMeetingLink()),
        duration: 1000,
      });
    };

    const onMessageScroll = (event: any) => {
      setScrolling(true);
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setScrolling(false);
      }, 500);
    };

    const borderColor = useMemo(() => {
      if (!speakingUserId) return "#1a1a1a";
      if (currentUser.userId === speakingUserId) return "#32CD32";

      if (
        computedUsers.some(
          (x) => x.isNextSpeaker && x.userId === currentUser.userId,
        )
      ) {
        return "#FA1A42";
      }

      return "#1a1a1a";
    }, [speakingUserId, computedUsers, currentUser]);

    const groupedUserConsecMsgBubbles: Message[] = useMemo(() => {
      if (messages.length === 0) return [];
      // push same user's consecutive messages into userConsecMessages props
      const groupedMessages: Message[] = [];
      let prevUserId = "";
      let prevItemCreatedAt = "";
      for (const item of messages) {
        if (item.centerData || !item.userId) {
          groupedMessages.push({ ...item });
          prevUserId = "";
          prevItemCreatedAt = "";
          continue;
        }

        if (item.originTexts.length === 0) continue;

        if (prevUserId !== item.userId) {
          groupedMessages.push({ ...item });
          prevUserId = item.userId;
          prevItemCreatedAt = format(item.createdAt, "HH:mm");
        } else {
          const lastItem = groupedMessages[groupedMessages.length - 1];
          if (!lastItem.userConsecMessages) lastItem.userConsecMessages = [];

          // Hide username if it's the same as the previous message
          const updatedItem = { ...item, username: "" };
          // Hide createdAt if it's the same as the previous message
          if (prevItemCreatedAt === format(item.createdAt, "HH:mm")) {
            updatedItem.createdAt = 0;
          } else {
            prevItemCreatedAt = format(item.createdAt, "HH:mm");
          }
          lastItem.userConsecMessages.push(updatedItem);
        }
      }

      return groupedMessages;
    }, [messages]);

    const renderMsgItem = (
      message: Message,
      index: number,
      classname: string = "",
    ) => {
      return (
        <MessageItem
          key={message.id}
          className={classname}
          message={message}
          onPlayAudio={setPlayingMessageId}
          disabledPlay={!!playingMessageId && playingMessageId !== message.id}
          isLastMessage={index === messages.length - 1}
          hideTranslated={
            message.userId === currentUser.userId ||
            message.originLang === currentUser.language
          }
          isRecording={!!speakingUserId}
          currentUserId={currentUser.userId}
          showThreeDots={true}
          fontSize={remCalc(fontSize)}
          realtimePlayingMsgId={realtimePlayingMsgId}
          onEditConfirm={onEditMessage}
          onClickEmoji={onReactEmoji}
          onReplyInThread={onOpenReplyInThread}
          onGetTranslatedData={onGetTranslatedData}
          onHighlight={onHighlight}
        />
      );
    };

    let bottomButton = (
      <LanguageRecorder
        recording={recording}
        recorder={leftRecorder}
        startRecording={startRecording}
        stopRecording={stopRecording}
        mediaRecorder={mediaRecorder}
        disabledRecord={notSpeakingCurrentUser}
        languages={allLanguages}
        showLargeRecorderBtn={showLargeRecorderBtn}
      />
    );

    if (notSpeakingCurrentUser) {
      const isChangeLayout =
        !showLargeRecorderBtn || speakingUserId != undefined;
      bottomButton = !isChangeLayout ? (
        <div className="flex h-full w-full flex-col gap-1">
          <div className="flex h-[50px] w-full items-center justify-between rounded-b-none rounded-t-2xl bg-primary px-4 py-2">
            <div className="flex gap-2">
              <img
                src={selectedLanguage?.flagUrl}
                alt={selectedLanguage?.flagUrl}
                width={20}
              />
              {selectedLanguage && <span>{t(selectedLanguage?.title())}</span>}
            </div>
          </div>

          <Button
            className={`group relative h-[146px] rounded-b-2xl rounded-t-none`}
            onClick={toggleHandReaction}
          >
            <RaiseHandIcon className="size-16" />
          </Button>
        </div>
      ) : (
        <div className="flex h-[50px] w-full justify-between gap-0.5">
          <div className="flex w-14 items-center justify-center rounded-none rounded-tl-2xl bg-primary">
            <div className="flex gap-2">
              <img
                src={selectedLanguage?.flagUrl}
                alt={selectedLanguage?.flagUrl}
                width={20}
              />
            </div>
          </div>

          <Button
            className={`h-[50px] w-full grow rounded-none rounded-tr-2xl`}
            onClick={toggleHandReaction}
          >
            <RaiseHandIcon className="size-8" />
          </Button>
        </div>
      );
    }

    if (hideMicrophone) {
      bottomButton = <></>;
    }

    if (fetchingMessages) {
      return (
        <div className="flex h-full w-full items-center justify-center">
          <Spinner />
        </div>
      );
    }

    const meetingTitle = (
      <div className="flex w-[50%] items-center overflow-hidden text-nowrap">
        {isBotMeeting && <TeamsIcon className="mr-2" />}
        {meeting.meetingName}
      </div>
    );

    let leftHeader = (
      <IconButton
        className="text-base"
        onClick={clickLeaveMeeting}
        disabled={recording}
      >
        <CircleLeftArrowIcon className="size-8 transition duration-200 hover:scale-[1.2]" />
      </IconButton>
    );

    const rightHeader = (
      <>
        {meetingTitle}
        <div className="flex items-center gap-2">
          <NetworkIndicator />

          <IconButton
            className="h-9 flex-col justify-between transition duration-200 hover:scale-[1.2] hover:text-success"
            onClick={copyMeetingLink}
          >
            <ShareNetworkIcon className="size-5" />
            <span className="text-[8px] leading-3">
              {t(tMessages.common.share())}
            </span>
          </IconButton>
          <VolumeSettings />
          <FontSizeSlider
            className="w-20"
            value={[fontSize]}
            min={10}
            max={16}
            step={1}
            onValueChange={(value) => {
              setFontSize(value[0]);
            }}
          />
          <ProfileDropdown disabled={recording} />
        </div>
      </>
    );

    return (
      <div
        className={`flex h-full w-full flex-col border-4 border-background py-4 transition-colors duration-1000`}
        style={{
          borderColor: borderColor,
        }}
      >
        <Header
          leftItem={leftHeader}
          rightItem={rightHeader}
          recording={recording}
          className="px-4"
          centerClasses="opacity-0"
          rightClasses="w-[85%] sm:w-[90%] justify-between items-center "
        />

        <Container className="relative mt-4 flex-col overflow-hidden px-4 sm:px-6">
          {/* meeting messages */}
          <div className="relative flex h-0 w-full grow">
            <MessageList
              messages={groupedUserConsecMsgBubbles}
              onScroll={onMessageScroll}
              renderItem={(message: Message, index: number) =>
                !message.userConsecMessages ? (
                  renderMsgItem(
                    message,
                    index,
                    `w-auto max-w-[95%] ${message.userId === currentUser.userId ? "self-end" : "self-start"}`,
                  )
                ) : (
                  <div
                    key={message.id}
                    className={`mt-2 flex w-auto max-w-[95%] flex-col rounded-2xl pb-2 ${message.userId === currentUser.userId ? "self-end" : "self-start"}`}
                    style={{
                      backgroundColor:
                        message.userId === currentUser.userId
                          ? "#0a637c"
                          : "#ffffff1a",
                    }}
                  >
                    {[message, ...message.userConsecMessages].map(
                      (consecMsg: Message, consecMsgIdx: number) =>
                        renderMsgItem(
                          consecMsg,
                          index + consecMsgIdx,
                          `bg-transparent rounded-none ${consecMsgIdx > 0 ? "border-t border-neutral-500" : ""}`,
                        ),
                    )}
                  </div>
                )
              }
            />

            {/* Question and Answer Chat */}
            <div
              className={`absolute bottom-0 right-0 transition-opacity duration-500 ${scrolling ? "opacity-0" : "opacity-100"}`}
            >
              <QAChatWindow />
            </div>
          </div>

          {/* bottom section */}
          <div className="mt-4 flex w-full items-end gap-2 sm:gap-4">
            {/* recorder button */}
            {bottomButton}

            <div className="w-full space-y-1">
              {botUnmuteMoreThan1 && (
                <p className="text-sm">
                  ⚠️{t(tMessages.common.multiUnmutedUsers())}
                </p>
              )}
              {botHasLeft && (
                <p className="text-sm">⚠️{t(tMessages.common.botHasLeft())}</p>
              )}
              {/* user list */}
              <MobileUserList
                users={computedUsers}
                speakingUserId={speakingUserId}
                currentUserId={currentUser.userId}
              />
            </div>
          </div>

          <>
            {isWaitingBot && (
              <>
                <BackdropOverlay className="z-40 bg-transparent opacity-70">
                  <div className="flex h-full items-center justify-center">
                    {t(tMessages.common.waitingBot())}
                  </div>
                </BackdropOverlay>
              </>
            )}
          </>
        </Container>

        {selectedMessage && (
          <Suspense fallback={<></>}>
            <ReplyThreadChat
              open={openReplyInThread}
              onOpenChange={(value) => {
                setOpenReplyInThread(value);
                if (!value) setSelectedMessageId("");
              }}
              message={selectedMessage}
              currentUserId={currentUser.userId}
              onReplyMessage={replyMessage}
            />
          </Suspense>
        )}
      </div>
    );
  },
);

export default MobileMeeting;
