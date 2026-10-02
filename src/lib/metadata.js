import { ANIMALS, speciesName } from "../data/animals.js";

// Title and description per page. They are what shows up in the Google result and in
// the card when someone shares the link on WhatsApp — for an NGO, it is the shop window.

export const SITE = {
  name: "AlimentaCão",
  title: "AlimentaCão — adoção de cães e gatos resgatados em Assis - SP",
  description:
    "ONG de Assis - SP. Conheça os cães e gatos resgatados que estão esperando um lar. Adoção gratuita e responsável, com castração e vacinação em dia."
};

export function wallMetadata() {
  return {
    title: "Mural · AlimentaCão",
    description: "Feiras de adoção, animais que encontraram uma família, resgates e o dia a dia da AlimentaCão, em fotos e vídeos."
  };
}

export function animalMetadata(slug) {
  const animal = ANIMALS.find((a) => a.slug === slug);
  if (!animal) return null;
  const species = speciesName(animal);
  const size = { small: "pequeno", medium: "médio", large: "grande" }[animal.size];
  return {
    title: `${animal.name} · ${species} para adoção · AlimentaCão`,
    description: `${animal.name}, ${species.toLowerCase()} de porte ${size}, ${animal.age}. ${animal.summary}`.slice(0, 300)
  };
}

// Format that Next expects in `metadata` / `generateMetadata`.
export function toNextMetadata({ title, description }) {
  return {
    title,
    description,
    openGraph: { title, description, type: "website", locale: "pt_BR", siteName: SITE.name }
  };
}
