import React, { useEffect, useRef, useState } from "react";
import {
  Container,
  HorizontalTransition,
  IconButton,
  Header,
  Button,
  TextWritter,
  BlinkingDot,
  Spinner,
} from "@/components";
import {
  CircleLeftArrowIcon,
  ChevronSelectorVerticalIcon,
} from "@/components/icons";
import { RootState } from "@/main";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { cloneDeep } from "lodash";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";
import { allLanguages, isDesktop, LanguageOption } from "@/lib/constaints";
import { LanguageSelect, PrimaryButton } from "@/components";
import { useCurrentUser, useCustomSpeechRecognition } from "@/hooks";
import { useCreateMeetingMutation } from "@/features/meeting/mutations";
import { CreateMeetingRequest, StopSpeakingEvent } from "@/features/meeting/types";
import { catchError } from "@/lib/trycatch";
import { SOCKET_EVENT, useSocketClient } from "@/features/socket/socketClient";
import { produce } from "immer";
import { useProcessWERCERMutation } from "@/features/microphone-test/mutations";
import {
  ProcessWERCERRequest,
  WERCERResult,
} from "@/features/microphone-test/types";
import WERCERModal from "./WERCERModal";
import WERCERHistoryTable from "./WERCERHistoryTable";

const MicrophoneTest = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentUser, setting } = useCurrentUser();
  const socket = useSocketClient();

  const createMeetingMutation = useCreateMeetingMutation();
  const processWERCERMutation = useProcessWERCERMutation();

  const device = useSelector((state: RootState) => state.device);
  const profileSettingLastLocation = useSelector(
    (state: RootState) => state.ui.profileSettingLastLocation,
  );
  const sttMode = useSelector((state: RootState) => state.setting.sttMode);

  const [selectedLang, setSelectedLanguage] = useState(
    () =>
      allLanguages.find((x) => x.code === setting.language) || allLanguages[0],
  );
  const [creating, setCreating] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [transcripts, setTransripts] = useState<string[]>([]);
  const [finalTranscripts, setFinalTransripts] = useState<string[]>([]);
  const [wercerResult, setWercerResult] = useState<WERCERResult | undefined>(
    undefined,
  );

  const [originTexts, setOriginTexts] = useState<any[]>([
    tMessages.microphoneTest.originTexts.text1,
    tMessages.microphoneTest.originTexts.text2,
    tMessages.microphoneTest.originTexts.text3,
    tMessages.microphoneTest.originTexts.text4,
    tMessages.microphoneTest.originTexts.text5,
    tMessages.microphoneTest.originTexts.text6,
    tMessages.microphoneTest.originTexts.text7,
    tMessages.microphoneTest.originTexts.text8,
    tMessages.microphoneTest.originTexts.text9,
    tMessages.microphoneTest.originTexts.text10,
  ]);

  const meetingIdRef = useRef<string>("");
  const transcriptChunkIdx = useRef<number>(0);
  const selectedOriginTextRef = useRef<string>(originTexts[0]);

  const {
    startRecognition,
    stopRecognition,
    transcript,
    finalTranscript,
    recognizing,
  } = useCustomSpeechRecognition({
    stream: true,
  });

  useEffect(() => {
    if (!transcript) return;

    setTransripts(
      produce((prev) => {
        prev[transcriptChunkIdx.current] = transcript;
      }),
    );
  }, [transcript]);

  useEffect(() => {
    if (!finalTranscript) return;

    const chunkIdx = transcriptChunkIdx.current;
    setFinalTransripts(
      produce((prev) => {
        prev[chunkIdx] = finalTranscript.text;
      }),
    );
    transcriptChunkIdx.current++;
  }, [finalTranscript]);

  const onLanguageChange = async (value: LanguageOption) => {
    setSelectedLanguage(value);
  };

  const goBack = () => {
    if (profileSettingLastLocation) {
      navigate(
        `${profileSettingLastLocation.pathname}${profileSettingLastLocation.search}`,
        {
          state: cloneDeep(profileSettingLastLocation.state),
        },
      );
    } else {
      navigate("/recorder");
    }
  };

  const onRandomText = () => {
    // shuffle origin texts and set to state
    setOriginTexts((prev) => [...prev.sort(() => Math.random() - 0.5)]);
  };

  const startTesting = async () => {
    setTransripts([]);
    setFinalTransripts([]);
    transcriptChunkIdx.current = 0;
    let meetingId = meetingIdRef.current;
    if (!meetingId) {
      meetingId = await createMeeting();
    }

    if (meetingId) {
      startRecognition({
        meetingId: meetingIdRef.current,
        userId: currentUser.id,
        language: selectedLang.code,
        stream: true,
        stt_model: sttMode
      });
      selectedOriginTextRef.current = t(originTexts[0](), {
        lng: selectedLang.code,
      });
    }
  };

  const createMeeting = async () => {
    setCreating(true);
    const payload: CreateMeetingRequest = {
      meetingId: "",
      meetingName: `microphone_test_${currentUser.id}`,
      private: true,
      userId: currentUser.id,
      username: currentUser.name,
      language: selectedLang.code,
      createdAt: new Date().getTime(),
      hidden: true,
      stt_model: sttMode,
    };

    const [_, createdMeeting] = await catchError(
      createMeetingMutation.mutateAsync(payload),
    );

    let meetingId = "";
    if (createdMeeting) {
      meetingIdRef.current = createdMeeting.meetingId;
      socket.emit(SOCKET_EVENT.join_channel, {
        meetingId: createdMeeting.meetingId,
        userId: currentUser.id,
        username: currentUser.name,
        email: currentUser.email,
        language: selectedLang.code,
      });

      meetingId = createdMeeting.meetingId;
    }

    setCreating(false);
    return meetingId;
  };

  const stopTesting = () => {
    stopRecognition();
    if (meetingIdRef.current) {
      socket.emit(SOCKET_EVENT.stop_speaking, {
        meetingId: meetingIdRef.current,
        user: {
          userId: currentUser.id,
        },
        stt_model: sttMode
      } as StopSpeakingEvent);
    }

    processWERCER();
  };

  const processWERCER = async () => {
    // const texts: string[] = [...transcripts];
    // if (finalTranscripts.length < transcripts.length) {
    //   for (let i = 0; i < finalTranscripts.length; i++) {
    //     texts[i] = finalTranscripts[i];
    //   }
    // }
    // if (texts.length === 0) return;
    if(finalTranscripts.length === 0) return;

    let microphone = device.inputDevice.label;
    if (!isDesktop) {
      microphone = navigator.userAgent;
    }
    const payload: ProcessWERCERRequest = {
      datetime: new Date().getTime(),
      language: selectedLang.code,
      hypothesis_text: finalTranscripts.join(" "),
      origin_text: selectedOriginTextRef.current,
      microphone,
    };
    setProcessing(true);
    const [_, result] = await catchError(
      processWERCERMutation.mutateAsync(payload),
    );
    setProcessing(false);

    if (result) {
      setWercerResult(result);
    }
  };

  const leftHeader = (
    <IconButton className="z-10" onClick={goBack}>
      <CircleLeftArrowIcon className="size-8 transition duration-200 hover:scale-[1.2]" />
    </IconButton>
  );

  return (
    <HorizontalTransition>
      <Header leftItem={leftHeader} />
      <Container className="flex-col">
        <div className="mt-4 flex w-full flex-col sm:flex-row">
          {/* Origin Text */}
          <div className="flex min-h-[250px] w-full flex-col items-center justify-center gap-2 space-y-2 border-2 border-primary-foreground p-4">
            <p className="text-center">
              {t(originTexts[0](), { lng: selectedLang.code })}
            </p>
            <Button onClick={onRandomText}>
              {t(tMessages.microphoneTest.randomize())}
            </Button>
          </div>

          {/* Transcript Text */}
          <div className="flex min-h-[250px] w-full flex-col items-center justify-center gap-2 border-2 border-primary-foreground p-4">
            <LanguageSelect
              value={selectedLang}
              options={allLanguages}
              onChange={onLanguageChange}
              triggerClass="gap-4"
              trigger={
                <PrimaryButton
                  className="h-auto w-full justify-center gap-4 rounded-md px-4"
                  prependIcon={
                    <img src={selectedLang.flagUrl} alt="flag" width={15} />
                  }
                  appendIcon={<ChevronSelectorVerticalIcon />}
                >
                  {t(selectedLang.title())}
                </PrimaryButton>
              }
            />

            <Button
              className="px-8"
              onClick={!recognizing ? startTesting : stopTesting}
              disabled={
                creating ||
                processing ||
                (recognizing && finalTranscripts.length < transcripts.length)
              }
            >
              {processing ? (
                t(tMessages.common.startProcessing())
              ) : recognizing ? (
                <BlinkingDot />
              ) : (
                <>
                  {t(tMessages.microphoneTest.startTest())}{" "}
                  {creating && <Spinner className="ml-2 size-4" />}
                </>
              )}
            </Button>
            <p className="text-sm text-primary-foreground">
              ※{t(tMessages.microphoneTest.note())}
            </p>

            {/* Transcripting text */}
            <div className="flex w-full flex-wrap">
              {transcripts.map((text: string, index: number) => {
                if (finalTranscripts[index]) {
                  return (
                    <p className="mr-1" key={index}>
                      {finalTranscripts[index]}
                    </p>
                  );
                }

                return <TextWritter key={index} className="mr-1" text={text} />;
              })}
            </div>
          </div>
        </div>

        {/* Test history */}
        <div className="mt-4 grow border-t-2 border-primary-foreground pt-4">
          <WERCERHistoryTable />
        </div>
      </Container>

      {!!wercerResult && (
        <WERCERModal
          onClose={() => {
            setWercerResult(undefined);
          }}
          result={wercerResult}
        />
      )}
    </HorizontalTransition>
  );
};

export default MicrophoneTest;
