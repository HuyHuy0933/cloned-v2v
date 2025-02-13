//@ts-ignore
import { LiveAudioVisualizer } from "react-audio-visualize";
import {
  Button,
  Container,
  Header,
  IconButton,
  Input,
  Label,
  PrimaryButton,
  Spinner,
  Dialog,
  DialogContent,
  DialogTrigger,
  CustomFileUpload,
  audioAccepts,
} from "@/components";
import {
  CircleLeftArrowIcon,
  UserVoiceIcon,
  CloudUploadIcon,
} from "@/components/icons";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import BlueAddVoiceIcon from "./BlueAddVoiceIcon";
import UploadDoneIcon from "./UploadDoneIcon";
import { useRegisterCloneVoiceMutation } from "@/features/cloned-voices/mutations";
import { RegisterCloneVoiceRequest } from "@/features/cloned-voices/types";
import { useAudioRecorder } from "react-audio-voice-recorder";
import { secondsToTimer, getAudioDurationFromURL } from "@/lib/utils";
import { motion } from "motion/react";
import { useMyVoiceQuery } from "@/features/cloned-voices/queries";
import Teleprompter from "./cloned-voices/Teleprompter";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";
import { useCurrentUser } from "@/hooks";
import { format, fromUnixTime } from "date-fns";

enum ADD_VOICE_STEP {
  PENDING = "pending",
  RECORDING = "recording",
  UPLOAD = "upload",
  DONE = "done",
}

const AddVoice = () => {
  const { t } = useTranslation();
  const waveformRef = useRef<any>(null);
  const invervalRef = useRef<any>(null);
  const navigate = useNavigate();

  const [step, setStep] = useState<ADD_VOICE_STEP>(ADD_VOICE_STEP.PENDING);
  const [name, setName] = useState("");
  const [mutating, setMutating] = useState(false);

  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const { currentUser } = useCurrentUser();
  const [openUploadModal, setOpenUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | undefined>(undefined);
  const [uploading, setUploading] = useState(false);

  const { data: myVoice, isFetching: isFetchingVoice } = useMyVoiceQuery();

  // const registerCloneVoiceMutation = useRegisterCloneVoiceMutation();

  const SCROLL_SPEED = 50; // in milisecond
  const TIMEOUT = 60; // in second

  const {
    startRecording,
    stopRecording,
    recordingBlob,
    mediaRecorder,
    recordingTime,
  } = useAudioRecorder();

  const recording = step === "recording";

  useEffect(() => {
    return () => {
      if (invervalRef.current) {
        clearInterval(invervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let timerId: any = null;
    if (isActive && seconds > 0) {
      timerId = window.setInterval(() => {
        setSeconds((prevSeconds) => {
          if (prevSeconds <= 1) {
            clearInterval(timerId);
            setIsActive(false);
            return 0;
          }
          return prevSeconds - 1;
        });
      }, 1000);
    }

    // Cleanup the interval on component unmount or when dependencies change
    return () => {
      clearInterval(timerId);
    };
  }, [isActive, seconds]);

  const onLeftClick = () => {
    if (step === ADD_VOICE_STEP.PENDING) {
      navigate("/setting");
      return;
    }

    if (step === ADD_VOICE_STEP.RECORDING) {
      stopRecord();
    }
    setStep(ADD_VOICE_STEP.PENDING);
  };

  const pushCloneVoice = async (voiceBlob: File | Blob) => {
    const now = new Date();
    const datetime = format(
      fromUnixTime(now.getTime() / 1000),
      "yyyyMMdd_HHmm",
    );

    const payload: RegisterCloneVoiceRequest = {
      audio: voiceBlob,
      name,
      username: currentUser.name,
      recordedTime: datetime,
    };

    // await registerCloneVoiceMutation.mutateAsync(payload);

    navigate("/voice-list");
  };

  const registerCloneVoice = async () => {
    try {
      if (!recordingBlob) return;
      setMutating(true);
      // await pushCloneVoice(recordingBlob);
      setStep(ADD_VOICE_STEP.PENDING);
    } catch (err) {
    } finally {
      setMutating(false);
    }
  };

  const uploadCloneVoice = async () => {
    try {
      if (!uploadFile) return;
      setUploading(true);
      await pushCloneVoice(uploadFile);
    } catch (err) {
    } finally {
      resetUploadModal();
    }
  };

  const startRecord = () => {
    setStep(ADD_VOICE_STEP.RECORDING);
    startRecording();
    setSeconds(TIMEOUT);
    setIsActive(true);
  };

  const stopRecord = () => {
    stopRecording();
    clearInterval(invervalRef.current);
  };

  const completeRecord = () => {
    stopRecord();
    setStep(ADD_VOICE_STEP.UPLOAD);
    if (myVoice) {
      setName(myVoice.name);
    }
  };

  const onOpenUploadChange = () => {
    setOpenUploadModal(!openUploadModal);
  };

  const handleFileChange = (file: File | undefined) => {
    if (file) {
      const fileURL = URL.createObjectURL(file);
      getAudioDurationFromURL(fileURL).then((duration) => {
        if (duration === Infinity) return;
        setUploadFile(file);
        if (myVoice) {
          setName(myVoice.name);
        } else {
          setName(currentUser.name);
        }
      });
    } else {
      removeFile();
    }
  };

  const removeFile = () => {
    setUploadFile(undefined);
  };

  const resetUploadModal = () => {
    setUploading(false);
    setUploadFile(undefined);
    setOpenUploadModal(false);
  };

  let leftHeader: JSX.Element | undefined = (
    <IconButton className="z-10" onClick={onLeftClick}>
      <CircleLeftArrowIcon className="size-8 transition duration-200 hover:scale-[1.2]" />
    </IconButton>
  );

  let rightHeader: JSX.Element | undefined = (
    <Dialog open={openUploadModal} onOpenChange={onOpenUploadChange}>
      <DialogTrigger asChild>
        <IconButton
          className="size-8 hover:bg-primary-foreground"
          disabled={
            (myVoice?.samples && myVoice.samples.length >= 3) ||
            step !== ADD_VOICE_STEP.PENDING
          }
          onClick={() => setOpenUploadModal(true)}
        >
          <CloudUploadIcon />
        </IconButton>
      </DialogTrigger>
      <DialogContent className="w-[90%] max-w-xl md:w-[700px] md:max-w-xl">
        {/* Select file box */}
        <div className="relative flex w-full flex-col items-center justify-center space-x-2 rounded-lg bg-[#1A1A1A] p-3">
          <CustomFileUpload
            onFileChange={(value) => handleFileChange(value)}
            onRemoveFile={removeFile}
            maxFileSizeText={t(tMessages.common.mp3FileSizeLimit())}
            maxFileSize={10}
            accept={audioAccepts}
          />
          {uploadFile && (
            <Button
              className="mt-4 w-[150px] rounded-xl py-2"
              onClick={uploadCloneVoice}
            >
              {uploading ? (
                <Spinner className="size-4" />
              ) : (
                t(tMessages.common.upload())
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  let content = (
    <div className="flex h-full w-full flex-col gap-2">
      {myVoice && myVoice.samples && myVoice.samples.length >= 3 ? (
        <motion.span
          key="maximum"
          className="flex grow flex-col items-center justify-center text-center text-xl text-primary-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {t(tMessages.common.maxClonedSamples())}
        </motion.span>
      ) : (
        <motion.div
          key="pending"
          className="flex grow flex-col items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <BlueAddVoiceIcon />

          <div className="w-[350px]">
            <h2 className="mb-5 text-center">
              {t(tMessages.common.clonedVoiceTipTitle())}👇
            </h2>

            <ul className="mb-5 list-disc pl-5 text-sm text-primary-foreground">
              <li>
                {t(tMessages.clonedVoiceTips.tip1())}
                <br />
              </li>
              <li>
                {t(tMessages.clonedVoiceTips.tip2())}
                <br />
              </li>
              <li>
                {t(tMessages.clonedVoiceTips.tip3())}
                <br />
              </li>
              <li>
                {t(tMessages.clonedVoiceTips.tip4())}
                <br />
              </li>
              <li>
                {t(tMessages.clonedVoiceTips.tip5())}
                <br />
              </li>
              <li>
                {t(tMessages.clonedVoiceTips.tip6())}
                <br />
              </li>
              <li>
                {t(tMessages.clonedVoiceTips.tip7())}
                <br />
              </li>
            </ul>

            <p className="mb-5 text-center font-bold text-red-500">
              ⚠️{t(tMessages.common.clonedVoiceTip4())}
            </p>

            <p className="mb-5 text-sm text-primary-foreground">
              {t(tMessages.common.clonedVoiceTip5())}
              <br />
              {t(tMessages.common.clonedVoiceTip6())}
              <br />
              {t(tMessages.common.clonedVoiceTip7())}
              <br />
            </p>
          </div>

          <Button className="rounded-2xl px-2">
            <div
              className="flex h-[48px] w-[160px] items-center justify-center rounded-sm bg-blue shadow-blue"
              onClick={startRecord}
            >
              {t(tMessages.common.startRecording2())}
            </div>
          </Button>
        </motion.div>
      )}
    </div>
  );

  if (step === ADD_VOICE_STEP.RECORDING) {
    content = (
      <motion.div
        key="recording"
        className="flex h-full w-full flex-col gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full" ref={waveformRef}>
          {mediaRecorder ? (
            <LiveAudioVisualizer
              mediaRecorder={mediaRecorder}
              width={waveformRef.current.clientWidth}
              height={100}
              barColor="hsla(0, 0%, 100%, 0.5)"
              barWidth={3}
              gap={3}
            />
          ) : null}

          <div className="w-full text-center text-[40px]">
            {secondsToTimer(recordingTime)}
          </div>
        </div>
        <Teleprompter speed={SCROLL_SPEED} />
        <Button
          className="mt-4 w-full rounded-2xl px-2"
          disabled={isActive}
          onClick={completeRecord}
        >
          <div className="flex h-[48px] w-full items-center justify-center rounded-sm bg-success shadow-success">
            {t(tMessages.common.endRecording())}{" "}
            {isActive ? `( ${seconds} )` : ""}
          </div>
        </Button>
      </motion.div>
    );
  }

  if (step === ADD_VOICE_STEP.UPLOAD) {
    content = (
      <motion.div
        key="upload"
        className="m-auto flex w-[260px] flex-col items-center justify-center gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <UploadDoneIcon />

        <span>{t(tMessages.common.recordThankYou())}</span>

        <span className="text-center text-primary-foreground">
          {t(tMessages.common.processVoiceTake1Min())}
        </span>

        {!myVoice && (
          <div className="w-full">
            <Label className="text-sm">
              {t(tMessages.common.enterVoiceName())}
            </Label>
            <Input
              className="mt-2"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t(tMessages.common.enterVoiceNamePlaceholder())}
            />
          </div>
        )}
        <PrimaryButton
          className="rounded-2xl text-primary-foreground"
          childClass="justify-center"
          onClick={registerCloneVoice}
          disabled={!name || mutating}
        >
          <UserVoiceIcon />
          {t(tMessages.common.startCloning())}
          {mutating && <Spinner className="size-4" />}
        </PrimaryButton>
      </motion.div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col p-4">
      <Header
        leftItem={leftHeader}
        centerItem={t(tMessages.common.cloneVoice())}
        recording={recording}
        rightItem={rightHeader}
      />

      <Container className="pt-4">
        {isFetchingVoice ? (
          <div className="flex w-full items-center justify-center">
            <Spinner />
          </div>
        ) : (
          content
        )}
      </Container>
    </div>
  );
};

export default AddVoice;
