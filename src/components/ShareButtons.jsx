"use client";

import { useEffect, useState } from "react";
import { colors, fonts } from "../theme.js";

// Share buttons on the animal's page.
//
// - Phone: "Compartilhar link" opens the system share sheet (WhatsApp,
//   Instagram, Messages...). The card with photo and name that shows up with
//   the link comes from src/app/animal/[slug]/opengraph-image.jsx.
// - Computer: WhatsApp and copy link.

function shareText(animal) {
  const she = animal.sex === "Fêmea";
  switch (animal.status) {
    case "in_treatment":
      return `${animal.name} está em tratamento e precisa de ajuda. Conheça a história:`;
    case "in_process":
      return `${animal.name} está quase indo para casa! Conheça a história:`;
    case "adopted":
      return `${animal.name} encontrou um lar! Conheça a história:`;
    default:
      return `Conheça ${she ? "a" : "o"} ${animal.name}, ${she ? "ela" : "ele"} está esperando um lar na AlimentaCão:`;
  }
}

const button = {
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, flex: "1 1 0",
  minWidth: 0, boxSizing: "border-box", fontFamily: fonts.heading, fontWeight: 700, fontSize: 14.5,
  color: colors.greenDark, background: colors.card, border: `1.5px solid ${colors.lineStrong}`,
  padding: "11px 14px", borderRadius: 999, cursor: "pointer", textDecoration: "none", whiteSpace: "nowrap"
};

function ShareIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v12" /><path d="M7 8l5-5 5 5" /><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    </svg>
  );
}

export default function ShareButtons({ animal }) {
  // The share sheet only exists in the browser: until the page mounts, the
  // computer version is shown.
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator.share === "function");
  }, []);

  const text = shareText(animal);
  const pageUrl = () => `${window.location.origin}/animal/${animal.slug}`;

  async function shareLink() {
    try {
      await navigator.share({ title: `${animal.name} · AlimentaCão`, text, url: pageUrl() });
    } catch {
      // Cancelled by the person: nothing to do.
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(pageUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copie o link:", pageUrl());
    }
  }

  return (
    <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${colors.line}` }}>
      <p style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 13, letterSpacing: "0.07em", textTransform: "uppercase", color: colors.ink3, margin: "0 0 10px" }}>
        {animal.status === "adopted"
          ? "Compartilhe esse final feliz"
          : `Ajude ${animal.sex === "Fêmea" ? "a" : "o"} ${animal.name} a ser ${animal.sex === "Fêmea" ? "vista" : "visto"}`}
      </p>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {canShare ? (
          <button type="button" onClick={shareLink} data-track="compartilhar" data-track-label={animal.name} style={button}>
            <ShareIcon /> Compartilhar link
          </button>
        ) : (
          <>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${text} https://alimentacao.org/animal/${animal.slug}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              data-track="compartilhar_whatsapp"
              data-track-label={animal.name}
              style={button}
            >
              WhatsApp
            </a>
            <button type="button" onClick={copyLink} data-track="copiar_link" data-track-label={animal.name} style={button}>
              {copied ? "Link copiado" : "Copiar link"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
