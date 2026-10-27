import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import animal from "./schemas/animal.js";
import wallPost from "./schemas/wallPost.js";

// projectId comes from the Sanity dashboard after creating the project.
// Run `npx sanity init` in here and it fills it in by itself.
export default defineConfig({
  name: "alimentacao",
  title: "AlimentaCão",
  // The project id is not a secret: it is public in every image URL.
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || "wberp9dd",
  dataset: process.env.SANITY_STUDIO_DATASET || "production",
  plugins: [structureTool()],
  schema: { types: [animal, wallPost] }
});
