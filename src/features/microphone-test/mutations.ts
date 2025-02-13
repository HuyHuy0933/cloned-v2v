import { AxiosResponse } from "axios";
import agent from "../base";
import { ProcessWERCERRequest, WERCERResult } from "./types";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/main";
import { QUERY_KEY } from "@/lib/constaints";

export const processWERCER = async (payload: ProcessWERCERRequest) => {
  try {
    const response: AxiosResponse<WERCERResult> = await agent.post(
      `/api/microphone-test`,
      payload,
    );

    return response.data
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const useProcessWERCERMutation = () =>
  useMutation({
    mutationFn: (payload: ProcessWERCERRequest) => {
      return processWERCER(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.WERCER_HISTORY] });
    },
  });
