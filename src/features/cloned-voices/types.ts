export type RegisterCloneVoiceRequest = {
  name: string;
  audio: Blob | File;
  username: string;
  recordedTime: string;
};
export type DeleteVoiceSampleRequest = {
  voice_id: string;
  sample_id: string;
};
export type GetVoiceSampleUrlRequest = {
  voice_id: string;
  sample_id: string;
};
export type RegisterCloneVoiceResponse = {};

export type ElevenLabsVoicesResponse = {
  voice_list: ElevenLabsVoice[];
};

export type ElevenLabsVoice = {
  id: string;
  name: string;
  is_system_voice: boolean
};

export type ElevenLabVoiceDetail = {
  name: string;
  samples?: VoiceSample[];
  user_id: string;
  voice_id: string
}

export type VoiceSample = {
  file_name: string
  sample_id: string
}