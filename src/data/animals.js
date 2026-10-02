import generated from "./animals.generated.json";
import { SEED } from "./animals.seed.js";

// Data model for AlimentaCão's animals.
//
// adoptionDate: fill it in together with status "adopted". It is what makes the
// site say "stayed with us for 8 months" instead of counting up to today.
//
// media: each item is { type: "image" | "video", src, alt, caption }.
// `thumbnail` (optional) is a light version used in the "Fotos e vídeos" grid;
// the Sanity sync generates it by itself. Without it, the grid uses `src`.
// A photo or video that shows a wound, surgery or mistreatment also takes
// `sensitive: true`: it shows up blurred on the animal's page until the person
// clicks to see it, and it is never the cover.
// While there is no real file, leave `src` empty ("") — the interface shows
// a placeholder in its place, without breaking. To publish a real photo,
// put the file in /public/animais/ and point src: "/animais/feijao-1.jpg".
// Video also accepts `poster` (cover image) and must be .mp4 to play in
// every browser.
//
// status: an adopted animal is NEVER deleted. It becomes social proof — whoever
// is thinking about adopting needs to see that the NGO delivers happy endings.

export const STATUS = {
  available: {
    value: "available",
    label: "Para adoção",
    longLabel: "Esperando um lar",
    color: "#467333",
    background: "#EAF2E4",
  },
  in_process: {
    value: "in_process",
    label: "Em processo",
    longLabel: "Em processo de adoção",
    color: "#3A5A80",
    background: "#E4EDF2",
  },
  in_treatment: {
    value: "in_treatment",
    label: "Em tratamento",
    longLabel: "Em tratamento veterinário",
    color: "#8A5A12",
    background: "#FBEEDF",
  },
  adopted: {
    value: "adopted",
    label: "Adotados",
    longLabel: "Já encontrou um lar",
    color: "#5A6A68",
    background: "#ECEFE8",
  },
};

export const SIZES = {
  small: { value: "small", label: "Pequeno", detail: "até 10 kg" },
  medium: { value: "medium", label: "Médio", detail: "10 a 25 kg" },
  large: { value: "large", label: "Grande", detail: "acima de 25 kg" },
};

export const SPECIES = {
  dog: { value: "dog", label: "Cão", plural: "Cães" },
  cat: { value: "cat", label: "Gato", plural: "Gatos" },
  // Everything that is neither dog nor cat: horse, rabbit, bird... The name of
  // the animal goes in its `speciesOther` field ("Cavalo") and is what shows up
  // on the card.
  other: { value: "other", label: "Outro", plural: "Outros" },
};

export function speciesName(animal) {
  if (animal?.species === "other" && animal.speciesOther) return animal.speciesOther;
  return (SPECIES[animal?.species] || SPECIES.other).label;
}

// "untested" is an honest and important answer: saying "yes" without having
// tested leads to the animal being returned, the worst possible outcome for it.
export const COMPATIBILITY = {
  yes: { label: "Sim", color: "#467333" },
  no: { label: "Não", color: "#A34428" },
  untested: { label: "Não testado", color: "#5F6D6B" },
};

// The animals come from Sanity, synced at build time by
// `npm run sync` (scripts/sync-content.mjs).
//
// While nothing is registered in Sanity, ANIMALS holds the sample list, but
// the site does not show it: the home page puts a "we are registering our
// animals" panel in place of the gallery and the animal pages redirect to the
// home page (see ANIMALS_ARE_SAMPLE in src/screens/Home.jsx and
// src/app/animal/[slug]/page.jsx). An adoption site showing made-up animals
// as if they were real would make someone leave home for nothing.

const REAL = Array.isArray(generated) ? generated : [];

export const ANIMALS_ARE_SAMPLE = REAL.length === 0;

export const ANIMALS = ANIMALS_ARE_SAMPLE ? SEED : REAL;

export const PER_PAGE = 6;

export function findAnimal(slug) {
  return ANIMALS.find((a) => a.slug === slug);
}

// Waiting time is a piece of data that converts: "esperando há 1 ano e 3 meses"
// weighs more than any appeal text.
export function waitingTime(rescueDate, reference = new Date()) {
  const start = new Date(rescueDate);
  if (Number.isNaN(start.getTime())) return null;
  let months =
    (reference.getFullYear() - start.getFullYear()) * 12 +
    (reference.getMonth() - start.getMonth());
  if (reference.getDate() < start.getDate()) months -= 1;
  if (months < 1) return "menos de um mês";
  if (months < 12) return months === 1 ? "1 mês" : `${months} meses`;
  const years = Math.floor(months / 12);
  const remainder = months % 12;
  const yearPart = years === 1 ? "1 ano" : `${years} anos`;
  if (remainder === 0) return yearPart;
  return `${yearPart} e ${remainder === 1 ? "1 mês" : `${remainder} meses`}`;
}

// A media item only counts when it has a file. Until the NGO does the photo
// shoot, the interface hides the gallery instead of showing an empty frame.
export function hasMedia(animal) {
  return Boolean(animal?.media?.some((m) => m && m.src));
}

// A sensitive photo never becomes the cover: the gallery card has no way to ask
// for confirmation before showing it.
export function coverPhoto(animal) {
  return (
    (animal?.media || []).find(
      (m) => m.type === "image" && m.src && !m.sensitive,
    ) || null
  );
}
