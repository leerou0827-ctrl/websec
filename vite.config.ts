// @lovable.dev/vite-tanstack-config already includes these plugins and settings;
// do not add them manually or the app can break with duplicate plugins:
//   - TanStack Start, React, Tailwind, tsconfig paths, Cloudflare build plugin
//   - dev component tagging, VITE_* env injection, @ alias, dependency dedupe
//   - error logger plugins and sandbox-aware dev server settings
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import basicSsl from "@vitejs/plugin-basic-ssl";

// Redirect TanStack Start's bundled server entry to src/server.ts.
export default defineConfig({
  vite: {
    plugins: [basicSsl()],
    server: {
      https: true,
      host: "0.0.0.0",
      port: 3000,
      strictPort: true,
    },
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});
