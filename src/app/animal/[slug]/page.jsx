import { notFound, redirect } from "next/navigation";
import AnimalPage from "../../../screens/AnimalPage.jsx";
import { ANIMALS, ANIMALS_ARE_SAMPLE, findAnimal } from "../../../data/animals.js";
import { FEATURES } from "../../../data/features.js";
import { animalMetadata, toNextMetadata } from "../../../lib/metadata.js";

// Animal pages exist only for animals registered in Sanity: with the gallery
// off, or with nothing registered yet, there is no page to show.
const GALLERY_ON = FEATURES.gallery && !ANIMALS_ARE_SAMPLE;

// One page per animal, generated at build time: it opens fast and shows up on
// Google and in the WhatsApp card with the animal's name and summary.
export function generateStaticParams() {
  return GALLERY_ON ? ANIMALS.map((a) => ({ slug: a.slug })) : [];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = GALLERY_ON ? animalMetadata(slug) : null;
  return data ? toNextMetadata(data) : {};
}

export default async function Page({ params }) {
  const { slug } = await params;
  // Without the gallery, an old animal link lands on the home page.
  if (!GALLERY_ON) redirect("/");
  if (!findAnimal(slug)) notFound();
  return <AnimalPage slug={slug} />;
}
