import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type CircularProgressProps = {
  className?: string;
  progress?: number;
  center?: ReactNode
};

const CircularProgress: React.FC<CircularProgressProps> = ({
  className,
  progress = 0,
  center
}) => {
  return (
    <div className={cn("relative size-8", className)}>
      <svg
        className="size-full -rotate-90"
        viewBox="0 0 36 36"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Circle */}
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          className="stroke-current text-neutral-400"
          strokeWidth="2"
        ></circle>
        {/* Progress Circle */}
        <circle
          cx="18"
          cy="18"
          r="16"
          fill="none"
          className="stroke-current text-success"
          strokeWidth="2"
          strokeDasharray="100"
          strokeDashoffset={100 - progress}
          strokeLinecap="round"
        ></circle>
      </svg>

      {/* center item */}
      <div className="absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
        {center}
      </div>
    </div>
  );
};

export { CircularProgress };
