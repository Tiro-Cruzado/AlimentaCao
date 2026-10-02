import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import animal from "./schemas/animal.js";
import wallPost from "./schemas/wallPost.js";

// projectId comes from the Sanity dashboard after creating the project.
// Run `npx sanity init` in here and it fills it in by itself.
export default defineConfig({
  name: "alimentacao",
  title: "AlimentaCão",
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || "PASTE_THE_PROJECT_ID_HERE",
  dataset: process.env.SANITY_STUDIO_DATASET || "production",
  // The studio is served from /studio on the same domain (see vercel.json).
  basePath: "/studio",
  plugins: [structureTool()],
  schema: { types: [animal, wallPost] }
});
