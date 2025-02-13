import {
  useSaveMeetingMutation,
  useVerifyCustomMeetingMutation,
} from "@/features/meeting/mutations";
import { useCurrentUser } from "@/hooks";
import { catchError } from "@/lib/trycatch";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MEETING_USER_ROLE } from "./MeetingSetting";
import {
  Button,
  ConfirmationModal,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Spinner,
} from "@/components";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";
import {
  LeaveMeetingEvent,
  MeetingRoom,
  MeetingUser,
} from "@/features/meeting/types";
import { FINE_TUNED_MODEL, SUMMARY_AI_TEMPLATE } from "@/features/record-audios/types";
import { SOCKET_EVENT, useSocketClient } from "@/features/socket/socketClient";
import AudioOptionsSelect from "../record-audios/AudioOptionsSelect";
import { RootState } from "@/main";
import { useSelector } from "react-redux";

const CustomMeetingCheckOut = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const socket = useSocketClient();

  const sttMode = useSelector((state: RootState) => state.setting.sttMode);

  const custom_room_id = searchParams.get("roomId");
  const custom_token = searchParams.get("token");

  const verifyCustomIdMeetingMutation = useVerifyCustomMeetingMutation();
  const saveMeetingMutation = useSaveMeetingMutation();

  const meetingUserRef = useRef<MeetingUser | undefined>(undefined);
  const meetingRef = useRef<MeetingRoom | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const [openRemoveNoiseAndModelSetting, setOpenRemoveNoiseAndModelSetting] =
    useState(false);
  const [removeNoise, setRemoveNoise] = useState<boolean>(false);
  const [model, setModel] = useState<string>(FINE_TUNED_MODEL.GENERAL);
  const [masking, setMasking] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [numSpeakers, setNumSpeakers] = useState<number>(0);
  const [analyzeSentiment, setAnalyzeSentiment] = useState<boolean>(false);
  const [enableSummaryAI, setEnableSummaryAI] = useState<boolean>(true);
  const [summaryAITemplate, setSummaryAITemplate] = useState<string>(
    SUMMARY_AI_TEMPLATE.MEETING,
  );

  useEffect(() => {
    verifyMeeting();
    // socket.connect();
  }, []);

  const verifyMeeting = async () => {
    if (!custom_room_id || !custom_token) {
      navigate("/meeting-setting");
      return;
    }

    const [error, data] = await catchError(
      verifyCustomIdMeetingMutation.mutateAsync({
        custom_room_id,
        custom_token,
      }),
    );

    if (!data || error) {
      navigate("/meeting-setting");
      return;
    }
    setLoading(false);

    const userArr = Object.keys(data.users)
      .map((x) => data.users[x])
      .filter((x) => !x.left);

    meetingRef.current = {
      ...data,
      meetingId: data.id,
      isProtected: !!data.password,
      users: userArr,
    };
    const meetingUser = data.users[currentUser.id];
    console.log(meetingUser, data.users);
    if (!meetingUser) {
      navigate("/meeting-setting");
      return;
    }

    meetingUserRef.current = meetingUser;
    if (meetingUser.role === MEETING_USER_ROLE.ADMIN || userArr.length === 1) {
      setOpenRemoveNoiseAndModelSetting(true);
      return;
    }

    leaveMeeting();
  };

  const leaveMeeting = () => {
    const meeting = meetingRef.current;
    const meetingUser = meetingUserRef.current;
    if (!meeting || !meetingUser) {
      navigate("/meeting-setting");
      return;
    }

    const event: LeaveMeetingEvent = {
      meetingId: meeting.meetingId,
      userId: meetingUser.userId,
      removeMeeting: false,
      language: meetingUser.language,
      user: {
        userId: meetingUser.userId,
        username: meetingUser.username,
        language: meetingUser.language,
      },
      stt_model: sttMode
    };
    socket.emit(SOCKET_EVENT.leave_channel, event);
    navigate("/meeting-setting");
  };

  const confirmSaveMeeting = async () => {
    const meeting = meetingRef.current;
    if (!meeting) return;
    setSaving(true);
    const saved = await saveMeetingMutation.mutateAsync({
      meetingId: meeting.meetingId,
      removeNoise,
      model,
      masking,
      analyze_sentiment: false,
      numSpeakers,
      enableAISummary: enableSummaryAI,
      summaryAITemplate,
    });
    setSaving(false);
    leaveMeeting();
  };

  if (loading) {
    <div className="flex h-full w-full flex-col items-center justify-center p-4">
      <Spinner />
    </div>;
  }

  return (
    <div className="flex h-full w-full items-center justify-center p-4">
      <p className="text-xl">{t(tMessages.common.leaving())}...</p>

      <ConfirmationModal
        open={openRemoveNoiseAndModelSetting}
        onClose={() => setOpenRemoveNoiseAndModelSetting(false)}
      >
        <DialogHeader>
          <DialogTitle className="w-full text-start leading-6 text-white"></DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div className="w-full space-y-2">
          <AudioOptionsSelect
            removeNoise={removeNoise}
            setRemoveNoise={setRemoveNoise}
            masking={masking}
            setMasking={setMasking}
            model={model}
            setModel={setModel}
            analyzeSentiment={analyzeSentiment}
            setAnalyzeSentiment={setAnalyzeSentiment}
            enableSummaryAI={enableSummaryAI}
            setEnableSummaryAI={setEnableSummaryAI}
            summaryAITemplate={summaryAITemplate}
            setSummaryAITemplate={setSummaryAITemplate}
            numSpeakers={numSpeakers}
            setNumSpeakers={setNumSpeakers}
          />

          <div className="mt-6 flex justify-end gap-2">
            <Button
              className="bg-success/90 transition duration-200 hover:bg-success hover:shadow-success"
              onClick={confirmSaveMeeting}
              disabled={saving}
            >
              {saving ? (
                <Spinner className="size-4" />
              ) : (
                t(tMessages.common.save())
              )}
            </Button>
          </div>
        </div>
      </ConfirmationModal>
    </div>
  );
};

export default CustomMeetingCheckOut;
