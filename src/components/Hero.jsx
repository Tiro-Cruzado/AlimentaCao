import { colors, fonts } from "../theme.js";
import { FEATURES } from "../data/features.js";

// Text side of the opening: tag, phrase, calls to action and the carousel
// controls. The photos, the curve and the cards live in Opening.jsx.
export default function Hero({ slides = [], current = 0, onSelect, paused = false, onTogglePause }) {
  const phrase = slides[current]?.phrase || "Um prato cheio e um lar à vista.";
  const many = slides.length > 1;
  return (
    <div
      id="topo"
      className="hero-content"
      style={{
        // Left edge lines up with the rest of the site (1160px column).
        padding: "56px clamp(24px,4vw,56px) 56px max(clamp(18px,5vw,32px), calc((100vw - 1160px) / 2 + 32px))"
      }}
    >
      {/* The h1 is the line with what people search on Google ("projeto social", "animais",
          "Assis"). The phrase below keeps the big look, as a paragraph. */}
      <h1 className="hero-badge" style={{ display: "inline-block", margin: 0, lineHeight: "inherit", fontFamily: fonts.heading, fontWeight: 600, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: "#34492A", background: colors.greenLight, padding: "8px 16px", borderRadius: 999 }}>
        Projeto social de resgate animal · Assis - SP
      </h1>

      {/* The phrase changes with the photo (src/data/opening.js). The key makes
          each new phrase fade in. */}
      <p key={current} className="hero-title hero-phrase" style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: "clamp(34px,4.6vw,58px)", lineHeight: 1.04, letterSpacing: "-0.025em", margin: "22px 0 0", maxWidth: "10em", textWrap: "balance" }}>
        {phrase}
      </p>

      <p className="hero-text" style={{ fontSize: "clamp(16px,1.5vw,18px)", lineHeight: 1.6, margin: "20px 0 0", maxWidth: "30em" }}>
        A AlimentaCão é um projeto social que resgata e ajuda cães e gatos abandonados nas ruas de Assis, no interior de São Paulo, até que encontrem uma família.
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 30 }}>
        <a href="#galeria" className="hero-cta-primary">
          Conhecer os animais
        </a>
        {FEATURES.donation && (
          <a href="#doar" className="hero-cta-secondary">
            Fazer uma doação
          </a>
        )}
      </div>

      {many && (
        <div role="group" aria-label="Fotos da abertura" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 30 }}>
          <button type="button" className="hero-round" onClick={() => onSelect?.(current - 1)} aria-label="Foto anterior">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M8.5 2.5 4 7l4.5 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => onSelect?.(i)}
              aria-label={`Foto ${i + 1} de ${slides.length}: ${s.alt}`}
              aria-current={i === current ? "true" : undefined}
              className={`hero-dot${i === current ? " is-current" : ""}`}
            />
          ))}
          <button type="button" className="hero-round" onClick={() => onSelect?.(current + 1)} aria-label="Próxima foto">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M5.5 2.5 10 7l-4.5 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          <button type="button" className="hero-round" onClick={onTogglePause} aria-label={paused ? "Continuar a troca de fotos" : "Pausar a troca de fotos"} style={{ width: 32, height: 32, marginLeft: 4, borderColor: "rgba(255,253,251,0.35)" }}>
            {paused ? (
              <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z" fill="currentColor" /></svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" fill="currentColor" /></svg>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
