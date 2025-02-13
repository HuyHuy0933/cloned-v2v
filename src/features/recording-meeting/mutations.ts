import { AxiosResponse } from "axios";
import agent from "../base";
import { useMutation } from "@tanstack/react-query";
import { QUERY_KEY } from "@/lib/constaints";
import { queryClient } from "@/main";
import {
  CreateMeetingRecoringRequest,
  DeleteAttachmentRequest,
  SaveRecordingMeetingRequest,
} from "./types";
import { CreateMeetingResponse, LanguageChunkMessage } from "../meeting/types";
import {
  GetRecordAudio,
  UploadAttachmentRequest,
  UploadAttachmentResponse,
} from "../record-audios/types";

export const saveRecordingMeeting = async (
  payload: SaveRecordingMeetingRequest,
) => {
  try {
    const formData = new FormData();
    payload.audio && formData.append("audio", payload.audio);
    formData.append("removeNoise", payload.removeNoise.toString());
    formData.append("recording_id", payload.recording_id);
    formData.append("model", payload.model);
    formData.append("type", payload.type);
    formData.append("masking", payload.masking.toString());
    formData.append("location", payload?.location || "");
    formData.append("analyze_sentiment", payload.analyze_sentiment.toString());
    formData.append("enableAISummary", payload.enableAISummary.toString());
    formData.append("summaryAITemplate", payload.summaryAITemplate);
    const response: AxiosResponse<boolean> = await agent.post(
      `/api/recording-save/${payload.recording_id}`,
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

export const extractEntities = async (audioId: string) => {
  try {
    const response: AxiosResponse<LanguageChunkMessage[]> = await agent.post(
      `api/entity-extraction/${audioId}`,
    );

    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const createRecoringMeeting = async (
  payload: CreateMeetingRecoringRequest,
) => {
  try {
    const response: AxiosResponse<CreateMeetingResponse> = await agent.post(
      "/api/meeting-room/create_recording",
      payload,
    );

    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const uploadAttachment = async (
  payload: UploadAttachmentRequest,
): Promise<UploadAttachmentResponse> => {
  const formData = new FormData();
  formData.append("file", payload.file);
  formData.append("audio_id", payload.audio_id);
  formData.append("datetime", payload.datetime.toString());
  formData.append("name", payload.name);
  formData.append("size", payload.size.toString());

  try {
    const response: AxiosResponse<UploadAttachmentResponse> = await agent.post(
      `/api/recording-meeting/attachments`,
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

export const deleteAttachment = async (id: string): Promise<boolean> => {
  try {
    const response: AxiosResponse<boolean> = await agent.delete(
      `/api/recording-meeting/attachments/${id}`,
    );
    return true;
  } catch (error) {
    console.error("Error:", error);
    return false;
  }
};

export const useSaveRecordingMeetingMutation = () =>
  useMutation({
    mutationFn: (payload: SaveRecordingMeetingRequest) => {
      return saveRecordingMeeting(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.RECORD_AUDIOS] });
    },
  });

export const useExtractEntitiesMutation = () =>
  useMutation({
    mutationFn: (id: string) => {
      return extractEntities(id);
    },
  });

export const useCreateMeetingRecordingMutation = () =>
  useMutation({
    mutationFn: (payload: CreateMeetingRecoringRequest) => {
      return createRecoringMeeting(payload);
    },
  });

export const useUploadAttachmentMutation = () =>
  useMutation({
    mutationFn: (payload: UploadAttachmentRequest) => {
      return uploadAttachment(payload);
    },
    onSuccess: (data: any, variables) => {
      const recordAudio: GetRecordAudio | undefined = queryClient.getQueryData([
        QUERY_KEY.RECORD_AUDIO_DETAIL,
        variables.audio_id,
      ]);

      if (recordAudio) {
        queryClient.setQueryData(
          [QUERY_KEY.RECORD_AUDIO_DETAIL, variables.audio_id],
          {
            ...recordAudio,
            attachments: recordAudio.attachments
              ? [
                  ...recordAudio.attachments,
                  {
                    id: data.id,
                    file_name: variables.name,
                    file_url: data.file_url,
                    datetime: variables.datetime,
                    size: variables.size,
                  },
                ]
              : [
                  {
                    id: data.id,
                    file_name: variables.name,
                    file_url: data.file_url,
                    datetime: variables.datetime,
                    size: variables.size,
                  },
                ],
          },
        );
      }
    },
  });

export const useDeleteAttachmentMutation = () =>
  useMutation({
    mutationFn: (payload: DeleteAttachmentRequest) => {
      return deleteAttachment(payload.attachmentId);
    },
    onSuccess: (data, variables) => {
      const recordAudio: GetRecordAudio | undefined = queryClient.getQueryData([
        QUERY_KEY.RECORD_AUDIO_DETAIL,
        variables.audioId,
      ]);

      if (recordAudio && recordAudio.attachments) {
        queryClient.setQueryData(
          [QUERY_KEY.RECORD_AUDIO_DETAIL, variables.audioId],
          {
            ...recordAudio,
            attachments: recordAudio.attachments.filter(
              (item) => item.id !== variables.attachmentId,
            ),
          },
        );
      }
    },
  });
