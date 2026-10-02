import generated from "./wall.generated.json";

// Wall: posts about events, adoptions, rescues and behind the scenes.
//
// Single source: Sanity (type "wallPost"), synced into wall.generated.json by
// `npm run sync` (scripts/sync-content.mjs). The volunteers publish in the
// panel; nothing is kept in the repository.
//
// With nothing published the list is empty: the home page hides the wall
// section and /mural says the wall is being put together. There are no sample
// posts — a made-up event presented as real misleads.

const REAL = Array.isArray(generated) ? generated : [];

// Posts without a date go to the end.
export const WALL_POSTS = REAL
  .filter((p) => p && p.title && Array.isArray(p.media))
  .sort((a, b) => (a.date || "0000") < (b.date || "0000") ? 1 : (a.date || "0000") > (b.date || "0000") ? -1 : 0);

export const CATEGORIES = {
  event: { label: "Evento", plural: "Eventos", background: "#EAF2E4", ink: "#467333" },
  adoption: { label: "Adoção", plural: "Adoções", background: "#FBEEDF", ink: "#8A5A12" },
  rescue: { label: "Resgate", plural: "Resgates", background: "#F6E7E4", ink: "#A34E3F" },
  behind_the_scenes: { label: "Bastidores", plural: "Bastidores", background: "#E4EDF2", ink: "#3A5A80" }
};

const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

// "2026-09-20" → "20 de setembro de 2026". Done by hand (and not with
// toLocaleDateString) so it comes out the same in the build and in the browser —
// a different time zone and language would break hydration.
export function formatDate(iso) {
  const [year, month, day] = String(iso).split("-").map(Number);
  if (!year || !month || !day) return "";
  return `${day} de ${MONTHS[month - 1]} de ${year}`;
}

export function mediaCount(media = []) {
  const withFile = media.filter((m) => m?.src);
  const photos = withFile.filter((m) => m.type === "image").length;
  const videos = withFile.length - photos;
  return [photos && `${photos} ${photos === 1 ? "foto" : "fotos"}`, videos && `${videos} ${videos === 1 ? "vídeo" : "vídeos"}`]
    .filter(Boolean)
    .join(" e ");
}
