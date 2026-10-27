import { ANIMALS, ANIMALS_ARE_SAMPLE } from "../data/animals.js";
import { FEATURES } from "../data/features.js";
import { SITE_ORIGIN } from "../lib/metadata.js";

// /sitemap.xml: list of pages for Google. Send it once in Google Search
// Console; after that Google comes back to it by itself. New animals enter on
// the next publication.
export default function sitemap() {
  const pages = [
    { url: `${SITE_ORIGIN}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_ORIGIN}/mural`, changeFrequency: "weekly", priority: 0.6 }
  ];
  if (FEATURES.gallery && !ANIMALS_ARE_SAMPLE) {
    for (const a of ANIMALS) {
      pages.push({
        url: `${SITE_ORIGIN}/animal/${a.slug}`,
        changeFrequency: "weekly",
        // Animals still waiting matter more than the adopted ones.
        priority: a.status === "adopted" ? 0.5 : 0.8
      });
    }
  }
  return pages;
}
