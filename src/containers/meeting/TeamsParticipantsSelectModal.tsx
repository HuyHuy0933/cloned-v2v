import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
} from "@/components";
import { useAddTeamsParicipantsMutation } from "@/features/meeting/mutations";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { MeetingRouteState } from "./Meeting";
import { getTeamsParticipants } from "@/features/meeting/queries";
import { catchError } from "@/lib/trycatch";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEY } from "@/lib/constaints";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";
import { useSelector } from "react-redux";
import { RootState } from "@/main";

type TeamsParticipant = {
  id: string;
  name: string;
};

type TeamsParticipantsSelectModalProps = {
  openWhenBotJoined: boolean;
};

const TeamsParticipantsSelectModal: React.FC<TeamsParticipantsSelectModalProps> =
  React.memo(({ openWhenBotJoined }) => {
    const { t } = useTranslation();
    const location = useLocation();
    const queryClient = useQueryClient();
    const { currentUser, meeting } = location.state as MeetingRouteState;
    const setting = useSelector((state: RootState) => state.setting);

    const addTeamsParicipantsMutation = useAddTeamsParicipantsMutation();
    const [guest] = useState<TeamsParticipant>({
      id: "guest",
      name: t(tMessages.common.guestUsed()),
    });
    const [teamsParticipants, setTeamsParicipants] = useState<
      TeamsParticipant[]
    >([guest]);
    const [teamsPariticipantId, setTeamsPariticipantId] = useState("");
    const [saving, setSaving] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
      const fetchTeamsParticipants = async () => {
        const [err, data] = await catchError(
          queryClient.fetchQuery({
            queryKey: [QUERY_KEY.MEETING_TEAMS_PARTICIPANTS],
            queryFn: () => getTeamsParticipants(meeting.meetingId),
            staleTime: Infinity,
          }),
        );
        if (!data) return;
        const participants = data.participants
          .filter((x) => !x.includes(`V2V (${meeting.meetingName})`))
          .map((x) => ({ id: x, name: x }));

        if (participants.length === 0) return;
        setTeamsParicipants((prev) => [...participants, ...prev]);
        setOpen(true);
      };

      if (meeting.bot_url && openWhenBotJoined) {
        fetchTeamsParticipants();
      }
    }, [meeting, openWhenBotJoined]);

    const linkV2VUserToTeamsUser = async () => {
      setSaving(true);
      setOpen(false);
      const teamsName =
        teamsParticipants.find((x) => x.id === teamsPariticipantId)?.name || "";
      currentUser.teams_name = teamsName;
      if (teamsPariticipantId === guest.id) {
        console.log(23423);
        setSaving(false);
        return;
      }

      await addTeamsParicipantsMutation.mutateAsync({
        meeting_id: meeting.meetingId,
        teams_name: teamsName,
        user_id: currentUser.userId,
        user_name: currentUser.username,
        language: currentUser.language,
        ttsMode: setting.ttsMode,
        voiceId: setting.meetingVoice.id,
      });
      setSaving(false);
    };

    return (
      <>
        <Dialog open={open}>
          <DialogContent className="w-[90%] max-w-xl md:w-[700px] md:max-w-xl">
            <DialogHeader>
              <DialogTitle>
                {t(tMessages.common.selectTeamsNameModalTitle())}
              </DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <Select
              value={teamsPariticipantId}
              onValueChange={setTeamsPariticipantId}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {teamsParticipants.map((x) => (
                  <SelectItem key={x.id} value={x.id}>
                    {x.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex justify-end">
              <Button
                className="bg-success hover:bg-success"
                onClick={linkV2VUserToTeamsUser}
                disabled={saving}
              >
                {saving ? (
                  <Spinner className="size-4" />
                ) : (
                  t(tMessages.common.confirmation())
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  });

export default TeamsParticipantsSelectModal;
