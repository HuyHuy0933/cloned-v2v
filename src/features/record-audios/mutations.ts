import { AxiosResponse } from "axios";
import agent from "../base";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/main";
import { QUERY_KEY } from "@/lib/constaints";
import {
  AskChatBotRequest,
  UpdateAudioRequest,
  UploadAudioRequest,
  UploadAudioResponse,
  UpdateAudioProgressRequest,
  UploadAIPlatformHistoryRequest,
  ShareRecordAudioRequest,
  AIChatHistory,
  SentimentData,
  UploadAIPlatformAgentRequest,
} from "./types";

const uploadRecordAudio = async (
  payload: UploadAudioRequest,
): Promise<UploadAudioResponse> => {
  const formData = new FormData();
  formData.append("audio", payload.audio);
  formData.append("start_date_time", payload.startDateTime.toString());
  formData.append("end_date_time", payload.endDateTime.toString());
  formData.append("speakers", payload?.speakers || "");
  formData.append("gender", payload?.gender || "");
  formData.append("age", payload?.age || "");
  formData.append("duration", payload.duration.toString());
  formData.append("removeNoise", payload.removeNoise.toString());
  formData.append("model", payload.model);
  formData.append("type", payload.type);
  formData.append("masking", payload.masking.toString());
  formData.append("customNames", payload.customNames);
  formData.append("censoredWords", payload.censoredWords);
  formData.append("location", payload?.location || "");
  formData.append("analyze_sentiment", payload.analyze_sentiment.toString());
  formData.append("enableAISummary", payload.enableAISummary.toString());
  formData.append("summaryAITemplate", payload.summaryAITemplate);
  formData.append("numSpeakers", payload.numSpeakers.toString());

  try {
    const response: AxiosResponse<UploadAudioResponse> = await agent.post(
      `/api/meeting-record-save`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 0,
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

const uploadToAiPlatformHistory = async (
  payload: UploadAIPlatformHistoryRequest,
): Promise<UploadAudioResponse> => {
  const formData = new FormData();
  formData.append("audio", payload.audio);
  formData.append("title", payload.title);
  payload.meeting_id && formData.append("meeting_id", payload.meeting_id);

  try {
    const response: AxiosResponse<UploadAudioResponse> = await agent.post(
      `/api/ai-platform-history-save`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const deleteAudio = async (id: string) => {
  try {
    const response: AxiosResponse<boolean> = await agent.post(
      `/api/meeting-record-remove/${id}`,
    );

    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const doFavoriteAudio = async (id: string) => {
  try {
    const response: AxiosResponse<boolean> = await agent.post(
      `/api/meeting-record-favorite/${id}`,
    );

    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const askChatBot = async (askChatBotRequest: AskChatBotRequest) => {
  try {
    const response: AxiosResponse<string> = await agent.post(
      `/api/bot-query`,
      askChatBotRequest,
    );

    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const updateAudio = async (payload: UpdateAudioRequest) => {
  try {
    const response: AxiosResponse<boolean> = await agent.post(
      `/api/meeting-record-update`,
      payload,
    );

    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const shareRecordAudioMutation = async (
  id: string,
  payload: ShareRecordAudioRequest,
) => {
  try {
    const response: AxiosResponse<boolean> = await agent.post(
      `/api/meeting-record/${id}/share`,
      payload,
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateAudioProgress = async (
  id: string,
  payload: UpdateAudioProgressRequest,
) => {
  try {
    const response: AxiosResponse<boolean> = await agent.post(
      `/api/meeting-record/${id}/update_progress`,
      payload,
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const saveAIChatHistory = async (payload: AIChatHistory) => {
  try {
    const response: AxiosResponse<string> = await agent.post(
      `/api/ai-chat/save-history`,
      payload,
    );

    return response.data;
  } catch (error) {
    console.log("Error: ", error);
    throw error;
  }
};
export const analyzeSentiment = async (
  id: string,
): Promise<SentimentData[]> => {
  try {
    const response: AxiosResponse<SentimentData[]> = await agent.post(
      `/api/sentiment/${id}`,
    );
    return response.data.map((x) => ({ ...x, id: Number(x.id) }));
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
};

const uploadAIPlatformAgent = async (
  payload: UploadAIPlatformAgentRequest,
): Promise<boolean> => {
  const formData = new FormData();
  formData.append("audio", payload.audio);
  formData.append("recording_id", payload.recording_id);
  formData.append("stop_time", payload.stop_time.toString());
  formData.append("shared_ai_platform", payload.shared_ai_platform.toString());

  try {
    const response: AxiosResponse<boolean> = await agent.post(
      `/api/ai-platform-agent-save`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return true;
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
};

export const useUploadRecordAudioMutation = () =>
  useMutation({
    mutationFn: (payload: UploadAudioRequest) => {
      return uploadRecordAudio(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.RECORD_AUDIOS] });
    },
  });

export const useUploadAiPlatformAudioMutation = () =>
  useMutation({
    mutationFn: (payload: UploadAIPlatformHistoryRequest) => {
      return uploadToAiPlatformHistory(payload);
    },
  });

export const useRemoveRecordAudioMutation = () =>
  useMutation({
    mutationFn: (id: string) => {
      return deleteAudio(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.RECORD_AUDIOS] });
    },
  });

export const useFavoriteRecordAudioMutation = () =>
  useMutation({
    mutationFn: (id: string) => {
      return doFavoriteAudio(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.RECORD_AUDIOS] });
    },
  });

export const useAskChatBotMutation = () =>
  useMutation({
    mutationFn: (payload: AskChatBotRequest) => {
      return askChatBot(payload);
    },
  });

export const useUpdateAudioMutation = () =>
  useMutation({
    mutationFn: (payload: UpdateAudioRequest) => {
      return updateAudio(payload);
    },
    onSuccess: () => {},
  });

export const useShareRecordAudioMutation = () =>
  useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ShareRecordAudioRequest;
    }) => {
      return shareRecordAudioMutation(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.USERS_RECORD_AUDIO_SHARED],
      });
    },
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.USERS_RECORD_AUDIO_SHARED],
      });
    },
  });

export const useUpdateAudioProgressMutation = () =>
  useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateAudioProgressRequest;
    }) => {
      return updateAudioProgress(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.RECORD_AUDIOS],
        refetchType: "none",
      });
    },
  });

export const useAnalyzeSentimentMutation = () =>
  useMutation({
    mutationFn: (id: string) => {
      return analyzeSentiment(id);
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData([QUERY_KEY.SENTIMENT_DATA, variables], data);
    },
  });

export const useSaveAIChatHistory = () =>
  useMutation({
    mutationFn: (payload: AIChatHistory) => {
      return saveAIChatHistory(payload);
    },
    onSuccess: (data: string) => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.AICHAT_HISTORY],
      });
    },
  });

export const useUploadAIPlatformAgentMutation = () =>
  useMutation({
    mutationFn: (payload: UploadAIPlatformAgentRequest) => {
      return uploadAIPlatformAgent(payload);
    },
    onSuccess: () => {},
  });
