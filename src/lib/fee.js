// Card fee calculation, shared between the screen (DonateForm) and the
// function that creates the charge (src/app/api/doacao/route.js). Living in a single
// place guarantees that the total shown to the donor is the same Mercado Pago charges.
//
// The Mercado Pago fee applies to the TOTAL charged, not to the donation.
// So adding 4.98% is not enough: the fee is "built in",
//
//     total = donation / (1 - fee)
//
// and rounded up to the cent, so the NGO never receives R$ 29,99.

// Credit card with INSTANT payout on Mercado Pago. The NGO chose instant
// payout because sick animals arrive on random days and at random times.
// CONFIRM in the NGO's account panel (Seu negócio → Custos) and update here:
// the fee changes over time and may vary by account profile.
export const CARD_FEE = 0.0498;

export const LIMITS = { min: 5, max: 5000 };

export function toCents(amount) {
  return Math.round(Number(amount) * 100);
}

// Returns null if the amount is acceptable, or a message for the donor.
export function validateAmount(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return "Digite um valor.";
  if (Math.abs(n * 100 - Math.round(n * 100)) > 1e-6) return "Use no máximo dois dígitos de centavos.";
  if (n < LIMITS.min) return `O valor mínimo no cartão é R$ ${LIMITS.min}.`;
  if (n > LIMITS.max) return `Para doar mais de R$ ${LIMITS.max.toLocaleString("pt-BR")}, fale com a gente.`;
  return null;
}

// { amount, fee, total, net } in reais, with two decimals.
// coverFee = true: the donor pays the fee and the NGO receives the full amount.
// coverFee = false: the donor pays only the amount and the fee comes out of what the NGO receives.
export function calculateCard(amount, coverFee, fee = CARD_FEE) {
  const base = toCents(amount);
  const total = coverFee ? Math.ceil(base / (1 - fee) - 1e-9) : base;
  const charged = Math.round(total * fee);
  return {
    amount: base / 100,
    fee: (total - base) / 100,
    total: total / 100,
    net: (total - charged) / 100
  };
}

export function formatBRL(amount) {
  return Number(amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
