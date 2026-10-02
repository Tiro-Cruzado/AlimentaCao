"use client";

import { CATEGORIES, formatDate } from "../data/wall.js";
import { INSTAGRAM, instagramProfile } from "../data/social.js";
import { colors, fonts } from "../theme.js";

// Wall shaped like a clothesline: the photos and videos hang from a rope, like
// polaroids held by clothes pegs. No text on the clothesline — title, date and
// caption show up when the visitor opens the photo in fullscreen.
//
//   const items = wallPhotos(posts);            flattens the posts into photos
//   const gallery = useGallery(items);          (MediaGallery.jsx)
//   <Clothesline items={items} gallery={gallery} />
//   <Fullscreen gallery={gallery} name="Mural" />
//
// The clothesline rows are drawn twice — 5 photos per rope on desktop and 3 on
// mobile — and the CSS shows one or the other (.clothesline-wide /
// .clothesline-narrow in styles.css). That way the pre-rendered HTML is already
// right at both sizes, without relying on JavaScript to measure the screen.

// A post with 10 photos becomes 10 polaroids. The caption shown in fullscreen
// joins the photo caption, the title and the date of the post.
export function wallPhotos(posts = []) {
  return posts.flatMap((p) =>
    (p.media || [])
      .filter((m) => m && m.src)
      .map((m, i) => {
        const context = [p.title, formatDate(p.date)].filter(Boolean).join(" · ");
        return {
          ...m,
          key: `${p.id}-${i}`,
          alt: m.alt || p.title,
          caption: m.caption ? `${m.caption} — ${context}` : context,
          category: CATEGORIES[p.category]?.label || ""
        };
      })
  );
}

// Fixed tilts (not random): the build HTML and the browser HTML have to come
// out identical, otherwise hydration complains.
const TILTS = [-5, 3, -2, 4, -3, 2, -4, 5, -1, 3];

// The rope is a curve that sags in the middle. For each photo, the height of
// the rope at the point where it hangs: 0 at the ends, SAG in the middle.
const SAG = 38;
const ropeHeight = (fraction) => 4 * SAG * fraction * (1 - fraction);

function Rope() {
  return (
    <svg className="clothesline-rope" viewBox={`0 0 1000 ${SAG + 14}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={`M0,6 Q500,${6 + 2 * SAG} 1000,6`} fill="none" stroke="#A88B62" strokeWidth="2.6" vectorEffect="non-scaling-stroke" />
      <path d={`M0,6 Q500,${6 + 2 * SAG} 1000,6`} fill="none" stroke="#C9AE84" strokeWidth="1.2" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function Peg() {
  return (
    <span className="clothesline-peg" aria-hidden="true">
      <span />
    </span>
  );
}

function CrossedEyeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c5 0 8.5 4.2 9.5 7-.4 1.1-1.2 2.5-2.4 3.8M6.6 6.6C4.6 7.9 3.2 9.9 2.5 12c1 2.8 4.5 7 9.5 7 1.6 0 3-.4 4.3-1.1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

// scale: on an incomplete rope the slot is wider; the polaroid takes up only
// the fraction of it that it would on a full rope, so they all have the same size.
function Polaroid({ item, index, gallery, fraction, scale = 1 }) {
  const hidden = gallery.isHidden(index);
  const image = item.thumbnail || (item.type === "image" ? item.src : item.poster);
  const tilt = TILTS[index % TILTS.length];

  return (
    <div className="clothesline-slot" style={{ paddingTop: ropeHeight(fraction) }}>
      <button
        type="button"
        className="polaroid"
        onClick={() => gallery.open(index)}
        aria-label={`${item.type === "video" ? "Vídeo" : "Foto"}: ${item.alt}${item.sensitive ? " (conteúdo sensível)" : ""}`}
        style={{ "--tilt": `${tilt}deg`, width: `${scale * 100}%` }}
      >
        <Peg />
        <span className="polaroid-photo">
          {!image && item.type === "video" && (
            // Video without a poster: the first frame of the video itself stands in for the photo.
            <video
              src={`${item.src}#t=0.1`}
              muted
              playsInline
              preload="metadata"
              aria-hidden="true"
              tabIndex={-1}
              style={hidden ? { filter: "blur(12px) saturate(0.6)", transform: "scale(1.15)" } : undefined}
            />
          )}
          {image && (
            <img
              src={image}
              alt=""
              loading="lazy"
              style={hidden ? { filter: "blur(12px) saturate(0.6)", transform: "scale(1.15)" } : undefined}
            />
          )}
          {hidden ? (
            <span className="polaroid-badge" style={{ background: "rgba(35,49,47,0.45)" }}>
              <CrossedEyeIcon />
            </span>
          ) : (
            item.type === "video" && (
              <span className="polaroid-badge">
                <span className="polaroid-play">
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>
                </span>
              </span>
            )
          )}
        </span>
      </button>
    </div>
  );
}

function Rows({ items: all, gallery, perRow, className, trim }) {
  // trim (home preview): never leaves a photo alone on the last rope — with
  // 10 photos, mobile shows 3 + 3 + 3 instead of 3 + 3 + 3 + 1.
  const items = trim && all.length > perRow && all.length % perRow === 1 ? all.slice(0, -1) : all;
  const rows = [];
  for (let i = 0; i < items.length; i += perRow) rows.push(items.slice(i, i + perRow).map((item, j) => ({ item, index: i + j })));

  return (
    <div className={className}>
      {rows.map((row, n) => (
        <div key={n} className="clothesline-row">
          <Rope />
          <span className="clothesline-nail clothesline-nail-left" aria-hidden="true" />
          <span className="clothesline-nail clothesline-nail-right" aria-hidden="true" />
          {/* Incomplete rope: the photos spread across the whole rope, but
              never wider than on a full rope. */}
          <div className="clothesline-slots" style={{ gridTemplateColumns: `repeat(${row.length}, minmax(0,1fr))` }}>
            {row.map(({ item, index }, j) => (
              <Polaroid key={item.key} item={item} index={index} gallery={gallery} fraction={(j + 0.5) / row.length} scale={row.length / perRow} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Clothesline({ items, gallery, trim = false }) {
  if (!items.length) return null;
  return (
    <div className="clothesline" role="group" aria-label="Fotos e vídeos do mural">
      <Rows items={items} gallery={gallery} perRow={5} className="clothesline-wide" trim={trim} />
      <Rows items={items} gallery={gallery} perRow={3} className="clothesline-narrow" trim={trim} />
    </div>
  );
}

export function InstagramLink() {
  if (!instagramProfile) return null;
  return (
    <a href={instagramProfile} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 8, maxWidth: "100%", fontFamily: fonts.heading, fontWeight: 700, fontSize: 15, color: colors.greenDark, textDecoration: "none" }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
      </svg>
      <span style={{ textAlign: "left" }}>Siga @{INSTAGRAM.username} no Instagram</span>
    </a>
  );
}
