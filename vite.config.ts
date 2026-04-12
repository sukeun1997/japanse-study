import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "icons/icon-192.png",
        "icons/icon-512.png",
        "icons/icon-maskable.png",
        "data/phrases.json",
      ],
      manifest: {
        name: "오사카 회화",
        short_name: "오사카",
        description: "오사카 여행 회화 도우미",
        theme_color: "#0ea5e9",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        lang: "ko",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/icons/icon-maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,webmanifest,json,svg}"],
        runtimeCaching: [
          {
            urlPattern: /\/data\/phrases\.json$/,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "phrases-data" },
          },
        ],
      },
    }),
  ],
});
