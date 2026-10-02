// Pulls the animals and the wall from Sanity and writes
// src/data/animals.generated.json and src/data/wall.generated.json.
//
//   npm run sync             once
//   npm run sync -- --watch  keeps checking every few seconds (used by npm run dev)
//
// Runs before the build. If Sanity is not configured yet, or if the query
// fails, the script warns and exits without an error: the site still goes up
// with the sample list and shows the notice that the data is not real.
// Taking down the NGO's deploy because the CMS is unavailable would be worse
// than serving the previous version.

import { readFile, writeFile } from "node:fs/promises";
import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

// On your own computer the variables live in .env.local (Next reads that file
// by itself, a plain `node` script does not). On Vercel the file does not
// exist and the variables come from the project settings.
try {
  process.loadEnvFile(".env.local");
} catch {
  // No .env.local, or a Node version without loadEnvFile: use the environment.
}

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || "production";
const OUTPUT = "src/data/animals.generated.json";
const WALL_OUTPUT = "src/data/wall.generated.json";

if (!projectId) {
  console.log(`
Sanity is not configured yet — keeping the sample animals.

To turn it on, set the environment variables (on Vercel, under Settings →
Environment Variables):

  SANITY_PROJECT_ID=your-project-id
  SANITY_DATASET=production

The project id comes from studio/ after running "npx sanity init".
`);
  process.exit(0);
}

const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", useCdn: false });
const builder = createImageUrlBuilder(client);

const imageUrl = (img, width) =>
  img?.asset ? builder.image(img).width(width).quality(80).auto("format").url() : "";

const QUERY = `*[_type == "animal" && defined(slug.current)] | order(rescueDate asc) {
  name, "slug": slug.current, species, speciesOther, size, sex, age, status, urgent,
  location, summary, story, rescueDate, adoptionDate, temperament, health, goodWith,
  media[]{ _type, alt, caption, asset, poster, sensitive }
}`;

const WALL_QUERY = `*[_type == "wallPost" && defined(date)] | order(date desc) {
  _id, title, date, category, text,
  "animals": animals[]->{ name, "slug": slug.current },
  media[]{ _type, alt, caption, asset, poster, sensitive }
}`;

function paragraphs(text) {
  return String(text || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim().replace(/\s*\n\s*/g, " "))
    .filter(Boolean);
}

function convertMedia(media, fileUrls) {
  return (media || []).map((m) => {
    if (m._type === "video") {
      return {
        type: "video",
        src: fileUrls.get(m.asset?._ref) || "",
        poster: imageUrl(m.poster, 1200),
        thumbnail: imageUrl(m.poster, 480),
        alt: m.alt || "",
        caption: m.caption || "",
        sensitive: Boolean(m.sensitive)
      };
    }
    return {
      type: "image",
      src: imageUrl(m, 1400),
      // Light version for the "Fotos e vídeos" grid: with 20 photos, downloading
      // the 1400px one for all of them would weigh several MB on mobile.
      thumbnail: imageUrl(m, 480),
      alt: m.alt || "",
      caption: m.caption || "",
      sensitive: Boolean(m.sensitive)
    };
  });
}

// Only touches the file when the content changed, so the dev server does not
// reload the page for nothing.
async function writeIfChanged(path, data) {
  const next = JSON.stringify(data, null, 2) + "\n";
  const current = await readFile(path, "utf8").catch(() => "");
  if (current === next) return false;
  await writeFile(path, next);
  return true;
}

async function syncOnce() {
  const animals = await client.fetch(QUERY);
  const wall = await client.fetch(WALL_QUERY);

  // Videos are "file": the link only exists by resolving the asset. We fetch
  // them all at once instead of one query per video.
  const refs = [
    ...new Set(
      [...animals, ...wall].flatMap((a) => (a.media || []).filter((m) => m._type === "video").map((m) => m.asset?._ref)).filter(Boolean)
    )
  ];
  const fileUrls = new Map();
  if (refs.length) {
    const files = await client.fetch(`*[_id in $refs]{ _id, url }`, { refs });
    files.forEach((f) => fileUrls.set(f._id, f.url));
  }

  const output = animals.map((a) => ({
    slug: a.slug,
    name: a.name,
    species: a.species,
    speciesOther: a.speciesOther || undefined,
    size: a.size,
    sex: a.sex,
    age: a.age,
    rescueDate: a.rescueDate,
    adoptionDate: a.adoptionDate || undefined,
    status: a.status,
    urgent: Boolean(a.urgent),
    location: a.location || "",
    summary: a.summary || "",
    story: paragraphs(a.story),
    temperament: a.temperament || [],
    health: {
      neutered: Boolean(a.health?.neutered),
      vaccinated: Boolean(a.health?.vaccinated),
      dewormed: Boolean(a.health?.dewormed),
      notes: a.health?.notes || ""
    },
    goodWith: {
      children: a.goodWith?.children || "untested",
      dogs: a.goodWith?.dogs || "untested",
      cats: a.goodWith?.cats || "untested"
    },
    media: convertMedia(a.media, fileUrls)
  }));

  const wallOutput = wall.map((p) => ({
    id: p._id,
    title: p.title,
    date: p.date,
    category: p.category || "event",
    text: p.text || "",
    animals: (p.animals || []).filter((a) => a?.slug),
    media: convertMedia(p.media, fileUrls)
  }));

  const animalsChanged = await writeIfChanged(OUTPUT, output);
  const wallChanged = await writeIfChanged(WALL_OUTPUT, wallOutput);
  return { output, wallOutput, changed: animalsChanged || wallChanged };
}

function report({ output, wallOutput }) {
  const byStatus = output.reduce((acc, a) => ({ ...acc, [a.status]: (acc[a.status] || 0) + 1 }), {});
  const withoutPhoto = output.filter((a) => !a.media.some((m) => m.type === "image" && m.src && !m.sensitive)).map((a) => a.name);

  console.log(`${output.length} ${output.length === 1 ? "animal synced" : "animals synced"} → ${OUTPUT}`);
  console.log(`${wallOutput.length} ${wallOutput.length === 1 ? "wall post" : "wall posts"} → ${WALL_OUTPUT}`);
  console.log(Object.entries(byStatus).map(([k, v]) => `  ${k}: ${v}`).join("\n"));
  if (withoutPhoto.length) {
    console.log(`\nWithout a photo (will show up with a placeholder): ${withoutPhoto.join(", ")}`);
  }
}

const WATCH = process.argv.includes("--watch");
const WATCH_INTERVAL_MS = 5000;

try {
  report(await syncOnce());
} catch (error) {
  console.error(`
Could not reach Sanity: ${error.message}

Keeping ${OUTPUT} as it is. The site goes up with the previous content.
`);
  if (!WATCH) process.exit(0);
}

// Watch mode, for local development: whatever is PUBLISHED in the panel shows
// up on the local site a few seconds later, without running the sync by hand.
// Drafts are not read. In production the content is refreshed on each deploy.
if (WATCH) {
  console.log(`Watching Sanity for published changes (every ${WATCH_INTERVAL_MS / 1000}s)…`);
  for (;;) {
    await new Promise((resolve) => setTimeout(resolve, WATCH_INTERVAL_MS));
    try {
      const result = await syncOnce();
      if (result.changed) {
        console.log(`\n[sanity] content changed at ${new Date().toLocaleTimeString()}`);
        report(result);
      }
    } catch {
      // Network hiccup: try again on the next round.
    }
  }
}
