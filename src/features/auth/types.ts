import { UserMetaDataType } from "../current-user/types";

export type LogoutRequest = void;
export type LogoutResponse = void;
export type ProfileRequest = void;
export type ProfileResponse = {
  id: string;
  name: string;
  email: string;
  department?: string;
  metadata: UserMetaDataType;
};
