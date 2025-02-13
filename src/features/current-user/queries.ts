import { QUERY_KEY } from "@/lib/constaints";
import { useQuery } from "@tanstack/react-query";
import { UserSetting, UserUsage } from "./types";
import agent from "../base";
import { AxiosResponse } from "axios";

export const getUserUsage = async (): Promise<UserUsage> => {
  try {
    const response: AxiosResponse<UserUsage> = await agent({
      url: `/api/user/usage`,
      method: "GET",
    });

    return response.data;
  } catch (error) {
    throw error
  }
};

export const getUserSetting = async (): Promise<UserSetting> => {
  try {
    const response: AxiosResponse<UserSetting> = await agent({
      url: `/api/user/settings`,
      method: "GET",
    });

    return response.data
  } catch (error) {
    throw error
  }
};

export const useUserUsageQuery = () =>
  useQuery({
    queryKey: [QUERY_KEY.USER_USAGE],
    queryFn: () => getUserUsage(),
    refetchOnWindowFocus: true,
  });

export const useUserSettingQuery = () =>
  useQuery({
    queryKey: [QUERY_KEY.USER_SETTINGS],
    queryFn: () => getUserSetting(),
    staleTime: Infinity,
  });
