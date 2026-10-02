import Link from "next/link";
import Logo from "./Logo.jsx";
import { colors, fonts, maxWidth, gutter } from "../theme.js";
import { FEATURES } from "../data/features.js";
import { chatLink } from "../data/contact.js";

const navLink = { color: "#4A5A58", textDecoration: "none" };

export default function Header() {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(251,248,244,0.92)", backdropFilter: "blur(10px)", borderBottom: "1px solid #EDE4DA" }}>
      <div className="header-bar" style={{ maxWidth: maxWidth, margin: "0 auto", padding: `14px clamp(18px,5vw,32px)` }}>
        <Link href="/" className="header-logo" style={{ display: "flex", alignItems: "center", gap: 10, color: colors.ink, textDecoration: "none" }}>
          <Logo height={30} color={colors.green} />
          <span style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 19, letterSpacing: "-0.01em" }}>
            Alimenta<span style={{ color: colors.greenText }}>Cão</span>
          </span>
        </Link>
        <nav className="header-links" style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 15 }}>
          <a href="/#galeria" style={navLink}>Adotar</a>
          {FEATURES.sponsorship && <a href="/#apadrinhar" style={navLink}>Apadrinhar</a>}
          <Link href="/mural" className="header-link-wall" style={navLink}>Mural</Link>
          {FEATURES.donation && <a href="/#doar" className="header-link-donate" style={navLink}>Doar</a>}
          <a href="/#sobre" style={navLink}>Sobre nós</a>
        </nav>
        {FEATURES.donation ? (
          <a href="/#doar" className="header-cta" style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 15, background: colors.greenDark, color: colors.card, padding: "10px 18px", borderRadius: 999, textDecoration: "none", whiteSpace: "nowrap" }}>Doar agora</a>
        ) : (
          <a href={chatLink("Olá! Vi o site da AlimentaCão e quero falar com vocês.")} target="_blank" rel="noopener noreferrer" className="header-cta" style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 15, background: colors.greenDark, color: colors.card, padding: "10px 18px", borderRadius: 999, textDecoration: "none", whiteSpace: "nowrap" }}>Fale com a gente</a>
        )}
      </div>
    </header>
  );
}
