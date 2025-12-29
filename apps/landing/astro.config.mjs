import { defineConfig } from "astro/config";

export default defineConfig({
  server: {
    port: 4321,
    host: true,
  },
  build: {
    format: "directory",
  },
});
