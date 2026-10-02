import { colors } from "../theme.js";
import { chatLink } from "../data/contact.js";
import { ComingSoonPanel } from "./ComingSoon.jsx";

// Takes the place of the donation and sponsorship section when both are
// turned off in src/data/features.js. Keeps the ids "doar" and "apadrinhar",
// so no old link lands on nothing.
export default function ContributeComingSoon() {
  return (
    <ComingSoonPanel
      id="doar"
      background={colors.background}
      bordered
      icon={<path d="M12 19s-7-4.4-7-9.3C5 7.1 6.9 5.5 9 5.5c1.3 0 2.4.7 3 1.7.6-1 1.7-1.7 3-1.7 2.1 0 4 1.6 4 4.2 0 4.9-7 9.3-7 9.3Z" />}
      title="Doação e apadrinhamento"
      text="Estamos preparando a doação e o apadrinhamento pelo site. Enquanto isso, quem quiser ajudar pode falar com a gente."
      buttonLabel="Quero ajudar"
      href={chatLink("Olá! Vi o site da AlimentaCão e quero ajudar.", "Quero ajudar")}
    >
      <span id="apadrinhar" aria-hidden="true" style={{ position: "absolute", top: 0 }} />
    </ComingSoonPanel>
  );
}
