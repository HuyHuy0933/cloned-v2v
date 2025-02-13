import { Button } from "@/components";

import React, { useState } from "react";
import { AnimatePresence, motion } from 'motion/react';
import NewIcon from "@/components/icons/NewIcon";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";

type CreateMeetingButtonProps = {
  createMeeting: (botMeeting: boolean | undefined) => void;
}

const CreateMeetingButton: React.FC<CreateMeetingButtonProps> = ({ createMeeting }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const onCreateMeeting = (value: boolean) => {
    createMeeting(value);
  }

  return (
    <>
      <div className="absolute w-auto bottom-4 right-4 z-[1000]">
        <Button
          className="rounded-full p-[10px] border-white/30 border-[2px] hover:bg-inherit hover:opacity-100"
          style={{
            background:
              "linear-gradient(to left, #00dbde, #fc00ff, #00dbde, #fc00ff",
            backgroundSize: "300%",
            backgroundPosition: "50%",
            boxShadow: "0 5px 30px rgba(0, 0, 0, 0.2)",
          }}
          onClick={toggleMenu}
        >
          <motion.div
            animate={{ rotate: isOpen ? 90 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <NewIcon />
          </motion.div>
        </Button>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="flex flex-col justify-items-end items-end grow-0 text-sm gap-5 absolute bottom-[80px] right-4 z-[1000] "
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <motion.span
              className="rounded-[5px] bg-[#313131] hover:bg-[#5a5a5a] p-3 text-right shadow-md"
              whileHover={{ x: -10, transition: { duration: 0.4, ease: "easeInOut" } }}
              whileTap={{ x: -10, scale: 0.9 }}
              onClick={() => onCreateMeeting(true)}
            >
              {t(tMessages.common.addV2VBotTeamsMeeting())}
            </motion.span>
            <motion.span
              className="rounded-[5px] bg-[#313131] hover:bg-[#5a5a5a] p-3 text-right shadow-md"
              whileHover={{ x: -10, transition: { duration: 0.4, ease: "easeInOut" } }}
              whileTap={{ x: -10, scale: 0.9 }}
              onClick={() => onCreateMeeting(false)}
            >
              {t(tMessages.common.holdV2VConference())}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* backdrop */}
      <div
        className={`fixed left-0 top-0 z-[999] h-full w-full ${isOpen ? "block" : "hidden"} bg-black/50`}
        onClick={toggleMenu}
      ></div>
    </>
  );
};

export default CreateMeetingButton;

