import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components";
import { useCurrentUser } from "@/hooks";
import { tMessages } from "@/locales/messages";
import { RootState } from "@/main";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const UserMetadataModal = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const tutorial = useSelector(
    (state: RootState) => state.tutorial.name,
  );

  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setOpen(!!currentUser.metadata.area && !tutorial)
    }, 600)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [tutorial, currentUser])

  return (
    <Dialog open={open}>
      <DialogContent className="w-[90%] max-w-xl md:w-[700px] md:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            ✅ {t(tMessages.common.userMetadataModalTitle())}
          </DialogTitle>
          <DialogDescription>
            {t(tMessages.common.userMetadataModalSubTitle())}
          </DialogDescription>
        </DialogHeader>

        <div className="w-full space-y-2">
          <p>
            {t(tMessages.common.area())}: {currentUser.metadata?.area}
          </p>
          <p>
            {t(tMessages.common.storeName())}: {currentUser.metadata?.branch}
          </p>
          <p>
            {t(tMessages.common.fullName())}: {currentUser.name}
          </p>
        </div>

        <div className="flex justify-end gap-2 ">
          <Button
            className="border bg-transparent break-normal text-wrap w-1/2"
            onClick={() => navigate("/profile")}
          >
            {t(tMessages.common.returnToSettings())}
          </Button>
          <Button
            className="bg-success/90 hover:bg-success break-normal text-wrap w-1/2"
            onClick={() => {
              setOpen(false);
            }}
          >
            {t(tMessages.common.confirmationCompleted())}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserMetadataModal;
