import { cn } from "@/lib/utils";
import React, { useEffect, useState } from "react";

type AutoLinearProgressProps = {
  duration?: number; // miliseconds
  className?: string;
  progressClassName?: string;
};

const AutoLinearProgress: React.FC<AutoLinearProgressProps> = ({
  duration = 3000,
  className,
  progressClassName,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Total duration in milliseconds (10 seconds)
    const intervalTime = 10; // Update every 100ms
    const increment = 100 / (duration / intervalTime); // Increment for each interval

    const interval = setInterval(() => {
      setProgress((prev) => {
        const nextValue = prev + increment;

        return nextValue >= 100 ? 100 : nextValue; // Stop at 100%
      });
    }, intervalTime);

    // Cleanup when the component is unmounted or progress reaches 100%
    return () => clearInterval(interval);
  }, [duration]);

  return (
    <div className={cn("relave h-1 w-full", className)}>
      <div
        className={cn(
          "transition-width absolute left-0 h-full duration-0",
          progressClassName,
        )}
        style={{
          width: `${progress}%`,
        }}
      ></div>
    </div>
  );
};

export { AutoLinearProgress };
