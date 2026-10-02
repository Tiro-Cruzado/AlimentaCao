"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { colors, fonts } from "../theme.js";

// Photos and videos on the animal page.
//
//   const gallery = useGallery(media);
//   <GalleryCover gallery={gallery} name="Feijão" />    large photo at the top
//   <GalleryGrid gallery={gallery} name="Feijão" />     "Fotos e vídeos" section
//   <Fullscreen gallery={gallery} name="Feijão" />      viewer
//
// Clicking any item opens the fullscreen view: arrows, keyboard (← → Esc) and
// swiping with a finger on mobile. Videos play right there.
//
// Media flagged as sensitive in its record (`sensitive: true`) shows up blurred
// in the grid and in fullscreen, with the "Exibir conteúdo sensível" button.
// Once revealed, it stays revealed in both places; it can be hidden again. A
// sensitive video does not load the player before the click. The blur protects
// people who do not want to see it by surprise; it does not hide the file.

const coverStyle = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" };
const blurStyle = (px) => ({ ...coverStyle, filter: `blur(${px}px) saturate(0.6)`, transform: "scale(1.15)" });

// Only media with a file gets in. Until the NGO takes the photos, nothing shows
// (an empty frame makes the profile look abandoned).
const NONE = [];

export function useGallery(media = NONE) {
  const items = media.filter((m) => m && m.src);
  const [openIndex, setOpenIndex] = useState(null); // index shown in fullscreen, or null
  const [revealed, setRevealed] = useState(() => new Set());

  // The animal changed: close and hide everything again.
  useEffect(() => {
    setOpenIndex(null);
    setRevealed(new Set());
  }, [media]);

  const reveal = useCallback((i, show = true) => {
    setRevealed((current) => {
      const updated = new Set(current);
      show ? updated.add(i) : updated.delete(i);
      return updated;
    });
  }, []);

  return {
    items,
    openIndex,
    open: setOpenIndex,
    close: () => setOpenIndex(null),
    revealed,
    reveal,
    isHidden: (i) => Boolean(items[i]?.sensitive) && !revealed.has(i),
    // Cover: first photo that is not sensitive.
    coverIndex: items.findIndex((m) => m.type === "image" && !m.sensitive)
  };
}

function CrossedEyeIcon({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c5 0 8.5 4.2 9.5 7-.4 1.1-1.2 2.5-2.4 3.8M6.6 6.6C4.6 7.9 3.2 9.9 2.5 12c1 2.8 4.5 7 9.5 7 1.6 0 3-.4 4.3-1.1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

function PlayIcon({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
    </svg>
  );
}

const thumbnailOf = (m) => m.thumbnail || (m.type === "image" ? m.src : m.poster) || "";
const itemLabel = (m, i, name) =>
  `${m.type === "video" ? "Vídeo" : "Foto"} ${i + 1} de ${name}${m.sensitive ? " (conteúdo sensível)" : ""}${m.caption ? `: ${m.caption}` : ""}`;

// ---------------------------------------------------------------- cover

export function GalleryCover({ gallery, name }) {
  const { items, coverIndex, open } = gallery;
  if (coverIndex < 0) return null;
  const cover = items[coverIndex];
  const total = items.length;
  return (
    <button
      type="button"
      onClick={() => open(coverIndex)}
      aria-label={`Abrir fotos e vídeos de ${name}`}
      style={{ position: "relative", display: "block", width: "100%", aspectRatio: "4/3", padding: 0, border: `1px solid ${colors.line}`, borderRadius: 24, overflow: "hidden", cursor: "zoom-in", background: colors.backgroundAlt }}
    >
      <img src={cover.src} alt={cover.alt || `Foto de ${name}`} style={{ ...coverStyle, objectPosition: cover.focus }} />
      {total > 1 && (
        <span style={{ position: "absolute", right: 14, bottom: 14, fontFamily: fonts.heading, fontWeight: 700, fontSize: 13.5, background: "rgba(35,49,47,0.78)", color: "#FFFDFB", padding: "8px 14px", borderRadius: 999 }}>
          Ver as {total} fotos e vídeos
        </span>
      )}
    </button>
  );
}

// ---------------------------------------------------------------- grid

export function GalleryGrid({ gallery, name }) {
  const { items, open, isHidden } = gallery;
  if (!items.length) return null;
  const photos = items.filter((m) => m.type === "image").length;
  const videos = items.length - photos;
  const count = [photos && `${photos} ${photos === 1 ? "foto" : "fotos"}`, videos && `${videos} ${videos === 1 ? "vídeo" : "vídeos"}`].filter(Boolean).join(" e ");

  return (
    <section aria-labelledby="photos-title" style={{ marginTop: 36 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap", margin: "0 0 14px" }}>
        <h2 id="photos-title" style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 24, color: colors.ink, margin: 0 }}>
          Fotos e vídeos
        </h2>
        <span style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 14, color: colors.ink3 }}>{count}</span>
      </div>

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10 }}>
        {items.map((m, i) => {
          const hidden = isHidden(i);
          const img = thumbnailOf(m);
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => open(i)}
                aria-label={itemLabel(m, i, name)}
                style={{ position: "relative", display: "block", width: "100%", aspectRatio: "1/1", padding: 0, border: "none", borderRadius: 16, overflow: "hidden", cursor: "zoom-in", background: "#2A2F2C" }}
              >
                {img && <img src={img} alt="" loading="lazy" style={hidden ? blurStyle(12) : { ...coverStyle, objectPosition: m.focus }} />}

                {hidden ? (
                  <span aria-hidden="true" style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, background: "rgba(35,49,47,0.5)", color: "#FFFDFB", fontFamily: fonts.heading, fontWeight: 700, fontSize: 12.5, padding: 8, textAlign: "center" }}>
                    <CrossedEyeIcon size={22} />
                    Conteúdo sensível
                  </span>
                ) : (
                  m.type === "video" && (
                    <span aria-hidden="true" style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(35,49,47,0.22)" }}>
                      <span style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(255,253,251,0.92)", color: colors.ink, display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: 3 }}>
                        <PlayIcon />
                      </span>
                    </span>
                  )
                )}

                {m.type === "video" && (
                  <span aria-hidden="true" style={{ position: "absolute", left: 8, bottom: 8, fontFamily: fonts.heading, fontWeight: 700, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", background: "rgba(35,49,47,0.78)", color: "#FFFDFB", padding: "4px 8px", borderRadius: 999 }}>
                    vídeo
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------- fullscreen

const roundButton = {
  display: "flex", alignItems: "center", justifyContent: "center",
  width: 48, height: 48, borderRadius: "50%", border: "none", cursor: "pointer",
  background: "rgba(255,253,251,0.14)", color: "#FFFDFB", fontSize: 26, lineHeight: 1
};

export function Fullscreen({ gallery, name }) {
  const { items, openIndex, open, close, isHidden, reveal } = gallery;
  const closeRef = useRef(null);
  const returnFocus = useRef(null);
  const touchStartX = useRef(null);
  const isOpen = openIndex !== null && items[openIndex];
  const total = items.length;

  const previous = useCallback(() => open((i) => (i - 1 + total) % total), [open, total]);
  const next = useCallback(() => open((i) => (i + 1) % total), [open, total]);

  // On open: remember who had the focus, lock page scrolling, focus the close button.
  // On close: put everything back the way it was.
  useEffect(() => {
    if (!isOpen) return;
    returnFocus.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      returnFocus.current?.focus?.();
    };
  }, [Boolean(isOpen)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft" && total > 1) previous();
      else if (e.key === "ArrowRight" && total > 1) next();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, total, previous, next, close]);

  if (!isOpen) return null;

  const m = items[openIndex];
  const hidden = isHidden(openIndex);
  // Clicking the dark backdrop (outside the photo) closes it.
  const closeIfBackdrop = (e) => e.target === e.currentTarget && close();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos e vídeos de ${name}`}
      onClick={closeIfBackdrop}
      onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStartX.current === null || total < 2) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(dx) > 50) (dx > 0 ? previous : next)();
      }}
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "#141816", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 12px 76px" }}
    >
      <div style={{ position: "absolute", top: 12, left: 16, right: 12, display: "flex", alignItems: "center", justifyContent: "space-between", color: "#FFFDFB" }}>
        <span aria-live="polite" style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 15 }}>
          {openIndex + 1} de {total}
        </span>
        <button ref={closeRef} type="button" onClick={close} aria-label="Fechar" style={roundButton}>
          ×
        </button>
      </div>

      <figure onClick={closeIfBackdrop} style={{ margin: 0, width: "100%", maxWidth: 1100, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, minHeight: 0, flex: 1, justifyContent: "center" }}>
        <div onClick={closeIfBackdrop} style={{ position: "relative", width: "100%", height: "100%", maxHeight: "calc(100vh - 150px)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 14 }}>
          {hidden ? (
            <div style={{ position: "relative", width: "min(100%, 900px)", aspectRatio: "4/3", maxHeight: "100%", borderRadius: 14, overflow: "hidden", background: "#2A2F2C" }}>
              {thumbnailOf(m) && <img src={thumbnailOf(m)} alt="" aria-hidden="true" style={blurStyle(30)} />}
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, color: "#FFFDFB", background: "rgba(35,49,47,0.45)", padding: 20, textAlign: "center" }}>
                <CrossedEyeIcon />
                <p style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 18, margin: 0 }}>Conteúdo sensível</p>
                <button type="button" onClick={() => reveal(openIndex, true)} style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 15, cursor: "pointer", background: "#FFFDFB", color: colors.ink, border: "none", borderRadius: 999, padding: "12px 22px" }}>
                  Exibir conteúdo sensível
                </button>
              </div>
            </div>
          ) : m.type === "video" ? (
            <video
              key={m.src}
              src={m.src}
              poster={m.poster || undefined}
              controls
              autoPlay
              playsInline
              style={{ maxWidth: "100%", maxHeight: "calc(100vh - 150px)", borderRadius: 14, background: "#000" }}
            >
              Seu navegador não consegue reproduzir este vídeo.
            </video>
          ) : (
            <img key={m.src} src={m.src} alt={m.alt || `Foto de ${name}`} style={{ maxWidth: "100%", maxHeight: "calc(100vh - 150px)", objectFit: "contain", borderRadius: 14 }} />
          )}

          {m.sensitive && !hidden && (
            <button type="button" onClick={() => reveal(openIndex, false)} style={{ position: "absolute", top: 10, right: 10, display: "flex", alignItems: "center", gap: 6, fontFamily: fonts.heading, fontWeight: 700, fontSize: 13, cursor: "pointer", background: "rgba(35,49,47,0.8)", color: "#FFFDFB", border: "none", borderRadius: 999, padding: "8px 14px" }}>
              <CrossedEyeIcon size={16} />
              Ocultar
            </button>
          )}
        </div>

        {m.caption && (
          <figcaption style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 15, color: "rgba(255,253,251,0.85)", textAlign: "center", padding: "0 56px" }}>
            {m.caption}
          </figcaption>
        )}
      </figure>

      {total > 1 && (
        <>
          <button type="button" onClick={previous} aria-label="Anterior" className="fullscreen-arrow" style={{ ...roundButton, position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}>
            ‹
          </button>
          <button type="button" onClick={next} aria-label="Próxima" className="fullscreen-arrow" style={{ ...roundButton, position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>
            ›
          </button>
        </>
      )}
    </div>
  );
}
