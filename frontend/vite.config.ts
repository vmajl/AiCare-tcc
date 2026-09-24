import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src/com/aicare", import.meta.url)),
      },
    },
  },
  tanstackStart: {
    router: {
      routesDirectory: "com/aicare/routes",
      generatedRouteTree: "com/aicare/routeTree.gen.ts",
    },
    server: { entry: "server" },
  },
});
