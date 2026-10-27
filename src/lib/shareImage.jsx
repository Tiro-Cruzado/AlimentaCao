// Share card for each animal (1200×630), drawn on the server with next/og. It
// shows up when the animal's link is sent on WhatsApp, Instagram, Facebook...
// (src/app/animal/[slug]/opengraph-image.jsx)
//
// Generated at build time, one per animal, from the cover photo
// cut by Sanity following the hotspot (scripts/sync-content.mjs → `share`).
// The renderer (Satori) only understands flexbox: every div with more than one
// child needs display: flex.
import { readFile } from "node:fs/promises";
import { ImageResponse } from "next/og";
import { join } from "node:path";
import { coverPhoto, speciesName } from "../data/animals.js";
import { LOGO_PATH } from "../components/Logo.jsx";
import { colors } from "../theme.js";

export const CARD_SIZE = { width: 1200, height: 630 };

const SITE_HOST = "alimentacao.org";

// What each image says, by situation. Short: it is read in one second.
const COPY = {
  available: { tag: "Para adoção", call: "Me adota?", accent: colors.greenDark, soft: colors.greenLight, ink: "#34492A" },
  in_process: { tag: "Em processo de adoção", call: "Quase em casa", accent: "#3A5A80", soft: "#E4EDF2", ink: "#2C4560" },
  in_treatment: { tag: "Em tratamento", call: "Me ajuda a ficar bem?", accent: "#8A5A12", soft: "#FBEEDF", ink: "#6B4510" },
  adopted: { tag: "Final feliz", call: "Encontrei um lar!", accent: colors.greenDark, soft: colors.greenLight, ink: "#34492A" }
};

let fontsPromise;
export function loadFonts() {
  const dir = join(process.cwd(), "node_modules/@fontsource/quicksand/files");
  fontsPromise ||= Promise.all([
    readFile(join(dir, "quicksand-latin-500-normal.woff")),
    readFile(join(dir, "quicksand-latin-700-normal.woff"))
  ]).then(([regular, bold]) => [
    { name: "Quicksand", data: regular, weight: 500, style: "normal" },
    { name: "Quicksand", data: bold, weight: 700, style: "normal" }
  ]);
  return fontsPromise;
}

// Photo already cut to size. Older data (before `share` existed) falls back to
// the cover asking Sanity for JPG, since the renderer does not read WebP/AVIF.
function photoFor(animal, kind) {
  if (animal.share?.[kind]) return animal.share[kind];
  const cover = coverPhoto(animal);
  if (!cover?.src) return null;
  return cover.src.replace("auto=format", "fm=jpg");
}

// The photo is fetched here (and not by the renderer) so a slow or missing
// image never breaks the build: it just becomes the green panel.
async function photoData(url) {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    const type = res.headers.get("content-type") || "image/jpeg";
    if (!/jpe?g|png/.test(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

function details(animal) {
  return [speciesName(animal), animal.age, animal.sex].filter(Boolean).join(" · ");
}

function Logo({ size, color }) {
  return (
    <svg width={Math.round((size * 769) / 526)} height={size} viewBox="38 62 769 526">
      <path d={LOGO_PATH} fill={color} />
    </svg>
  );
}

function Brand({ size }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.4 }}>
      <Logo size={size} color={colors.green} />
      <div style={{ display: "flex", fontSize: size * 0.82, fontWeight: 700, color: colors.ink }}>
        Alimenta<span style={{ color: colors.greenText }}>Cão</span>
      </div>
    </div>
  );
}

function Photo({ src, width, height }) {
  if (src) {
    return <img src={src} width={width} height={height} style={{ width, height, objectFit: "cover" }} />;
  }
  return (
    <div style={{ display: "flex", width, height, alignItems: "center", justifyContent: "center", background: colors.greenLight }}>
      <Logo size={Math.round(width * 0.32)} color={colors.green} />
    </div>
  );
}

// Long names shrink so they never break into three lines.
function nameSize(name, base) {
  const n = [...String(name)].length;
  if (n <= 7) return base;
  if (n <= 11) return Math.round(base * 0.8);
  return Math.round(base * 0.62);
}

export async function renderCard(animal) {
  const copy = COPY[animal.status] || COPY.available;
  const photo = await photoData(photoFor(animal, "card"));
  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: colors.background, fontFamily: "Quicksand" }}>
      <Photo src={photo} width={640} height={630} />
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 560, padding: "48px 52px" }}>
        <Brand size={40} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div style={{ display: "flex", fontSize: 22, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: copy.ink, background: copy.soft, padding: "10px 20px", borderRadius: 999 }}>
            {copy.tag}
          </div>
          <div style={{ display: "flex", fontSize: nameSize(animal.name, 92), fontWeight: 700, color: colors.ink, lineHeight: 1.05, marginTop: 22, letterSpacing: -2 }}>
            {animal.name}
          </div>
          <div style={{ display: "flex", fontSize: 28, fontWeight: 500, color: colors.ink2, marginTop: 12 }}>
            {details(animal)}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 32, fontWeight: 700, color: colors.card, background: copy.accent, padding: "16px 32px", borderRadius: 999 }}>
            {copy.call}
          </div>
          <div style={{ display: "flex", fontSize: 24, fontWeight: 700, color: colors.ink3 }}>{SITE_HOST}</div>
        </div>
      </div>
    </div>
  );
}

// The renderer only outputs PNG, and a photo in PNG weighs 1–2.5 MB. WhatsApp
// skips the link preview when the image is too heavy, so it is re-encoded as
// JPG. sharp comes with Next; without it, the PNG goes as it is.
export async function imageFile(element, size) {
  const png = Buffer.from(await new ImageResponse(element, { ...size, fonts: await loadFonts() }).arrayBuffer());
  try {
    const { default: sharp } = await import("sharp");
    const jpg = await sharp(png).jpeg({ quality: 84, mozjpeg: true }).toBuffer();
    return new Response(jpg, { headers: { "Content-Type": "image/jpeg" } });
  } catch {
    return new Response(png, { headers: { "Content-Type": "image/png" } });
  }
}
