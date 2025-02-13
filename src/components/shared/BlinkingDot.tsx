import { motion } from "motion/react"
import { tMessages } from "@/locales/messages";
import { useTranslation } from "react-i18next";

const BlinkingDot = () => {
    const { t } = useTranslation();
    return (
        <div 
            className="flex items-center gap-2"   
          >
            <motion.div
            className="h-4 w-4 rounded-full bg-red-500"
            animate={{
                opacity: [1, 0, 1],
            }}
            transition={{
                duration: 1,
                ease: "easeInOut",
                repeat: Infinity,
            }}
            />
            <span>{t(tMessages.common.recording())}</span>
        </div>
    );
}

export { BlinkingDot };
