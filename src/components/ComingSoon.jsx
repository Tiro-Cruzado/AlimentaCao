import { colors, fonts, maxWidth, gutter } from "../theme.js";

// "Em breve" (coming soon) label, used in the section, in the tab and in the card.
export function ComingSoonBadge({ small = false }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: fonts.heading,
        fontWeight: 700,
        fontSize: small ? 11 : 12.5,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        lineHeight: 1,
        color: colors.amberInk,
        background: colors.amberLight,
        border: `1px solid ${colors.amber}`,
        padding: small ? "4px 8px" : "7px 13px",
        borderRadius: 999,
        whiteSpace: "nowrap",
        verticalAlign: "middle"
      }}
    >
      Em breve
    </span>
  );
}

// Panel that takes the place of a section turned off in src/data/features.js.
// `icon` is the content of an <svg viewBox="3 3 18 18">.
export function ComingSoonPanel({ id, background = colors.backgroundAlt, bordered = false, icon, iconFilled = false, title, text, buttonLabel, href, children }) {
  return (
    <section id={id} style={{ position: "relative", background, borderBottom: bordered ? `1px solid ${colors.line}` : undefined, padding: "clamp(60px,9vw,104px) 0" }}>
      {children}
      <div style={{ maxWidth: maxWidth, margin: "0 auto", padding: gutter }}>
        <div
          style={{
            background: colors.card,
            border: `1px solid ${colors.line}`,
            borderRadius: 28,
            padding: "clamp(28px,5vw,52px)",
            display: "flex",
            flexWrap: "wrap",
            gap: "clamp(18px,3vw,32px)",
            alignItems: "start"
          }}
        >
          <span style={{ flex: "none", width: 64, height: 64, borderRadius: 20, background: colors.greenLight, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="34" height="34" viewBox="3 3 18 18" aria-hidden="true" fill={iconFilled ? colors.greenDark : "none"} stroke={iconFilled ? "none" : colors.greenDark} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              {icon}
            </svg>
          </span>
          <div style={{ flex: "1 1 300px" }}>
            <ComingSoonBadge />
            <h2 style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: "clamp(28px,4.6vw,40px)", lineHeight: 1.1, letterSpacing: "-0.02em", margin: "14px 0 0", color: colors.ink, textWrap: "balance" }}>
              {title}
            </h2>
            <p style={{ fontSize: "clamp(16px,2vw,18px)", lineHeight: 1.6, color: colors.ink2, margin: "14px 0 0", maxWidth: "36em" }}>
              {text}
            </p>
            {buttonLabel && (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-block", marginTop: 26, fontFamily: fonts.heading, fontWeight: 700, fontSize: 16, background: colors.greenDark, color: colors.card, padding: "14px 26px", borderRadius: 999, textDecoration: "none" }}
              >
                {buttonLabel}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
