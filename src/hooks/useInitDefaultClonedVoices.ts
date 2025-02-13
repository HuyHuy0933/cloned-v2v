import { useElevenLabsVoicesQuery } from "@/features/cloned-voices/queries";
import {
  setLeftVoice,
  setMeetingVoice,
  setRightVoice,
} from "@/features/settings/settingSlice";
import { RootState } from "@/main";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export const useInitDefaultClonedVoices = () => {
  const dispatch = useDispatch();
  const { data: voices, isFetched: isFetchedVoices } =
    useElevenLabsVoicesQuery();
  const meetingVoice = useSelector(
    (state: RootState) => state.setting.meetingVoice,
  );
  const leftVoice = useSelector((state: RootState) => state.setting.leftVoice);
  const rightVoice = useSelector(
    (state: RootState) => state.setting.rightVoice,
  );

  useEffect(() => {
    // Set default voice for first visit or when delete the selected voice
    if (!isFetchedVoices || !voices || voices.length === 0) return;
    if (!meetingVoice.id || !voices.some((x) => x.id === meetingVoice.id)) {
      dispatch(setMeetingVoice(voices[0]));
    }
    if (!leftVoice.id || !voices.some((x) => x.id === leftVoice.id)) {
      dispatch(setLeftVoice(voices[0]));
    }
    if (!rightVoice.id || !voices.some((x) => x.id === rightVoice.id)) {
      dispatch(setRightVoice(voices[0]));
    }
  }, [voices, isFetchedVoices]);
};
