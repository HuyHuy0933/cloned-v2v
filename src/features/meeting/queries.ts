import { AxiosResponse } from "axios";
import agent from "../base";
import { useQuery } from "@tanstack/react-query";
import { DEFAULT_STALE_TIME_QUERY, QUERY_KEY } from "@/lib/constaints";
import {
  GetTeamsParticipantsResponse,
  GetTranslatedDataRequest,
  GetTranslatedDataResponse,
  GroupedMessage,
  MeetingDetailsResponse,
  MeetingRoom,
  MeetingRoomResponse,
  MeetingUser,
} from "./types";
import {
  ActiveUserCenterMsg,
  Message,
  MessageEmoji,
  ReplyMessage,
} from "../messages/types";
import { config } from "@/lib/config";
import { decodeHtmlEntities } from "@/lib/utils";
import { QAMessage, QAMessageHistoryResponse } from "../qa-messages/types";

export const fetchCurrentMeeting = async (id: string): Promise<MeetingRoom> => {
  try {
    const response: AxiosResponse<MeetingRoom> = await agent.get(
      `/api/meeting-room/${id}/get`,
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const fetchMeetingUsers = async (
  meetingId: string | undefined,
): Promise<MeetingUser[]> => {
  try {
    if (!meetingId) return [];
    const response: AxiosResponse<MeetingUser[]> = await agent.get(
      `/api/meeting-room/${meetingId}/users`,
    );

    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const fetchMeetings = async (): Promise<MeetingRoomResponse[]> => {
  try {
    // const response: AxiosResponse<MeetingRoomResponse[]> = await agent.get(
    //   `/api/meeting-room/list`,
    // );

    return [];
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const fetchMeetingDetails = async (
  id: string,
): Promise<MeetingDetailsResponse> => {
  try {
    const response: AxiosResponse<MeetingDetailsResponse> = await agent.get(
      `/api/meeting-room/${id}/details`,
    );

    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const fetchSingleMeeting = async (
  meetingId: string,
): Promise<MeetingRoom> => {
  try {
    const response: AxiosResponse<any> = await agent.get(
      `/api/meeting-room/${meetingId}/get-meeting`,
    );

    const { password, conversation, users, reactions, id, main_user, ...rest } =
      response.data;
    const result: MeetingRoom = {
      ...rest,
      isProtected: !!response.data.password,
      meetingId: response.data.id,
    };
    console.log(result);
    return result;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const fetchQAHistories = async (meetingId: string) => {
  try {
    const response: AxiosResponse<QAMessageHistoryResponse[]> = await agent.get(
      `/api/meeting/qa-history/${meetingId}`,
    );

    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const fetchQAHistoriesOffline = async (meetingId: string) => {
  try {
    const response: AxiosResponse<QAMessageHistoryResponse[]> = await agent.get(
      `/api/qa-meeting-history/${meetingId}`,
    );

    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const generateTranslateData = async (
  payload: GetTranslatedDataRequest,
): Promise<GetTranslatedDataResponse> => {
  try {
    const response: AxiosResponse<GetTranslatedDataResponse> = await agent.post(
      "/api/translate-message",
      payload,
    );

    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const genTranslateDataTop5Messages = async (
  payloads: GetTranslatedDataRequest[],
): Promise<GetTranslatedDataResponse[]> => {
  try {
    const requests = payloads.map((payload) =>
      agent.post("/api/translate-message", payload),
    );

    const response: PromiseSettledResult<
      AxiosResponse<GetTranslatedDataResponse>
    >[] = await Promise.allSettled(requests);

    return response
      .filter((result) => result.status === "fulfilled")
      .map((x) => x.value.data);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const getTeamsParticipants = async (
  meetingId: string,
): Promise<GetTeamsParticipantsResponse> => {
  try {
    const response: AxiosResponse<GetTeamsParticipantsResponse> =
      await agent.get(`/api/bot/${meetingId}/participants`);

    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const useCurrentMeetingQuery = (id: string) =>
  useQuery({
    queryKey: [QUERY_KEY.MEETING_ROOM, id],
    queryFn: ({ queryKey }) => fetchCurrentMeeting(queryKey[1]),
    staleTime: DEFAULT_STALE_TIME_QUERY,
  });

export const useMeetingUsersQuery = (id?: string) => {
  return useQuery({
    queryKey: [QUERY_KEY.MEETING_USERS, id],
    queryFn: ({ queryKey }) => fetchMeetingUsers(queryKey[1]),
    staleTime: 0,
  });
};

export const useMeetingsQuery = () => {
  return useQuery({
    queryKey: [QUERY_KEY.MEETING_LIST],
    queryFn: () => fetchMeetings(),
    staleTime: DEFAULT_STALE_TIME_QUERY,
    select: (data: MeetingRoomResponse[]) => {
      const result: MeetingRoom[] = [];
      for (const item of data) {
        const users = Object.keys(item.users)
          .map((x) => item.users[x])
          .filter((x) => !x.left);

        const { password, ...rest } = item;

        result.push({
          ...rest,
          isProtected: !!item.password,
          meetingId: item.id,
          users,
        });
      }
      return result;
    },
  });
};

export const useMeetingDetailsQuery = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY.MEETING_DETAIL],
    queryFn: ({ queryKey }) => fetchMeetingDetails(id),
    staleTime: Infinity,
  });
};

export const useSingleMeetingQuery = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY.MEETING_SINGLE, id],
    queryFn: ({ queryKey }) => fetchSingleMeeting(id),
    staleTime: DEFAULT_STALE_TIME_QUERY,
  });
};

export const useTeamsParticipantsQuery = (meetingId: string) => {
  return useQuery({
    queryKey: [QUERY_KEY.MEETING_TEAMS_PARTICIPANTS],
    queryFn: () => getTeamsParticipants(meetingId),
    staleTime: Infinity,
  });
};

export const groupResponsedMessagesById = (
  data: MeetingDetailsResponse,
): GroupedMessage[] => {
  const messages = data.conversation;
  const result: GroupedMessage[] = [];

  let originDurations: number[] = [];
  for (const item of messages) {
    let _msg = result.find((x) => x.message_id === item.message_id);
    if (!_msg) {
      _msg = {
        meeting_id: item.meeting_id,
        message_id: item.message_id,
        origin_language: item.origin_language,
        origin_texts: [],
        origin_audio_paths: [],
        translated_texts: {},
        translated_audio_paths: {},
        user_id: item.user_id,
        username: data.users[item.user_id]?.username,
        translated_duration: {},
        origin_duration: 0,
        createdAt: item.createdAt,
        corrected_texts: [],
      };
      result.push(_msg);
    }

    _msg.corrected_texts[item.chunk_index] = item.corrected_text
      ? decodeHtmlEntities(item.corrected_text)
      : decodeHtmlEntities(item.origin_text);
    _msg.origin_texts[item.chunk_index] = decodeHtmlEntities(item.origin_text);
    if (item.origin_audio_path) {
      _msg.origin_audio_paths[item.chunk_index] =
        `${config.apiBaseUrl}/audio/${item.origin_audio_path}`;
    }

    if (!_msg.translated_texts[item.target_language]) {
      _msg.translated_texts[item.target_language] = [];
    }
    _msg.translated_texts[item.target_language][item.chunk_index] =
      decodeHtmlEntities(item.translated_text);

    if (!_msg.translated_audio_paths[item.target_language]) {
      _msg.translated_audio_paths[item.target_language] = [];
    }
    const translatedAudioPath = `${config.apiBaseUrl}/audio/${item.translated_audio_path}`;
    _msg.translated_audio_paths[item.target_language][item.chunk_index] =
      translatedAudioPath;

    if (!_msg.translated_duration[item.target_language]) {
      _msg.translated_duration[item.target_language] = 0;
    }
    _msg.translated_duration[item.target_language] += item.translated_duration;

    originDurations[item.chunk_index] = item.origin_duration;
    _msg.origin_duration = originDurations.reduce((acc, dur) => acc + dur);

    if (item.centerData) {
      _msg.centerData = item.centerData;
    }

    if (item.highlights) {
      _msg.highlights = item.highlights;
    }
  }

  return result;
};

export const mapMeetingDetailsToMessages = (
  data: MeetingDetailsResponse,
  userLanguage: string,
) => {
  const groupedMessages: GroupedMessage[] = groupResponsedMessagesById(data);
  const reactions = data.reactions?.reactions;
  const reactionMap: Record<
    string,
    { emojis: MessageEmoji[]; replies: ReplyMessage[] }
  > = {};

  if (reactions) {
    for (const item of reactions) {
      const emojis = item.emojis;
      const replies = item.messages;

      reactionMap[item.message_id] = {
        emojis: [],
        replies: [],
      };
      const msgReaction = reactionMap[item.message_id];
      for (const e of emojis) {
        const msgEmoji = msgReaction.emojis.find((x) => x.name === e.emoji);
        if (!msgEmoji) {
          msgReaction.emojis.push({ name: e.emoji, userIds: [e.user_id] });
        } else {
          msgEmoji.userIds.push(e.user_id);
        }
      }

      for (const r of replies) {
        msgReaction.replies.push({
          id: r.id,
          createdAt: r.createdAt,
          parent_id: item.message_id,
          correctedTexts: [r.message],
          originTexts: [r.message],
          userId: r.user_id,
          username: r.user_name,
          originLang: data.users[r.user_id]?.language || userLanguage,
          targetLang: "",
          translatedTexts: [],
          translatedAudios: [],
        });
      }
    }
  }

  const result: Message[] = [];
  let lastActiveUser: ActiveUserCenterMsg = {
    username: "",
    status: false,
  };
  for (const item of groupedMessages) {
    const originTexts = item.origin_texts.filter((x) => x);
    const mappedMsg: Message = {
      id: item.message_id,
      originLang: item.origin_language,
      targetLang: userLanguage,
      voiceId: "",
      completed: true,
      originTexts: originTexts,
      correctedTexts: item.corrected_texts,
      translatedTexts: [],
      translatedAudios: [],
      userId: item.user_id,
      username: item.username,
      translatedAudioDuration: item.origin_duration,
      createdAt: item.createdAt || new Date().getTime(),
      emojis: reactionMap[item.message_id]?.emojis || [],
      replies: reactionMap[item.message_id]?.replies || [],
      noTranslatedData: false,
    };

    if (item.centerData) {
      mappedMsg.centerData = item.centerData;
      const itemActiveUser = item.centerData.activeUser;
      // remove duplicated consecutive same status user
      if (
        itemActiveUser &&
        (lastActiveUser.username !== itemActiveUser.username ||
          lastActiveUser.status !== itemActiveUser.status)
      ) {
        result.push(mappedMsg);
        lastActiveUser = itemActiveUser;
      }
      continue;
    }
    lastActiveUser = {
      username: "",
      status: false,
    };

    if (!item.translated_texts[userLanguage]) {
      mappedMsg.noTranslatedData = item.origin_language !== userLanguage;
    } else {
      mappedMsg.translatedTexts = item.translated_texts[userLanguage];
      mappedMsg.translatedAudios = item.translated_audio_paths[
        userLanguage
      ].map((x) => [x]);
      mappedMsg.translatedAudioDuration =
        item.translated_duration[userLanguage];
    }

    if (item.highlights) {
      mappedMsg.highlights = {
        origins: item.highlights.origins || [],
        translations: item.highlights.translations,
      };
    }

    result.push(mappedMsg);
  }

  return result;
};

export const mapResponsedQAHistoriesToQAMessages = (
  data: QAMessageHistoryResponse[],
  userLanguage: string,
) => {
  const questions: QAMessage[] = data
    .filter((x) => !x.parentId)
    .map(
      (x) =>
        ({
          ...x,
          text: decodeHtmlEntities(x.translatedData[userLanguage]?.text || ""),
          answers: [],
          botAnswering: false,
        }) as QAMessage,
    );

  for (const item of questions) {
    const answers = data.filter((x) => x.parentId === item.id);

    if (answers.length > 0) {
      item.answers = answers.map(
        (x) =>
          ({
            ...x,
            text: decodeHtmlEntities(
              x.translatedData[userLanguage]?.text || "",
            ),
            answers: [],
            botAnswering: false,
          }) as QAMessage,
      );
    }
  }

  return questions;
};
