import { ANIMALS, ANIMALS_ARE_SAMPLE, STATUS } from "../data/animals.js";

// Animals a donation can be earmarked for: everyone still in the NGO's care
// (waiting, in treatment or in the middle of an adoption). Adopted animals do
// not need it anymore. Sample animals never show up.
export const DONATABLE = ANIMALS_ARE_SAMPLE
  ? []
  : ANIMALS.filter((a) => a.status !== "adopted").sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

export function findDonatable(slug) {
  return DONATABLE.find((a) => a.slug === slug) || null;
}

// "Lalá · em tratamento" in the list, so urgent cases stand out.
export function donatableLabel(animal) {
  return animal.status === "available" ? animal.name : `${animal.name} · ${STATUS[animal.status].label.toLowerCase()}`;
}

// Text that goes with the Pix (the donor and the NGO see it in the bank
// statement). Accents are removed by the Pix code itself.
export function pixDescription(animal, fallback) {
  return animal ? `Doacao para ${animal.name} - AlimentaCao` : fallback;
}

// Pix "txid": letters and digits only, up to 25. It shows up in the NGO's
// bank reconciliation, so it also carries the animal.
export function pixTxid(amount, animal) {
  const tag = animal ? animal.slug.replace(/[^a-z0-9]/gi, "").toUpperCase() : "";
  return `DOACAO${amount}${tag}`.slice(0, 25);
}
