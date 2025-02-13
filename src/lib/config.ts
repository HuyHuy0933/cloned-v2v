type Config = {
  port: number;
  basename: string
  apiBaseUrl: string;
  socketBaseUrl: string;
  clientBaseUrl: string;
  aiPlatformBaseUrl: string;
  appVersion: string;
  recordingStrictDomains: string[];
  liveblocksPublicApiKey: string;
  kuritaVersion: boolean;
};

export const config: Config = {
  port: import.meta.env.PORT,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  socketBaseUrl: import.meta.env.VITE_SOCKET_BASE_URL,
  clientBaseUrl: import.meta.env.VITE_BASE_URL,
  aiPlatformBaseUrl: import.meta.env.VITE_AI_PLATFORM_BASE_URL,
  appVersion: import.meta.env.VITE_APP_VERSION,
  recordingStrictDomains:
    import.meta.env.VITE_STRICT_RECORDING?.split(",") || [],
  basename: import.meta.env.VITE_PROXY_PREFIX,
  liveblocksPublicApiKey: import.meta.env.VITE_LIVEBLOCKS_PUBLIC_API_KEY,
  kuritaVersion: import.meta.env.VITE_KURITA_VERSION === "true",
};
