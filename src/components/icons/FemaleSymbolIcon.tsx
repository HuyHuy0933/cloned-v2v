import { cn } from "@/lib/utils";

type FemaleSymbolIconProps = {
  className?: string;
};

const FemaleSymbolIcon: React.FC<FemaleSymbolIconProps> = ({
  className,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-5", className)}
      {...props}
    >
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M20 9a8.001 8.001 0 0 1-7.002 7.938A.97.97 0 0 1 13 17v2h1a1 1 0 1 1 0 2h-1v1a1 1 0 1 1-2 0v-1h-1a1 1 0 1 1 0-2h1v-2c0-.02 0-.041.002-.062A8.001 8.001 0 0 1 12 1a8 8 0 0 1 8 8ZM6.004 9a5.996 5.996 0 1 0 11.992 0A5.996 5.996 0 0 0 6.004 9Z"
        clipRule="evenodd"/>
    </svg>
  );
};

export { FemaleSymbolIcon };
