import { AxiosResponse } from "axios";
import { SaveTutorialRequest } from "./types";
import agent from "../base";
import { useMutation } from "@tanstack/react-query";

export const saveTutorial = async (payload: SaveTutorialRequest) => {
  try {
    const response: AxiosResponse<boolean> = await agent.post(
      `/api/tutorial`,
      payload,
    );

    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const useSaveTutorialMutation = () =>
  useMutation({
    mutationFn: (payload: SaveTutorialRequest) => {
      return saveTutorial(payload);
    },
  });
