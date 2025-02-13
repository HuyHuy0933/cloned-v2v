import { AxiosResponse } from "axios";
import { WERCERHistory } from "./types";
import agent from "../base";
import { useQuery } from "@tanstack/react-query";
import { DEFAULT_STALE_TIME_QUERY, QUERY_KEY } from "@/lib/constaints";

const getWERCERHistory = async () => {
  try {
    const response: AxiosResponse<WERCERHistory[]> =
      await agent.get(`/api/microphone-test`);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const useWERCERHistoryQuery = () =>
  useQuery({
    queryKey: [QUERY_KEY.WERCER_HISTORY],
    queryFn: () => getWERCERHistory(),
    staleTime: DEFAULT_STALE_TIME_QUERY,
  });
