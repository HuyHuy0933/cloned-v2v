import { AxiosResponse } from "axios";
import agent from "../base";
import {
  DeleteVoiceSampleRequest,
  RegisterCloneVoiceRequest,
  RegisterCloneVoiceResponse,
} from "./types";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/main";
import { QUERY_KEY } from "@/lib/constaints";

const registerCloneVoice = async (
  payload: RegisterCloneVoiceRequest,
): Promise<RegisterCloneVoiceResponse> => {
  const formData = new FormData();
  formData.append("audio", payload.audio);
  formData.append("name", payload.name);
  formData.append("username", payload.username);
  formData.append("recordedTime", payload.recordedTime);

  try {
    const response: AxiosResponse<RegisterCloneVoiceResponse> =
      await agent.post(`/api/register-clone-voice`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 0,
      });

    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const deleteVoiceSample = async (
  payload: DeleteVoiceSampleRequest,
): Promise<boolean> => {
  try {
    const response = await agent.post(
      `/api/custom-voice/delete-sample`,
      payload,
    );

    return true;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const deleteClonedVoice = async (voiceId: string): Promise<boolean> => {
  try {
    const response = await agent.post(`/api/custom-voice/${voiceId}/delete`);

    return true;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const useRegisterCloneVoiceMutation = () =>
  useMutation({
    mutationFn: (payload: RegisterCloneVoiceRequest) => {
      return registerCloneVoice(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.ELEVENTLAB_VOICES],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.MY_VOICE],
      });
    },
  });
export const useDeleteVoiceSampleMutation = () =>
  useMutation({
    mutationFn: (payload: DeleteVoiceSampleRequest) => {
      return deleteVoiceSample(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.MY_VOICE],
      });
    },
  });

export const useDeleteClonedVoiceMutation = () =>
  useMutation({
    mutationFn: (voiceId: string) => {
      return deleteClonedVoice(voiceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.ELEVENTLAB_VOICES],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.MY_VOICE],
      });
    },
  });
