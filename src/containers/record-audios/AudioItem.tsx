import {
  Button,
  CircularProgress,
  CustomTabsTrigger,
  Input,
  Skeleton,
  Spinner,
  CenterSpinner,
  Tabs,
  TabsContent,
  TabsList,
} from "@/components";
import { secondsToTimer } from "@/lib/utils";
import { fromUnixTime } from "date-fns";
import React, {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CalendarIcon,
  CheckIcon,
  Cross2Icon,
  PauseIcon,
  PlayIcon,
} from "@radix-ui/react-icons";
import {
  ChatsIcon,
  CloudUploadIcon,
  NoiseSuppressionIcon,
  RecorderIcon,
  TeamsIcon,
  UsersIcon,
} from "@/components/icons";
import {
  useUpdateAudioMutation,
  useUpdateAudioProgressMutation,
} from "@/features/record-audios/mutations";
import {
  AUDIO_STATUS_ENUM,
  MEETING_BOT_TYPE,
  RECORDED_AUDIO_TYPE,
  RecordedAudio,
  RecordedAudioDiary,
} from "@/features/record-audios/types";
import AudioSummary from "./AudioSummary";
import { useQueryClient } from "@tanstack/react-query";

import { getAudioBlob } from "@/features/record-audios/queries";
import {
  flagIcon,
  isDesktop,
  LOCAL_STORAGE_KEY,
  QUERY_KEY,
} from "@/lib/constaints";
import { fineTuneOptions } from "./RecordAudios";
import CheckCircleFill from "@/components/icons/CheckCircleFill";
import { useDebounceValue, useMediaQuery } from "usehooks-ts";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";
import { formatDateTimeLocale } from "@/lib/datetime";
import ToggleSharePopup from "./ToggleSharePopup";
import AudioPlayerPopup from "./AudioPlayerPopup";
import AttachmentUploadModal from "./AttachmentUploadModal";
import { useCurrentUser } from "@/hooks";
import LiveBlockProviders from "./audio-editor/LiveBlockProviders";
import FileAttachmentItem from "./FileAttachmentItem";
import { config } from "@/lib/config";
import { AlertCircleIcon, Loader2 } from "lucide-react";

const AudioDiary = lazy(() => import("./AudioDiary"));
const AudioEntityExtraction = lazy(() => import("./AudioEntityExtraction"));
const AudioSentiment = lazy(() => import("./AudioSentiment"));
const TranscriptionEditor = lazy(
  () => import("./audio-editor/TranscriptionEditor"),
);
const QAHistory = lazy(() => import("./QAHistory"));

const ProccessingLoader: React.FC = React.memo(() => {
  const { t } = useTranslation();
  return (
    <div className="flex h-32 w-full items-center justify-center space-x-2">
      <Spinner className="size-4 animate-spin text-neutral-300" />
      <p className="text-sm">{t(tMessages.common.processing())}...</p>
    </div>
  );
});

export const renderTypeIcon = (audio: RecordedAudio) => {
  if (audio.type === RECORDED_AUDIO_TYPE.RECORDER) {
    return <RecorderIcon className="size-4" />;
  }

  if (audio.type === RECORDED_AUDIO_TYPE.UPLOAD) {
    return <CloudUploadIcon className="size-4" />;
  }

  if (audio.bot_type === MEETING_BOT_TYPE.TEAMS) {
    return <TeamsIcon className="size-4" />;
  }

  return <ChatsIcon className="size-4" />;
};

export type AudioItemProps = {
  audio: RecordedAudio;
  onPlayingAudio?: (audioId: string) => void;
  disabled?: boolean;
  showDetail?: boolean;
  isPopupShareVisible?: boolean;
  openEditDiary?: boolean;
  setIsPopupShareVisible?: (isVisible: boolean) => void;
  onTranscriptsChange?: (transcripts: RecordedAudioDiary[]) => void;
  onTabChange?: (tab: string) => void;
  hasEditPermission?: boolean;
};

const AudioItem: React.FC<AudioItemProps> = React.memo(
  ({
    audio,
    onPlayingAudio,
    disabled = false,
    showDetail = false,
    isPopupShareVisible = false,
    openEditDiary = false,
    setIsPopupShareVisible,
    onTranscriptsChange,
    onTabChange,
    hasEditPermission = false,
  }) => {
    const matches = useMediaQuery("(max-width: 800px)");
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { currentUser, setting: userSetting } = useCurrentUser();
    const updateAudioMutation = useUpdateAudioMutation();
    const updateAudioProgressMutation = useUpdateAudioProgressMutation();

    const audioPlayerRef = useRef<HTMLAudioElement>(null);
    const presignUrl = useRef<string>("");
    const playedRef = useRef<boolean>(false);
    const currentTimeRef = useRef<number>(0);

    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [activeTags, setActiveTags] = useState<string[]>([]);
    const [title, setTitle] = useState(() => audio.name);
    const [editting, setEditting] = useState(false);
    const [tab, setTab] = useState("summary");
    const [gettingPresignUrl, setGettingPresignUrl] = useState(false);
    const [playComplete, setPlayComplete] = useState(false);
    const [editorLoaded, setEditorLoaded] = useState(false);
    const [updating, setUpdating] = useState(false);

    const summaryDetail = audio.summaryDetail;
    const isUploading = audio.status === AUDIO_STATUS_ENUM.UPLOADING;
    const showAttachments = tab === "summary";
    const canEditTitle = hasEditPermission && showDetail;
    const isProcessing = audio.status === AUDIO_STATUS_ENUM.PROCESSING;
    const isUploaded = audio.status === AUDIO_STATUS_ENUM.UPLOADED;
    const isFailed = audio.status && audio.status.includes("failed");

    const detailedDivRef = useRef<HTMLDivElement>(null);

    const [debouncedCurrentTime] = useDebounceValue(
      audioPlayerRef.current?.currentTime,
      500,
    );

    useEffect(() => {
      if (audioPlayerRef.current && audio.progress) {
        const current_time = audio.progress.current_progress;
        const percentage = (current_time / audio.duration) * 100;
        audioPlayerRef.current.currentTime = current_time;
        setProgress(percentage >= 100 ? 100 : percentage);
        setPlayComplete(audio.progress.play_complete);
      }
    }, [audio]);

    useEffect(() => {
      if (
        debouncedCurrentTime !== undefined &&
        playedRef.current &&
        audioPlayerRef.current?.currentTime
      ) {
        saveCurrentProgress(audioPlayerRef.current?.currentTime);
      }
    }, [debouncedCurrentTime]);

    useEffect(() => {
      return () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY.AUDIO_PRESIGN_URL, audio.id],
        });

        if (playedRef.current) saveCurrentProgress(currentTimeRef.current);
      };
    }, []);

    useEffect(() => {
      setTitle(audio.name);
    }, [audio.name]);

    useEffect(() => {
      if (!openEditDiary) {
        setEditorLoaded(false);
      } else if (playing) {
        pauseAudio();
      }
    }, [openEditDiary, playing]);

    const handleTimeUpdate = useCallback(() => {
      if (!playing || !audioPlayerRef.current) return;
      const { currentTime } = audioPlayerRef.current;
      currentTimeRef.current = currentTime;
      const percentage = (currentTime / audio.duration) * 100;
      setProgress(percentage >= 100 ? 100 : percentage);
      percentage >= 100 && setPlayComplete(true);
    }, [playing, audioPlayerRef.current]);

    const saveCurrentProgress = async (currentTime: number) => {
      try {
        const id = audio.id;
        const userId = localStorage.getItem(LOCAL_STORAGE_KEY.user_id);
        const playCurrentTime = currentTime;
        const playComplete = currentTime >= audio.duration ? true : false;
        let playCount = audio.progress.play_count || 0; // no increasement
        if (
          !audio.progress.current_progress ||
          audio.progress.current_progress === audio.duration
        ) {
          playCount += 1;
        }

        const payload = {
          userId: userId,
          current_progress: playCurrentTime,
          play_count: playCount,
          play_complete: playComplete,
        };

        await updateAudioProgressMutation.mutateAsync({ id, payload });
      } catch (err) {
        console.error("Error updating audio progress", err);
      }
    };

    const handleAudioEnded = useCallback(() => {
      setPlaying(false);
      onPlayingAudio && onPlayingAudio("");
    }, [onPlayingAudio]);

    const playAudio = async () => {
      if (!audio.fileUrl || !audioPlayerRef.current) return;

      const _presignUrl = await getAudioPresignUrl(audio.fileUrl);
      if (!audioPlayerRef.current.src || presignUrl.current !== _presignUrl) {
        audioPlayerRef.current.src = _presignUrl;
        // audioPlayerRef.current.volume = 0
        presignUrl.current = _presignUrl;
      }

      if (!audioPlayerRef.current.src) {
        audioPlayerRef.current.src = audio.fileUrl;
      }

      if (audio.progress.current_progress >= audio.duration) {
        audioPlayerRef.current.currentTime = 0;
      }

      audioPlayerRef.current.play();
      playedRef.current = true;
      setPlaying(true);
      onPlayingAudio && onPlayingAudio(audio.id);
    };

    const pauseAudio = useCallback(() => {
      if (!playedRef.current) {
        return;
      }

      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        setPlaying(false);
        onPlayingAudio && onPlayingAudio("");
      }
    }, [onPlayingAudio, audioPlayerRef.current]);

    const getAudioPresignUrl = async (audioUrl: string) => {
      if (presignUrl.current) return presignUrl.current;

      setGettingPresignUrl(true);
      const data = await queryClient.fetchQuery({
        queryKey: [QUERY_KEY.AUDIO_PRESIGN_URL, audio.id],
        queryFn: () => getAudioBlob(audioUrl),
        staleTime: Infinity,
      });

      setGettingPresignUrl(false);

      return data;
    };

    useEffect(() => {
      if (!audio.fileUrl) return;
      if (openEditDiary) {
        getAudioPresignUrl(audio.fileUrl).then((url) => {
          presignUrl.current = url;
        });
      }
    }, [openEditDiary, audio]);

    const toggleTag = (event: any, tag: string) => {
      event.stopPropagation();
      if (!showDetail) {
        return;
      }
      setActiveTags((prevTags) =>
        prevTags.includes(tag)
          ? prevTags.filter((t) => t !== tag)
          : [...prevTags, tag],
      );
    };

    const openEditTitle = () => {
      if (isUploading) return;
      setEditting(true);
    };

    const confirmEditTitle = async () => {
      setUpdating(true);
      await updateAudioMutation.mutateAsync({
        id: audio.id,
        title: title,
      });
      setEditting(false);
      setUpdating(false);
    };

    const onTranscriptClick = useCallback(
      (startTime: number) => {
        if (audioPlayerRef.current) {
          audioPlayerRef.current.currentTime = startTime;
          if (!playing) {
            playAudio();
          }
        }
      },
      [playing, audioPlayerRef.current],
    );

    const renderTabsContent = () => {
      const diaryClasses = () => {
        // To keep the editor height
        let result = "w-full ";
        if (editorLoaded && openEditDiary) {
          result += "hidden";
        } else if (!editorLoaded && openEditDiary) {
          result += "opacity-50 pointer-events-none";
        }

        return result;
      };

      return (
        <Tabs
          className="w-full rounded-xl bg-modal"
          value={tab}
          onValueChange={(value) => {
            setTab(value);
            onTabChange && onTabChange(value);
          }}
        >
          <div className="sticky left-0 top-0 z-30 w-full rounded-xl bg-modal p-2">
            <TabsList className="flex h-auto w-full rounded-none bg-background p-0 text-[10px] sm:text-sm">
              <CustomTabsTrigger
                className="h-full grow text-wrap"
                value="summary"
              >
                🤖{matches ? "" : t(tMessages.common.summaryAI())}
              </CustomTabsTrigger>
              <CustomTabsTrigger
                className="h-full grow text-wrap"
                value="diaries"
              >
                📝{matches ? "" : t(tMessages.common.transcription())}
              </CustomTabsTrigger>
              {!!audio.meeting_id && (
                <CustomTabsTrigger
                  className="h-full grow text-wrap"
                  value="questions"
                >
                  ❓{matches ? "" : t(tMessages.common.question())}
                </CustomTabsTrigger>
              )}
              <CustomTabsTrigger
                className="h-full grow text-wrap"
                value="entities"
              >
                📊{matches ? "" : t(tMessages.common.entity())}
              </CustomTabsTrigger>
              {!config.kuritaVersion && (
                <CustomTabsTrigger
                  className="h-full grow text-wrap"
                  value="sentiment"
                >
                  ❤️{matches ? "" : t(tMessages.common.sentiment())}
                </CustomTabsTrigger>
              )}
            </TabsList>
          </div>
          <div className="mt-2 w-full space-y-2 p-2">
            <div className="flex w-full items-center justify-between px-2">
              {/* place */}
              <div className="text-[12px] text-primary-foreground">
                {audio.location && (
                  <span>
                    {t(tMessages.common.location())} {audio.location}
                  </span>
                )}
              </div>
            </div>
            <Suspense fallback={<CenterSpinner />}>
              <TabsContent value="summary">
                {isProcessing ? (
                  <ProccessingLoader />
                ) : (
                  <AudioSummary
                    enableAISummary={audio.enableAISummary}
                    summaryAITemplate={audio.summaryAITemplate}
                    summaryDetail={summaryDetail}
                    participants={
                      audio.type === RECORDED_AUDIO_TYPE.MEETING
                        ? audio.participants
                        : undefined
                    }
                  />
                )}
              </TabsContent>
              <TabsContent className="relative" value="diaries">
                {isProcessing ? (
                  <ProccessingLoader />
                ) : (
                  <>
                    <div className={diaryClasses()}>
                      <AudioDiary
                        audio={audio}
                        activeTags={activeTags}
                        audioPlayerCurrentTime={
                          audioPlayerRef?.current?.currentTime
                        }
                        isPlaying={playing}
                        onClick={onTranscriptClick}
                      />
                    </div>

                    {openEditDiary && (
                      <div
                        className={`w-full ${!editorLoaded ? "absolute inset-0" : ""}`}
                      >
                        {gettingPresignUrl ? (
                          <></>
                        ) : (
                          <LiveBlockProviders roomId={`room_${audio.id}`}>
                            <TranscriptionEditor
                              audio={audio}
                              onTranscriptsChange={onTranscriptsChange}
                              audioPresignUrl={presignUrl.current}
                              onTranscriptsLoaded={() => setEditorLoaded(true)}
                            />
                          </LiveBlockProviders>
                        )}
                      </div>
                    )}
                  </>
                )}
              </TabsContent>

              {!!audio.meeting_id && (
                <TabsContent value="questions">
                  {isProcessing ? (
                    <ProccessingLoader />
                  ) : (
                    <QAHistory audio={audio} detailedDivRef={detailedDivRef} />
                  )}
                </TabsContent>
              )}
              <TabsContent value="entities">
                {isProcessing ? (
                  <ProccessingLoader />
                ) : (
                  <AudioEntityExtraction
                    meetingId={audio.meeting_id}
                    audioId={audio.id}
                    language={audio.language}
                  />
                )}
              </TabsContent>
              {!config.kuritaVersion && (
                <TabsContent value="sentiment">
                  {isProcessing ? <ProccessingLoader /> : <AudioSentiment />}
                </TabsContent>
              )}
            </Suspense>
          </div>
        </Tabs>
      );
    };

    const playPauseButton = (
      <Button
        className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-audios/10"
        onClick={(event) => {
          event.stopPropagation();
          playing ? pauseAudio() : playAudio();
        }}
        disabled={disabled || isUploading || openEditDiary}
      >
        <CircularProgress
          className="absolute"
          progress={progress}
          center={
            playing ? <PauseIcon /> : <PlayIcon className="text-audios" />
          }
        />
        {playComplete && (
          <CheckCircleFill className="absolute bottom-0.5 right-0.5 h-3 w-3 text-sm text-green-500" />
        )}
      </Button>
    );

    let leftAreaIcon: React.ReactNode = playPauseButton;
    if (isUploading) {
      leftAreaIcon = (
        <div className="flex flex-col items-center gap-1">
          <Spinner className="size-6" />
          <span className="rounded-full bg-green-700 px-2 py-0.5 text-[10px] text-xs capitalize">
            {t(tMessages.common.uploading())}
          </span>
        </div>
      );
    } else if (isProcessing) {
      leftAreaIcon = (
        <div className="flex flex-col items-center gap-1">
          {playPauseButton}
          <span className="rounded-full bg-yellow-600 px-2 py-0.5 text-[10px] text-xs capitalize">
            {t(tMessages.common.processing())}
          </span>
        </div>
      );
    } else if (isFailed) {
      leftAreaIcon = (
        <div className="flex flex-col items-center gap-1">
          <AlertCircleIcon className="size-6 text-red-500" />
          <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] text-xs capitalize">
            Failed
          </span>
        </div>
      );
    }

    const typeIcon = useMemo(() => {
      return renderTypeIcon(audio);
    }, [audio]);

    const finedTuneTitle = fineTuneOptions.find(
      (x) => x.value === audio.model,
    )?.title;

    return (
      <div className="flex h-full w-full flex-col">
        {/* Audio infomation */}
        <div className="flex w-full items-center gap-2">
          {/* {isUploading && <Spinner className="size-6" />} */}
          <div
            className={`relative flex w-full items-center justify-start gap-2 overflow-x-hidden rounded-2xl bg-primary p-2 sm:gap-3 ${audio.status === AUDIO_STATUS_ENUM.UPLOADING ? "group-hover:bg-[#555555]" : ""}`}
          >
            {leftAreaIcon}
            {/* Audio title, datetime, participants and tags */}
            <div className="relative flex h-full grow flex-col items-start justify-center gap-2 overflow-x-hidden">
              {editting && (
                <div
                  className="absolute left-0 top-0 z-[100] w-full"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Input
                    className="w-full rounded-md border border-primary-foreground py-1 text-xs focus:border-primary-foreground focus-visible:ring-0 sm:text-sm disabled:opacity-100"
                    value={title}
                    onChange={(event) => {
                      setTitle(event.target.value);
                    }}
                    disabled={updating}
                  />
                  <div className="absolute right-0 top-8 flex gap-1">
                    <Button
                      size="sm"
                      className="bg-neutral-600 hover:bg-neutral-500 disabled:opacity-100"
                      onClick={(event) => {
                        event.stopPropagation();
                        confirmEditTitle();
                      }}
                      disabled={updating}
                    >
                      {updating ? <Spinner className="size-4" /> : <CheckIcon className="size-4" />}
                    </Button>
                    <Button
                      size="sm"
                      className="bg-neutral-600 hover:bg-neutral-500 disabled:opacity-100"
                      onClick={(event) => {
                        event.stopPropagation();
                        setEditting(false);
                      }}
                      disabled={updating}
                    >
                      <Cross2Icon className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
              <span
                className={`w-auto overflow-hidden text-nowrap text-sm font-semibold ${canEditTitle ? "hover:bg-neutral-600" : ""} `}
                onClick={(event) => {
                  if (canEditTitle) {
                    event.stopPropagation();
                    event.preventDefault();
                    openEditTitle();
                  }
                }}
              >
                {title}
              </span>
              <div className="flex items-center gap-2 text-primary-foreground sm:gap-4">
                <span className="text-[10px] sm:text-xs">
                  <CalendarIcon className="float-left mr-2" />
                  {formatDateTimeLocale(
                    fromUnixTime(audio.startDateTime / 1000),
                    userSetting.language,
                  )}
                </span>
                <span className="text-[10px] sm:text-xs">
                  <UsersIcon className="float-left mr-1 size-4" />
                  {audio.participants.length}
                </span>

                {typeIcon}
              </div>

              {/* Audio tags */}
              <ul className="flex min-h-[17px] flex-wrap gap-1">
                {isUploaded ? (
                  summaryDetail.tags.map((tag, index: number) => (
                    <li
                      key={`tag-${index}`}
                      className={`rounded-sm border bg-neutral-700 px-2 py-0 text-[10px] ${!showDetail ? "" : "hover:bg-neutral-500"} ${
                        activeTags.includes(tag)
                          ? "border-audios text-audios"
                          : ""
                      }`}
                      onClick={(event) => toggleTag(event, tag)}
                    >
                      {tag}
                    </li>
                  ))
                ) : (
                  <>
                    <Skeleton className="h-3 w-8 rounded-sm" />
                    <Skeleton className="h-3 w-10 rounded-sm" />
                    <Skeleton className="h-3 w-7 rounded-sm" />
                  </>
                )}
              </ul>
            </div>

            <div
              className={`flex h-full flex-col items-end justify-center gap-2 pt-1 ${isDesktop ? "group-hover:invisible" : ""} `}
            >
              {/* Audio duration */}
              <span className="text-xs font-semibold sm:text-base">
                {secondsToTimer(Math.round(audio.duration))}
              </span>

              <span className="text-right text-[10px] text-primary-foreground sm:text-sm">
                {finedTuneTitle && t(finedTuneTitle())}
              </span>

              <span className="flex gap-1">
                {audio.remove_noise && (
                  <NoiseSuppressionIcon className="size-5 text-primary-foreground" />
                )}
                {audio.is_masking && audio.masking_approved && (
                  <CheckIcon className="size-5 text-success" />
                )}
                {!!audio.language && audio.meeting_id && (
                  <img
                    src={flagIcon[audio.language]}
                    alt={flagIcon[audio.language]}
                    width={14}
                  />
                )}
              </span>
            </div>
          </div>
        </div>
        {/* Audio infomation */}

        {showDetail && (
          <div
            ref={detailedDivRef}
            className="mt-4 w-full grow overflow-y-auto overflow-x-hidden rounded-xl"
          >
            {/* Tabs for summary and diarization */}
            {renderTabsContent()}

            {/* Attachments */}
            {showAttachments && (
              <div className="mt-4 w-full rounded-xl bg-modal px-4 py-2">
                <div className="flex w-full items-center justify-between">
                  <p className="text-sm sm:text-base">
                    {t(tMessages.common.attachments())}
                  </p>
                  <AttachmentUploadModal audioId={audio.id} />
                </div>

                {/* Attachment list */}
                {audio.attachments && audio.attachments.length > 0 ? (
                  <div className="mt-2 w-full space-y-2">
                    {audio.attachments.map((attachment) => (
                      <FileAttachmentItem
                        key={attachment.id}
                        attachment={attachment}
                        audioId={audio.id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="mt-2 w-full space-y-1 py-4 text-xs text-primary-foreground sm:text-sm">
                    <p className="w-full text-center">
                      {t(tMessages.common.emptyAttachment1())}
                    </p>
                    <p className="w-full text-center">
                      {t(tMessages.common.emptyAttachment2())}
                    </p>
                  </div>
                )}
              </div>
            )}
            {/* Attachments */}

            <ToggleSharePopup
              isVisible={isPopupShareVisible}
              onClose={() =>
                setIsPopupShareVisible && setIsPopupShareVisible(false)
              }
            />
          </div>
        )}
        {/* audio html tag */}

        <AudioPlayerPopup
          open={playing}
          duration={audio.duration}
          ref={audioPlayerRef}
          onTimeUpdate={handleTimeUpdate}
          onError={pauseAudio}
          onEnded={handleAudioEnded}
          className="hidden"
        />
      </div>
    );
  },
);

export default AudioItem;
