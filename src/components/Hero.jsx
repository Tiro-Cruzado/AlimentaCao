import { colors, fonts, maxWidth } from "../theme.js";
import { FEATURES } from "../data/features.js";

// Title and calls to action of the opening. The background photo and the scroll effect live in
// Opening.jsx, which wraps this component and the Benefits cards.
export default function Hero() {
  return (
      <div
        id="topo"
        className="hero-content"
        style={{
          maxWidth: maxWidth, margin: "0 auto",
          padding: "clamp(56px,10vw,104px) clamp(18px,5vw,32px) clamp(44px,7vw,72px)"
        }}
      >
        <span className="hero-badge" style={{ display: "inline-block", fontFamily: fonts.heading, fontWeight: 600, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.greenDark, background: colors.greenLight, padding: "8px 16px", borderRadius: 999 }}>
          ONG de resgate animal · Assis - SP
        </span>

        <h1 className="hero-title" style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: "clamp(38px,7vw,68px)", lineHeight: 1.04, letterSpacing: "-0.025em", margin: "24px 0 0", maxWidth: "11em", textWrap: "balance" }}>
          Um prato cheio e um lar à vista.
        </h1>

        <p className="hero-text" style={{ fontSize: "clamp(17px,2.2vw,20px)", lineHeight: 1.6, margin: "24px 0 0", maxWidth: "30em" }}>
          A AlimentaCão cuida de cães e gatos resgatados das ruas de Assis, no interior de São Paulo, até que encontrem uma família. Enquanto isso, cada doação vira ração, vacina e veterinário para um animal com nome e história.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 36 }}>
          <a href="#galeria" style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 16, background: colors.greenDark, color: colors.card, padding: "16px 28px", borderRadius: 999, textDecoration: "none" }}>
            Conhecer os animais
          </a>
          {FEATURES.donation && (
            <a href="#doar" style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 16, background: colors.card, color: colors.greenDark, padding: "16px 28px", borderRadius: 999, border: `1.5px solid ${colors.lineStrong}`, textDecoration: "none" }}>
              Fazer uma doação
            </a>
          )}
        </div>
      </div>
  );
}
