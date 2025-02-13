import { useCallback, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getAudioBlob,
  useRecordAudioDetailsQuery,
  useUsersRecordAudioSharedQuery,
} from "@/features/record-audios/queries";
import AudioItem from "./AudioItem";
import {
  HorizontalTransition,
  Container,
  Spinner,
  IconButton,
  Header,
  CircularProgress,
} from "@/components";
import {
  CheckCircleIcon,
  CircleLeftArrowIcon,
  Copy2Icon,
  PenIcon,
  ShareNetworkIcon,
} from "@/components/icons";
import ProfileDropdown from "../account-setting/ProfileDropdown";
import { format, fromUnixTime } from "date-fns";
import {
  downloadMediaFileURL,
  getFileExtensionFromUrl,
  secondsToDurationFormat,
  secondsToTimer,
} from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEY } from "@/lib/constaints";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";
import { DownloadIcon } from "@radix-ui/react-icons";
import { formatDateTimeLocale } from "@/lib/datetime";
import { useToast } from "@/components/ui/use-toast";
import { useAISummaryTemplateData } from "./useAISummaryTemplateData";
import {
  AUDIO_PERMISSION,
  AUDIO_STATUS_ENUM,
  RecordedAudioDiary,
} from "@/features/record-audios/types";
import { useUpdateAudioMutation } from "@/features/record-audios/mutations";
import { useCurrentUser } from "@/hooks";
import { catchError } from "@/lib/trycatch";

const RecordAudioDetails = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { currentUser, setting } = useCurrentUser();
  const audioId = location.state?.id || params.id;

  const { data: audio } = useRecordAudioDetailsQuery(audioId);
  const { data: users = [] } = useUsersRecordAudioSharedQuery(audioId);
  const { getSectionTitle } = useAISummaryTemplateData();
  const updateAudioMutation = useUpdateAudioMutation();

  const presignUrl = useRef<string>("");
  const updatedDiariesRef = useRef<RecordedAudioDiary[] | undefined>(undefined);

  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isPopupShareVisible, setIsPopupShareVisible] = useState(false);
  const [openEditDiary, setOpenEditDiary] = useState(false);
  const [tab, setTab] = useState("summary");

  const hasEditPermission = users.some(
    (user) =>
      user.user_id === currentUser.id &&
      user.audio_permission !== AUDIO_PERMISSION.VIEWER,
  );
  const isProcessing = audio?.status === AUDIO_STATUS_ENUM.PROCESSING;

  const clickLeftButton = () => {
    setTimeout(() => {
      navigate("/audios", { replace: true });
    }, 300);
  };

  const getPresignUrl = async (audioUrl: string) => {
    if (!audio) return "";
    if (presignUrl.current) return presignUrl.current;

    const data = await queryClient.fetchQuery({
      queryKey: [QUERY_KEY.AUDIO_PRESIGN_URL, audio.id],
      queryFn: () => getAudioBlob(audioUrl),
      staleTime: Infinity,
    });

    return data;
  };

  const downloadAudio = async (event: any) => {
    if (!audio || !audio.fileUrl || downloading) return;

    try {
      setDownloading(true);
      const datetime = format(
        fromUnixTime(audio.startDateTime / 1000),
        "yyyyMMdd_HHmm",
      );
      const duration = secondsToDurationFormat(Math.round(audio.duration));
      const extension = getFileExtensionFromUrl(audio.fileUrl);
      const filename = `${datetime}_${audio.name}_${duration}.${extension}`;
      const presignUrl = await getPresignUrl(audio.fileUrl);
      downloadMediaFileURL(presignUrl, filename, null, (progress: number) => {
        setDownloadProgress(progress);
        if (progress === 100) {
          setDownloading(false);
          setDownloadProgress(0);
        }
      });
    } catch (err) {
      setDownloading(false);
      setDownloadProgress(0);
    }
  };

  const copyDiaries = async () => {
    if (!audio) return;
    const summaryDetail = audio.summaryDetail;
    const audioInfoText = [
      audio.name,
      formatDateTimeLocale(
        fromUnixTime(audio.startDateTime / 1000),
        setting.language,
      ),
      `${t(tMessages.common.length())}:${secondsToTimer(audio.duration)}`,
      t(tMessages.common.participants2(), { value: audio.participants.length }),
      summaryDetail.tags.length
        ? `${t(tMessages.common.keyword())}: ${summaryDetail.tags.join(", ")}`
        : "",
    ].join("\n");

    // Summary detail
    const summaries: string[] = [];
    summaryDetail.summaries.forEach((item) => {
      const summary = `${getSectionTitle(audio.summaryAITemplate, item.key)}: \n ${
        item.content
          .split(";")
          .map((item) => item.trim())
          .join("\n ") ?? ""
      }`;

      summaries.push(summary);
    });

    const summaryText = summaries.join("\n");

    const diariesText = audio.diary
      .map(
        (item) =>
          `speaker_${item.speaker} (${secondsToTimer(Math.round(item.start_time)).substring(3)}): ${item.transcript}`,
      )
      .join("\n");

    await navigator.clipboard.writeText(
      `${audioInfoText}\n\n${diariesText}\n\n${summaryText}`,
    );

    toast({
      description: t(tMessages.common.textCopied()),
      duration: 2000,
    });
  };

  const editTranscripts = () => {
    setOpenEditDiary(true);
  };

  const onTranscriptsChange = useCallback((diaries: any) => {
    updatedDiariesRef.current = diaries;
  }, []);

  const saveTranscripts = async () => {
    if (!audio || !updatedDiariesRef.current) {
      setOpenEditDiary(false);
      return;
    }

    setOpenEditDiary(false);
    const cachedData: any = queryClient.getQueryData([
      QUERY_KEY.RECORD_AUDIO_DETAIL,
      audioId,
    ]);
    const diaries = updatedDiariesRef.current;
    queryClient.setQueryData([QUERY_KEY.RECORD_AUDIO_DETAIL, audioId], {
      ...cachedData,
      diary: JSON.stringify(diaries),
    });
    catchError(
      updateAudioMutation.mutateAsync({
        id: audioId,
        diary: JSON.stringify(diaries),
      }),
    );
    updatedDiariesRef.current = undefined;
  };

  const onTabChange = useCallback((value: string) => {
    setTab(value);
  }, []);

  const leftItem = (
    <IconButton onClick={clickLeftButton}>
      <CircleLeftArrowIcon className="size-8 transition duration-200 hover:scale-[1.2]" />
    </IconButton>
  );

  let editIcon = openEditDiary ? (
    <IconButton
      className="h-9 flex-col justify-between hover:text-success"
      onClick={saveTranscripts}
    >
      <CheckCircleIcon className="size-5" />
      <span className="text-[8px] leading-3">
        {t(tMessages.common.save2())}
      </span>
    </IconButton>
  ) : (
    <IconButton
      className="h-9 flex-col justify-between hover:text-success"
      onClick={editTranscripts}
      disabled={isProcessing}
    >
      <PenIcon className="size-5" />
      <span className="text-[8px] leading-3">{t(tMessages.common.edit())}</span>
    </IconButton>
  );

  if (!hasEditPermission || tab !== "diaries") {
    editIcon = <></>;
  }

  const rightItem = (
    <div className="justify-content-end flex gap-3">
      {editIcon}
      <IconButton
        className="h-9 flex-col justify-between hover:text-success"
        onClick={() => setIsPopupShareVisible(true)}
        disabled={isProcessing}
      >
        <ShareNetworkIcon className="size-5" />
        <span className="text-[8px] leading-3">
          {t(tMessages.common.share())}
        </span>
      </IconButton>
      <IconButton
        className="h-9 flex-col justify-between hover:text-success"
        onClick={downloadAudio}
        disabled={isProcessing}
      >
        <div className="relative">
          <DownloadIcon className="size-5" />
          {downloading && (
            <CircularProgress
              className="absolute -left-1 -top-[3px] size-7"
              progress={downloadProgress}
            />
          )}
        </div>

        <span className="text-[8px] leading-3">
          {t(tMessages.common.download())}
        </span>
      </IconButton>

      <IconButton
        className="h-9 flex-col justify-between hover:text-success"
        onClick={copyDiaries}
        disabled={isProcessing}
      >
        <Copy2Icon className="size-5" />
        <span className="text-[8px] leading-3">
          {t(tMessages.common.copy())}
        </span>
      </IconButton>
      <ProfileDropdown />
    </div>
  );

  return (
    <HorizontalTransition>
      <Header leftItem={leftItem} rightItem={rightItem} />
      <Container className="h-full w-full flex-col items-center gap-2 pt-4 tracking-wider">
        {audio ? (
          <AudioItem
            audio={audio}
            showDetail={true}
            isPopupShareVisible={isPopupShareVisible}
            setIsPopupShareVisible={setIsPopupShareVisible}
            openEditDiary={openEditDiary}
            hasEditPermission={hasEditPermission}
            onTranscriptsChange={onTranscriptsChange}
            onTabChange={onTabChange}
          />
        ) : (
          <Spinner />
        )}
      </Container>
    </HorizontalTransition>
  );
};

export default RecordAudioDetails;
