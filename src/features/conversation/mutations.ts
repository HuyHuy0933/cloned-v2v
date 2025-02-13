import { useMutation } from "@tanstack/react-query";
import agent from "../base";
import { v4 as uuidv4 } from "uuid";
import { AxiosResponse } from "axios";
import {
  CleanTranslationRequest,
  CreateAudioRequest,
  CreateAudioResponse,
  ReverseTranslatedTextRequest,
  ReverseTranslatedTextResponse,
  SaveBlobResponse,
  TranslateTextRequest,
  TranslateTextResponse,
} from "./types";

const saveBlob = async (blob: Blob): Promise<SaveBlobResponse> => {
  const formData = new FormData();
  const uuid = uuidv4();
  formData.append("audio", blob, `${uuid}.wav`);

  try {
    const response: AxiosResponse<SaveBlobResponse> = await agent.post(
      `/api/save-blob`,
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

const translatedText = async (
  payload: TranslateTextRequest,
): Promise<TranslateTextResponse> => {
  try {
    const response: AxiosResponse<TranslateTextResponse> = await agent.post(
      `/api/pre_tts`,
      payload,
    );
    return response.data;
  } catch (err) {
    throw err;
  }
};

const createAudio = async (
  payload: CreateAudioRequest,
): Promise<CreateAudioResponse> => {
  try {
    const response: AxiosResponse<CreateAudioResponse> = await agent.post(
      `/api/generate-audio`,
      payload,
    );
    return response.data;
  } catch (err) {
    throw err;
  }
};

const reverseTranslatedText = async (
  payload: ReverseTranslatedTextRequest,
): Promise<ReverseTranslatedTextResponse> => {
  try {
    const response: AxiosResponse<ReverseTranslatedTextResponse> =
      await agent.post(`/api/reverse`, payload);
    return response.data;
  } catch (err) {
    throw err;
  }
};

const cleanTranslation = async (
  payload: CleanTranslationRequest,
): Promise<ReverseTranslatedTextResponse> => {
  try {
    const response: AxiosResponse =
      await agent.post(`/api/translation/clean`, payload);
    return response.data;
  } catch (err) {
    throw err;
  }
};

export const useTranslateTextMutation = () =>
  useMutation({
    mutationFn: (payload: TranslateTextRequest) => {
      return translatedText(payload);
    },
  });

export const useUploadBlobMutation = () =>
  useMutation({
    mutationFn: (blob: Blob) => {
      return saveBlob(blob);
    },
  });

export const useReverseTranslateTextMutation = () =>
  useMutation({
    mutationFn: (payload: ReverseTranslatedTextRequest) => {
      return reverseTranslatedText(payload);
    },
  });

export const useCreateAudioMutation = () =>
  useMutation({
    mutationFn: (payload: CreateAudioRequest) => {
      return createAudio(payload);
    },
  });

  export const useCleanTranslationMutation = () =>
    useMutation({
      mutationFn: (payload: CleanTranslationRequest) => {
        return cleanTranslation(payload);
      },
    });