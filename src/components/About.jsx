export default function About() {
  return (
    <section
      id="sobre"
      style={{
        maxWidth: 1160,
        margin: "0 auto",
        padding: "clamp(60px,9vw,112px) clamp(18px,5vw,32px)",
      }}
    >
      <div style={{ maxWidth: "46em" }}>
        <div>
          <span
            style={{
              display: "inline-block",
              fontFamily: "Quicksand,sans-serif",
              fontWeight: 600,
              fontSize: 13,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#467333",
              background: "#EAF2E4",
              padding: "8px 16px",
              borderRadius: 999,
            }}
          >
            Sobre nós
          </span>
          <h2
            style={{
              fontFamily: "Quicksand,sans-serif",
              fontWeight: 700,
              fontSize: "clamp(28px,5vw,40px)",
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              margin: "20px 0 0",
              color: "#23312F",
            }}
          >
            Começou com uma panela de comida na calçada
          </h2>
          <p
            style={{
              fontSize: "clamp(16px,2vw,18px)",
              lineHeight: 1.65,
              color: "#50605E",
              margin: "16px 0 0",
            }}
          >
            Hoje somos uma organização sem fins lucrativos de Assis - SP,
            formada por voluntários, sem abrigo fixo: cada animal fica em uma casa até ser
            adotado. Não recusamos casos graves.
          </p>
          <div
            style={{
              display: "flex",
              gap: 32,
              marginTop: 30,
              flexWrap: "wrap",
            }}
          >
            <div>
              <p
                style={{
                  fontFamily: "Quicksand,sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#23312F",
                  margin: 0,
                }}
              >
                Lares temporários
              </p>
              <p
                style={{
                  fontFamily: "Quicksand,sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#5F6D6B",
                  margin: "4px 0 0",
                }}
              >
                Nenhum animal em canil coletivo
              </p>
            </div>
            <div>
              <p
                style={{
                  fontFamily: "Quicksand,sans-serif",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "#23312F",
                  margin: 0,
                }}
              >
                Adoção acompanhada
              </p>
              <p
                style={{
                  fontFamily: "Quicksand,sans-serif",
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#5F6D6B",
                  margin: "4px 0 0",
                }}
              >
                Entrevista, visita e retorno em 30 dias
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
