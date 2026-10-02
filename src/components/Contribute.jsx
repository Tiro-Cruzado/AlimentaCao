"use client";

import { useEffect, useState } from "react";
import { useLocationParts } from "../lib/useLocationParts.js";
import DonateForm from "./DonateForm.jsx";
import Sponsorship from "./Sponsorship.jsx";
import { colors, fonts, maxWidth, gutter } from "../theme.js";
import { FEATURES } from "../data/features.js";
import { ComingSoonBadge } from "./ComingSoon.jsx";

// Single contribution section, with a selector between donating once and
// sponsoring every month. The links keep working:
//   /#doar         opens on "Uma vez"
//   /#apadrinhar   opens on "Todo mês"
//   /?pagamento=…  (back from Mercado Pago, donation)    → "Uma vez"
//   /?apadrinhamento=ok (back from Mercado Pago, plan)   → "Todo mês"
//   /?apadrinhar=feijao (button on the animal's page)    → "Todo mês", with it selected

const ENABLED = { once: FEATURES.donation, monthly: FEATURES.sponsorship };
// Tab that opens first: the one-time donation, or the monthly one if only it is enabled.
const DEFAULT_MODE = ENABLED.once ? "once" : "monthly";

const OPTIONS = [
  { value: "once", label: "Uma vez", comingSoon: !ENABLED.once },
  { value: "monthly", label: "Todo mês", comingSoon: !ENABLED.monthly }
];

function modeFromUrl(hash, search) {
  const q = new URLSearchParams(search);
  let requested = null;
  if (hash === "#apadrinhar" || q.has("apadrinhamento") || q.has("apadrinhar")) requested = "monthly";
  else if (hash === "#doar") requested = "once";
  if (!requested) return null;
  // A link to a disabled tab opens whichever one is enabled.
  return ENABLED[requested] ? requested : DEFAULT_MODE;
}

export default function Contribute() {
  const { hash, search } = useLocationParts();
  const [mode, setMode] = useState(DEFAULT_MODE);

  // The mode follows the address: clicking "Apadrinhar" in the header already
  // flips the selector to "Todo mês", and "Doar agora" goes back to "Uma vez".
  useEffect(() => {
    const fromLink = modeFromUrl(hash, search);
    if (fromLink) setMode(fromLink);
  }, [hash, search]);

  return (
    <section id="doar" style={{ position: "relative", background: colors.background, borderBottom: `1px solid ${colors.line}`, padding: "clamp(60px,9vw,104px) 0" }}>
      {/* Sponsorship anchor: same section, the selector does the rest. */}
      <span id="apadrinhar" aria-hidden="true" style={{ position: "absolute", top: 0 }} />

      <div style={{ maxWidth: maxWidth, margin: "0 auto", padding: gutter }}>
        <p id="contribute-label" style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", color: colors.greenDark, margin: "0 0 12px" }}>
          Como você quer ajudar?
        </p>
        <div
          role="tablist"
          aria-labelledby="contribute-label"
          style={{ display: "inline-flex", gap: 4, background: colors.backgroundAlt, border: `1px solid ${colors.line}`, padding: 5, borderRadius: 999, maxWidth: "100%" }}
        >
          {OPTIONS.map((o) => {
            const active = mode === o.value;
            const locked = Boolean(o.comingSoon);
            return (
              <button
                key={o.value}
                role="tab"
                type="button"
                id={`tab-${o.value}`}
                aria-selected={active}
                aria-disabled={locked || undefined}
                disabled={locked}
                title={locked ? "Em breve" : undefined}
                aria-controls="contribute-panel"
                onClick={() => !locked && setMode(o.value)}
                style={{
                  fontFamily: fonts.heading, fontWeight: 700, fontSize: "clamp(14px,3.6vw,15.5px)",
                  padding: "12px 26px", minWidth: 120, borderRadius: 999, border: "none", cursor: locked ? "not-allowed" : "pointer",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                  whiteSpace: "nowrap", transition: "background .18s, color .18s, box-shadow .18s",
                  background: active ? colors.greenDark : "transparent",
                  color: active ? colors.card : locked ? colors.ink3 : colors.ink2,
                  boxShadow: active ? "0 2px 8px rgba(76,122,56,0.25)" : "none"
                }}
              >
                {o.label}
                {locked && <ComingSoonBadge small />}
              </button>
            );
          })}
        </div>

        <div
          id="contribute-panel"
          role="tabpanel"
          aria-labelledby={`tab-${mode}`}
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "clamp(32px,5vw,56px)", alignItems: "center", marginTop: "clamp(28px,4vw,44px)" }}
        >
          {mode === "monthly" ? <Sponsorship /> : <DonateForm />}
        </div>
      </div>
    </section>
  );
}
