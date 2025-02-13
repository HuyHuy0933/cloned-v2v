import React, { useState } from "react";
import SampleVoiceItem from "./VoiceSampleItem";
import {
  ElevenLabVoiceDetail,
  VoiceSample,
} from "@/features/cloned-voices/types";
import {
  useDeleteClonedVoiceMutation,
  useDeleteVoiceSampleMutation,
} from "@/features/cloned-voices/mutations";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEY } from "@/lib/constaints";
import { tMessages } from "@/locales/messages";
import { useTranslation } from "react-i18next";

type ClonedVoiceDetailProps = {
  voice: ElevenLabVoiceDetail;
};

const ClonedVoiceDetail: React.FC<ClonedVoiceDetailProps> = React.memo(
  ({ voice }) => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    const [playingSampleId, setPlayingSampleId] = useState("");

    const deleteVoiceSampleMutation = useDeleteVoiceSampleMutation();
    const deleteClonedVoiceMutation = useDeleteClonedVoiceMutation();

    const deleteSample = async (sampleId: string) => {
      if (voice.samples && voice.samples.length === 1) {
        await deleteClonedVoiceMutation.mutateAsync(voice.voice_id);
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY.MY_VOICE],
        });
      } else {
        await deleteVoiceSampleMutation.mutateAsync({
          voice_id: voice.voice_id,
          sample_id: sampleId,
        });
      }
    };

    if (!voice.samples) return null;

    return (
      <div className="w-full">
        <div className="mb-1 w-full text-xs">{t(tMessages.common.audioSamplesRegisteredIn())} ({voice.samples.length}/3)</div>
        <div className="flex w-full flex-col gap-2">
          {voice.samples.map((item: VoiceSample) => (
            <SampleVoiceItem
              key={item.sample_id}
              voiceId={voice.voice_id}
              sample={item}
              setPlayingSampleId={setPlayingSampleId}
              disabled={!!playingSampleId && playingSampleId !== item.sample_id}
              onDeleteSample={deleteSample}
            />
          ))}
        </div>
      </div>
    );
  },
);

export default ClonedVoiceDetail;
