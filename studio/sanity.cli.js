import { defineCliConfig } from "sanity/cli";

// Used by the Sanity command line (`sanity deploy`, `sanity dataset ...`).
// The values come from studio/.env — see README.md, "First time".
export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || "production"
  }
});
