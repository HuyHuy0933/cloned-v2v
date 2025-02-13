import { Button, Spinner, UserAvatar } from "@/components";
import {
  EndCallIcon,
  Microphone2Icon,
  RaiseHandIcon,
  RecordIcon,
  UserPlusIcon,
  UsersIcon,
} from "@/components/icons";
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
import { CalendarIcon } from "@radix-ui/react-icons";
import React, { lazy, Suspense, useCallback, useEffect, useState } from "react";
import PCMessageItem from "../../messages/PCMessageItem";
import { useDispatch } from "react-redux";
import { mobileLayout, pcLayout } from "@/features/ui/uiSlice";
import PCUserList from "./PCUserList";
import MessageList from "@/containers/messages/MessageList";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";
import { secondsToTimerWithSpace } from "@/lib/utils";
import { formatDateTimeLocale } from "@/lib/datetime";
import { useCurrentUser } from "@/hooks";
import { fromUnixTime } from "date-fns";
import { useLocation } from "react-router-dom";
import { MeetingRouteState } from "../Meeting";

const ReplyThreadChat = lazy(() => import("../ReplyThreadChat"));

type LightMeetingProps = {
  fetchingMessages: boolean;
  recording: boolean;
  messages: Message[];
  speakingUserId?: string;
  mediaRecorder?: MediaRecorder;
  meetingUsers: MeetingUser[];
  computedUsers: ComputedMeetingUser[];
  meetingDuration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  toggleHandReaction: () => void;
  clickLeaveMeeting: () => Promise<void>;
  onReactEmoji?: (messageId: string, emoji: string) => void;
  onReplyMessage?: (messageId: string, text: string) => void;
  realtimePlayingMsgId?: string;
  onEditMessage?: (messageId: string, text: string) => void;
  onHighlight?: (
    messageId: string,
    key: keyof HighlightedData,
    payload: HighlightedRange,
  ) => void;
};

// 64px for padding Y
// 64px for title section
// 64px for microphone section
// 32px for gap
const HEIGHT = "calc(100vh - 64px - 64px - 64px - 32px)";

const PCMeeting: React.FC<LightMeetingProps> = ({
  fetchingMessages,
  recording,
  messages,
  speakingUserId,
  mediaRecorder,
  meetingDuration,
  meetingUsers,
  computedUsers,
  startRecording,
  stopRecording,
  toggleHandReaction,
  clickLeaveMeeting,
  onReactEmoji,
  onReplyMessage,
  realtimePlayingMsgId,
  onEditMessage,
  onHighlight,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { setting } = useCurrentUser();
  const location = useLocation();
  const { currentUser, meeting } = location.state as MeetingRouteState;

  const [openReplyInThread, setOpenReplyInThread] = useState(false);
  const [selectedMessageId, setSelectedMessageId] = useState<string>("");
  const [playingMessageId, setPlayingMessageId] = useState<string>("");

  const selectedMessage = messages.find((x) => x.id === selectedMessageId);
  const notSpeakingCurrentUser =
    !!speakingUserId && speakingUserId !== currentUser.userId;

  useEffect(() => {
    dispatch(pcLayout());

    return () => {
      dispatch(mobileLayout());
    };
  }, []);

  const onClickEmoji = useCallback(
    (messageId: string, emoji: string) => {
      if (!onReactEmoji) return;
      onReactEmoji(messageId, emoji);
    },
    [onReactEmoji],
  );

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

  if (fetchingMessages) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div id="pc-meeting" className="h-full w-full">
      <div className="flex h-full w-full flex-col gap-4">
        {/* Meeting tile and recorded time bar */}
        <section className="flex items-center justify-between">
          <div>
            <h1 className="text-[32px] font-semibold">{meeting.meetingName}</h1>
            <p className="text-sm leading-4 text-gray-52">
              <CalendarIcon className="float-left mr-2" />{" "}
              {formatDateTimeLocale(
                meeting.createdAt
                  ? fromUnixTime(meeting.createdAt)
                  : new Date(),
                setting.language,
              )}
            </p>
          </div>
          <div className="flex h-[64px] w-[214px] items-center justify-center rounded-2xl border border-gray-92 text-2xl font-bold">
            <RecordIcon />
            <span className="ml-2">
              {secondsToTimerWithSpace(meetingDuration)}
            </span>
          </div>
        </section>

        {/* User video list, meeting messages, participants */}
        <section className="flex gap-4" style={{ height: HEIGHT }}>
          {/* Meeting user videos */}
          <div className="flex h-fit max-h-full min-h-[96px] w-[130px] shrink-0 flex-col gap-2 overflow-auto rounded-2xl border border-gray-92 bg-white p-2 shadow">
            {meetingUsers.map((user: MeetingUser) => (
              <div
                key={user.userId}
                className="h-[96px] w-full shrink-0 rounded-xl bg-black"
              >
                <div className="float-left flex h-[80%] w-full items-center justify-center border-b-[1px] border-gray-35">
                  <UserAvatar username={user.username} />
                </div>
                <div className="float-left flex h-[20%] w-full items-center justify-between px-2">
                  <span className="text-[10px] text-white">
                    {user.username}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Meeting messages */}
          <div className="flex h-full grow flex-col overflow-auto rounded-2xl border border-gray-92 bg-white shadow">
            <div className="relative flex h-0 w-full grow flex-col">
              <MessageList
                messages={messages}
                renderItem={(message: Message, index: number) => (
                  <PCMessageItem
                    key={message.id}
                    message={message}
                    onPlayAudio={setPlayingMessageId}
                    disabledPlay={
                      !!playingMessageId && playingMessageId !== message.id
                    }
                    isRecording={!!speakingUserId}
                    hideTranslated={
                      message.userId === currentUser.userId ||
                      message.originLang === currentUser.language
                    }
                    isLastMessage={index === messages.length - 1}
                    currentUserId={currentUser.userId}
                    showThreeDots={true}
                    realtimePlayingMsgId={realtimePlayingMsgId}
                    onClickEmoji={onClickEmoji}
                    onReplyInThread={onOpenReplyInThread}
                    onEditConfirm={onEditMessage}
                    onHighlight={onHighlight}
                  />
                )}
              />
            </div>
          </div>

          {/* Meeting participants */}
          <div className="flex w-[400px] shrink-0 flex-col rounded-2xl border border-gray-92 bg-white shadow">
            <div className="flex h-[50px] w-full items-center border-b-[1px] border-gray-92 px-6">
              <span>
                <UsersIcon className="float-left mr-3 text-black" />
                {t(tMessages.common.participants())}
              </span>
            </div>
            <div className="flex w-full grow flex-col p-6">
              {/* participants amount */}
              <div className="flex w-full justify-between gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-gray-92 px-3 py-2">
                  {t(tMessages.common.participants())}
                  <span className="flex size-5 items-center justify-center rounded-md bg-[#42A7E0]/10 text-xs font-medium text-[#42A7E0]">
                    {meetingUsers.length}
                  </span>
                </div>

                {/* Add user */}
                <Button
                  variant="secondary"
                  className="gap-2 bg-gradient-lime-25 px-4 py-2 text-base"
                >
                  <UserPlusIcon className="size-4" />
                  {t(tMessages.common.addPeople())}
                </Button>
              </div>

              {/* participants list */}
              <PCUserList
                users={computedUsers}
                speakingUserId={speakingUserId}
                currentUserId={currentUser.userId}
              />
            </div>
          </div>
        </section>

        {/* Action buttons */}
        <section className="flex h-[64px] w-full justify-center gap-4">
          {notSpeakingCurrentUser ? (
            <Button
              variant="secondary"
              className="size-[64px] rounded-full bg-gradient-lime-100"
              onClick={toggleHandReaction}
            >
              <RaiseHandIcon className="size-8" />
            </Button>
          ) : (
            <Button
              variant="secondary"
              className="size-[64px] rounded-full bg-gradient-lime-100"
              onClick={!recording ? startRecording : stopRecording}
            >
              {recording ? <RecordIcon /> : <Microphone2Icon />}
            </Button>
          )}

          <Button
            variant="secondary"
            className="size-[64px] rounded-full"
            onClick={clickLeaveMeeting}
          >
            <EndCallIcon />
          </Button>
        </section>
      </div>

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
            layout="pc"
          />
        </Suspense>
      )}
    </div>
  );
};

export default PCMeeting;
