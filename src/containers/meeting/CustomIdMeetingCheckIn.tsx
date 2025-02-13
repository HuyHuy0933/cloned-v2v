import { Spinner } from "@/components";
import { useVerifyCustomMeetingMutation } from "@/features/meeting/mutations";
import { MeetingRoom, MeetingUser } from "@/features/meeting/types";
import { catchError } from "@/lib/trycatch";
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const CustomIdMeetingCheckIn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const custom_room_id = searchParams.get("roomId");
  const custom_token = searchParams.get("token");

  const verifyCustomIdMeetingMutation = useVerifyCustomMeetingMutation();

  useEffect(() => {
    verifyMeeting();
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

    if (error) {
      navigate("/meeting-setting");
      return;
    }

    let users: MeetingUser[] = [];
    let customMeeting: MeetingRoom | undefined = undefined;
    if (data) {
      users = Object.keys(data.users)
        .map((x) => data.users[x])
        .filter((x) => !x.left);
      customMeeting = {
        ...data,
        meetingId: data.id,
        isProtected: !!data.password,
        users,
      };
    }

    navigate(`/meeting-setting?${searchParams.toString()}`, {
      state: {
        customMeeting,
      },
    });
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-4">
      <Spinner />
    </div>
  );
};

export default CustomIdMeetingCheckIn;
