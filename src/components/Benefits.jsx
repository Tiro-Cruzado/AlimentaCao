import { fonts } from "../theme.js";
import { SPONSORSHIP } from "../data/payment.js";
import { FEATURES } from "../data/features.js";
import { ComingSoonBadge } from "./ComingSoon.jsx";

// Lowest sponsorship amount, so the card follows the configuration.
const LOWEST_SPONSORSHIP = Math.min(...SPONSORSHIP.amounts.map((v) => v.amount));

// Simple hand-drawn icons (stroke, no library), one per way of helping.
const ICONS = {
  house: (
    <path d="M4 11.5 12 5l8 6.5M6.5 10v8.5h11V10M10 18.5v-4.5h4v4.5" />
  ),
  heart: (
    <path d="M12 19s-7-4.4-7-9.3C5 7.1 6.9 5.5 9 5.5c1.3 0 2.4.7 3 1.7.6-1 1.7-1.7 3-1.7 2.1 0 4 1.6 4 4.2 0 4.9-7 9.3-7 9.3Z" />
  ),
  calendar: (
    <>
      <path d="M5 7.5h14v11.5H5zM5 11h14M9 5v4M15 5v4" />
      <path d="M12 17.4s-2.5-1.5-2.5-3.2c0-.9.6-1.5 1.3-1.5.5 0 .9.3 1.2.7.3-.4.7-.7 1.2-.7.7 0 1.3.6 1.3 1.5 0 1.7-2.5 3.2-2.5 3.2Z" />
    </>
  ),
  paw: (
    <>
      <ellipse cx="12" cy="15.5" rx="3.6" ry="3" />
      <circle cx="6.8" cy="11" r="1.6" />
      <circle cx="9.6" cy="7.4" r="1.6" />
      <circle cx="14.4" cy="7.4" r="1.6" />
      <circle cx="17.2" cy="11" r="1.6" />
    </>
  )
};

const ITEMS = [
  { icon: "house", background: "#FBEEDF", ink: "#B8741A", title: "Seja lar temporário", text: "Abrigar um animal por algumas semanas não custa nada e é o que mais falta. A ONG cobre ração e veterinário." },
  { icon: "heart", background: "#EAF2E4", ink: "#467333", title: "Doe uma vez", comingSoon: !FEATURES.donation, text: FEATURES.donation ? "Qualquer valor entra no caixa de ração, castração e emergências veterinárias do mês." : "Em breve você vai poder doar qualquer valor pelo site, para ração, castração e emergências veterinárias." },
  { icon: "calendar", background: "#F6E7E4", ink: "#A34E3F", title: "Apadrinhe", comingSoon: !FEATURES.sponsorship, text: FEATURES.sponsorship ? `Escolha um animal e contribua todo mês com os cuidados dele, a partir de R$ ${LOWEST_SPONSORSHIP}. Cancele quando quiser.` : "Em breve você vai poder escolher um animal e contribuir todo mês com os cuidados dele." },
  { icon: "paw", background: "#E4EDF2", ink: "#3A5A80", title: "Adote", text: "Conheça quem está esperando um lar. A adoção é gratuita, e a gente conversa antes para ter certeza de que a casa combina com o animal." }
];

export default function Benefits() {
  return (
    <section className="benefits" style={{ maxWidth: 1160, margin: "0 auto", padding: "clamp(24px,6vh,64px) clamp(18px,5vw,32px) clamp(120px,30vh,280px)" }}>
      <div className="benefits-grid">
        {ITEMS.map((it, i) => (
          <div key={it.title} className="benefit" style={{ transitionDelay: `${i * 120}ms`, background: "#FFFDFB", border: "1px solid #EDE4DA", borderRadius: 28, padding: 30, boxShadow: "0 18px 50px rgba(0,0,0,0.28)" }}>
            <span aria-hidden="true" style={{ width: 48, height: 48, borderRadius: 16, background: it.background, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="30" height="30" viewBox="3 3 18 18" fill={it.icon === "paw" ? it.ink : "none"} stroke={it.icon === "paw" ? "none" : it.ink} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                {ICONS[it.icon]}
              </svg>
            </span>
            <h2 style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 20, margin: "20px 0 8px", color: "#23312F", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>{it.title}{it.comingSoon && <ComingSoonBadge small />}</h2>
            <p style={{ fontSize: 16, lineHeight: 1.6, color: "#50605E", margin: 0 }}>{it.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
