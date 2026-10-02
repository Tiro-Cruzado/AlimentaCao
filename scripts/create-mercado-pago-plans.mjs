// Creates the sponsorship plans on Mercado Pago — one per available animal,
// per amount, with and without the card fee — and writes the links to
// src/data/sponsorship.generated.json.
//
//   npm run plans:mp -- https://site-address          (manual)
//   npm run build                                     (runs by itself, see package.json)
//
// Configuration:
//   MP_ACCESS_TOKEN   token of the NGO's account (environment variable or .env.local)
//   SITE_URL          https address of the site (or the argument above)
// On Vercel, both go in Settings → Environment Variables, so that the build
// creates the plans for new animals on every deploy.
//
// It keeps no state: on every run it lists the account's active plans and
// finds the ones that already exist by external_reference (see
// src/lib/sponsorship.js). It only creates what is missing. Running it twice
// does not duplicate anything.
//
// Like sync-content.mjs, it never breaks the build: without configuration or
// with Mercado Pago down, it warns and leaves the file as it was.

import { readFile, writeFile } from "node:fs/promises";
import { SPONSORSHIP } from "../src/data/payment.js";
import { SEED } from "../src/data/animals.seed.js";
import { calculateCard, toCents, CARD_FEE } from "../src/lib/fee.js";
import { canBeSponsored, planReference, parseReference } from "../src/lib/sponsorship.js";

const OUTPUT = "src/data/sponsorship.generated.json";
const API = "https://api.mercadopago.com/preapproval_plan";

function exit(message) {
  console.log(`\n[sponsorship plans] ${message}\n`);
  process.exit(0);
}

async function readToken() {
  if (process.env.MP_ACCESS_TOKEN) return process.env.MP_ACCESS_TOKEN.trim();
  try {
    const vars = await readFile(".env.local", "utf-8");
    const line = vars.split("\n").find((l) => l.trim().startsWith("MP_ACCESS_TOKEN="));
    return line ? line.split("=").slice(1).join("=").trim() : "";
  } catch {
    return "";
  }
}

// Same rule as src/data/animals.js: without animals from Sanity, the sample list applies.
async function readAnimals() {
  try {
    const generated = JSON.parse(await readFile("src/data/animals.generated.json", "utf-8"));
    if (Array.isArray(generated) && generated.length) return { animals: generated, sample: false };
  } catch {}
  return { animals: SEED, sample: true };
}

const token = await readToken();
const site = (process.argv[2] || process.env.SITE_URL || "").replace(/\/$/, "");
const test = token.startsWith("TEST-");

if (!token || token.includes("cole-aqui")) {
  exit("MP_ACCESS_TOKEN not configured — no plans created. Sponsorship stays disabled on the site.");
}
if (!/^https:\/\//.test(site)) {
  exit("The https address of the site is missing (SITE_URL or npm run plans:mp -- https://...). Mercado Pago only accepts an https return URL. No plans created.");
}

const { animals, sample } = await readAnimals();
if (sample && !test) {
  exit("The animals are still the SAMPLE ones and the token is a production one. Creating real plans for made-up animals would make someone pay for an animal that does not exist. Connect Sanity first.");
}

const headers = { authorization: `Bearer ${token}`, "content-type": "application/json" };

// 1. Plans that already exist in the account, by external_reference.
const existing = new Map();
try {
  // Advances by what actually came back: if Mercado Pago returns fewer than
  // the limit requested per page, no plan is left out.
  for (let offset = 0; ; ) {
    const r = await fetch(`${API}/search?status=active&limit=100&offset=${offset}`, { headers });
    if (!r.ok) throw new Error(`search refused (${r.status}) ${await r.text()}`);
    const page = await r.json();
    const results = page.results || [];
    for (const plan of results) {
      if (parseReference(plan.external_reference)) existing.set(plan.external_reference, plan);
    }
    offset += results.length;
    if (!results.length || offset >= (page.paging?.total ?? 0)) break;
  }
} catch (e) {
  exit(`Could not list the plans on Mercado Pago (${e.message}). File left as it was.`);
}

// 2. Creates what is missing.
const sponsorable = animals.filter(canBeSponsored);
const output = {};
let created = 0;
let kept = 0;

try {
  for (const animal of sponsorable) {
    output[animal.slug] = { name: animal.name, plans: {} };
    for (const { amount } of SPONSORSHIP.amounts) {
      output[animal.slug].plans[amount] = {};
      for (const [key, cover] of [["withFee", true], ["withoutFee", false]]) {
        const { total } = calculateCard(amount, cover);
        const ref = planReference(animal.slug, amount, cover, toCents(total));
        let plan = existing.get(ref);

        if (plan) {
          kept++;
        } else {
          const r = await fetch(API, {
            method: "POST",
            headers,
            body: JSON.stringify({
              reason: cover
                ? `Apadrinhamento: ${animal.name} — R$ ${amount}/mês + taxa do cartão`
                : `Apadrinhamento: ${animal.name} — R$ ${amount}/mês`,
              external_reference: ref,
              auto_recurring: { frequency: 1, frequency_type: "months", transaction_amount: total, currency_id: "BRL" },
              payment_methods_allowed: { payment_types: [{ id: "credit_card" }] },
              back_url: `${site}/?apadrinhamento=ok&animal=${encodeURIComponent(animal.slug)}#apadrinhar`
            })
          });
          plan = await r.json().catch(() => ({}));
          if (!r.ok || !plan.init_point) throw new Error(`${animal.name} R$ ${amount} ${key}: refused (${r.status}) ${JSON.stringify(plan)}`);
          created++;
          console.log(`+ ${animal.name} · R$ ${amount} ${key} · R$ ${total.toFixed(2)}/month`);
        }
        output[animal.slug].plans[amount][key] = { id: plan.id, url: plan.init_point, total };
      }
    }
  }
} catch (e) {
  exit(`Mercado Pago refused a plan: ${e.message}. File left as it was — the plans already created will be found again next time.`);
}

// 3. Warning for the NGO: animals that left the list but have active plans.
const activeSlugs = new Set(sponsorable.map((a) => a.slug));
const offTheList = new Set(
  [...existing.keys()].map((ref) => parseReference(ref).slug).filter((slug) => !activeSlugs.has(slug))
);

await writeFile(
  OUTPUT,
  JSON.stringify(
    {
      notice: "Generated by scripts/create-mercado-pago-plans.mjs — do not edit by hand.",
      updatedAt: new Date().toISOString(),
      fee: CARD_FEE,
      test,
      sample,
      site,
      animals: output
    },
    null,
    2
  ) + "\n"
);

console.log(`\n[sponsorship plans] ${sponsorable.length} animals · ${created} plan(s) created · ${kept} reused.`);
if (test) console.log("TEST token — nothing here is a real charge.");
if (offTheList.size) {
  const names = [...offTheList].map((slug) => animals.find((a) => a.slug === slug)?.name || slug).join(", ");
  console.log(`\nWARNING: ${names} is/are no longer available for sponsorship, but still has/have plans on Mercado Pago.`);
  console.log("The site no longer offers these plans. Whoever already sponsors keeps being charged: sort it out with the sponsors (continue with another animal or cancel under Subscriptions, in the Mercado Pago dashboard).");
}
