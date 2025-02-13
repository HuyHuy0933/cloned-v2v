import { EndCallIcon, RecordIcon } from "@/components/icons";
import { mobileLayout, pcLayout } from "@/features/ui/uiSlice";
import { formatDateTimeLocale } from "@/lib/datetime";
import { CalendarIcon } from "@radix-ui/react-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import EntityCheckboxes, { TreeNodeEntity } from "./EntityCheckboxes";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { catchError } from "@/lib/trycatch";
import { DEFAULT_STALE_TIME_QUERY, QUERY_KEY } from "@/lib/constaints";
import { SOCKET_EVENT, useSocketClient } from "@/features/socket/socketClient";
import { useCurrentUser } from "@/hooks";
import { MEETING_USER_ROLE } from "../meeting/MeetingSetting";
import {
  JoinMeetingEvent,
  LeaveMeetingEvent,
  MeetingRoom,
  MeetingUser,
} from "@/features/meeting/types";
import { useTranslation } from "react-i18next";
import JoinRecordingMeetingModal from "./JoinRecordingMeetingModal";
import { produce } from "immer";
import MessageList from "../messages/MessageList";
import RecordingMessageItem from "./RecordingMessageItem";
import { secondsToTimerWithSpace } from "@/lib/utils";
import { useEventListener } from "usehooks-ts";
import { Button, Checkbox, Label, Separator } from "@/components";
import {
  EntityLabelIndex,
  RECORDING_STATUS_ENUM,
  RecordingMeetingStatusEvent,
  RecordingMeetingWhisperEvent,
  RecordingMessage,
  RecordingMessageEvent,
  RecordingStreamingEvent,
} from "@/features/recording-meeting/types";
import { config } from "@/lib/config";
import {
  getRecordingHistories,
  getRecordingMeeting,
} from "@/features/recording-meeting/queries";
import { tMessages } from "@/locales/messages";
import { useDefaultEntitiesState } from "@/hooks";
import { useToast } from "@/components/ui/use-toast";
import { CheckedState } from "@radix-ui/react-checkbox";
import { RootState } from "@/main";

// 64px for padding Y
// 64px for title section
// 64px for bottom section
// 32px for gap
const HEIGHT = "calc(100vh - 64px - 64px - 64px - 32px)";

const RecordingTranscription = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const params = useParams();
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const socket = useSocketClient();
  const { setting: userSetting } = useCurrentUser();

  const sttMode = useSelector((state: RootState) => state.setting.sttMode);

  const audioCtxRef = useRef<AudioContext | null>();
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const meetingDurIntervalRef = useRef<any>(null);
  const meetingUserRef = useRef<MeetingUser | null>(null);

  const [defaultEntities, setDefaultEntities] = useDefaultEntitiesState();
  const [customEntities, setCustomEntities] = useState<TreeNodeEntity[]>([]);
  const [messages, setMessages] = useState<RecordingMessage[]>([]);
  const [recordMeeting, setRecordMeeting] = useState<MeetingRoom | undefined>(
    undefined,
  );
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [openJoin, setOpenJoin] = useState(false);
  const [status, setStatus] = useState("");
  const [selectedAll, setSelectedAll] = useState(false);

  const recordingId = params.id;

  useEventListener("beforeunload", (event) => {
    event.preventDefault();
    event.returnValue = "";
  });
  useEventListener("unload", (event) => {
    leaveMeeting();
  });

  useEffect(() => {
    dispatch(pcLayout());

    return () => {
      workletNodeRef.current && workletNodeRef.current.disconnect();
      audioCtxRef.current && audioCtxRef.current.close();
      clearInterval(meetingDurIntervalRef.current);
      dispatch(mobileLayout());
    };
  }, []);

  useEffect(() => {
    const fetchRecordMeeting = async (id: string) => {
      const [_, meeting] = await catchError(
        queryClient.fetchQuery({
          queryKey: [QUERY_KEY.RECORDING_MEETING],
          queryFn: () => getRecordingMeeting(id),
          staleTime: Infinity,
        }),
      );

      if (!meeting) return;
      setRecordMeeting(meeting);
      if (meeting.custom_entities) {
        setCustomEntities(
          meeting.custom_entities.map((x) => ({
            id: x.entity,
            label: x.entity,
            title: x.entity,
            checked: false,
            activeColor: "#bbb",
            children: x.values.map((val) => ({
              id: val,
              label: val,
              title: val,
              checked: false,
              children: [],
            })),
          })),
        );
      }

      if (meeting.main_user) {
        meetingUserRef.current = {
          userId: meeting.main_user.userId,
          email: meeting.main_user.email,
          username: meeting.main_user.username,
          language: meeting.main_user.language,
          role: MEETING_USER_ROLE.OBSERVER,
        };
      }

      socket.emit(SOCKET_EVENT.join_channel, {
        meetingId: meeting.meetingId,
        ...meetingUserRef.current,
      });
      setOpenJoin(true);
    };

    const fetchRecordingHistories = async (id: string) => {
      const [_, histories] = await catchError(
        queryClient.fetchQuery({
          queryKey: [QUERY_KEY.RECORDING_HISTORIES],
          queryFn: () => getRecordingHistories(id),
          staleTime: DEFAULT_STALE_TIME_QUERY,
        }),
      );

      if (!histories) return;
      setMessages(histories);

      histories.forEach((msg) => {
        const entityLabels = msg.entity_labels;
        if (!entityLabels) return;

        updateEntities(entityLabels);
      });
    };

    if (recordingId) {
      fetchRecordMeeting(recordingId);
      fetchRecordingHistories(recordingId);
    }
  }, [recordingId]);

  useEffect(() => {
    const entities = [...defaultEntities, ...customEntities];
    setSelectedAll(
      entities.every((x) => x.checked) &&
        entities.every((x) => x.children?.every((y) => y.checked)),
    );
  }, [defaultEntities, customEntities]);

  const updateEntities = useCallback((entityLabels: EntityLabelIndex[]) => {
    const setEntities = (
      setEntitiesState: React.Dispatch<React.SetStateAction<TreeNodeEntity[]>>,
    ) => {
      setEntitiesState(
        produce((prev) => {
          for (const item of entityLabels) {
            const entity = prev.find((x) => x.label === item.label);
            if (!entity) continue;

            entity.checked = true;
            entity.children = entity.children || [];
            const child = entity.children.find(
              (x) => x.label.toLowerCase() === item.entity.toLowerCase(),
            );
            if (!child) {
              entity.children.push({
                id: item.entity,
                label: item.entity,
                checked: true,
                children: [],
              });
            } else {
              child.checked = true;
            }
          }
        }),
      );
    };

    setEntities(setDefaultEntities);
    setEntities(setCustomEntities);
  }, []);

  const onMessage = useCallback(
    (event: RecordingMessageEvent) => {
      if (event.whisper_data) {
        // console.log("final", event.whisper_data, event.is_final);
        setMessages(event.whisper_data);

        event.whisper_data.forEach((msg) => {
          if (msg.entity_labels) {
            updateEntities(msg.entity_labels);
          }
        });
      } else {
        // console.log("not final", event.text, event.is_final);
        setMessages(
          produce((prev) => {
            let msg = prev.find((x) => x.id === event.messageId);
            if (!msg) {
              msg = {
                id: event.messageId,
                text: event.text,
                userId: event.userId,
                username: event.username,
                language: event.language,
                is_final: event.is_final,
                createdAt: event.createdAt || Date.now(),
                is_whisper: event.is_whisper,
              };

              prev.push(msg);
            }

            msg.text = event.text;
            msg.username = event.username;
            msg.is_final = event.is_final;

            if (!msg.is_final && event.is_whisper) {
              msg.username = "";
            }

            if (event.entity_labels) {
              msg.entity_labels = event.entity_labels;
            }
          }),
        );

        if (event.entity_labels) {
          updateEntities(event.entity_labels);
        }
      }

      // setMessages(data)
    },
    [updateEntities],
  );

  const onSocketReconnect = useCallback(() => {
    if (!recordMeeting || !meetingUserRef.current) return;
    console.log("socket reconnect");
    socket.emit(SOCKET_EVENT.join_channel, {
      meetingId: recordMeeting.meetingId,
      ...meetingUserRef.current,
    } as JoinMeetingEvent);
  }, [recordMeeting]);

  const playOriginStreamingAudio = useCallback((audioData: any) => {
    if (!workletNodeRef.current) return;

    let int16Buffer = audioData;
    workletNodeRef.current.port.postMessage(int16Buffer);
  }, []);

  const onHandleOriginAudio = useCallback((data: RecordingStreamingEvent) => {
    playOriginStreamingAudio(data.audioData);
  }, []);

  const countMeetingDuration = useCallback(() => {
    if (meetingDurIntervalRef.current) return;
    meetingDurIntervalRef.current = setInterval(() => {
      setMeetingDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  const pauseCountDuration = useCallback(() => {
    clearInterval(meetingDurIntervalRef.current);
    meetingDurIntervalRef.current = null;
  }, []);

  const onRecordingMeetingStatus = useCallback(
    (data: RecordingMeetingStatusEvent) => {
      data.duration && setMeetingDuration(data.duration);
      if (data.status === RECORDING_STATUS_ENUM.PAUSED) {
        toast({
          description: t(tMessages.common.recordingPaused()),
          duration: 3000,
        });
        setStatus(t(tMessages.common.paused()));

        pauseCountDuration();
        return;
      }

      if (data.status === RECORDING_STATUS_ENUM.RECORDING) {
        toast({
          description: t(tMessages.common.recordingResumed()),
          duration: 3000,
        });
        countMeetingDuration();
        setStatus("");
        return;
      }

      toast({
        description: t(tMessages.common.recordingStopped()),
        duration: 3000,
      });
      setStatus(t(tMessages.common.ended()));
      pauseCountDuration();
    },
    [pauseCountDuration, countMeetingDuration],
  );

  const onRecordingMessageWhisperUpdate = useCallback(
    (data: RecordingMeetingWhisperEvent) => {
      setMessages(
        produce((prev) => {
          const msg = prev.find(
            (x) => x.id.toString() == data.message_id.toString(),
          );

          if (msg) {
            msg.username = data.username;
          }
        }),
      );
    },
    [],
  );

  useEffect(() => {
    socket.on(SOCKET_EVENT.connect, onSocketReconnect);
    socket.on(SOCKET_EVENT.recording_message, onMessage);
    socket.on(SOCKET_EVENT.recording_streaming, onHandleOriginAudio);
    socket.on(SOCKET_EVENT.recording_meeting_status, onRecordingMeetingStatus);
    socket.on(
      SOCKET_EVENT.recording_message_whisper_update,
      onRecordingMessageWhisperUpdate,
    );
    // socket.connect();
    return () => {
      socket.off(SOCKET_EVENT.connect, onSocketReconnect);
      socket.off(SOCKET_EVENT.recording_message, onMessage);
      socket.off(SOCKET_EVENT.recording_streaming, onHandleOriginAudio);
      socket.off(
        SOCKET_EVENT.recording_meeting_status,
        onRecordingMeetingStatus,
      );
      socket.off(
        SOCKET_EVENT.recording_message_whisper_update,
        onRecordingMessageWhisperUpdate,
      );
    };
  }, [
    onMessage,
    onSocketReconnect,
    onHandleOriginAudio,
    onRecordingMeetingStatus,
    onRecordingMessageWhisperUpdate,
  ]);

  const setupOriginAudioPlayback = useCallback(async () => {
    setOpenJoin(false);
    const context = new AudioContext({ sampleRate: 16000 });
    audioCtxRef.current = context;

    try {
      await context.audioWorklet.addModule(
        `${config.basename}/worklet/stream-audio-converter.js`,
      );

      workletNodeRef.current = new AudioWorkletNode(
        context,
        "stream-audio-converter",
      );
      workletNodeRef.current.connect(context.destination);
    } catch (err) {
      console.log(err);
    }
  }, []);

  const leaveMeeting = useCallback(() => {
    if (!recordMeeting || !meetingUserRef.current) return;
    console.log("User leaving the page.");
    socket.emit(SOCKET_EVENT.leave_channel, {
      meetingId: recordMeeting.meetingId,
      userId: meetingUserRef.current.userId,
      user: {
        userId: meetingUserRef.current.userId,
        username: meetingUserRef.current.username,
        language: meetingUserRef.current.language,
      },
      stt_model: sttMode
    } as LeaveMeetingEvent);

    // redirect to ai-platform
    const params = new URLSearchParams(window.location.search);
    const fromParam = params.get("from");
    if (fromParam) {
      window.location.href = `${config.aiPlatformBaseUrl}/ai/ai-agents`;
    } else {
      navigate("/recorder");
    }
  }, [recordMeeting]);

  const onToggleSelectAll = useCallback((value: CheckedState) => {
    if (value === "indeterminate") return;
    setDefaultEntities(
      produce((prev) => {
        for (const item of prev) {
          item.checked = value;

          if (item.children) {
            for (const child of item.children) {
              child.checked = value;
            }
          }
        }
      }),
    );
    setCustomEntities(
      produce((prev) => {
        for (const item of prev) {
          item.checked = value;

          if (item.children) {
            for (const child of item.children) {
              child.checked = value;
            }
          }
        }
      }),
    );
    setSelectedAll(value);
  }, []);

  return (
    <div className="relative h-full w-full">
      <span className="absolute -right-4 -top-6 text-xs text-gray-52">
        {t(tMessages.common.trial())}: {config.appVersion}
      </span>
      {/* Meeting tile and recorded time bar */}
      <section className="flex w-full items-center justify-between">
        <div>
          <h1 className="text-[32px] font-semibold">
            {recordMeeting?.meetingName}
          </h1>
          <p className="text-sm leading-4 text-gray-52">
            <CalendarIcon className="float-left mr-2" />{" "}
            {recordMeeting?.createdAt &&
              formatDateTimeLocale(
                new Date(recordMeeting.createdAt),
                userSetting.language,
              )}
          </p>
        </div>
        <div className="relative flex h-[64px] w-[214px] items-center justify-center rounded-2xl border border-gray-92 text-2xl font-bold">
          <RecordIcon className="mr-2" />
          {secondsToTimerWithSpace(meetingDuration)}

          <span className="absolute bottom-0 right-2 text-xs text-gray-52">
            {status}
          </span>
        </div>
      </section>

      {/* Recording transcription, Label tree */}
      <section className="mt-4 flex gap-4" style={{ height: HEIGHT }}>
        {/* Recording transcription */}
        <div className="flex h-full grow flex-col overflow-auto rounded-2xl border border-gray-92 bg-white shadow">
          <div className="relative flex h-0 w-full grow flex-col">
            <MessageList
              messages={messages}
              renderItem={(message: RecordingMessage) => (
                <RecordingMessageItem
                  key={message.id}
                  message={message}
                  entities={[...defaultEntities, ...customEntities]}
                />
              )}
            />
          </div>
        </div>

        {/* Entity extraction tree */}
        <div className="flex w-[400px] shrink-0 flex-col overflow-auto rounded-2xl border border-gray-92 bg-white shadow">
          <div className="flex h-[50px] w-full shrink-0 items-center border-b-[1px] border-gray-92 px-6">
            <span>{t(tMessages.common.entityExtraction())}</span>
          </div>

          <div className="mt-4 flex w-full flex-col px-6">
            <div className="flex items-center">
              <Checkbox
                id="select-all"
                className="mr-2 border-black data-[state=checked]:text-black"
                checked={selectedAll}
                onCheckedChange={onToggleSelectAll}
              />

              <Label className="rounded-sm px-1 text-base" htmlFor="select-all">
                {selectedAll
                  ? t(tMessages.common.deselectAll())
                  : t(tMessages.common.selectAll())}
              </Label>
            </div>

            <EntityCheckboxes
              data={defaultEntities}
              onChange={setDefaultEntities}
            />
            <Separator />
            <EntityCheckboxes
              data={customEntities}
              onChange={setCustomEntities}
            />
          </div>
        </div>
      </section>

      <section className="mt-4 flex h-[64px] w-full justify-center gap-4">
        <Button
          variant="secondary"
          className="size-[64px] rounded-full"
          onClick={leaveMeeting}
        >
          <EndCallIcon />
        </Button>
      </section>

      <JoinRecordingMeetingModal
        open={openJoin}
        onConfirm={setupOriginAudioPlayback}
      />
    </div>
  );
};

export default RecordingTranscription;
