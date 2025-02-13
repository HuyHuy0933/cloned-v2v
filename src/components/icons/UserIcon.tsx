import { cn } from "@/lib/utils";

type UserIconProps = {
  className?: string;
};

const UserIcon: React.FC<UserIconProps> = ({ className, ...props }: any) => {
  return (
    <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    width={24}
    height={24}
    className={cn('size-6', className)}
    {...props}
  >
    <path
      fillRule="evenodd"
      d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1 -9 0M3.751 20.105a8.25 8.25 0 0 1 16.498 0 0.75 0.75 0 0 1 -0.437 0.695A18.7 18.7 0 0 1 12 22.5c-2.786 0 -5.433 -0.608 -7.812 -1.7a0.75 0.75 0 0 1 -0.437 -0.695"
      clipRule="evenodd"
    />
  </svg>
  );
};

export { UserIcon };
