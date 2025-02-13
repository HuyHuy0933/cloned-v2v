import { AxiosResponse } from "axios";
import agent from "../base";
import { useQuery } from "@tanstack/react-query";
import {
  DEFAULT_STALE_TIME_QUERY,
  LOCAL_STORAGE_KEY,
  QUERY_KEY,
} from "@/lib/constaints";
import {
  GetAudioPresignUrlResponse,
  GetRecordAudio,
  GetRecordAudioDiary,
  GetRecordAudioDiaryResponse,
  GetRecordAudioProgress,
  GetRecordAudiosResponse,
  GetRecordAudioStatusesResponse,
  GetUsersRecordAudioShared,
  Participant,
  RecordedAudio,
  RecordedAudioDiary,
  SentimentData,
  AIChatHistory,
  SUMMARY_AI_TEMPLATE,
  AUDIO_STATUS_ENUM,
  OLD_FINE_TUNED_MODEL,
  FINE_TUNED_MODEL,
} from "./types";
import { decodeHtmlEntities, getTop3SummaryTags } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { tMessages } from "@/locales/messages";
import { t } from "i18next";

const fetchRecordAudios = async (): Promise<GetRecordAudiosResponse> => {
  try {
    // const response: AxiosResponse<GetRecordAudiosResponse> = await agent.get(
    //   `/api/meeting-record-list`,
    // );
    return {
      audio_list: [
        {
          "bot_type": "normal",
          "custom_names": "Kenji\nAtPeak",
          "details": {
            "summaries": [
              {
                "content": "None.",
                "key": "section_1"
              },
              {
                "content": "None.",
                "key": "section_2"
              },
              {
                "content": "None.",
                "key": "section_3"
              },
              {
                "content": "Người nói chia sẻ rằng họ sử dụng mô hình học máy mỗi ngày. Thông tin chi tiết hơn không được cung cấp trong đoạn hội thoại.",
                "key": "section_4"
              },
              {
                "content": "Bạn sử dụng mô hình học máy cho mục đích gì?; Bạn có gặp khó khăn gì khi sử dụng mô hình học máy không?; Bạn có thể chia sẻ một ví dụ về mô hình học máy mà bạn đã sử dụng?",
                "key": "section_5"
              }
            ],
            "tags": [
              "mô hình học máy",
              "người sử dụng"
            ],
            "title": "Sử dụng mô hình học máy hàng ngày"
          },
          "diary": "[{\"speaker\": \"lexuanhuydn1997\", \"start_time\": 0, \"end_time\": 2.116, \"transcript\": \"L\\u00e0 ng\\u01b0\\u1eddi s\\u1eed d\\u1ee5ng m\\u00f4 h\\u00ecnh h\\u1ecdc m\\u00e1y m\\u1ed7i ng\\u00e0y.\", \"highlights\": [], \"is_translated\": true}]",
          "duration": 2.116,
          "enableAISummary": true,
          "end_date_time": 1739329350602,
          "favorite": [],
          "id": "67ac0f4609df30cd9e363e3d",
          "is_masking": false,
          "language": "vi-VN",
          "location": "",
          "masking_approved": true,
          "meeting_id": "67ac0eee09df30cd9e363e1a",
          "model": "general",
          "name": "Test",
          "participants": {
            "66f656a9b2b157b550ff5208": {
              "id": "66f656a9b2b157b550ff5208",
              "name": "lexuanhuydn1997",
              "role": "speaker"
            },
            "6720bd12ddef186802198508": {
              "id": "6720bd12ddef186802198508",
              "name": "xuanhuy0933",
              "role": "speaker"
            }
          },
          "progress": [],
          "remove_noise": false,
          "s3_path": "https://v2v-audio.s3.amazonaws.com/66f656a9b2b157b550ff5208/ce519506-c444-420b-8b88-5b10a3da7616.mp3",
          "start_date_time": 1739329350602,
          "status": "uploaded",
          "summaryAITemplate": "meeting",
          "tags": "mô hình học máy, người sử dụng",
          "type": "meeting",
          "voiceid": "None"
        } as any,
        {
          "attachments": [],
          "bot_type": "normal",
          "custom_names": "Kenji\nAtPeak",
          "details": {
            "summaries": [
              {
                "content": "None.",
                "key": "section_1"
              },
              {
                "content": "None.",
                "key": "section_2"
              },
              {
                "content": "None.",
                "key": "section_3"
              },
              {
                "content": "The conversation reflects on the beauty of nature, contrasting the serene meadow with the bustling city life. The speaker describes the old oak tree and the peaceful atmosphere it creates. Additionally, the imagery of an antique clock in an abandoned library evokes a sense of nostalgia and the passage of time. Overall, it captures a longing for tranquility amidst modern life's chaos.",
                "key": "section_4"
              },
              {
                "content": "What inspired the imagery of the oak tree?; How does the speaker feel about the contrast between nature and the city?; What significance does the antique clock hold in the conversation?",
                "key": "section_5"
              }
            ],
            "tags": [
              "oak tree",
              "meadow",
              "tranquility",
              "city",
              "antique clock",
              "library"
            ],
            "title": "Reflections on Nature and Time"
          },
          "diary": "[{\"speaker\": \"lexuanhuydn1997\", \"start_time\": 0, \"end_time\": 4.256, \"transcript\": \"Good morning. What are you doing?\", \"highlights\": null, \"is_translated\": false}, {\"speaker\": \"lexuanhuydn1997\", \"start_time\": 4.256, \"end_time\": 17.472, \"transcript\": \"The old weathered oak tree, its gnarled branches reaching out like the arms of a wizened sage, stood Sentinel at the edge of the Meadow.\", \"highlights\": null, \"is_translated\": false}, {\"speaker\": \"lexuanhuydn1997\", \"start_time\": 17.472, \"end_time\": 47.903999999999996, \"transcript\": \"Its leaves rustling in the gentle breeze that carried the scent of wildflowers and the distant murmur of a babbling brook. A Symphony of nature that lulled the senses and brought a sense of tranquility to the soul. A stark contrast to the bustling city just beyond the horizon, where the cacophony of traffic and the hurried footsteps of preoccupied pedestrians created a constant hum of activity, A reminder of the ceaseless motion of modern life that seemed the world away from the peaceful.\", \"highlights\": null, \"is_translated\": false}, {\"speaker\": \"lexuanhuydn1997\", \"start_time\": 47.903999999999996, \"end_time\": 58.559999999999995, \"transcript\": \"Entity of the Meadow, where time seemed to slow down and the worries of the world faded into the background, replaced by the simple beauty of the natural world.\", \"highlights\": null, \"is_translated\": false}, {\"speaker\": \"lexuanhuydn1997\", \"start_time\": 58.559999999999995, \"end_time\": 87.52, \"transcript\": \"The antique clock with its ornate carvings and tarnished brass pendulum ticked with a slow, deliberate rhythm, each second echoing in the cabin in the silence of the abandoned library. A place where dust smooth danced in the shafts of sunlight that streamed through the grimy windows, illuminating rows upon rows of forgotten books, their pages filled with stories and knowledge that at once captivated eager minds but now lay dormant.\", \"highlights\": null, \"is_translated\": false}, {\"speaker\": \"lexuanhuydn1997\", \"start_time\": 87.52, \"end_time\": 92.128, \"transcript\": \"Waiting to be rediscovered by a curious soul.\", \"highlights\": null, \"is_translated\": false}]",
          "duration": 92.128,
          "enableAISummary": true,
          "end_date_time": 1738853506155,
          "id": "67a4cc8299344cdfa638afd5",
          "is_masking": false,
          "language": "en-US",
          "location": "Thành phố Đà Nẵng, Việt Nam",
          "masking_approved": true,
          "meeting_id": "67a4cc0d99344cdfa638afd1",
          "model": "general",
          "name": "Recording_lexuanhuydn1997_20250206_2149",
          "participants": {
            "lexuanhuydn1997": {
              "id": "lexuanhuydn1997",
              "name": "lexuanhuydn1997",
              "role": ""
            }
          },
          "progress": [],
          "remove_noise": false,
          "s3_path": "https://v2v-audio.s3.amazonaws.com/66f656a9b2b157b550ff5208/49c254b7-0a0b-4df6-8e0e-71ec03460f67.mp3",
          "start_date_time": 1738853506155,
          "status": "uploaded",
          "summaryAITemplate": "meeting",
          "tags": "oak tree, meadow, tranquility, city, antique clock, library",
          "type": "recorder",
          "voiceid": "None"
        } as any
      ]
    } as any;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const fetchRecordAudioDetails = async (
  id: string,
): Promise<GetRecordAudio> => {
  try {
    const response: AxiosResponse<GetRecordAudio> = await agent.get(
      `/api/meeting-record-audio/${id}/details`,
    );
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const fetchUsersRecordAudioShared = async (
  id: string,
): Promise<GetUsersRecordAudioShared[]> => {
  try {
    const response: AxiosResponse<GetUsersRecordAudioShared[]> =
      await agent.post(`api/meeting-record/${id}/shared-users`);
    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const checkRecordAudiosStatus = async (
  ids: string[],
): Promise<GetRecordAudioStatusesResponse> => {
  try {
    const response: AxiosResponse<GetRecordAudioStatusesResponse> =
      await agent.post(`/api/meeting-record-status`, {
        ids,
      });

    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const fetchAudioDiary = async (
  id: string,
): Promise<GetRecordAudioDiaryResponse> => {
  try {
    const response: AxiosResponse<GetRecordAudioDiaryResponse> =
      await agent.get(`/api/meeting-record-diary/${id}`);

    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const queryAIChatHistories = async (
  date: number,
): Promise<AIChatHistory> => {
  try {
    const response: AxiosResponse<AIChatHistory> = await agent.get(
      `/api/ai-chat/get-history/${date}`,
    );
    return response.data;
  } catch (error) {
    console.log("Error: ", error);
    throw error;
  }
};

export const fetchSentimentData = async (
  id: string,
): Promise<SentimentData[] | null> => {
  try {
    const response: AxiosResponse<SentimentData[]> = await agent.get(
      `/api/sentiment/${id}`,
    );

    return response.data.map((x) => ({ ...x, id: Number(x.id) }));
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

export const generateAudioPresignUrl = async (
  url: string,
): Promise<GetAudioPresignUrlResponse> => {
  try {
    const response: AxiosResponse<GetAudioPresignUrlResponse> =
      await agent.post(`/api/audio/get_url`, {
        url,
      });

    return response.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const getAudioBlob = async (audioUrl: string): Promise<any> => {
  try {
    const response: AxiosResponse<any> = await agent.get(
      `/api/audio_stream/${btoa(audioUrl)}`,
      { responseType: "blob" },
    );

    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

export const mappingAudioResponse = (data: GetRecordAudio) => {
  const diaryData: GetRecordAudioDiary[] = data.diary
    ? JSON.parse(data.diary)
    : [];
  const speakers = [...new Set(diaryData.map((x) => x.speaker))];

  let summaryDetail: any = {};

  if (data.details && typeof data.details === "object") {
    let summaries = data.details.summaries;

    // Handle for historical data
    if (!summaries) {
      summaries = [
        {
          key: "section_1",
          content: data.details.agenda ?? "",
        },
        {
          key: "section_2",
          content: data.details.action_items.join(";"),
        },
        {
          key: "section_3",
          content: data.details.next_steps.join(";"),
        },
        {
          key: "section_4",
          content: data.details.questions.join(";"),
        },
        {
          key: "section_5",
          content: data.details.summary ?? "",
        },
      ];
    }

    summaryDetail = {
      tags: getTop3SummaryTags(
        data.details.tags.filter(
          (x) => !x.includes("***") && x.trim().length > 0,
        ),
      ),
      summaries: summaries,
    };
  }

  let progressData: GetRecordAudioProgress = {
    userId: localStorage.getItem(LOCAL_STORAGE_KEY.user_id),
    current_progress: 0,
    play_count: 0,
    play_complete: false,
  };

  if (data.progress) {
    const userProgress = data.progress.find(
      (p) => p.userId == localStorage.getItem(LOCAL_STORAGE_KEY.user_id),
    );

    if (userProgress) {
      progressData = userProgress;
    }
  }

  let participants: Participant[] = speakers.map((x) => ({
    id: x,
    name: x,
    role: "",
  }));
  if (data.participants && Object.keys(data.participants).length > 0) {
    participants = Object.keys(data.participants).map(
      (x) => data.participants[x],
    );
  }

  let name = "";
  if (data.status === AUDIO_STATUS_ENUM.UPLOADING || data.status === AUDIO_STATUS_ENUM.PROCESSING) {
    name = t(tMessages.common.processingAudio());
  } else if (!data.enableAISummary) {
    name = t(tMessages.common.untitledAudio());
  }

  if (data.name) {
    name = data.name.trim();
  }

  return {
    id: data.id,
    name,
    startDateTime: data.start_date_time,
    endDateTime: data.end_date_time,
    duration: Number(data.duration),
    status: data.status,
    order: 0,
    fileUrl: data.s3_path,
    diary: diaryData.map(
      (d, index) =>
        ({
          id: `${index + 1}`,
          speaker: d.speaker,
          end_time: d.end_time,
          start_time: d.start_time,
          transcript: decodeHtmlEntities(d.transcript),
          piiEntities: d.entities
            ? {
                text: d.entities.text,
                entities: d.entities.entities?.map((e) => ({
                  category: e.category,
                  confidence_score: e.confidence_score,
                  text: e.text,
                  offset: e.offset,
                  length: e.length,
                })),
              }
            : undefined,
            highlights: d.highlights,
            is_translated: d.is_translated
        }) as RecordedAudioDiary,
    ),
    speakers: speakers.length,
    summaryDetail,
    type: data.type,
    remove_noise: data.remove_noise,
    model: mapOldFineTunedModel(data.model),
    progress: progressData,
    is_masking: data.is_masking,
    masking_approved: data.masking_approved,
    bot_type: data.bot_type,
    participants,
    meeting_id: data.meeting_id,
    language: data.language,
    languageAudios: [],
    location: data.location,
    enableAISummary: data.enableAISummary ?? true,
    summaryAITemplate: data.summaryAITemplate ?? SUMMARY_AI_TEMPLATE.MEETING,
    favorite: data.favorite,
    attachments: data.attachments
      ? data.attachments.map((x) => ({
          ...x,
          size: Number(x.size),
        }))
      : [],
  } as RecordedAudio;
};

export const groupResponsedByMeetingIdThenMapToRecordedAudio = (
  data: GetRecordAudio[],
) => {
  // memorize languageAudios reference by meeting_id
  const languageMap: Record<string, RecordedAudio[]> = {};

  const result: RecordedAudio[] = [];
  for (const audio of data) {
    const recordedAudio = mappingAudioResponse(audio);
    if (!audio.meeting_id) {
      result.push(recordedAudio);
      continue;
    }

    if (!languageMap[audio.meeting_id]) {
      result.push(recordedAudio);
      if (recordedAudio.languageAudios) {
        recordedAudio.languageAudios.push(recordedAudio);
        languageMap[audio.meeting_id] = recordedAudio.languageAudios;
      }
    } else {
      languageMap[audio.meeting_id].push(recordedAudio);
    }
  }

  return result;
};

const mapOldFineTunedModel = (model: string) => {
  if (model === OLD_FINE_TUNED_MODEL.NONE) {
    return FINE_TUNED_MODEL.GENERAL;
  }

  if (model === OLD_FINE_TUNED_MODEL.FINE_TUNED) {
    return FINE_TUNED_MODEL.GENERAL;
  }

  return model;
};

export const useRecordAudioDetailsQuery = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY.RECORD_AUDIO_DETAIL, id],
    queryFn: () => fetchRecordAudioDetails(id),
    staleTime: DEFAULT_STALE_TIME_QUERY,
    select: (data: GetRecordAudio): RecordedAudio => {
      return mappingAudioResponse(data);
    },
  });
};

export const useUsersRecordAudioSharedQuery = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY.USERS_RECORD_AUDIO_SHARED, id],
    queryFn: () => fetchUsersRecordAudioShared(id),
    staleTime: Infinity,
    select: (
      data: GetUsersRecordAudioShared[],
    ): GetUsersRecordAudioShared[] => {
      return data;
    },
  });
};

export const useRecordAudiosQuery = () =>
  useQuery({
    queryKey: [QUERY_KEY.RECORD_AUDIOS],
    queryFn: () => fetchRecordAudios(),
    staleTime: DEFAULT_STALE_TIME_QUERY,
    select: (data: GetRecordAudiosResponse): GetRecordAudio[] => {
      return data.audio_list;
    },
  });

export const useSentimentDataQuery = (id: string) => {
  return useQuery({
    queryKey: [QUERY_KEY.SENTIMENT_DATA, id],
    queryFn: () => fetchSentimentData(id),
    staleTime: Infinity,
  });
};

export const useAIChatHistoriesQuery = (date: number) => {
  return useQuery({
    queryKey: [QUERY_KEY.AICHAT_HISTORY],
    queryFn: () => queryAIChatHistories(date),
    staleTime: Infinity,
  });
};
