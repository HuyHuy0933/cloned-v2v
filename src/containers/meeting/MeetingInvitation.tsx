import { Spinner } from "@/components";
import { useParams } from "react-router-dom";
import { fetchSingleMeeting } from "@/features/meeting/queries";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEY } from "@/lib/constaints";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const MeetingInvitation = () => {
  const params = useParams();
  const meetingId = params.id || "";
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (meetingId) {
      fetchMeeting();
    }
  }, [meetingId]);

  const fetchMeeting = async () => {
    try {
      const invitationMeeting = await queryClient.fetchQuery({
        queryKey: [QUERY_KEY.MEETING_SINGLE, meetingId],
        queryFn: () => fetchSingleMeeting(meetingId),
        staleTime: Infinity,
      });

      if (invitationMeeting) {
        navigate(`/meeting-setting?invitation_meeting_id=${meetingId}`, {
          state: { invitationMeeting },
        });
      } else {
        navigate("/meeting-setting");
      }
    } catch (error) {
      console.error("Error fetching meeting");
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-4">
      <Spinner />
    </div>
  );
};

export default MeetingInvitation;
