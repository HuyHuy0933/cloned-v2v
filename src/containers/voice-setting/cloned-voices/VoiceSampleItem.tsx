import React, { useCallback, useRef, useState } from "react";
import { Button, CircularProgress, DeletedSwipeLeftCard } from "@/components";
import { PauseIcon, PlayIcon } from "@radix-ui/react-icons";
import { DEFAULT_STALE_TIME_QUERY, QUERY_KEY } from "@/lib/constaints";
import { VoiceSample } from "@/features/cloned-voices/types";
import { useQueryClient } from "@tanstack/react-query";
import { getVoiceSampleUrl } from "@/features/cloned-voices/queries";
import { getAudioDurationFromURL } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";

type VoiceSampleItemProps = {
  voiceId: string;
  sample: VoiceSample;
  setPlayingSampleId: React.Dispatch<React.SetStateAction<string>>;
  onDeleteSample?: (sampleId: string) => Promise<void>;
  disabled?: boolean;
};

const VoiceSampleItem: React.FC<VoiceSampleItemProps> = React.memo(
  ({ sample, voiceId, setPlayingSampleId, disabled, onDeleteSample }) => {
    const audioPlayerRef = useRef<any>(null);
    const sampleUrlRef = useRef<string>("");
    const durationRef = useRef<number>(0);

    const queryClient = useQueryClient();
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    const { t } = useTranslation();

    const handleTimeUpdate = useCallback(() => {
      if (!playing || !audioPlayerRef.current) return;

      const { currentTime } = audioPlayerRef.current;
      const percentage = (currentTime / durationRef.current) * 100;
      setProgress(percentage > 100 ? 100 : percentage);
    }, [playing]);

    const playAudio = useCallback(async () => {
      const url = await getSampleUrl();
      if (!url || !audioPlayerRef.current) return;

      const duration = await getAudioDurationFromURL(url);
      durationRef.current = duration;
      audioPlayerRef.current.src = url;
      audioPlayerRef.current.play();

      setPlayingSampleId(sample.sample_id);
      setPlaying(true);
    }, []);

    const getSampleUrl = async () => {
      if (sampleUrlRef.current) return sampleUrlRef.current;

      const data = await queryClient.fetchQuery({
        queryKey: [QUERY_KEY.SAMPLE_PRESIGN_URL, sample.sample_id],
        queryFn: () =>
          getVoiceSampleUrl({
            sample_id: sample.sample_id,
            voice_id: voiceId,
          }),
        staleTime: DEFAULT_STALE_TIME_QUERY,
      });

      return data;
    };

    const pauseAudio = useCallback(() => {
      audioPlayerRef.current.pause();
      setPlaying(false);
      setPlayingSampleId("");
    }, []);

    const openDeleteConfirm = () => {
      if (playing) pauseAudio();
    };

    const onDeleteConfirm = async () => {
      if (!onDeleteSample) return;
      onDeleteSample(sample.sample_id);
    };

    return (
      <div className="relative flex w-full items-center">
        <DeletedSwipeLeftCard
          className="flex w-full items-center gap-2 rounded-2xl bg-primary px-2 py-2 sm:gap-3 sm:px-4"
          title={t(tMessages.common.deleteVoiceConfirm())}
          onOpenDeleteModal={openDeleteConfirm}
          onDelete={onDeleteConfirm}
        >
          {/* play/pause icon */}
          <Button
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-audios/10"
            onClick={(event) => {
              playing ? pauseAudio() : playAudio();
            }}
            disabled={disabled}
          >
            <CircularProgress
              className="absolute w-7 h-7"
              progress={progress}
              center={
                playing ? <PauseIcon /> : <PlayIcon className="text-audios" />
              }
            />
          </Button>

          {/* Audio title, datetime */}
          <div className="relative flex h-full grow flex-col items-start justify-center gap-2 overflow-x-hidden">
            <span className="w-auto overflow-hidden text-nowrap text-xs font-medium">
              {sample.file_name}
            </span>
          </div>
        </DeletedSwipeLeftCard>

        <audio
          ref={audioPlayerRef}
          src=""
          onTimeUpdate={handleTimeUpdate}
          onError={pauseAudio}
          className="hidden"
        />
      </div>
    );
  },
);

export default VoiceSampleItem;
