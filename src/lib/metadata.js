import { ANIMALS, speciesName } from "../data/animals.js";
import { CONTACT } from "../data/contact.js";
import { instagramProfile } from "../data/social.js";

// Public address of the site: canonical links, sitemap, share cards. On
// Vercel, SITE_URL wins; production falls back to the official domain.
export const SITE_ORIGIN = (
  process.env.SITE_URL ||
  (process.env.VERCEL_ENV === "production" ? "https://alimentacao.org" : "") ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/$/, "");

// Title and description per page. They are what shows up in the Google result and in
// the card when someone shares the link on WhatsApp — for a social project, it is the shop window.

// The title and description carry the words people type on Google ("projeto
// social", "ajuda", "resgate", "animais", "Assis", "adoção", "cães e gatos").
export const SITE = {
  name: "AlimentaCão",
  title: "AlimentaCão — Projeto social de ajuda e resgate de animais em Assis-SP",
  description:
    "Projeto social de Assis-SP que resgata e ajuda animais abandonados: cães e gatos recebem ração, vacina, castração e veterinário até a adoção responsável. Adote, doe ou seja lar temporário."
};

export function wallMetadata() {
  return {
    title: "Mural · AlimentaCão, projeto social de animais em Assis-SP",
    path: "/mural",
    description: "Feiras de adoção, resgates de animais em Assis-SP, cães e gatos que encontraram uma família e o dia a dia do projeto AlimentaCão, em fotos e vídeos."
  };
}

export function animalMetadata(slug) {
  const animal = ANIMALS.find((a) => a.slug === slug);
  if (!animal) return null;
  const species = speciesName(animal);
  const size = { small: "pequeno", medium: "médio", large: "grande" }[animal.size];
  return {
    path: `/animal/${animal.slug}`,
    title: `${animal.name} · ${species} para adoção em Assis-SP · AlimentaCão`,
    description: `${animal.name}, ${species.toLowerCase()}${size ? ` de porte ${size}` : ""}, ${animal.age}. ${animal.summary}`.slice(0, 300)
  };
}

// Format that Next expects in `metadata` / `generateMetadata`. `path` gives
// the canonical address, so Google never splits the ranking between
// alimentacao.org, www.alimentacao.org and the vercel.app address.
export function toNextMetadata({ title, description, path }) {
  return {
    title,
    description,
    ...(path ? { alternates: { canonical: path } } : {}),
    openGraph: { title, description, type: "website", locale: "pt_BR", siteName: SITE.name, ...(path ? { url: path } : {}) }
  };
}

// Structured data (schema.org): tells Google, in its own format, that this is
// a social project in Assis - SP, with contact and Instagram. It feeds the panel
// on the side of the results and the local searches ("projeto social animais Assis").
// "Organization" and not "NGO": the project is not a registered entity yet.
export function organizationJsonLd() {
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_ORIGIN}/#projeto`,
    name: SITE.name,
    alternateName: ["Projeto AlimentaCão", "AlimentaCao", "AlimentaCão Assis"],
    slogan: "Projeto social de resgate e ajuda a animais em Assis-SP",
    url: `${SITE_ORIGIN}/`,
    logo: `${SITE_ORIGIN}/apple-touch-icon.png`,
    description: SITE.description,
    email: CONTACT.email || undefined,
    telephone: CONTACT.whatsapp ? `+${CONTACT.whatsapp}` : undefined,
    address: { "@type": "PostalAddress", addressLocality: "Assis", addressRegion: "SP", addressCountry: "BR" },
    areaServed: { "@type": "City", name: "Assis", containedInPlace: { "@type": "State", name: "São Paulo" } },
    knowsAbout: ["Projeto social", "Resgate de animais", "Ajuda a animais abandonados", "Resgate de cães e gatos", "Adoção de cães", "Adoção de gatos", "Lar temporário", "Castração", "Proteção animal"],
    sameAs: [instagramProfile].filter(Boolean)
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_ORIGIN}/#site`,
    name: SITE.name,
    url: `${SITE_ORIGIN}/`,
    inLanguage: "pt-BR",
    publisher: { "@id": `${SITE_ORIGIN}/#projeto` }
  };
  return [org, website];
}
