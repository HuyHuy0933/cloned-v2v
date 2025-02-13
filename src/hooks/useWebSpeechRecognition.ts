import { useEffect, useRef, useState } from "react";
import "regenerator-runtime";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { produce } from "immer";
import { useAudioRecorder } from "react-audio-voice-recorder";
import { isAndroid } from "@/lib/constaints";

type RecognitionParams = {
  audioInputDeviceId?: string
}

type RecognitionOptions = {
  names?: string;
  language?: string;
  silentThresholdSec?: number
}

const useWebSpeechRecognition = () => {
  const silentThresholdTimeout = useRef<any>(null);
  const optionsRef = useRef<RecognitionOptions | null>(null);
  const interimChunkIdxRef = useRef(0);

  const [transcriptChunks, setTranscriptChunks] = useState<string[]>([]);
  const [interimTranscriptChunks, setInterimTranscriptChunks] = useState<
    string[]
  >([]);
  const [audioChunk, setAudioChunk] = useState<Blob | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [recording, setRecording] = useState(false);

  const {
    startRecording,
    stopRecording,
    recordingBlob,
    recordingTime,
    mediaRecorder,
  } = useAudioRecorder();

  const { transcript, listening, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setSpeaking(true);

      if (silentThresholdTimeout.current) {
        clearTimeout(silentThresholdTimeout.current);
        silentThresholdTimeout.current = null;
      }

      setInterimTranscriptChunks(
        produce((prev) => {
          prev[interimChunkIdxRef.current] = transcript;
        }),
      );
    }
  }, [transcript]);

  useEffect(() => {
    // listening is false -> user stop speaking
    if (!listening && recording && optionsRef.current) {
      restartRecognition();

      setSpeaking(false);
      if (interimTranscriptChunks[interimChunkIdxRef.current]) {
        interimChunkIdxRef.current++;
      }

      if (!silentThresholdTimeout.current) {
        const { silentThresholdSec = 1 } = optionsRef.current;
        silentThresholdTimeout.current = setTimeout(() => {
          interimChunkIdxRef.current = 0;
          setTranscriptChunks((prev) => [
            ...prev,
            interimTranscriptChunks.join(" "),
          ]);
          setInterimTranscriptChunks([]);
        }, silentThresholdSec * 1000);
      }
    }
  }, [listening]);

  const startRecognition = async (options: RecognitionOptions) => {
    try {
      setRecording(true);
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

  const restartRecognition = async () => {
    await SpeechRecognition.startListening({
      continuous: false,
    });
  };

  const stopRecognition = async () => {
    console.log(`Stop recogniztion`);
    setRecording(false);
    optionsRef.current = null;

    const lastInterimTranscript = interimTranscriptChunks.join(" ");
    if (lastInterimTranscript) {
      setTranscriptChunks((prev) => [...prev, lastInterimTranscript]);
    }

    if (silentThresholdTimeout.current) {
      clearTimeout(silentThresholdTimeout.current);
    }

    if (!isAndroid) {
      stopRecording();
    }
    await SpeechRecognition.abortListening();
    setInterimTranscriptChunks([]);
    setTranscriptChunks([]);
    interimChunkIdxRef.current = 0;
  };

  return {
    startRecognition,
    stopRecognition,
    transcript: interimTranscriptChunks.join(" "),
    transcriptChunks,
    audioChunk,
    speaking,
    mediaRecorder,
    recordingTime,
    recordingBlob,
  };
};

export { useWebSpeechRecognition };
