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
  TextWritter,
  UserAvatar,
} from "@/components";
import {
  ChatCircleDotIcon,
  HighlighterIcon,
  PencilIcon,
  ShowEyeIcon,
  Vertical3DotsIcon,
  Volume2Icon,
} from "@/components/icons";
import MessageEmojis from "@/containers/messages/MessageEmojis";
import {
  HighlightedData,
  HighlightedRange,
  Message,
} from "@/features/messages/types";
import { Emoji, emojis } from "@/lib/constaints";
import { cn, secondsToTimer } from "@/lib/utils";
import { CheckIcon, Cross2Icon, PauseIcon } from "@radix-ui/react-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import MessageReplies from "./MessageReplies";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";
import { RootState } from "@/main";
import { useSelector } from "react-redux";
import { TRANSLATION_MODE } from "@/features/settings/types";
import HighlightedSentence from "./HighlightedSentence";
import { useLocation } from "react-router-dom";
import { MeetingRouteState } from "../meeting/Meeting";

type SecretaryMessageProps = {
  className?: string;
  message: Message;
  onPlayAudio?: (messageId: string) => void;
  disabledPlay?: boolean;
  isRecording?: boolean;
  hideOrigin?: boolean;
  hideTranslated?: boolean;
  hideVolume?: boolean;
  isLastMessage?: boolean;
  currentUserId?: string;
  showThreeDots?: boolean;
  realtimePlayingMsgId?: string;
  onClickEmoji?: (messageId: string, emoji: string) => void;
  onReplyInThread?: (messageId: string) => void;
  onEditConfirm?: (messageId: string, newTranscript: string) => void;
  onHighlight?: (
    messageId: string,
    key: keyof HighlightedData,
    payload: HighlightedRange,
  ) => void;
};

const PCMessageItem: React.FC<SecretaryMessageProps> = ({
  className,
  message,
  onPlayAudio,
  disabledPlay = false,
  isRecording = false,
  hideOrigin = false,
  hideTranslated = false,
  hideVolume = false,
  isLastMessage = false,
  onClickEmoji,
  showThreeDots = false,
  currentUserId,
  onReplyInThread,
  realtimePlayingMsgId = "",
  onEditConfirm,
  onHighlight,
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const translationMode = useSelector(
    (state: RootState) => state.setting.translationMode,
  );
  const currentUser = (location.state as MeetingRouteState)?.currentUser || ""

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioIndexRef = useRef<number>(0);
  const [playing, setPlaying] = useState(false);
  const [playingHighlightIdx, setPlayingHighlighIdx] = useState<number>(-1);
  const [highlighting, setHighlighting] = useState<boolean>(false);
  const [edittingTranscript, setEdittingTranscript] = useState("");
  const [showOrigin, setShowOrigin] = useState<boolean>(false);
  const showOriginOption = translationMode !== TRANSLATION_MODE.ONLINE;
  // const [annotator, setAnnotator] = useState<HIGHLIGHT_TYPE_ENUM>(
  //   HIGHLIGHT_TYPE_ENUM.CHECK,
  // );

  const originTexts = message.originTexts;
  const correctedTexts = message.correctedTexts;
  const translatedTexts = message.translatedTexts;
  const translatedAudios = message.translatedAudios;

  const flattenAudios = translatedAudios.flat();
  let hasAllAudio =
    translatedAudios.length > 0 &&
    translatedAudios.length === originTexts.length;
  if (flattenAudios.includes("")) {
    hasAllAudio = false;
  }

  useEffect(() => {
    if (realtimePlayingMsgId === message.id) {
      setPlayingHighlighIdx(0);
    } else {
      setPlayingHighlighIdx(-1);
    }
  }, [realtimePlayingMsgId, message]);

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
    setPlayingHighlighIdx(audioIndexRef.current);
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

  const editTranscript = () => {
    setEdittingTranscript(message.correctedTexts.join(" "));
  };

  const confirmEditTranscript = () => {
    if (!onEditConfirm) return;
    setEdittingTranscript("");
    onEditConfirm(message.id, edittingTranscript);
  };

  const toggleShowOriginText = async () => {
    setShowOrigin((prev) => !prev);
  };

  const highlightMsg = useCallback(
    (start: number, end: number, key: string) => {
      console.log("highlightMsg", start, end, key);
      if (!highlighting) return;

      onHighlight &&
        onHighlight(message.id, key as keyof HighlightedData, {
          start,
          end,
        });
    },
    [highlighting, onHighlight],
  );

  let originText = (
    <div className="relative w-full">
      {originTexts.map((text: string, chunkIdx: number) => {
        if (correctedTexts[chunkIdx]) {
          return (
            <HighlightedSentence
              key={`origin_chunk_${chunkIdx + 1}`}
              className="mr-1 text-sm"
              style={{
                color: playingHighlightIdx === chunkIdx ? "#42b0f3" : "#868782",
              }}
              sentence={correctedTexts[chunkIdx]}
              annotations={message.highlights?.origins || []}
              onHighlight={(start, end) => highlightMsg(start, end, "origins")}
            />
          );
        }

        return (
          <TextWritter
            key={`origin_${chunkIdx}`}
            className="mr-1 text-sm text-gray-52"
            text={text}
          />
        );
      })}

      {showOrigin && (
        <p className="text-sm text-gray-52/70">
          ({t(tMessages.common.original())}) {originTexts.join(" ")}
        </p>
      )}

      {edittingTranscript && (
        <div className="absolute -top-2 left-0 z-20 w-full">
          <AutoHeightInput
            className="mb-6 h-auto w-full overflow-hidden border-gray-92 bg-white"
            value={edittingTranscript}
            onChange={(event) => setEdittingTranscript(event.target.value)}
          />
          <div className="absolute -bottom-2 right-2 z-50 flex gap-1">
            <Button
              size="sm"
              className="bg-gray-52 hover:bg-gray-52"
              onClick={confirmEditTranscript}
            >
              <CheckIcon className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              className="bg-gray-52 hover:bg-gray-52"
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
    originText = <></>;
  }

  let translatedText = (
    <div className="">
      {translatedTexts.map((text: string, chunkIdx: number) => {
        return (
          <HighlightedSentence
            key={`translated_chunk_${chunkIdx + 1}`}
            className="mr-1"
            style={{
              color: playingHighlightIdx === chunkIdx ? "#42b0f3" : "black",
            }}
            sentence={text}
            annotations={
              message.highlights?.translations?.[currentUser.language] || []
            }
            onHighlight={(start, end) =>
              highlightMsg(start, end, "translations")
            }
          />
        );
      })}
    </div>
  );
  if (hideTranslated) {
    translatedText = <></>;
  }

  return (
    <div
      className={cn(
        `min-h-[60px] w-full shrink-0 flex-col justify-center gap-2 border-b-[1px] px-4 py-2 pr-2 ${message.originTexts.join("").trim().length > 0 ? "flex" : "hidden"}`,
        className,
      )}
    >
      <div className="relative flex w-full items-start justify-between gap-4">
        {/* user avatar and message */}
        <div className="flex w-full items-start gap-4">
          <div className="relative">
            <UserAvatar
              className="shrink-0"
              username={message.username || ""}
            />
          </div>
          <div className="w-full">
            {originText}
            {translatedText}
            <span className="text-[10px] text-gray-52">
              {format(message.createdAt, "HH:mm")}
            </span>
          </div>
        </div>

        {/* speaker icon, duration and 3 dots */}
        <div className="flex items-center gap-2 text-xs text-gray-52">
          {hasAllAudio && !hideVolume ? (
            <>
              <IconButton
                className="transition duration-200 hover:scale-[1.2]"
                onClick={() => onAudioClick()}
                disabled={disabledPlay || isRecording}
              >
                {playing ? (
                  <PauseIcon className="h-4 w-5 text-gray-52" />
                ) : (
                  <Volume2Icon />
                )}
              </IconButton>
              {secondsToTimer(Math.round(message.translatedAudioDuration || 0))}
            </>
          ) : null}

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <IconButton className={`${showThreeDots ? "block" : "hidden"}`}>
                <Vertical3DotsIcon className="size-6 text-gray-52 transition duration-200 hover:scale-[1.2] hover:text-gray-700" />
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-30 border-gray-92 bg-gray-97 px-2 text-gray-52"
              align="end"
            >
              <DropdownMenuGroup className="flex flex-row justify-evenly gap-4">
                {emojis.map((emo: Emoji, index: number) => (
                  <DropdownMenuItem
                    key={index}
                    className="size-6 cursor-none rounded-full p-0 text-base focus:bg-gray-92"
                    onClick={() => clickEmoji(emo.name)}
                  >
                    {emo.code}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="mx-0 bg-gray-92" />
              <DropdownMenuGroup>
                {message.userId === currentUserId && (
                  <DropdownMenuItem
                    className="cursor-none gap-3 text-sm text-gray-52 focus:bg-gray-92"
                    onClick={editTranscript}
                  >
                    <PencilIcon /> {t(tMessages.common.editMsg())}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  className="cursor-none gap-3 text-sm text-gray-52 focus:bg-gray-92"
                  onClick={replyInThread}
                >
                  <ChatCircleDotIcon /> {t(tMessages.common.replyInThread())}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-none gap-3 text-sm text-gray-52 focus:bg-gray-92"
                  onClick={() => setHighlighting(true)}
                >
                  <HighlighterIcon /> {t(tMessages.common.highlightMsg())}
                </DropdownMenuItem>
                {showOriginOption && (
                  <DropdownMenuItem
                    className="cursor-none gap-3 text-sm text-gray-52 focus:bg-gray-92"
                    onClick={() => toggleShowOriginText()}
                  >
                    <ShowEyeIcon className="size-5" />{" "}
                    {t(tMessages.common.showOriginText())}
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {highlighting && (
            <IconButton className="" onClick={() => setHighlighting(false)}>
              <CheckIcon className="size-6 text-gray-52" />
            </IconButton>
          )}
        </div>

        {/* Three annotator buttons for highlighting */}
        {/* {highlighting && (
          <RadioGroup
            className="absolute -bottom-4 right-6 z-50 flex gap-2 rounded border-gray-92 bg-gray-92 px-2 py-1"
            value={annotator}
            onValueChange={(value) =>
              setAnnotator(value as HIGHLIGHT_TYPE_ENUM)
            }
          >
            {annotations.map((anno) => (
              <Label
                key={anno}
                className="flex items-center justify-center rounded bg-transparent p-1 text-xs has-[[data-state=checked]]:bg-gray-97 sm:text-sm"
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
      </div>

      {message.emojis && message.emojis.length > 0 && (
        <MessageEmojis
          emojis={message.emojis}
          onClickEmoji={clickEmoji}
          emojiItemClasses="rounded-xl border bg-transparent border-gray-92 hover:bg-gray-97"
        />
      )}

      {message.replies && message.replies.length > 0 && (
        <MessageReplies
          className="mt-1"
          replies={message.replies}
          onClick={replyInThread}
          layout="pc"
        />
      )}

      <audio
        src=""
        ref={audioRef}
        onEnded={onAudioEnd}
        onError={stopAudio}
        className="hidden"
      ></audio>
    </div>
  );
};

export default PCMessageItem;
