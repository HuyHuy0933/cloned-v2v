import { VolumeNoneIcon } from "@/components/icons";
import React, { useState } from "react";
import "./volume-toggle.scss";
import { cn } from "@/lib/utils";

type VolumeToggleIconProps = {
  onClick?: (value: boolean) => void;
  muted: boolean;
  className?: string;
};

const VolumeToggleIcon: React.FC<VolumeToggleIconProps> = React.memo(
  ({ muted, onClick, className }) => {
    const color = !muted ? "#16c413" : "#fa1a42";
    return (
      <div
        className={cn(
          `volume-toggle size-8 ${muted ? "mute" : ""}`,
          className,
        )}
        style={{ color }}
        onClick={() => {
          onClick && onClick(!muted);
        }}
      >
        <div className="volume-toggle--icon">
          <VolumeNoneIcon className="h-full w-full" />
        </div>
        <div
          className="volume-toggle--wave volume-toggle--wave_one border-2 border-transparent"
          style={{ borderRightColor: "currentColor" }}
        ></div>
        <div
          className="volume-toggle--wave volume-toggle--wave_two border-2 border-transparent"
          style={{ borderRightColor: "currentColor" }}
        ></div>
      </div>
    );
  },
);

export { VolumeToggleIcon };
