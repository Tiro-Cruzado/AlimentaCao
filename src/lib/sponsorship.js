// Sponsorship rules, shared by the screen (Sponsorship.jsx) and by the script
// that creates the plans on Mercado Pago.

// Who can be sponsored: animals available for adoption.
// To include the ones in treatment, add "in_treatment" here and run the plans
// script again.
export const SPONSORABLE_STATUSES = ["available"];

export function canBeSponsored(animal) {
  return SPONSORABLE_STATUSES.includes(animal?.status);
}

// Identifier of each plan on Mercado Pago (external_reference field).
// It is how the script finds the plans already created, without storing
// anything outside Mercado Pago. The total in cents is part of the key: if the
// fee changes, the key changes and a new plan is created with the right amount.
export function planReference(slug, amount, coverFee, totalCents) {
  return `sponsor:${slug}:${amount}:${coverFee ? "fee" : "nofee"}:${totalCents}`;
}

export function parseReference(ref) {
  const [prefix, slug, amount, fee, total] = String(ref || "").split(":");
  if (prefix !== "sponsor" || !slug) return null;
  return { slug, amount: Number(amount), coverFee: fee === "fee", totalCents: Number(total) };
}
