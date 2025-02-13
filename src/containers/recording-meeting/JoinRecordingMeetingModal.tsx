import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components";
import { tMessages } from "@/locales/messages";
import React from "react";
import { useTranslation } from "react-i18next";

type JoinRecordingMeetingModalModalProps = {
  open?: boolean;
  onConfirm: () => void;
};

const JoinRecordingMeetingModal: React.FC<JoinRecordingMeetingModalModalProps> =
  React.memo(({ open, onConfirm }) => {
    const { t } = useTranslation();

    return (
      <Dialog open={open}>
        <DialogContent className="w-[90%] max-w-xl md:w-[700px] md:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t(tMessages.common.joinRecordingModalTitle())}</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2">
            <Button
              className="bg-success/90 hover:bg-success transition duration-200 hover:shadow-success"
              onClick={onConfirm}
            >
              {t(tMessages.common.enterRoom())}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  });

export default JoinRecordingMeetingModal;
