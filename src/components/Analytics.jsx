"use client";

import { useEffect, useState } from "react";
import { colors, fonts } from "../theme.js";
import {
  GA_ID,
  OPEN_PREFERENCES_EVENT,
  clearAnalyticsCookies,
  loadAnalytics,
  readConsent,
  saveConsent,
  track
} from "../lib/analytics.js";

// Cookie banner + Google Analytics.
//
// - Nothing from Google loads before the visitor clicks "Aceitar".
// - The choice is remembered on this browser; "Cookies" in the footer reopens it.
// - Clicks are measured by the data-track attribute on links and buttons
//   (data-track="quero_adotar" data-track-label="Lala"). WhatsApp and e-mail
//   links without the attribute are counted as "abrir_whatsapp" / "abrir_email".
export default function Analytics() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!GA_ID) return;
    const consent = readConsent();
    if (consent === "accepted") loadAnalytics();
    if (consent === null) setOpen(true);

    const reopen = () => setOpen(true);
    window.addEventListener(OPEN_PREFERENCES_EVENT, reopen);

    const onClick = (e) => {
      const el = e.target.closest?.("a, button");
      if (!el) return;
      const name = el.dataset.track;
      const href = el.getAttribute("href") || "";
      if (name) {
        const params = {};
        if (el.dataset.trackLabel) params.label = el.dataset.trackLabel;
        if (el.dataset.trackValue) {
          params.value = Number(el.dataset.trackValue);
          params.currency = "BRL";
        }
        track(name, params);
      } else if (href.includes("wa.me/")) {
        track("abrir_whatsapp", { page: window.location.pathname });
      } else if (href.startsWith("mailto:")) {
        track("abrir_email", { page: window.location.pathname });
      }
    };
    document.addEventListener("click", onClick, true);

    return () => {
      window.removeEventListener(OPEN_PREFERENCES_EVENT, reopen);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  if (!GA_ID || !open) return null;

  function accept() {
    saveConsent("accepted");
    loadAnalytics();
    setOpen(false);
  }

  function reject() {
    const wasAccepted = readConsent() === "accepted";
    saveConsent("rejected");
    setOpen(false);
    if (wasAccepted) {
      clearAnalyticsCookies();
      // GA is already running on this page: reload to stop it.
      window.location.reload();
    }
  }

  const button = {
    fontFamily: fonts.heading, fontWeight: 700, fontSize: 14.5, padding: "10px 18px",
    borderRadius: 999, cursor: "pointer", whiteSpace: "nowrap"
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Uso de cookies"
      style={{
        position: "fixed", left: 16, right: 16, bottom: 16, zIndex: 1000, maxWidth: 560,
        margin: "0 auto", background: colors.card, border: `1px solid ${colors.line}`,
        borderRadius: 18, boxShadow: "0 10px 34px rgba(35,49,47,0.18)", padding: "16px 18px",
        display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12
      }}
    >
      <p style={{ flex: "1 1 260px", margin: 0, fontFamily: fonts.heading, fontWeight: 500, fontSize: 14, lineHeight: 1.5, color: colors.ink2 }}>
        🐾 Usamos cookies do Google Analytics para saber quantas pessoas visitam o site e o que ajuda mais os animais. Nada de anúncios.
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" onClick={reject} style={{ ...button, background: "transparent", color: colors.ink2, border: `1.5px solid ${colors.lineStrong}` }}>
          Recusar
        </button>
        <button type="button" onClick={accept} style={{ ...button, background: colors.greenDark, color: colors.card, border: "none" }}>
          Aceitar
        </button>
      </div>
    </div>
  );
}

// "Cookies" link in the footer: reopens the banner.
export function CookiePreferencesButton({ style }) {
  if (!GA_ID) return null;
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_PREFERENCES_EVENT))}
      style={{ background: "none", border: "none", padding: 0, cursor: "pointer", font: "inherit", textAlign: "left", ...style }}
    >
      Cookies
    </button>
  );
}
