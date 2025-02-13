import { Progress } from "@/components";
import { cn } from "@/lib/utils";
import React from "react";

type UsageProgressProps = {
  title: string;
  max: number;
  value: number;
  className?: string;
  unit?: string
  round?: boolean
};

const UsageProgress: React.FC<UsageProgressProps> = React.memo(
  ({ title, max, value, className, unit, round }) => {
    const displayedPercent = ((value / max) * 100).toFixed(2);
    const percent = Number(displayedPercent);

    let bgIndicator = "#27ae60";

    if (percent >= 100) {
      bgIndicator = "#c0392b";
    } else if (percent >= 66.7) {
      bgIndicator = "#ffa500";
    }

    const displayedVal = round ? Number((value || 0).toFixed(1)) : value

    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-end justify-between">
          <p className="font-bold text-sm">{title}</p>
          <p className="text-sm text-right">
            {displayedVal}/{max} {unit} ({displayedPercent}%)
          </p>
        </div>

        <Progress
          value={percent}
          max={100}
          className="mt-2 h-1.5"
          bgIndicator={bgIndicator}
          
        />
      </div>
    );
  },
);

export default UsageProgress;
