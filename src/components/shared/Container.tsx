import { cn } from "@/lib/utils";

type ContainerProps = {
  children: JSX.Element | JSX.Element[];
  className?: string;
  isDeveloping?: boolean;
};

const DevelopOverlay = () => (
  <div className="absolute left-0 top-0 z-50 h-full w-full bg-black/50">
    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-nowrap text-xl font-bold">
      ＜録音履歴実装中＞
    </span>
  </div>
);

const Container: React.FC<ContainerProps> = ({
  children,
  className,
  isDeveloping = false,
}) => {
  return (
    <div
      className={cn(
        `relative flex h-0 w-full grow ${isDeveloping ? "overflow-hidden" : "overflow-auto"}`,
        className,
      )}
    >
      {isDeveloping ? <DevelopOverlay /> : null}
      {children}
    </div>
  );
};

export { Container };
