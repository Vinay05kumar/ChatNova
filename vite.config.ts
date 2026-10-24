// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
import { existsSync, readFileSync } from "node:fs";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Local development: HTTPS on fixed port 4200 when localhost.pem / localhost-key.pem exist in the project root.
const hasCerts = existsSync("localhost.pem") && existsSync("localhost-key.pem");

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: hasCerts
    ? {
        server: {
          port: 4200,
          strictPort: true,
          https: { cert: readFileSync("localhost.pem"), key: readFileSync("localhost-key.pem") },
        },
      }
    : {},
});
