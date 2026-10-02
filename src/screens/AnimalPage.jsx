"use client";

import { canBeSponsored } from "../lib/sponsorship.js";
import { findAnimal, waitingTime, speciesName, STATUS, SIZES, COMPATIBILITY } from "../data/animals.js";
import { FEATURES } from "../data/features.js";
import { adoptionLink } from "../data/contact.js";
import { useGallery, GalleryCover, GalleryGrid, Fullscreen } from "../components/MediaGallery.jsx";
import { colors, fonts, maxWidth, gutter } from "../theme.js";
import { useMounted } from "../lib/useMounted.js";

function Tag({ children, background, ink }) {
  return (
    <span style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", background: background, color: ink, padding: "6px 12px", borderRadius: 999 }}>
      {children}
    </span>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "11px 0", borderBottom: `1px solid ${colors.line}` }}>
      <span style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 14, color: colors.ink3 }}>{label}</span>
      <span style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 14, color: colors.ink, textAlign: "right" }}>{children}</span>
    </div>
  );
}

// The address (/animal/<slug>), the tab title and the 404 live in
// src/app/animal/[slug]/page.jsx. Only the slug arrives here.
export default function AnimalPage({ slug }) {
  const animal = findAnimal(slug);
  const gallery = useGallery(animal?.media);
  const hasCover = gallery.coverIndex >= 0;
  const mounted = useMounted();

  if (!animal) {
    return (
      <main style={{ maxWidth: 720, margin: "0 auto", padding: `clamp(60px,9vw,110px) clamp(18px,5vw,32px)` }}>
        <h1 style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: "clamp(26px,4vw,34px)", color: colors.ink, margin: 0 }}>
          Não encontramos esse animal
        </h1>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: colors.ink2 }}>
          O link pode estar errado, ou ele já foi adotado e saiu da lista.
        </p>
        <a href="/#galeria" style={{ fontFamily: fonts.heading, fontWeight: 700, color: colors.greenDark }}>
          Ver todos os animais
        </a>
      </main>
    );
  }

  const st = STATUS[animal.status] || STATUS.available;
  const adopted = animal.status === "adopted";
  // For animals already adopted, the clock stops at the adoption date.
  const waiting = waitingTime(
    animal.rescueDate,
    adopted && animal.adoptionDate ? new Date(animal.adoptionDate) : undefined
  );
  const size = SIZES[animal.size];

  const healthItems = [
    ["Castrado", animal.health.neutered],
    ["Vacinado", animal.health.vaccinated],
    ["Vermifugado", animal.health.dewormed]
  ];

  return (
    <main style={{ background: colors.background, paddingBottom: "clamp(50px,8vw,90px)" }}>
      <div style={{ maxWidth, margin: "0 auto", padding: gutter }}>

        <a
          href="/#galeria"
          style={{ display: "inline-block", fontFamily: fonts.heading, fontWeight: 700, fontSize: 14.5, color: colors.greenDark, textDecoration: "none", padding: "26px 0 20px" }}
        >
          ← Todos os animais
        </a>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <Tag background={st.background} ink={st.color}>{st.longLabel}</Tag>
          {animal.urgent && !adopted && <Tag background={colors.amber} ink={colors.amberInk}>cuidado urgente</Tag>}
        </div>

        <h1 style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: "clamp(34px,6vw,52px)", lineHeight: 1.05, letterSpacing: "-0.02em", color: colors.ink, margin: 0, textWrap: "balance" }}>
          {animal.name}
        </h1>
        <p style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 15, color: colors.ink3, margin: "10px 0 0", letterSpacing: "0.02em" }}>
          {speciesName(animal)} · {animal.age} · Porte {size.label} ({size.detail}) · {animal.sex}
        </p>

        <div className="animal-layout">

          <div style={{ minWidth: 0 }}>
            {/* Without a cover photo, the story moves up and takes its place.
                An empty frame makes the profile look abandoned — and an
                abandoned profile does not lead to adoption. */}
            <GalleryCover gallery={gallery} name={animal.name} />

            <section style={{ marginTop: hasCover ? 36 : 0 }}>
              <h2 style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 24, color: colors.ink, margin: "0 0 14px" }}>
                A história {animal.sex === "Fêmea" ? "da" : "do"} {animal.name}
              </h2>
              {!hasCover && (
                <p style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: "clamp(19px,2.4vw,23px)", lineHeight: 1.45, color: colors.ink, margin: "0 0 22px", maxWidth: "26em" }}>
                  {animal.summary}
                </p>
              )}
              {animal.story.map((p, idx) => (
                <p key={idx} style={{ fontSize: 17, lineHeight: 1.7, color: colors.ink2, margin: "0 0 16px", maxWidth: "62ch" }}>{p}</p>
              ))}
            </section>

            <GalleryGrid gallery={gallery} name={animal.name} />

            <section style={{ marginTop: 28 }}>
              <h2 style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 18, color: colors.ink, margin: "0 0 12px" }}>Temperamento</h2>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {animal.temperament.map((t) => (
                  <span key={t} style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 13.5, color: colors.greenDark, background: colors.greenLight, padding: "8px 14px", borderRadius: 999 }}>{t}</span>
                ))}
              </div>
            </section>
          </div>

          <aside className="animal-aside" style={{ background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 26, padding: "22px 24px" }}>
            <Row label="Situação">{st.longLabel}</Row>
            {waiting && (
              <Row label={adopted ? "Ficou conosco" : "Esperando há"}><span key={mounted ? "today" : "build"} suppressHydrationWarning>{waiting}</span></Row>
            )}
            <Row label="Onde está">{animal.location}</Row>
            <Row label="Porte">{size.label} · {size.detail}</Row>

            <h3 style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 13, letterSpacing: "0.07em", textTransform: "uppercase", color: colors.ink3, margin: "22px 0 10px" }}>
              Saúde
            </h3>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {healthItems.map(([label, ok]) => (
                <span key={label} style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 12.5, padding: "6px 11px", borderRadius: 999, background: ok ? colors.greenLight : colors.amberLight, color: ok ? colors.greenDark : "#8A5A12" }}>
                  {ok ? "✓" : "○"} {label}
                </span>
              ))}
            </div>
            {animal.health.notes && (
              <p style={{ fontSize: 14, lineHeight: 1.6, color: colors.ink2, margin: "12px 0 0" }}>{animal.health.notes}</p>
            )}

            <h3 style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 13, letterSpacing: "0.07em", textTransform: "uppercase", color: colors.ink3, margin: "22px 0 4px" }}>
              Convive bem com
            </h3>
            <Row label="Crianças"><span style={{ color: COMPATIBILITY[animal.goodWith.children].color }}>{COMPATIBILITY[animal.goodWith.children].label}</span></Row>
            <Row label="Cães"><span style={{ color: COMPATIBILITY[animal.goodWith.dogs].color }}>{COMPATIBILITY[animal.goodWith.dogs].label}</span></Row>
            <Row label="Gatos"><span style={{ color: COMPATIBILITY[animal.goodWith.cats].color }}>{COMPATIBILITY[animal.goodWith.cats].label}</span></Row>

            {adopted ? (
              <div style={{ marginTop: 22, background: colors.backgroundAlt, borderRadius: 18, padding: "16px 18px" }}>
                <p style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 15, color: colors.ink, margin: 0 }}>
                  Esse aqui deu certo.
                </p>
                <p style={{ fontSize: 14.5, lineHeight: 1.6, color: colors.ink2, margin: "6px 0 14px" }}>
                  Mantemos {animal.name} no site porque cada adoção concluída é a melhor prova de que vale tentar.
                </p>
                <a href="/#galeria" style={{ display: "inline-block", fontFamily: fonts.heading, fontWeight: 700, fontSize: 15, background: colors.greenDark, color: colors.card, padding: "12px 20px", borderRadius: 999, textDecoration: "none" }}>
                  Ver quem ainda espera
                </a>
              </div>
            ) : (
              <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
                <a
                  href={adoptionLink(animal.name)}
                  style={{ display: "block", textAlign: "center", fontFamily: fonts.heading, fontWeight: 700, fontSize: 16, background: colors.greenDark, color: colors.card, padding: "14px 20px", borderRadius: 999, textDecoration: "none" }}
                >
                  Quero adotar {animal.name}
                </a>
                {FEATURES.sponsorship && canBeSponsored(animal) ? (
                  <a
                    href={`/?apadrinhar=${animal.slug}#apadrinhar`}
                    style={{ display: "block", textAlign: "center", fontFamily: fonts.heading, fontWeight: 700, fontSize: 15, background: colors.card, color: colors.greenDark, border: `1.5px solid ${colors.lineStrong}`, padding: "13px 20px", borderRadius: 999, textDecoration: "none" }}
                  >
                    Apadrinhar {animal.name}
                  </a>
                ) : FEATURES.donation ? (
                  <a
                    href="/#doar"
                    style={{ display: "block", textAlign: "center", fontFamily: fonts.heading, fontWeight: 700, fontSize: 15, background: colors.card, color: colors.greenDark, border: `1.5px solid ${colors.lineStrong}`, padding: "13px 20px", borderRadius: 999, textDecoration: "none" }}
                  >
                    Ajudar com uma doação
                  </a>
                ) : null}
                <p style={{ fontSize: 13, lineHeight: 1.55, color: colors.ink3, margin: "2px 0 0", textAlign: "center" }}>
                  A adoção é gratuita. Conversamos antes para ter certeza de que a casa combina com {animal.name}.
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
      <Fullscreen gallery={gallery} name={animal.name} />
    </main>
  );
}
