import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components";
import { tMessages } from "@/locales/messages";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

type SpeakSlowlyRemindModalProps = {
  onClose?: () => void;
  onConfirm?: () => void;
};

const SpeakSlowlyRemindModal: React.FC<SpeakSlowlyRemindModalProps> =
  React.memo(({ onClose, onConfirm }) => {
    const { t } = useTranslation();
    const [openRemindSpeakSlowly, setOpenRemindSpeakSlowly] = useState(true);

    return (
      <Dialog
        open={openRemindSpeakSlowly}
      >
        <DialogContent className="w-[90%] max-w-xl md:w-[700px] md:max-w-xl">
          <DialogHeader>
            <DialogTitle>{t(tMessages.meetingRemindModal.title())}</DialogTitle>
            <DialogDescription>
              {t(tMessages.meetingRemindModal.subTitle())}
            </DialogDescription>
          </DialogHeader>

          <ul className="w-full list-inside list-disc space-y-2 text-sm">
            <li>🧑‍💼 {t(tMessages.meetingRemindModal.desc1())}</li>
            <li>🗣️ {t(tMessages.meetingRemindModal.desc2())}</li>
            <li>✂️ {t(tMessages.meetingRemindModal.desc3())}</li>
            <li>⚠️ {t(tMessages.meetingRemindModal.desc4())}</li>
            <li>🌐 {t(tMessages.meetingRemindModal.desc5())}</li>
            <li>💡 {t(tMessages.meetingRemindModal.desc6())}</li>
            <li>⚙️ {t(tMessages.meetingRemindModal.desc7())}</li>
            <li>🎧 {t(tMessages.meetingRemindModal.desc8())}</li>
          </ul>

          <div className="flex justify-end gap-2">
            <Button className="border bg-transparent" onClick={onClose}>
              {t(tMessages.common.return())}
            </Button>
            <Button
              className="bg-success/90 hover:bg-success transition duration-200 hover:shadow-success"
              onClick={() => {
                setOpenRemindSpeakSlowly(false);
                onConfirm && onConfirm();
              }}
            >
              {t(tMessages.common.enterRoom())}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  });

export default SpeakSlowlyRemindModal;
