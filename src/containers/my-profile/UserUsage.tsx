import { useTranslation } from "react-i18next";
import UsageProgress from "./UsageProgress";
import { useCurrentUser } from "@/hooks";
import { useEffect } from "react";
import { tMessages } from "@/locales/messages";

const UserUsage = () => {
  const { t } = useTranslation();
  const { usage, refetchUsage } = useCurrentUser();

  useEffect(() => {
    refetchUsage();
  }, []);

  const audio_storage_usage_time_minutes =
    usage.recording_time_minutes + usage.audio_upload_time_minutes;
  const noise_suppression_time_minutes =
    usage.recording_noise_suppression_time_minutes +
    usage.audio_upload_noise_suppression_time_minutes +
    usage.meeting_noise_suppression_time_minutes;
  const ai_summary_tokens =
    usage.recording_ai_summary_tokens +
    usage.audio_upload_ai_summary_tokens +
    usage.meeting_ai_summary_tokens +
    usage.chatbot_ai_tokens;
  const meeting_time_minutes = usage.meeting_time_minutes;
  const stt_time_minutes =
    usage.meeting_stt_time_minutes + usage.translate_stt_time_minutes;
  const tts_time_characters =
    usage.meeting_tts_time_characters + usage.translate_tts_time_characters;
  const voice_cloning_tts_time_characters =
    usage.meeting_voice_cloning_tts_time_characters +
    usage.translate_voice_cloning_tts_time_characters;
  const translated_characters =
    usage.meeting_translated_characters + usage.translate_translated_characters;

  return (
    <div className="mt-4 flex w-full flex-col gap-4 px-2">
      <UsageProgress
        title={t(tMessages.common.customVoiceUsageAmount())}
        value={usage.custom_voice_count}
        max={1}
      />
      <UsageProgress
        title={t(tMessages.common.audioSamplesUsageAmount())}
        value={usage.custom_voice_audio_samples_count}
        max={3}
      />
      <UsageProgress
        title={t(tMessages.common.storageUsageTime())}
        value={audio_storage_usage_time_minutes}
        max={60}
        unit={t(tMessages.common.minutes())}
        round
      />
      <UsageProgress
        title={t(tMessages.common.noiseSuppressionUsageTime())}
        value={noise_suppression_time_minutes}
        max={60}
        unit={t(tMessages.common.minutes())}
        round
      />
      <UsageProgress
        title={t(tMessages.common.AIUsageAmount())}
        value={ai_summary_tokens}
        max={100000}
      />
      <UsageProgress
        title={t(tMessages.common.meetingUsageTime())}
        value={meeting_time_minutes}
        max={600}
        unit={t(tMessages.common.minutes())}
        round
      />
      <UsageProgress
        title={t(tMessages.common.sttUsageTime())}
        value={stt_time_minutes}
        max={60}
        unit={t(tMessages.common.minutes())}
        round
      />
      <UsageProgress
        title={t(tMessages.common.ttsUsageChars())}
        value={tts_time_characters}
        max={100000}
        round
      />
      <UsageProgress
        title={t(tMessages.common.cloneVoiceUsageChars())}
        value={voice_cloning_tts_time_characters}
        max={10000}
        round
      />
      <UsageProgress
        title={t(tMessages.common.translatedUsageChars())}
        value={translated_characters}
        max={50000}
      />
    </div>
  );
};

export default UserUsage;
