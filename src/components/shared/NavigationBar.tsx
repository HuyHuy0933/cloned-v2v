import { TranslationFunc } from "@/locales/messages";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export type NavigationTab = {
  title: TranslationFunc;
  icon: any;
  path: string;
  name: string;
};

export type NavigationBarProps = {
  items: NavigationTab[];
  currentPath: string;
  hidden?: boolean;
};

const NavigationBar: React.FC<NavigationBarProps> = ({
  items,
  currentPath,
  hidden = false,
}) => {
  const { t } = useTranslation();
  const [tabUnderlineWidth, setTabUnderlineWidth] = useState(0);
  const [tabUnderlineLeft, setTabUnderlineLeft] = useState(0);
  const tabsRef = useRef<any>([]);

  useEffect(() => {
    function setTabPosition() {
      const currentTab = tabsRef.current[currentPath];
      setTabUnderlineLeft(currentTab?.offsetLeft ?? 0);
      setTabUnderlineWidth(currentTab?.clientWidth ?? 0);
    }

    setTabPosition();
    window.addEventListener("resize", setTabPosition);

    return () => window.removeEventListener("resize", setTabPosition);
  }, [currentPath]);

  if (hidden) return <></>;

  return (
    <div className="relative grid grid-cols-4 gap-4">
      {items.map((tab: NavigationTab, index: number) => (
        <Link
          id={tab.name}
          ref={(el) => (tabsRef.current[tab.path] = el)}
          to={tab.path}
          className={`flex h-full w-full flex-col items-center justify-start gap-1 bg-transparent p-2 text-white [&>*]:transition-all [&>*]:duration-300 [&>svg]:hover:scale-[1.2] [&>*]:hover:translate-y-[-5px] ${
            currentPath === tab.path ? "" : "opacity-60"
          }`}
          key={`${tab.title}-${index + 1}`}
          replace={true}
          // style={{ height: hidden ? 0 : "70px" }}
        >
          {tab.icon}
          <span className="text-center text-xs">{t(tab.title())}</span>
        </Link>
      ))}

      <span
        className="absolute top-0 block h-0.5 transition-all bg-white duration-300"
        style={{ left: tabUnderlineLeft, width: tabUnderlineWidth }}
      />
    </div>
  );
};

export { NavigationBar };
