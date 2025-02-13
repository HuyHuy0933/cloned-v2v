import { useEffect } from "react";
import Fuse from "fuse.js";
import { UserAvatar } from "@/components";
import {
  PIIEntity,
  RecordedAudio,
  RecordedAudioDiary,
  RecordedAudioDiaryExt,
} from "@/features/record-audios/types";
import { cn, secondsToTimer } from "@/lib/utils";
import { BOT_NAME } from "../meeting/Meeting";
import { TeamsIcon } from "@/components/icons";
import { useState } from "react";
import { catchError } from "@/lib/trycatch";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEY } from "@/lib/constaints";
import { fetchMeetingDetails } from "@/features/meeting/queries";
import { useSelector } from "react-redux";
import { RootState } from "@/main";
import HighlightedSentence from "../messages/HighlightedSentence";
import { HighlightedRange } from "@/features/messages/types";

type AudioDiaryProps = {
  audio: RecordedAudio;
  activeTags: string[];
  audioPlayerCurrentTime?: number;
  isPlaying?: boolean;
  onClick?: (startTime: number) => void;
  className?: string;
};

const colors: Record<string, string> = {
  1: "#5dade2",
  2: "#f1948a",
  3: "#58d68d",
  4: "#f8c471",
  5: "#c39bd3",
  6: "#48c9b0",
  7: "#f0b27a",
  8: "#5daade",
  9: "#e57373",
  10: "#52be80",
  11: "#af7ac5",
  12: "#f7dc6f",
  13: "#e59866",
  14: "#48c9b0",
  15: "#5d6d7e",
  16: "#b3b6b7",
  17: "#d5e8d4",
  18: "#ff9a8a",
  19: "#90a4ae",
  20: "#64c2f6",
};

const AudioDiary: React.FC<AudioDiaryProps> = ({
  audio,
  activeTags,
  audioPlayerCurrentTime = -1,
  isPlaying,
  onClick,
  className,
}) => {
  const queryClient = useQueryClient();
  const [diaries, setDiaries] = useState<RecordedAudioDiaryExt[]>([]);
  const setting = useSelector((state: RootState) => state.setting);

  const handleResetAudioDiaries = (diaries: RecordedAudioDiary[]) => {
    const transformedDiaries: RecordedAudioDiaryExt[] = diaries.map((diary) => {
      let maskedTranscript = diary.transcript;

      if (diary.piiEntities) {
        maskedTranscript = maskTranscript(
          diary.transcript,
          diary.piiEntities.entities,
        );
      }

      return {
        ...diary,
        transcript: maskedTranscript,
        tts: false,
      };
    });

    setDiaries(transformedDiaries);
  };

  const maskTranscript = (transcript: string, entities: PIIEntity[]) => {
    // Get Pii Categories from Setting
    const piiCategories = setting.piiCategories
      ? [
          ...new Set(
            setting.piiCategories
              .filter((item) => item.category)
              .map((item) => item.category?.replace(/_/g, "")),
          ),
        ]
      : [];

    let maskedText = transcript;

    if (entities.length == 0 || piiCategories.length == 0) {
      return maskedText;
    }

    for (const entity of entities) {
      const shouldMasking = piiCategories.some((cat) =>
        cat?.includes(entity.category),
      );

      if (!shouldMasking) {
        continue;
      }

      const start = entity.offset;
      const end = start + entity.length;

      maskedText =
        maskedText.slice(0, start) +
        "*".repeat(entity.length) +
        maskedText.slice(end);
    }

    return maskedText;
  };

  // Initilize the fuse.js options
  const fuseOptions = {
    includeScore: true,
    shouldSort: true,
    threshold: 0.2,
    keys: ["translated_text"],
  };

  const filteringTTSTranscript = async () => {
    const [err, data] = await catchError(
      queryClient.fetchQuery({
        queryKey: [QUERY_KEY.MEETING_DETAIL, audio.meeting_id],
        queryFn: () => fetchMeetingDetails(audio.meeting_id || ""),
        staleTime: Infinity,
      }),
    );

    if (err || !data?.conversation?.length) {
      handleResetAudioDiaries(audio.diary);
      return;
    }

    // Remove chunkes where origin_text is empty
    const processedConversations = data.conversation.filter(
      (conv) => conv.origin_text !== "",
    );
    // Find the best match to determine whether it is TTS
    const fuse = new Fuse(processedConversations, fuseOptions);
    const updatedAudioDiaries = audio.diary.map((item) => {
      const [bestMatch] = fuse.search(item.transcript);
      const isTTS =
        bestMatch?.item.origin_text !== bestMatch?.item.translated_text ||
        false;

      let maskedTranscript = item.transcript;

      if (item.piiEntities) {
        maskedTranscript = maskTranscript(
          item.transcript,
          item.piiEntities.entities,
        );
      }

      return {
        ...item,
        transcript: maskedTranscript,
        tts: isTTS,
      };
    });

    setDiaries(updatedAudioDiaries);
  };

  useEffect(() => {
    if (audio.type == "meeting") {
      filteringTTSTranscript();
    } else {
      handleResetAudioDiaries(audio.diary);
    }
  }, [audio]);

  const renderTimer = (seconds: number) => {
    let result = secondsToTimer(Math.round(seconds));

    if (Math.floor(audio.duration / 3600) <= 0) {
      result = result.substring(3);
    }

    return result;
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-4 overflow-auto px-2",
        className,
      )}
    >
      {diaries.map((item: RecordedAudioDiaryExt, index: number) => {
        const isHighlight = !isPlaying
          ? false
          : item.start_time <= audioPlayerCurrentTime &&
            audioPlayerCurrentTime <= item.end_time;

        let splitTranscripts = [item.transcript];

        // styling texts included in active tags

        let regexInsensitive = undefined;
        if (activeTags.length > 0) {
          regexInsensitive = new RegExp(`(${activeTags.join("|")})`, "gi");
          splitTranscripts = item.transcript.split(regexInsensitive);
        }

        let highlightRanges: HighlightedRange[] = [];
        if (item.highlights && audio.language) {
          if (item.is_translated) {
            highlightRanges = item.highlights.translations?.[audio.language] || [];
          } else {
            highlightRanges = item.highlights.origins || [];
          }
        }


        return (
          <div
            className={`flex w-full items-start gap-4 py-2 hover:bg-[#5493ac80] ${isHighlight ? "bg-[#5493ac80]" : ""}`}
            key={`diary-${index}`}
            onClick={() => onClick && onClick(item.start_time)}
          >
            <div className="flex grow items-start gap-2">
              {item.speaker === BOT_NAME ? (
                <TeamsIcon className="shrink-0" />
              ) : (
                <UserAvatar
                  username={item.speaker.toString()}
                  className="shrink-0"
                />
              )}

              {activeTags.length > 0 ? (
                <div>
                  {splitTranscripts.map((transcript: string, index: number) => {
                    return (
                      <span
                        key={`transcript-${index}`}
                        className={`rounded-sm bg-none ${regexInsensitive?.test(transcript) ? "bg-[#d4f4d2] p-1 text-foreground" : ""} text-xs sm:text-sm`}
                      >
                        {transcript}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <HighlightedSentence
                  className="text-xs sm:text-sm"
                  sentence={item.transcript}
                  annotations={highlightRanges}
                />
              )}
            </div>
            <span className="text-xs sm:text-sm">
              {renderTimer(item.start_time)}
              <br />
              {item.tts && (
                <span className="text-[10px] text-primary-foreground sm:text-sm">
                  TTS
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default AudioDiary;
