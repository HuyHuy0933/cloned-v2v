import { AxiosResponse } from "axios";
import agent from "../base";
import { useMutation } from "@tanstack/react-query";
import {
  AddTeamsParticipantsRequest,
  CreateMeetingRequest,
  CreateMeetingResponse,
  MeetingPasswordRequest,
  MeetingRoomResponse,
  SaveMeetingRequest,
  VerifyCustomIdMeetingRequest,
} from "./types";
import { queryClient } from "@/main";
import { QUERY_KEY } from "@/lib/constaints";
import { QAMessageReponse, QAMessageSentEvent } from "../qa-messages/types";

const createMeeting = async (
  payload: CreateMeetingRequest,
): Promise<CreateMeetingResponse> => {
  try {
    const response: AxiosResponse<CreateMeetingResponse> = await agent.post(
      `/api/meeting-room/create`,
      payload,
    );
    return response.data;
  } catch (err) {
    throw err;
  }
};

const removeMeeting = async (id: string): Promise<boolean> => {
  try {
    const response: AxiosResponse<boolean> = await agent.post(
      `/api/meeting-room/${id}/remove`,
    );
    return response.data;
  } catch (err) {
    throw err;
  }
};

const leaveMeeting = async (
  meetingId: string,
  userId: string,
): Promise<boolean> => {
  try {
    const response: AxiosResponse<boolean> = await agent.post(
      `/api/meeting-room/${meetingId}/leave`,
      {
        userId,
      },
    );
    return response.data;
  } catch (err) {
    throw err;
  }
};

const saveMeeting = async (payload: SaveMeetingRequest): Promise<boolean> => {
  try {
    const response: AxiosResponse<boolean> = await agent.post(
      `/api/meeting-save/${payload.meetingId}`,
      payload,
    );
    return response.data;
  } catch (err) {
    throw err;
  }
};

const checkMeetingPassword = async (
  payload: MeetingPasswordRequest,
): Promise<boolean> => {
  try {
    const response: AxiosResponse<boolean> = await agent.post(
      "/api/meeting-room/check_password",
      payload,
    );
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const addTeamsParicipants = async (payload: AddTeamsParticipantsRequest) => {
  try {
    const response: AxiosResponse<boolean> = await agent.post(
      "/api/bot/participants/add",
      payload,
    );
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const verifyCustomIdMeeting = async (
  payload: VerifyCustomIdMeetingRequest,
) => {
  try {
    const response: AxiosResponse<MeetingRoomResponse> = await agent.post(
      "/api/meeting-room/verify_custom_id",
      payload,
    );

    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const discardMeeting = async (id: string): Promise<boolean> => {
  try {
    const response: AxiosResponse<boolean> = await agent.post(
      `/api/meeting/${id}/discard`,
    );
    return response.data;
  } catch (err) {
    throw err;
  }
};

const sendQAMessage = async (
  payload: QAMessageSentEvent,
) => {
  try {
    const response: AxiosResponse<QAMessageReponse> = await agent.post(
      `/api/qa-meeting-history/${payload.meetingId}/handle-message`,
      payload,
    );

    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const useCreateMeetingMutation = () =>
  useMutation({
    mutationFn: (payload: CreateMeetingRequest) => {
      return createMeeting(payload);
    },
  });

export const useRemoveMeetingMutation = () =>
  useMutation({
    mutationFn: (id: string) => {
      return removeMeeting(id);
    },
  });
export const useLeaveMeetingMutation = () =>
  useMutation({
    mutationFn: (payload: { meetingId: string; userId: string }) => {
      return leaveMeeting(payload.meetingId, payload.userId);
    },
  });

export const useSaveMeetingMutation = () =>
  useMutation({
    mutationFn: (payload: SaveMeetingRequest) => {
      return saveMeeting(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.RECORD_AUDIOS] });
    },
  });

export const useCheckMeetingPasswordMutation = () =>
  useMutation({
    mutationFn: (payload: MeetingPasswordRequest) => {
      return checkMeetingPassword(payload);
    },
  });
export const useAddTeamsParicipantsMutation = () =>
  useMutation({
    mutationFn: (payload: AddTeamsParticipantsRequest) => {
      return addTeamsParicipants(payload);
    },
  });

export const useVerifyCustomMeetingMutation = () =>
  useMutation({
    mutationFn: (payload: VerifyCustomIdMeetingRequest) => {
      return verifyCustomIdMeeting(payload);
    },
  });

export const useDiscardMeetingMutation = () =>
  useMutation({
    mutationFn: (id: string) => {
      return discardMeeting(id);
    },
  });

export const useSendQAMessageMutation = () =>
  useMutation({
    mutationFn: (payload: QAMessageSentEvent) => {
      return sendQAMessage(payload);
    },     
  });