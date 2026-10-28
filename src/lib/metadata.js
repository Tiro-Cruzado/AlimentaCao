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
// the card when someone shares the link on WhatsApp — for an NGO, it is the shop window.

// The title and description carry the words people type on Google ("ONG",
// "animais", "Assis", "adoção", "cães e gatos"), in the order they type them.
export const SITE = {
  name: "AlimentaCão",
  title: "AlimentaCão — ONG de animais em Assis-SP | Adote um cão ou gato",
  description:
    "ONG de proteção animal em Assis, interior de São Paulo. Resgatamos cães e gatos das ruas, cuidamos com ração, vacina e veterinário e buscamos famílias para adoção responsável. Adote ou doe."
};

export function wallMetadata() {
  return {
    title: "Mural · AlimentaCão, ONG de animais em Assis-SP",
    path: "/mural",
    description: "Feiras de adoção, animais que encontraram uma família, resgates e o dia a dia da AlimentaCão, em fotos e vídeos."
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
// an NGO in Assis - SP, with contact and Instagram. It feeds the panel on the
// side of the results and the local searches ("ong de animais em Assis").
export function organizationJsonLd() {
  const org = {
    "@context": "https://schema.org",
    "@type": "NGO",
    "@id": `${SITE_ORIGIN}/#ong`,
    name: SITE.name,
    alternateName: ["Projeto AlimentaCão", "AlimentaCao", CONTACT.legalName].filter(Boolean),
    url: `${SITE_ORIGIN}/`,
    logo: `${SITE_ORIGIN}/apple-touch-icon.png`,
    description: SITE.description,
    email: CONTACT.email || undefined,
    telephone: CONTACT.whatsapp ? `+${CONTACT.whatsapp}` : undefined,
    address: { "@type": "PostalAddress", addressLocality: "Assis", addressRegion: "SP", addressCountry: "BR" },
    areaServed: { "@type": "City", name: "Assis", containedInPlace: { "@type": "State", name: "São Paulo" } },
    knowsAbout: ["Resgate de animais", "Adoção de cães", "Adoção de gatos", "Castração", "Proteção animal"],
    sameAs: [instagramProfile].filter(Boolean)
  };
  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_ORIGIN}/#site`,
    name: SITE.name,
    url: `${SITE_ORIGIN}/`,
    inLanguage: "pt-BR",
    publisher: { "@id": `${SITE_ORIGIN}/#ong` }
  };
  return [org, website];
}
