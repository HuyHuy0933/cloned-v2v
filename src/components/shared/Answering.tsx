import { motion, Variants } from "framer-motion";
import { useTranslation } from "react-i18next";
import { tMessages } from "@/locales/messages";
import { UserAvatar } from "@/components";

const Answering: React.FC = () => {
  const { t } = useTranslation();

  const containerVariants: Variants = {
    visible: {
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const dotVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 1, repeat: Infinity, repeatType: "loop" },
    },
  };

  return (
    <div className="mt-1 flex items-center gap-2 pl-2 text-sm text-white">
      <UserAvatar className="shrink-0" username="bot" />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex items-center"
      >
        {t(tMessages.common.answering())}
        <span className="ml-1 flex">
          <motion.span className="mx-[1px]" variants={dotVariants}>
            .
          </motion.span>
          <motion.span className="mx-[1px]" variants={dotVariants}>
            .
          </motion.span>
          <motion.span className="mx-[1px]" variants={dotVariants}>
            .
          </motion.span>
        </span>
      </motion.div>
    </div>
  );
};

export { Answering };
