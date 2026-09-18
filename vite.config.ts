import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      {
        name: "html-dev-title-prefix",
        transformIndexHtml(html) {
          if (mode === "development") {
            return html.replace(
              /<title>(.*?)<\/title>/,
              "<title>[DEV] $1</title>",
            );
          }
          return html;
        },
      },
    ],
    server: {
      port: 5173,
      host: true,
    },
  };
});
