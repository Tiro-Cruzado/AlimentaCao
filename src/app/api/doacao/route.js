// POST /api/doacao — creates the card charge on Mercado Pago (Checkout Pro).
//
// Next server route (runs on Vercel as a function). It exists only because the
// API token is a secret and cannot go to the browser.
//
// The browser sends only { amount, coverFee }. The total is RECALCULATED here:
// if it came ready from the screen, anyone could send "R$ 0,01".
//
// Configuration (Vercel → Settings → Environment Variables):
//   MP_ACCESS_TOKEN   token of the NGO's Mercado Pago account (secret).
//                     When testing, use the TEST token (starts with TEST-).
//                     NEVER use the NEXT_PUBLIC_ prefix on it: it would go to the browser.
//
// Locally: create .env.local with MP_ACCESS_TOKEN=... and run `npm run dev`.

import { calculateCard, validateAmount, toCents } from "../../../lib/fee.js";

const MP_API = "https://api.mercadopago.com/checkout/preferences";

// Always executed on every request, never cached.
export const dynamic = "force-dynamic";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
  });
}

export async function POST(request) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: "invalid_request", message: "Pedido inválido." }, 400);
  }

  const amount = Number(data?.amount);
  const problem = validateAmount(amount);
  if (problem) return json({ error: "invalid_amount", message: problem }, 400);

  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) {
    return json({ error: "not_configured", message: "O pagamento com cartão ainda não foi configurado." }, 503);
  }

  const coverFee = data?.coverFee !== false;
  const breakdown = calculateCard(amount, coverFee);
  const origin = new URL(request.url).origin;
  const backUrl = (status) => `${origin}/?pagamento=${status}#doar`;

  const preference = {
    items: [
      {
        id: "donation",
        title: "Doação para a AlimentaCão",
        description: coverFee
          ? `Doação de ${breakdown.amount.toFixed(2)} + taxa do cartão ${breakdown.fee.toFixed(2)}`
          : `Doação de ${breakdown.amount.toFixed(2)}`,
        quantity: 1,
        currency_id: "BRL",
        unit_price: breakdown.total
      }
    ],
    // Card and Mercado Pago balance only. The calculated fee is the credit
    // card one; Pix has its own tab on the site (no fee) and boleto takes days
    // to clear, and the NGO needs to receive right away.
    payment_methods: {
      excluded_payment_types: [{ id: "ticket" }, { id: "bank_transfer" }, { id: "atm" }],
      installments: 1,
      default_installments: 1
    },
    back_urls: { success: backUrl("aprovado"), pending: backUrl("pendente"), failure: backUrl("falhou") },
    statement_descriptor: "ALIMENTACAO",
    external_reference: `donation-${toCents(breakdown.amount)}-${coverFee ? "with-fee" : "no-fee"}-${Date.now()}`,
    metadata: {
      type: "one_time_donation",
      donation_amount: breakdown.amount,
      fee_covered_by_donor: coverFee,
      fee: breakdown.fee
    }
  };
  // Mercado Pago only returns to the site by itself (auto_return) with an https address.
  if (origin.startsWith("https://")) preference.auto_return = "approved";

  let response;
  try {
    response = await fetch(MP_API, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        "x-idempotency-key": crypto.randomUUID()
      },
      body: JSON.stringify(preference),
      cache: "no-store"
    });
  } catch (e) {
    console.error("Mercado Pago unreachable", e);
    return json({ error: "mercado_pago", message: "Não conseguimos falar com o Mercado Pago." }, 502);
  }

  if (!response.ok) {
    console.error("Mercado Pago rejected the preference", response.status, await response.text());
    return json({ error: "mercado_pago", message: "O Mercado Pago recusou o pedido." }, 502);
  }

  const created = await response.json();
  if (!created.init_point) return json({ error: "mercado_pago", message: "Resposta inesperada do Mercado Pago." }, 502);

  return json({ url: created.init_point, total: breakdown.total, fee: breakdown.fee });
}

// Any other method answers 405 by itself: Next only accepts what is exported.
