import { chatLink } from "../data/contact.js";
import { ComingSoonPanel } from "./ComingSoon.jsx";

// Takes the place of the animal gallery in two cases:
//   - the gallery is turned off in src/data/features.js;
//   - the gallery is on but no animal is registered in Sanity yet
//     (`registering`), so the site never shows the sample animals as real.
// Keeps the id "galeria", so "Adotar" and "Conhecer os animais" still bring
// the person here.
export default function GalleryComingSoon({ registering = false }) {
  return (
    <ComingSoonPanel
      id="galeria"
      iconFilled
      icon={
        <>
          <ellipse cx="12" cy="15.5" rx="3.6" ry="3" />
          <circle cx="6.8" cy="11" r="1.6" />
          <circle cx="9.6" cy="7.4" r="1.6" />
          <circle cx="14.4" cy="7.4" r="1.6" />
          <circle cx="17.2" cy="11" r="1.6" />
        </>
      }
      title="Quem está esperando"
      text={
        registering
          ? "Estamos cadastrando os nossos animais para você conhecê-los direitinho por aqui. Enquanto os cadastros não ficam prontos, quem quiser adotar pode falar com a gente."
          : "Estamos fotografando cada um dos nossos animais para você conhecê-los direitinho por aqui. Enquanto a galeria não fica pronta, quem quiser adotar pode falar com a gente."
      }
      buttonLabel="Quero adotar"
      href={chatLink("Olá! Vi o site da AlimentaCão e tenho interesse em adotar.", "Interesse em adotar")}
    />
  );
}
