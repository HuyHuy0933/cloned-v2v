import { useMutation } from "@tanstack/react-query";
import agent from "../base";
import { SaveUserSettingRequest, TrackUserUsageRequest } from "./types";
import { queryClient } from "@/main";
import { QUERY_KEY } from "@/lib/constaints";

export const saveUserSettings = async (payload: SaveUserSettingRequest) => {
  try {
    const response = await agent.post("/api/user/settings", payload);

    return true;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const trackUserUsage = async (payload: TrackUserUsageRequest) => {
  try {
    const response = await agent.post(`/api/logging/track-usage`, payload);

    return true;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const useSaveUserSettingsMutation = () =>
  useMutation({
    mutationFn: (payload: SaveUserSettingRequest) => {
      return saveUserSettings(payload);
    },
  });

export const useTrackUserUsageMutation = () =>
  useMutation({
    mutationFn: (payload: TrackUserUsageRequest) => {
      return trackUserUsage(payload);
    },
  });
