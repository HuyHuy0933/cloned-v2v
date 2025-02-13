import {
  AutoHeightInput,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
  Label,
  RadioGroup,
  RadioGroupItem,
  Spinner,
  TextWritter,
} from "@/components";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  SymbolIcon,
  Cross2Icon,
  CheckIcon,
  PauseIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Emoji, emojis, flagIcon } from "@/lib/constaints";
import {
  HighlightedRange,
  HIGHLIGHT_TYPE_ENUM,
  Message,
  HighlightedData,
} from "@/features/messages/types";
import MessageEmojis from "./MessageEmojis";
import {
  ChatCircleDotIcon,
  HighlighterIcon,
  PencilIcon,
  ShowEyeIcon,
  TranslateIcon,
  Vertical3DotsIcon,
  VolumeIcon,
} from "@/components/icons";
import MessageReplies from "./MessageReplies";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";
import { useSelector } from "react-redux";
import { RootState } from "@/main";
import { TRANSLATION_MODE } from "@/features/settings/types";
import HighlightedSentence from "./HighlightedSentence";
import { useLocation } from "react-router-dom";
import { MeetingRouteState } from "../meeting/Meeting";

export const annotations: string[] = [
  HIGHLIGHT_TYPE_ENUM.CHECK,
  HIGHLIGHT_TYPE_ENUM.WARNING,
  HIGHLIGHT_TYPE_ENUM.ERROR,
];

type MessageItemProps = {
  className?: string;
  message: Message;
  disabledPlay?: boolean;
  onPlayAudio?: (messageId: string) => void;
  onEditConfirm?: (messageId: string, newTranscript: string) => void;
  isRecording?: boolean;
  isLastMessage?: boolean;
  hideOrigin?: boolean;
  hideTranslated?: boolean;
  hideVolume?: boolean;
  allowHoverEdit?: boolean;
  noPlayingHighlight?: boolean;
  currentUserId?: string;
  showThreeDots?: boolean;
  realtimePlayingMsgId?: string;
  fontSize?: string;
  onClickEmoji?: (messageId: string, emoji: string) => void;
  onReplyInThread?: (messageId: string) => void;
  onGetTranslatedData?: (messageId: string) => Promise<void>;
  onHighlight?: (
    messageId: string,
    key: keyof HighlightedData,
    payload: HighlightedRange,
  ) => void;
};

const MessageItem: React.FC<MessageItemProps> = React.memo(
  ({
    className,
    message,
    onPlayAudio,
    disabledPlay = false,
    onEditConfirm,
    isRecording = false,
    isLastMessage = false,
    hideOrigin = false,
    hideTranslated = false,
    hideVolume = false,
    allowHoverEdit = false,
    currentUserId,
    showThreeDots = false,
    realtimePlayingMsgId = "",
    noPlayingHighlight = false,
    fontSize = "0.875rem",
    onClickEmoji,
    onReplyInThread,
    onGetTranslatedData,
    onHighlight,
  }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const translationMode = useSelector((state: RootState) => state.setting.translationMode);
    const currentUser = (location.state as MeetingRouteState)?.currentUser

    const audioRef = useRef<HTMLAudioElement>(null);
    const audioIndexRef = useRef<number>(0);
    const [edittingTranscript, setEdittingTranscript] = useState("");
    const [playing, setPlaying] = useState(false);
    const [playingHighlightIdx, setPlayingHighlighIdx] = useState<number>(-1);
    const [highlighting, setHighlighting] = useState<boolean>(false);
    const [translating, setTranslating] = useState<boolean>(false);
    const [showOrigin, setShowOrigin] = useState<boolean>(false);
    // const [annotator, setAnnotator] = useState<HIGHLIGHT_TYPE_ENUM>(
    //   HIGHLIGHT_TYPE_ENUM.CHECK,
    // );

    const originTexts = message.originTexts;
    const correctedTexts = message.correctedTexts;
    const translatedTexts = message.translatedTexts;
    const reversedTexts = message.reversedTexts;
    const translatedAudios = message.translatedAudios;
    const isTranslating = message.isTranslating;
    const showOriginOption = translationMode !== TRANSLATION_MODE.ONLINE;

    const flattenAudios = translatedAudios.flat();
    let hasAllAudio =
      translatedAudios.length > 0 &&
      translatedAudios.length === originTexts.length;
    if (flattenAudios.includes("")) {
      hasAllAudio = false;
    }

    useEffect(() => {
      // when have all audio, trigger auto play audio for last recording message
      if (
        !isRecording &&
        hasAllAudio &&
        isLastMessage &&
        !message.completed &&
        !hideTranslated
      ) {
        playAudio();
      }
    }, [hasAllAudio, isRecording, isLastMessage, message, !message.completed]);

    useEffect(() => {
      if (realtimePlayingMsgId === message.id) {
        setPlayingHighlighIdx(0);
      } else {
        setPlayingHighlighIdx(-1);
      }
    }, [realtimePlayingMsgId, message]);

    const editTranscript = () => {
      setEdittingTranscript(message.correctedTexts.join(" "));
    };

    const confirmEditTranscript = () => {
      if (!onEditConfirm) return;
      setEdittingTranscript("");
      if (edittingTranscript === message.correctedTexts.join(" ")) return;
      onEditConfirm(message.id, edittingTranscript);
    };

    const onAudioClick = () => {
      if (!playing) {
        playAudio();
      } else {
        stopAudio();
      }
    };

    const playAudio = () => {
      if (!audioRef || !audioRef.current) return;

      const flatAudios = message.translatedAudios.flat();
      if (!flatAudios[audioIndexRef.current]) return;

      audioRef.current.src = flatAudios[audioIndexRef.current];
      // audioRef.current.setSinkId(device.outputDevice.deviceId);
      audioRef.current.play();
      setPlaying(true);
      onPlayAudio && onPlayAudio(message.id);
      !noPlayingHighlight && setPlayingHighlighIdx(audioIndexRef.current);
    };

    const stopAudio = () => {
      if (!audioRef || !audioRef.current) return;
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioIndexRef.current = 0;
      setPlaying(false);
      onPlayAudio && onPlayAudio("");
      setPlayingHighlighIdx(-1);
    };

    const onAudioEnd = () => {
      const flatAudios = message.translatedAudios.flat();
      if (audioIndexRef.current >= flatAudios.length - 1) {
        stopAudio();
        return;
      }

      audioIndexRef.current++;
      playAudio();
    };

    const clickEmoji = useCallback(
      (emoji: string) => {
        onClickEmoji && onClickEmoji(message.id, emoji);
      },
      [onClickEmoji],
    );

    const replyInThread = useCallback(() => {
      onReplyInThread && onReplyInThread(message.id);
    }, [onReplyInThread]);

    const highlightMsg = useCallback(
      (start: number, end: number, key: string) => {
        if (!highlighting) return;

        onHighlight &&
          onHighlight(message.id, key as keyof HighlightedData, {
            start,
            end,
          });
      },
      [highlighting, onHighlight],
    );

    const getTranslatedData = async () => {
      if (!onGetTranslatedData) return;
      setTranslating(true);
      await onGetTranslatedData(message.id);
      setTranslating(false);
    };

    const toggleShowOriginText = async () => {
      setShowOrigin((prev) => !prev);
    };

    const volumeIcon =
      hasAllAudio && !hideVolume ? (
        <IconButton
          className="absolute right-[-10px] top-0 transition duration-200 hover:scale-[1.2]"
          onClick={() => onAudioClick()}
          disabled={disabledPlay || isRecording}
        >
          {playing ? (
            <PauseIcon className="h-3 w-4" />
          ) : (
            <VolumeIcon className="size-4" />
          )}
        </IconButton>
      ) : null;

    const isCurrentUser = currentUserId && message.userId === currentUserId;
    let color = isCurrentUser ? "#ffffff" : "#a3a3a3";
    let originTextSection = (
      <div className="relative w-full">
        <div
          className={`relative w-full ${allowHoverEdit ? "hover:bg-neutral-600" : ""} pr-4`}
          onClick={allowHoverEdit ? editTranscript : undefined}
        >
          {originTexts.map((text: string, chunkIdx: number) => {
            if (correctedTexts[chunkIdx]) {
              return (
                <HighlightedSentence
                  key={`origin_chunk_${chunkIdx + 1}`}
                  style={{
                    fontSize,
                    color: playingHighlightIdx === chunkIdx ? "#42b0f3" : color,
                  }}
                  sentence={correctedTexts[chunkIdx]}
                  annotations={message.highlights?.origins || []}
                  onHighlight={(start, end) =>
                    highlightMsg(start, end, "origins")
                  }
                />
              );
            }

            return (
              <TextWritter
                key={`origin_chunk_${chunkIdx + 1}`}
                className="mr-1"
                style={{
                  fontSize,
                  color,
                }}
                text={text}
              />
            );
          })}

          {showOrigin && (
            <p
              className="text-white/60"
              style={{
                fontSize,
              }}
            >
              ({t(tMessages.common.original())}) {originTexts.join(" ")}
            </p>
          )}
          {hideTranslated && volumeIcon}
        </div>
        {edittingTranscript && (
          <div className="absolute left-0 top-0 z-[50] w-full">
            <AutoHeightInput
              className="mb-6 h-auto overflow-hidden bg-modal"
              value={edittingTranscript}
              onChange={(event) => setEdittingTranscript(event.target.value)}
            />
            <div className="absolute -bottom-2 right-2 z-50 flex gap-1">
              <Button
                size="sm"
                className="bg-modal hover:bg-modal"
                onClick={confirmEditTranscript}
              >
                <CheckIcon className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                className="bg-modal hover:bg-modal"
                onClick={() => {
                  setEdittingTranscript("");
                }}
              >
                <Cross2Icon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );

    if (hideOrigin) {
      originTextSection = <></>;
    }

    let translatedTextSection = (
      <div className="relative w-full pr-4">
        {translatedTexts.map((text: string, chunkIdx: number) => {
          return (
            <HighlightedSentence
              key={`translated_chunk_${chunkIdx + 1}`}
              style={{
                fontSize,
                color: playingHighlightIdx === chunkIdx ? "#42b0f3" : color,
              }}
              sentence={text}
              annotations={message.highlights?.translations?.[currentUser.language] || []}
              onHighlight={(start, end) =>
                highlightMsg(start, end, "translations")
              }
            />
          );
        })}
        {isTranslating ? (
          <span className="inline-flex items-center text-xl text-white">
            <SymbolIcon className="mr-1 h-3 w-3 animate-spin" /> Translating...
          </span>
        ) : null}
        {volumeIcon}
      </div>
    );
    if (hideTranslated || translatedTexts.length === 0) {
      translatedTextSection = <></>;
    }

    return (
      <div className="relative mt-2 flex shrink flex-col">
        <div
          key={message.id}
          className={cn(
            `relative min-h-10 w-full min-w-[200px] shrink-0 flex-col gap-1 rounded-2xl ${isCurrentUser ? "bg-[#0a637c]" : "bg-primary"} px-4 py-2 ${
              message.originTexts.join("").trim().length > 0 ? "flex" : "hidden"
            }`,
            className,
          )}
        >
          <div className="flex w-full space-x-2 pr-4">
            {message.username && (
              <>
                <img
                  src={flagIcon[message.originLang]}
                  alt="flag"
                  width={15}
                  className="inline"
                />
                <span className="text-xs">{message.username}</span>
              </>
            )}
            {message.createdAt >= 0 && (
              <span
                className={`text-[10px] ${message.createdAt === 0 ? "opacity-0" : "opacity-100"}`}
              >
                {format(message.createdAt, "HH:mm")}
              </span>
            )}
          </div>

          {/* Origin, translation text */}
          <div className="flex w-full flex-col space-y-2">
            {originTextSection}

            {translatedTextSection}

            {/* reversed text */}
            {!hideOrigin &&
              !hideTranslated &&
              reversedTexts &&
              reversedTexts.length > 0 && (
                <div className="w-full">
                  {reversedTexts.map((text: string, index: number) => (
                    <p
                      key={`reversed-${index}`}
                      className="mr-2 text-neutral-400"
                      style={{
                        fontSize,
                      }}
                    >
                      {`${text}`}
                    </p>
                  ))}
                </div>
              )}
          </div>

          {/* Three dots icon */}
          <div className="absolute right-1 top-0 flex items-center gap-2">
            {message.noTranslatedData && (
              <IconButton onClick={getTranslatedData}>
                {translating ? (
                  <Spinner className="size-2" />
                ) : (
                  <TranslateIcon className="size-4" />
                )}
              </IconButton>
            )}
            {highlighting && (
              <IconButton onClick={() => setHighlighting(false)}>
                <CheckIcon className="size-5" />
              </IconButton>
            )}

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <IconButton
                  className={`rotate-90 ${showThreeDots ? "block" : "hidden"}`}
                >
                  <Vertical3DotsIcon className="size-6 text-neutral-300 transition duration-200 hover:scale-[1.2]" />
                </IconButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="min-w-30 border-primary bg-modal px-2 text-neutral-300"
                align="end"
              >
                <DropdownMenuGroup className="flex flex-row justify-evenly gap-4">
                  {emojis.map((emo: Emoji, index: number) => (
                    <DropdownMenuItem
                      key={index}
                      className="size-6 cursor-none rounded-full p-0 text-base focus:bg-primary-foreground"
                      onClick={() => clickEmoji(emo.name)}
                    >
                      {emo.code}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="mx-0 bg-primary-foreground" />
                <DropdownMenuGroup>
                  {message.userId === currentUserId && (
                    <DropdownMenuItem
                      className="cursor-none gap-3 text-sm focus:bg-primary focus:text-neutral-200"
                      onClick={editTranscript}
                    >
                      <PencilIcon /> {t(tMessages.common.editMsg())}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="cursor-none gap-3 text-sm focus:bg-primary focus:text-neutral-200"
                    onClick={replyInThread}
                  >
                    <ChatCircleDotIcon /> {t(tMessages.common.replyInThread())}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-none gap-3 text-sm focus:bg-primary focus:text-neutral-200"
                    onClick={() => setHighlighting(true)}
                  >
                    <HighlighterIcon /> {t(tMessages.common.highlightMsg())}
                  </DropdownMenuItem>
                  {showOriginOption && (
                    <DropdownMenuItem
                      className="cursor-none gap-3 text-sm focus:bg-primary focus:text-neutral-200"
                      onClick={() => toggleShowOriginText()}
                    >
                      <ShowEyeIcon className="size-5" />{" "}
                      {t(tMessages.common.showOriginText())}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Three annotator buttons for highlighting */}
          {/* {highlighting && (
            <RadioGroup
              className="absolute -bottom-10 z-50 flex gap-2 rounded bg-modal px-2 py-1"
              value={annotator}
              onValueChange={(value) =>
                setAnnotator(value as HIGHLIGHT_TYPE_ENUM)
              }
            >
              {annotations.map((anno) => (
                <Label
                  key={anno}
                  className="flex items-center justify-center rounded bg-primary p-1 text-xs has-[[data-state=checked]]:bg-primary-foreground sm:text-sm"
                >
                  {anno}
                  <RadioGroupItem
                    value={anno}
                    className="sr-only after:absolute after:inset-0"
                  />
                </Label>
              ))}
            </RadioGroup>
          )} */}

          <audio
            src=""
            ref={audioRef}
            onEnded={onAudioEnd}
            onError={stopAudio}
            className="hidden"
          ></audio>
        </div>

        {/* Bottom msg data includes emojis, replies, and center messages */}
        <div className="z-[30] -mt-2.5 flex w-full flex-col">
          {message.emojis && (
            <MessageEmojis
              className={`${isCurrentUser ? "justify-end" : ""} mt-1 gap-1`}
              emojis={message.emojis}
              emojiItemClasses={`rounded-xl text-xs border border-solid border-neutral-500 ${isCurrentUser ? "bg-neutral-700 hover:bg-neutral-600" : "bg-neutral-600 hover:bg-neutral-700"}`}
              onClickEmoji={(emoji) => clickEmoji(emoji)}
            />
          )}

          {message.replies && message.replies.length > 0 && (
            <MessageReplies
              className={`${isCurrentUser ? "justify-end" : ""} mt-1 gap-1`}
              replies={message.replies}
              onClick={replyInThread}
            />
          )}

          {message.centerData?.activeUser && (
            <div className="mt-2 w-full text-center">
              {
                <p className="text-sm text-muted-foreground">
                  {message.centerData.activeUser.status
                    ? `🟢 ${message.centerData.activeUser.username}${t(tMessages.common.hasEnteredRoom())}`
                    : `🔴 ${message.centerData.activeUser.username}${t(tMessages.common.hasLeftRoom())}`}
                </p>
              }
            </div>
          )}
        </div>
      </div>
    );
  },
);

export default MessageItem;
