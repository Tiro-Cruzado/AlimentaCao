import { defineCliConfig } from "sanity/cli";

// Used by the Sanity command line (`sanity deploy`, `sanity dataset ...`).
//
// `npm run deploy` publishes the panel at https://<studioHost>.sanity.studio,
// hosted by Sanity for free. The site's /studio redirects there.
//
// It is .ts on purpose: with "type": "module" in package.json, the Sanity CLI
// fails to load a sanity.cli.js ("does not provide an export named
// defineCliConfig"). The .ts file is compiled by the CLI itself.
export default defineCliConfig({
  api: {
    // The project id is not a secret: it is public in every image URL.
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || "wberp9dd",
    dataset: process.env.SANITY_STUDIO_DATASET || "production"
  },
  studioHost: "alimentacao"
});
