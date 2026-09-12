import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "proj_nexus_intellect",
  dirs: ["./src/jobs"],
  runtime: "node",
  maxDuration: 300,
});
