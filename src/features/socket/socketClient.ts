import { config } from "@/lib/config";
import { io } from "socket.io-client";

export enum SOCKET_EVENT {
  connect = "connect",
  user_disconnect = "user_disconnect",
  streaming = "streaming",
  streaming_received = "streaming_received",
  stop_stream = "stop_stream",
  join_channel = "join_channel",
  leave_channel = "leave_channel",
  send_message = "send_message",
  update_message = "update_message",
  start_speaking = "start_speaking",
  stop_speaking = "stop_speaking",
  add_next_speakers_queue = "add_next_speakers_queue",
  hands_reaction = "hands_reaction",
  qa_message = "qa_message",
  qa_streaming = "qa_streaming",
  qa_streaming_received = "qa_streaming_received",
  qa_stop_stream = "qa_stop_stream",
  bot_teams_raise_hand_users = "bot_teams_raise_hand_users",
  bot_teams_unmute_count = "bot_teams_unmute_count",
  real_audio_streaming = "real_audio_streaming",
  heart_beat = "heart_beat",
  meeting_stop_alert = "meeting_stop_alert",
  recording_streaming= "recording_streaming",
  stop_recording_streaming="stop_recording_streaming",
  recording_message="recording_message",
  recording_meeting_status="recording_meeting_status",
  recording_streaming_diarization="recording_streaming_diarization",
  recording_streaming_whisper="recording_streaming_whisper",
  stop_recording_streaming_whisper="stop_recording_streaming_whisper",
  recording_message_whisper_update="recording_message_whisper_update",
  whospeaks_ready="whospeaks_ready"
}

// console.log("socketBaseUrl", config.socketBaseUrl);
export const socket = io(config.socketBaseUrl, {
  autoConnect: true,
  transports: ["websocket"],
  extraHeaders: { "X-Custom-Header": "v2v" },
});

export const useSocketClient = () => {
  return socket;
};
