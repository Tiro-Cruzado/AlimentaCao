// Simple hand-drawn icons (stroke, no library), one per category.
const ICONS = {
  food: (
    <>
      <path d="M4 11.5h16l-1.5 5.8a2 2 0 0 1-1.9 1.5H7.4a2 2 0 0 1-1.9-1.5L4 11.5Z" />
      <path d="M7.5 11.5a4.5 4.5 0 0 1 9 0" />
      <path d="M12 3.5v1.6M8.2 4.7l.8 1.3M15.8 4.7 15 6" />
    </>
  ),
  vet: <path d="M10 4.5h4V10h5.5v4H14v5.5h-4V14H4.5v-4H10V4.5Z" />,
  neutering: (
    <>
      <path d="M12 3.8 19 6.4v5.2c0 4.1-2.8 7.2-7 8.6-4.2-1.4-7-4.5-7-8.6V6.4l7-2.6Z" />
      <path d="m8.8 12 2.3 2.3 4.2-4.6" />
    </>
  ),
  transport: (
    <>
      <path d="M3 7h10.5v9.5H3zM13.5 10h4l3 3.2v3.3h-7" />
      <circle cx="7.3" cy="17.3" r="1.7" />
      <circle cx="16.8" cy="17.3" r="1.7" />
    </>
  )
};

// The percentages are sample values: replace with the NGO's real numbers.
const ITEMS = [
  { icon: "food", label: "Ração e alimentação", pct: 46, color: "#7FB069", text: "Ração para adultos e filhotes, leite e alimentação especial para quem está em tratamento." },
  { icon: "vet", label: "Veterinário e cirurgias", pct: 34, color: "#F0A868", text: "Consultas, exames, remédios, internações e cirurgias de emergência." },
  { icon: "neutering", label: "Castração", pct: 14, color: "#B6C9A8", text: "Castração dos animais resgatados, para que não nasçam mais filhotes na rua." },
  { icon: "transport", label: "Transporte e materiais", pct: 6, color: "#A7BE99", text: "Combustível para os resgates, caminhas, coleiras e produtos de limpeza." }
];

const heading = { fontFamily: "Quicksand,sans-serif", fontWeight: 700, color: "#23312F" };

export default function Transparency() {
  return (
    <section style={{ maxWidth: 1160, margin: "0 auto", padding: "0 clamp(18px,5vw,32px) clamp(60px,9vw,112px)" }}>
      <div style={{ background: "#F5EFE6", borderRadius: 34, padding: "clamp(28px,4vw,48px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "clamp(32px,5vw,64px)", alignItems: "center" }}>
        <div>
          <h2 style={{ ...heading, fontSize: "clamp(26px,4vw,32px)", lineHeight: 1.15, letterSpacing: "-0.02em", margin: 0 }}>
            Para onde vai o dinheiro
          </h2>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "#50605E", margin: "16px 0 0" }}>
            A AlimentaCão é mantida por voluntários e por quem doa. As doações pagam o cuidado direto com os animais, do resgate até a adoção.
          </p>

          {/* What goes into each part of the bar. The little square on each row
              has the same colour as the matching segment. */}
          <ul style={{ listStyle: "none", margin: "28px 0 0", padding: 0, display: "grid", gap: 18 }}>
            {ITEMS.map((it) => (
              <li key={it.label} style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 14, alignItems: "start" }}>
                <span aria-hidden="true" style={{ width: 44, height: 44, borderRadius: 14, background: it.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#23312F" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    {ICONS[it.icon]}
                  </svg>
                </span>
                <div>
                  <p style={{ ...heading, fontSize: 16, lineHeight: 1.3, margin: 0 }}>{it.label}</p>
                  <p style={{ fontSize: 15, lineHeight: 1.5, color: "#50605E", margin: "3px 0 0" }}>{it.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* A single bar, standing up. Each segment has a height proportional to the
            percentage, and the name sits next to the matching segment. On very
            narrow screens, a name that wraps onto two lines grows the segment
            instead of overflowing the card. */}
        <ul
          aria-label="Distribuição das doações"
          style={{
            listStyle: "none", margin: 0, padding: 0,
            display: "grid",
            gridTemplateColumns: "clamp(40px,11vw,56px) 1fr",
            gridTemplateRows: ITEMS.map((it) => `minmax(min-content, ${it.pct}fr)`).join(" "),
            columnGap: "clamp(12px,3vw,18px)", rowGap: 3,
            height: 380
          }}
        >
          {ITEMS.map((it, i) => (
            <li key={it.label} style={{ display: "contents" }}>
              <span
                aria-hidden="true"
                style={{
                  background: it.color,
                  borderRadius: `${i === 0 ? "16px 16px" : "3px 3px"} ${i === ITEMS.length - 1 ? "16px 16px" : "3px 3px"}`
                }}
              />
              <span style={{ ...heading, alignSelf: "center", minHeight: 18, display: "flex", alignItems: "baseline", gap: "clamp(6px,2vw,10px)", fontSize: "clamp(13.5px,3.8vw,15px)", lineHeight: 1.2 }}>
                <span style={{ flex: "none", width: "clamp(46px,14vw,60px)", fontSize: i === 0 ? "clamp(22px,6.6vw,28px)" : i === 1 ? "clamp(20px,5.6vw,23px)" : "clamp(16px,4.6vw,18px)", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{it.pct}%</span>
                <span>{it.label}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
