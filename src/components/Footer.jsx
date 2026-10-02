import Logo from "./Logo.jsx";
import { instagramProfile } from "../data/social.js";
import { FEATURES } from "../data/features.js";
import { CONTACT } from "../data/contact.js";

function formatPhone(number) {
  const n = number.replace(/^55/, "");
  return `(${n.slice(0, 2)}) ${n.slice(2, -4)}-${n.slice(-4)}`;
}
export default function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid #EDE4DA",
        padding: "clamp(36px,6vw,52px) 0 clamp(32px,5vw,44px)",
      }}
    >
      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          padding: "0 clamp(18px,5vw,32px)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "clamp(28px,4vw,40px)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Logo height={28} />
            <span
              style={{
                fontFamily: "Quicksand,sans-serif",
                fontWeight: 700,
                fontSize: 19,
                color: "#23312F",
              }}
            >
              Alimenta<span style={{ color: "#5E934A" }}>Cão</span>
            </span>
          </div>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.6,
              color: "#5F6D6B",
              margin: "16px 0 0",
              maxWidth: "26em",
            }}
          >
            Organização sem fins lucrativos de Assis - SP, mantida por
            voluntários e por quem doa.
          </p>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            fontFamily: "Quicksand,sans-serif",
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          <span style={{ color: "#23312F", fontWeight: 700 }}>Site</span>
          <a
            href="/#galeria"
            style={{ color: "#5F6D6B", textDecoration: "none" }}
          >
            Adotar
          </a>
          {FEATURES.donation && (
            <a
              href="/#doar"
              style={{ color: "#5F6D6B", textDecoration: "none" }}
            >
              Doar
            </a>
          )}
          {FEATURES.sponsorship && (
            <a
              href="/#apadrinhar"
              style={{ color: "#5F6D6B", textDecoration: "none" }}
            >
              Apadrinhar
            </a>
          )}
          <a href="/mural" style={{ color: "#5F6D6B", textDecoration: "none" }}>
            Mural
          </a>
          {instagramProfile && (
            <a
              href={instagramProfile}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#5F6D6B", textDecoration: "none" }}
            >
              Instagram
            </a>
          )}
          <a
            href="/#sobre"
            style={{ color: "#5F6D6B", textDecoration: "none" }}
          >
            Sobre nós
          </a>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            fontFamily: "Quicksand,sans-serif",
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          <span style={{ color: "#23312F", fontWeight: 700 }}>Contato</span>
          <span style={{ color: "#5F6D6B" }}>contato@alimentacao.org</span>
          {CONTACT.whatsapp && (
            <a
              href={`https://wa.me/${CONTACT.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#5F6D6B", textDecoration: "none" }}
            >
              WhatsApp {formatPhone(CONTACT.whatsapp)}
            </a>
          )}
          <span style={{ color: "#5F6D6B" }}>Assis - SP</span>
        </div>
      </div>
    </footer>
  );
}
