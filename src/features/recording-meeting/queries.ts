import { AxiosResponse } from "axios";
import { MeetingRoom, MeetingRoomResponse } from "../meeting/types";
import agent from "../base";
import { RecordingMessage, RecordingMessageHistory } from "./types";

export const getRecordingMeeting = async (
  recording_id: string,
): Promise<MeetingRoom> => {
  try {
    const response: AxiosResponse<MeetingRoomResponse> = await agent.get(
      `/api/meeting-room/${recording_id}/get_by_recording_id`,
    );

    const { password, ...rest } = response.data;
    return {
      ...rest,
      isProtected: !!response.data.password,
      meetingId: response.data.id,
      users: [],
    };
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const getRecordingHistories = async (
  recording_id: string,
): Promise<RecordingMessage[]> => {
  try {
    const response: AxiosResponse<RecordingMessageHistory[]> = await agent.get(
      `/api/meeting-room/recoding-history/${recording_id}`,
    );

    return response.data
      .filter((x: any) => !!x.origin_text)
      .map((x) => {
        return {
          id: x.message_id,
          text: x.origin_text,
          is_final: true,
          entity_labels: x.entity_labels,
          userId: x.user_id,
          username: x.username,
          createdAt: x.createdAt,
        } as RecordingMessage;
      });
  } catch (err) {
    console.log(err);
    throw err;
  }
};
