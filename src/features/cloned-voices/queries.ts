import { DEFAULT_STALE_TIME_QUERY, QUERY_KEY } from "@/lib/constaints";
import agent from "../base";
import { useQuery } from "@tanstack/react-query";
import {
  ElevenLabsVoicesResponse,
  ElevenLabVoiceDetail,
  GetVoiceSampleUrlRequest,
} from "./types";

const fetchElevenLabsVoices = async (): Promise<ElevenLabsVoicesResponse> => {
  // const response = await agent.get(`/api/voice-list`);
  // console.log(response.data);
  return {
    voice_list: [
      {
        id: "1",
        is_system_voice: true,
        name: "voice 1",
      },
      {
        id: "2",
        is_system_voice: true,
        name: "voice 2",
      },
      {
        id: "3",
        is_system_voice: true,
        name: "voice 3",
      },
    ],
  };
};

const fetchVoiceDetail = async (
  id?: string,
): Promise<ElevenLabVoiceDetail | undefined> => {
  if (!id) return undefined;
  const response = await agent.get(`/api/custom-voice/${id}/detail`);
  return response.data;
};

const fetchMyVoice = async (): Promise<ElevenLabVoiceDetail | null> => {
  // const response = await agent.get(`/api/custom-voice/my-voice`);
  return null;
};

export const getVoiceSampleUrl = async (
  payload: GetVoiceSampleUrlRequest,
): Promise<any> => {
  const response = await agent.get(
    `/api/custom-voice/audio/${payload.voice_id}/${payload.sample_id}`,
    {
      responseType: "blob",
    },
  );

  const url = URL.createObjectURL(response.data);
  return url;
};

export const useElevenLabsVoicesQuery = () =>
  useQuery({
    queryKey: [QUERY_KEY.ELEVENTLAB_VOICES],
    queryFn: () => fetchElevenLabsVoices(),
    staleTime: DEFAULT_STALE_TIME_QUERY,
    select: (data: ElevenLabsVoicesResponse) => {
      const result =
        data.voice_list.sort((a, b) => a.name.localeCompare(b.name, "ja")) ||
        [];

      const myVoiceIndex = result.findIndex((x) => !x.is_system_voice);
      if (myVoiceIndex >= 0) {
        const myVoice = result[myVoiceIndex];
        result.splice(myVoiceIndex, 1);
        result.unshift(myVoice);
      }

      return result;
    },
  });

export const useVoiceDetailQuery = (id?: string) =>
  useQuery({
    queryKey: [QUERY_KEY.VOICE_DETAIL],
    queryFn: () => fetchVoiceDetail(id),
    staleTime: DEFAULT_STALE_TIME_QUERY,
  });

export const useMyVoiceQuery = () =>
  useQuery({
    queryKey: [QUERY_KEY.MY_VOICE],
    queryFn: () => fetchMyVoice(),
    staleTime: Infinity,
  });
