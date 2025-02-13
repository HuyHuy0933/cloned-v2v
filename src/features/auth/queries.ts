import { useQuery } from "@tanstack/react-query";
import agent from "../base";
import { ProfileRequest, ProfileResponse } from "./types";
import { LOCAL_STORAGE_KEY, QUERY_KEY } from "@/lib/constaints";
import { config } from "@/lib/config";
import { CurrentUser } from "../current-user/types";

const getProfile = async (_: ProfileRequest) => {
  try {
    // api not work for localhost, use this for development, remove later
    const data: ProfileResponse = {
      id: '1',
      email: 'kenji.sakuramoto@gmail.com',
      name: 'kenji.sakuramoto@gmail.com',
      metadata: {
        area: "",
        branch: "",
      }
    };
    localStorage.setItem(LOCAL_STORAGE_KEY.user_id, data.id);
    return data;
  } catch (error) {
    throw error;
  }
};
export const useUserProfileQuery = () =>
  useQuery({
    queryKey: [QUERY_KEY.CURRENT_USER],
    queryFn: () => getProfile(),
    staleTime: Infinity,
    retry: false,
    select: (data: ProfileResponse) =>
      ({
        id: data.id,
        name: data.name.split("@")[0],
        email: data.email,
        metadata: data.metadata,
        isRecordingStrict: config.recordingStrictDomains.includes(
          data.email.split("@")[1].trim(),
        ),
      }) as CurrentUser,
  });
