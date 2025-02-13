import { RootState } from "@/main";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCurrentUser } from "./current-user/CurrentUserProvider";
import { CustomEntity } from "@/features/settings/types";
import { aeonDefaultEntities } from "@/features/settings/aeon-default-entities-data";
import { setCustomEntities } from "@/features/settings/settingSlice";

const useInitAeonDefaultEntities = () => {
  const dispatch = useDispatch();
  const customEntities = useSelector(
    (state: RootState) => state.setting.recorderMeeting.customEntities,
  );
  const { currentUser } = useCurrentUser();

  const initRef = useRef(false);
  useEffect(() => {
    if (!currentUser.email.includes("aeonbank.co.jp") || initRef.current)
      return;

    const defaultEntities: CustomEntity[] = [];
    if (
      !customEntities.some((x) => x.entity === aeonDefaultEntities[0].entity)
    ) {
      defaultEntities.push(aeonDefaultEntities[0]);
    }

    if (
      !customEntities.some((x) => x.entity === aeonDefaultEntities[1].entity)
    ) {
      defaultEntities.push(aeonDefaultEntities[1]);
    }

    if (defaultEntities.length > 0) {
      dispatch(setCustomEntities([...defaultEntities, ...customEntities]));
    }
    initRef.current = true;
  }, [customEntities]);

  return true
};

export { useInitAeonDefaultEntities };
