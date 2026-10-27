import { ANIMALS, ANIMALS_ARE_SAMPLE, findAnimal } from "../../../data/animals.js";
import { FEATURES } from "../../../data/features.js";
import { CARD_SIZE, imageFile, renderCard } from "../../../lib/shareImage.jsx";

// Card that shows up when someone sends the animal's link on WhatsApp,
// Instagram, Facebook... Generated at build time, one per animal.
export const size = CARD_SIZE;
export const contentType = "image/jpeg";
export const alt = "Foto e nome do animal, com o convite da AlimentaCão";
export const dynamicParams = false;

export function generateStaticParams() {
  return FEATURES.gallery && !ANIMALS_ARE_SAMPLE ? ANIMALS.map((a) => ({ slug: a.slug })) : [];
}

export default async function Image({ params }) {
  const { slug } = await params;
  const animal = findAnimal(slug);
  return imageFile(await renderCard(animal), CARD_SIZE);
}
