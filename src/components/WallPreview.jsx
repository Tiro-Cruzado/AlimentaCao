"use client";

import Link from "next/link";
import { WALL_POSTS } from "../data/wall.js";
import { Clothesline, InstagramLink, wallPhotos } from "./Wall.jsx";
import { useGallery, Fullscreen } from "./MediaGallery.jsx";
import { colors, fonts, maxWidth, gutter } from "../theme.js";

// Wall preview on the home page: two clotheslines with the 10 most recent
// photos and the link to /mural. On desktop, 2 ropes of 5; on mobile, 3 ropes of 3.
const RECENT = wallPhotos(WALL_POSTS).slice(0, 10);

export default function WallPreview() {
  const gallery = useGallery(RECENT);
  // Nothing published in Sanity yet: the section does not show on the home page.
  if (RECENT.length === 0) return null;

  return (
    <section id="mural" style={{ background: colors.backgroundAlt, padding: "clamp(60px,9vw,104px) 0" }}>
      <div style={{ maxWidth, margin: "0 auto", padding: gutter }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: "clamp(30px,5vw,42px)", lineHeight: 1.1, letterSpacing: "-0.02em", margin: 0, color: colors.ink }}>
              Mural
            </h2>
            <p style={{ fontSize: "clamp(16px,2vw,18px)", lineHeight: 1.6, color: colors.ink2, margin: "12px 0 0", maxWidth: "32em" }}>
              Feiras, adoções, resgates e o dia a dia da ONG.
            </p>
          </div>
          <Link href="/mural" style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 15.5, color: colors.greenDark, textDecoration: "none", padding: "12px 20px", border: `1.5px solid ${colors.lineStrong}`, borderRadius: 999, background: colors.card }}>
            Ver o mural completo →
          </Link>
        </div>

        <div style={{ marginTop: "clamp(40px,6vw,60px)" }}>
          <Clothesline items={RECENT} gallery={gallery} trim />
        </div>
        <p style={{ textAlign: "center", margin: "4px 0 0" }}>
          <InstagramLink />
        </p>
      </div>
      <Fullscreen gallery={gallery} name="Mural" />
    </section>
  );
}
