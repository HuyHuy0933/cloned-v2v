import "regenerator-runtime";
import { SOCKET_EVENT, useSocketClient } from "@/features/socket/socketClient";
import { isAndroid, isDesktop } from "@/lib/constaints";
import { useEffect, useRef, useState } from "react";
import { useAudioRecorder } from "react-audio-voice-recorder";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { config } from "@/lib/config";

type RecognitionParams = {
  stream: boolean;
  sent_event?: string;
  received_event?: string;
  stopped_event?: string;
  audioInputDeviceId?: string;
};

export type RecognitionOptions = {
  meetingId?: string;
  userId?: string;
  language: string;
  stream: boolean;
  silentThreshold?: number;
  stt_model: string;
};

type FinalTrancriptData = {
  text: string;
  audioChunk?: Int16Array;
};

type StreamingTranscription = {
  text: string;
  is_final: boolean;
  meetingId: string;
  userId: string;
};

export const useCustomSpeechRecognition = (params: RecognitionParams) => {
  const socket = useSocketClient();
  const {
    sent_event = SOCKET_EVENT.streaming,
    received_event = SOCKET_EVENT.streaming_received,
    stopped_event = SOCKET_EVENT.stop_stream,
  } = params;
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioBufferRef = useRef<Int16Array[]>([]); // Buffer to store Int16Array chunks
  const interimChunkIdxRef = useRef(0);
  const optionsRef = useRef<RecognitionOptions | null>(null);
  const silentThresholdTimeoutRef = useRef<any>(null);
  const transcriptChunksRef = useRef<string[]>([]);

  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState<
    FinalTrancriptData | undefined
  >(undefined);

  const {
    startRecording,
    stopRecording,
    mediaRecorder: wsMediaRcorder,
  } = useAudioRecorder({
    deviceId: params.audioInputDeviceId,
  });

  const {
    transcript: wsTranscript,
    listening,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    const onTranscriptReceived = (data: StreamingTranscription) => {
      if (
        !optionsRef.current ||
        data.userId !== optionsRef.current.userId ||
        !data.text
      ) {
        return;
      }

      // console.log("Received transcript:", data);
      if (silentThresholdTimeoutRef.current) {
        clearTimeout(silentThresholdTimeoutRef.current);
      }

      transcriptChunksRef.current[interimChunkIdxRef.current] = data.text;
      setTranscript(transcriptChunksRef.current.join(" "));
      if (data.is_final) {
        if (transcriptChunksRef.current[interimChunkIdxRef.current]) {
          interimChunkIdxRef.current++;
        }

        const { silentThreshold = 1 } = optionsRef.current;
        silentThresholdTimeoutRef.current = setTimeout(() => {
          setFinalTranscript({
            text: transcriptChunksRef.current.join(" "),
            audioChunk: concatenateBuffers(audioBufferRef.current),
          });
          interimChunkIdxRef.current = 0;
          transcriptChunksRef.current = [];
          audioBufferRef.current = [];
          setTranscript("");
        }, silentThreshold * 1000);
      }
    };

    socket.on(received_event, onTranscriptReceived);
    return () => {
      socket.off(received_event, onTranscriptReceived);
    };
  }, []);

  useEffect(() => {
    if (wsTranscript) {
      if (silentThresholdTimeoutRef.current) {
        clearTimeout(silentThresholdTimeoutRef.current);
        silentThresholdTimeoutRef.current = null;
      }

      transcriptChunksRef.current[interimChunkIdxRef.current] = wsTranscript;
      setTranscript(transcriptChunksRef.current.join(" "));
    }
  }, [wsTranscript]);

  useEffect(() => {
    // listening is false -> user stop speaking
    if (!listening && recognizing && optionsRef.current) {
      continueWSRecognition();

      if (transcriptChunksRef.current[interimChunkIdxRef.current]) {
        interimChunkIdxRef.current++;
      }

      if (!silentThresholdTimeoutRef.current) {
        const { silentThreshold = 1 } = optionsRef.current;
        silentThresholdTimeoutRef.current = setTimeout(() => {
          setFinalTranscript({
            text: transcriptChunksRef.current.join(" "),
          });
          interimChunkIdxRef.current = 0;
          transcriptChunksRef.current = [];
        }, silentThreshold * 1000);
      }
    }
  }, [listening]);

  const startRecognition = async (options: RecognitionOptions) => {
    if (params.stream) {
      await startStreamingRecognition(options);
    } else {
      await startWSRecognition(options);
    }
  };

  const stopRecognition = async () => {
    if (params.stream) {
      stopStreamingRecognition();
    } else {
      await stopWSRecognition();
    }
  };

  const startStreamingRecognition = async (options: RecognitionOptions) => {
    try {
      optionsRef.current = options;
      // Access microphone
      let constraints: MediaStreamConstraints = { audio: true };
      if (isDesktop) {
        constraints = {
          audio: {
            deviceId: params.audioInputDeviceId
              ? { exact: params.audioInputDeviceId }
              : undefined,
          },
        };
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      streamMediaRecorderRef.current = mediaRecorder;

      // Initialize AudioContext and ensure 16kHz sample rate
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      // Load the AudioWorkletProcessor
      await audioContext.audioWorklet.addModule(
        `${config.basename}/worklet/pcm-audio-converter.js`,
      );

      // Create the MediaStreamSource from the microphone
      const mediaStreamSource = audioContext.createMediaStreamSource(stream);

      // Create AudioWorkletNode and set up message handling
      const workletNode = new AudioWorkletNode(
        audioContext,
        "pcm-audio-converter",
      );
      workletNodeRef.current = workletNode;

      // Handle audio data received from the AudioWorkletProcessor
      workletNode.port.onmessage = (event) => {
        const int16Array = event.data;
        // Store the received chunks into the buffer
        audioBufferRef.current.push(int16Array);
        // Emit the audio data as PCM to the server
        socket.emit(sent_event, {
          audioData: int16Array.buffer, // Send the raw PCM data buffer
          ...options, // Send additional meeting/user data
          user: {
            userId: options.userId,
            language: options.language,
          },
        });
      };

      // Connect the media stream source to the worklet node
      mediaStreamSource.connect(workletNode);
      mediaRecorder.start();
      setRecognizing(true);
    } catch (err) {
      console.error("Error accessing the microphone:", err);
    }
  };

  const stopStreamingRecognition = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }

    if (streamRef.current) {
      // Stop all tracks from the media stream (microphone)
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (streamMediaRecorderRef.current) {
      streamMediaRecorderRef.current.stop();
      streamMediaRecorderRef.current = null;
    }

    // Emit stop signal to the server
    socket.emit(stopped_event, {
      ...optionsRef.current,
      user: {
        userId: optionsRef.current?.userId,
      },
    });
    setRecognizing(false);
  };

  const startWSRecognition = async (options: RecognitionOptions) => {
    try {
      setRecognizing(true);
      optionsRef.current = options;
      const { language } = options;

      if (!browserSupportsSpeechRecognition) {
        alert("Your browser does not support the Web Speech API.");
      }

      if (!isAndroid) {
        startRecording();
      }
      await SpeechRecognition.startListening({
        continuous: false,
        language,
      });
    } catch (err: any) {}
  };

  const continueWSRecognition = async () => {
    await SpeechRecognition.startListening({
      continuous: false,
    });
  };

  const stopWSRecognition = async () => {
    console.log(`Stop recogniztion`);
    setRecognizing(false);
    optionsRef.current = null;

    const lastInterimTranscript = transcriptChunksRef.current.join(" ");
    if (lastInterimTranscript) {
      // setTranscriptChunks((prev) => [...prev, lastInterimTranscript]);
      setFinalTranscript({
        text: lastInterimTranscript,
        audioChunk: undefined,
      });
    }

    if (silentThresholdTimeoutRef.current) {
      clearTimeout(silentThresholdTimeoutRef.current);
    }

    if (!isAndroid) {
      stopRecording();
    }
    await SpeechRecognition.abortListening();
    transcriptChunksRef.current = [];
    setFinalTranscript(undefined);
    interimChunkIdxRef.current = 0;
  };

  return {
    startRecognition,
    stopRecognition,
    recognizing,
    transcript,
    finalTranscript,
    mediaRecorder: params.stream
      ? streamMediaRecorderRef.current
      : wsMediaRcorder,
  };
};

// Concatenate Int16Array chunks into a single buffer
const concatenateBuffers = (buffers: Int16Array[]) => {
  const length = buffers.reduce((acc, buffer) => acc + buffer.length, 0);
  const result = new Int16Array(length);
  let offset = 0;
  buffers.forEach((buffer) => {
    result.set(buffer, offset);
    offset += buffer.length;
  });
  return result;
};
