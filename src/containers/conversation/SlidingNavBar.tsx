import { TranslationFunc } from "@/locales/messages";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface SlidingNavbarProps {
  items: TranslationFunc[];
  activeIndex: number;
  onChange?: () => void;
}

const SlidingNavbar: React.FC<SlidingNavbarProps> = ({
  items,
  onChange,
  activeIndex
}) => {
  const { t } = useTranslation();

  const handleClick = (index: number) => {
    if (onChange) {
      onChange();
    }
  };

  return (
    <div className="border-1 relative grid auto-cols-fr grid-flow-col rounded-lg border border-white bg-primary">
      <div
        className="absolute left-0 top-0 h-full rounded-md bg-white transition-transform duration-300"
        style={{
          width: `calc(100% / ${items.length})`,
          transform: `translateX(${activeIndex * 100}%)`,
        }}
      />
      {items.map((item, index) => (
        <div key={index} className="relative">
          <input
            type="radio"
            id={`menu-${index}`}
            name="menu"
            value={t(item())}
            className="sr-only"
            checked={activeIndex === index}
            onChange={() => handleClick(index)}
          />
          <label
            htmlFor={`menu-${index}`}
            className={`grid h-[30px] place-items-center rounded-sm px-2 text-sm transition-colors duration-200 sm:text-base ${activeIndex === index ? "text-black" : "text-white hover:bg-primary-foreground"}`}
            // onClick={() => handleClick(index)}
          >
            {t(item())}
          </label>
        </div>
      ))}
    </div>
  );
};

export default SlidingNavbar;
