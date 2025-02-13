import { Button, Spinner } from "@/components";
import { ChatIcon } from "@/components/icons";
import React, { lazy, Suspense, useState } from "react";
import "./ai-chatbot.scss";
import { AnimatePresence, motion } from "motion/react";
const AIChatMessages = lazy(() => import("./AIChatMessages"));

type AIChatBotProps = {
  hidden?: boolean;
};

const AIChatBot: React.FC<AIChatBotProps> = React.memo(({ hidden = false }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {!hidden && (
          <motion.div
            key="chatbot"
            className="absolute bottom-4 right-4 z-[1000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* chatbot icon */}
            <Button
              className={`rounded-full p-2 opacity-80 hover:bg-inherit hover:opacity-100 sm:p-3 ${open ? "hidden" : "block"}`}
              style={{
                background:
                  "linear-gradient(to left, #00dbde, #fc00ff, #00dbde, #fc00ff",
                backgroundSize: "300%",
                backgroundPosition: "50%",
                boxShadow: "0 5px 30px rgba(0, 0, 0, 0.2)",
              }}
              onClick={() => setOpen(true)}
            >
              <ChatIcon className="size-6" />
            </Button>

            {open && (
              <Suspense fallback={<Spinner className="size-4" />}>
                <AIChatMessages />
              </Suspense>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* backdrop */}
      <div
        className={`fixed left-0 top-0 z-[900] h-full w-full ${open ? "block" : "hidden"}`}
        onClick={() => setOpen(false)}
      ></div>
    </>
  );
});

export default AIChatBot;
