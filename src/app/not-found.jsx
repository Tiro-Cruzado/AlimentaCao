import { colors, fonts } from "../theme.js";

export const metadata = { title: "Página não encontrada · AlimentaCão" };

export default function NotFound() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "clamp(60px,9vw,110px) clamp(18px,5vw,32px)" }}>
      <h1 style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: "clamp(26px,4vw,34px)", color: colors.ink, margin: 0 }}>
        Não encontramos essa página
      </h1>
      <p style={{ fontSize: 17, lineHeight: 1.6, color: colors.ink2 }}>
        O link pode estar errado. Se você procurava um animal, ele pode já ter sido adotado e saído da lista.
      </p>
      <a href="/#galeria" style={{ fontFamily: fonts.heading, fontWeight: 700, color: colors.greenDark }}>
        Ver todos os animais
      </a>
    </main>
  );
}
