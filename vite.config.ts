import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";
import viteCompression from "vite-plugin-compression";

// https://vitejs.dev/config/
export default ({ mode }: any) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return defineConfig({
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    optimizeDeps: {
      exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
    },
    base: process.env.VITE_PROXY_PREFIX || '/',
    plugins: [
      react(),
      // VitePWA({
      //   registerType: "autoUpdate",
      //   includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      //   manifest: {
      //     name: "Voice to Voice",
      //     short_name: "V2V",
      //     theme_color: "#ffffff",
      //     display: "standalone",
      //     start_url: "/recorder",
      //     icons: [
      //       {
      //         src: "pwa-64x64.png",
      //         sizes: "64x64",
      //         type: "image/png",
      //       },
      //       {
      //         src: "pwa-192x192.png",
      //         sizes: "192x192",
      //         type: "image/png",
      //       },
      //       {
      //         src: "pwa-512x512.png",
      //         sizes: "512x512",
      //         type: "image/png",
      //         purpose: "any",
      //       },
      //       {
      //         src: "maskable-icon-512x512.png",
      //         sizes: "512x512",
      //         type: "image/png",
      //         purpose: "maskable",
      //       },
      //     ],
      //   },
      // }),
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: "gzip",
        ext: ".gz",
      }),
    ],
  });
};
