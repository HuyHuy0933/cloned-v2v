import React from "react";
import ContentLoader from "react-content-loader";

const AudioListLoader = React.memo(() => {
  return (
    <div className="relative w-full h-full">
      <ContentLoader
        speed={2}
        width="100%"
        height="600"
        backgroundColor="hsl(var(--primary))"
        foregroundColor="hsl(var(--primary-foreground))"
      >
        <rect x="0" y="0" rx="4" ry="4" width="137" height="36" />
        <rect x="145" y="0" rx="4" ry="4" width="48" height="36" />
        <rect x="201" y="0" rx="4" ry="4" width="100" height="36" />
        <rect x="0" y="52" rx="16" ry="16" width="100%" height="85" />
        <rect x="0" y="145" rx="16" ry="16" width="100%" height="85" />
        <rect x="0" y="238" rx="16" ry="16" width="100%" height="85" />
        <rect x="0" y="331" rx="16" ry="16" width="100%" height="85" />
        <rect x="0" y="424" rx="16" ry="16" width="100%" height="85" />
      </ContentLoader>
    </div>
  );
});

export default AudioListLoader;
