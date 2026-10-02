"use client";

import { useMemo, useState } from "react";
import { WALL_POSTS } from "../data/wall.js";
import { Clothesline, InstagramLink, wallPhotos } from "../components/Wall.jsx";
import { useGallery, Fullscreen } from "../components/MediaGallery.jsx";
import { colors, fonts, maxWidth, gutter } from "../theme.js";

// /mural page: every photo and video from the posts, from the most recent to
// the oldest, hanging on clotheslines. Shows 30 at a time so that hundreds of
// photos are not loaded at once on mobile.

const PAGE_SIZE = 30;
const ALL_PHOTOS = wallPhotos(WALL_POSTS);

export default function WallPage() {
  const [shownCount, setShownCount] = useState(PAGE_SIZE);
  // Memoized: a new list on every render would make the gallery reset non-stop.
  const items = useMemo(() => ALL_PHOTOS.slice(0, shownCount), [shownCount]);
  const gallery = useGallery(items);

  return (
    <main style={{ background: colors.backgroundAlt, padding: "clamp(48px,7vw,88px) 0 clamp(60px,9vw,104px)" }}>
      <div style={{ maxWidth, margin: "0 auto", padding: gutter }}>
        <h1 style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: "clamp(34px,6vw,52px)", lineHeight: 1.05, letterSpacing: "-0.02em", margin: 0, color: colors.ink }}>
          Mural
        </h1>
        <p style={{ fontSize: "clamp(16px,2vw,18px)", lineHeight: 1.6, color: colors.ink2, margin: "14px 0 0", maxWidth: "34em" }}>
          Feiras, adoções, resgates e o dia a dia da AlimentaCão. Clique numa foto para ver maior.
        </p>
        <p style={{ margin: "14px 0 0" }}>
          <InstagramLink />
        </p>

        <div style={{ marginTop: "clamp(40px,6vw,64px)" }}>
          {ALL_PHOTOS.length === 0 ? (
            <p style={{ fontSize: 16, lineHeight: 1.6, color: colors.ink2 }}>Estamos montando o mural. Em breve as fotos e os vídeos aparecem aqui.</p>
          ) : (
            <Clothesline items={items} gallery={gallery} />
          )}
        </div>

        {ALL_PHOTOS.length > shownCount && (
          <p style={{ textAlign: "center", margin: "8px 0 0" }}>
            <button
              type="button"
              onClick={() => setShownCount((q) => q + PAGE_SIZE)}
              style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 15.5, color: colors.greenDark, background: "transparent", border: "none", textDecoration: "underline", textUnderlineOffset: 4, cursor: "pointer", padding: 8 }}
            >
              Pendurar mais fotos
            </button>
          </p>
        )}
      </div>
      <Fullscreen gallery={gallery} name="Mural" />
    </main>
  );
}
