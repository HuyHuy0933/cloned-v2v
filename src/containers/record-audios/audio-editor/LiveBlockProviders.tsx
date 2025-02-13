import React, { PropsWithChildren } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import ContentLoader from "react-content-loader";
import { config } from "@/lib/config";

type CollaborativeProvidersProps = PropsWithChildren & {
  roomId: string;
};

const LiveBlockProviders: React.FC<CollaborativeProvidersProps> = ({
  roomId,
  children,
}) => {
  return (
    <LiveblocksProvider publicApiKey={config.liveblocksPublicApiKey}>
      <RoomProvider id={roomId}>
        <ClientSideSuspense
          fallback={
            <ContentLoader
              speed={2}
              width="100%"
              height="100%"
              backgroundColor="hsl(var(--primary))"
              foregroundColor="hsl(var(--primary-foreground))"
            >
              <rect x="0" y="0" rx="0" ry="0" width="100%" height="100%" />
            </ContentLoader>
          }
        >
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
};

export default LiveBlockProviders;
