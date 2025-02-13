import { config } from "@/lib/config";
import agent from "../base";
import { LogoutResponse } from "./types";
import { useMutation } from "@tanstack/react-query";
import { QUERY_KEY } from "@/lib/constaints";
import { queryClient } from "@/main";

export const signOut = () =>
  agent<LogoutResponse>({
    url: `${config.aiPlatformBaseUrl}/v2v/logout`,
    method: "GET",
    withCredentials: true,
  });

export const useSignOutMutation = () =>
  useMutation({
    mutationFn: () => signOut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.CURRENT_USER] });
    },
  });
