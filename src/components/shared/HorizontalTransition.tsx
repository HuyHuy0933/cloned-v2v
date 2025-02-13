import { updateTabContentTranslatedX } from "@/features/ui/uiSlice";
import { cn } from "@/lib/utils";
import { RootState } from "@/main";
import { tabPaths } from "@/routes/Layout";
import { motion } from "motion/react";
import { ReactNode, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

type HorizontalTransitionProps = {
  children: ReactNode;
  className?: string;
};

const HorizontalTransition: React.FC<HorizontalTransitionProps> = ({
  children,
  className = "",
}) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const tabContent = useSelector((state: RootState) => state.ui.tabContent);
  const tutorial = useSelector((state: RootState) => state.tutorial);
  const pathname = location.pathname?.split("/")[1];
  const isTutorial = !!tutorial.name;

  useEffect(() => {
    if (!pathname || !dispatch) return;

    if (tabPaths.includes(`/${pathname}`)) {
      dispatch(updateTabContentTranslatedX(pathname));
    }
  }, [pathname, dispatch]);

  return (
    <div
      className={cn("flex h-full w-full flex-col p-4", className)}
      // initial={{
      //   x: isTutorial ? 0 : tabContent[pathname]?.translatedX || "100%",
      // }}
      // animate={{ x: 0 }}
      // transition={{ ease: "linear", duration: 0.5 }}
    >
      {children}
    </div>
  );
};

export { HorizontalTransition };
