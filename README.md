# AlimentaCão — adoption site

Site of the NGO AlimentaCão: gallery of animals for adoption, a page of its own
for each animal, and donation by Pix (straight to the NGO's key, no fee) and card
(Mercado Pago, with the option for the donor to cover the fee).

Next.js (App Router) with React 19. The home, wall and per-animal pages are
generated as HTML at build time, so Google can find each animal. The only
part that runs on a server is the card payment route.

## Run

```
npm install
npm run dev
```

Opens at http://localhost:3000.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Builds the clothesline and starts the development server, with automatic reload |
| `npm run build` | Syncs Sanity, builds the clothesline, creates the sponsorship plans and compiles the site |
| `npm start` | Serves the compiled site, as in production (after the build) |
| `npm run sync` | Only downloads the animals and the wall from Sanity |
| `node scripts/test-pix.mjs <key> 0.01` | Generates a Pix QR for testing |
| `npm run plans:mp -- https://your-site` | Creates in Mercado Pago the sponsorship plans that are missing (the build already runs this) |

## What to configure

Everything lives in `src/data/`:

| File | What is in it |
|---|---|
| `payment.js` | Name and city of the Pix recipient, `cardEnabled`, donation and sponsorship amounts, `TEST_MODE` |
| `contact.js` | WhatsApp, e-mail, legal name |
| `social.js` | Instagram @ and links to the posts |
| `animals.seed.js` | Sample animals, used while Sanity is not connected |
| `features.js` | Switches that turn gallery, donation, Pix and sponsorship on and off ("Em breve", i.e. coming soon) |

Secrets and addresses live in environment variables — see `env.example`.

The card fee (4.98%, instant payout) lives in `src/lib/fee.js` —
check it in the NGO's Mercado Pago dashboard.

**The Pix key is not kept in the code.** It comes from the `PIX_KEY`
variable (`.env.local` on your computer, Environment Variables on Vercel). Without the
variable, the Pix tab warns that it is not configured yet.

**Before publishing for real:** register on Vercel the Pix key of the NGO's CNPJ
and set `TEST_MODE = false` in `payment.js`.

## Card through Mercado Pago

The Mercado Pago API token is a secret and cannot go to the browser. That is
why the charge is created by a Next server route,
`src/app/api/doacao/route.js`, which runs as a function on Vercel.

1. Mercado Pago → Suas integrações → create application → **Credenciais**.
2. Vercel → project → Settings → **Environment Variables** →
   `MP_ACCESS_TOKEN` with the token (the test one while testing). Never use the
   `NEXT_PUBLIC_` prefix on it.
3. `cardEnabled: true` in `src/data/payment.js` and publish.

To test locally: copy `env.example` to `.env.local`, put in the
test token and run `npm run dev`.

Pay with the **test users** from the Mercado Pago developer
dashboard: an account cannot pay itself.

## Sponsorship (monthly)

A sponsor picks an animal that is **available for adoption** and an amount
(`SPONSORSHIP.amounts` in `payment.js`: R$ 20, 30, 50 and 100). The charge is
a credit card subscription through Mercado Pago, with no server code.

Each animal × amount becomes two plans in Mercado Pago, with and without the card
fee. They are created by `scripts/create-mercado-pago-plans.mjs`, which **runs by itself
in `npm run build`**: a new animal registered in Sanity gets its plans on the
next publish. The script looks up the plans that already exist in the account and only
creates what is missing — running it again duplicates nothing.

To turn it on, on Vercel (Settings → Environment Variables):

- `MP_ACCESS_TOKEN` — the same token as the card donation
- `SITE_URL` — https address of the site, e.g. `https://alimentacao.org.br`

Locally: token in `.env.local` and `npm run plans:mp -- https://address-of-the-site`.

Without a token or without `SITE_URL`, the build goes on normally and the sponsorship stays
off on the site. With Mercado Pago down, the build goes on with the links from
last time. With a **production** token and the animals still being samples, the script
refuses to create plans — nobody should pay for a made-up animal.

Who can be sponsored is defined in `src/lib/sponsorship.js`
(`SPONSORABLE_STATUSES`). When an animal is adopted, it disappears from the site's list,
but **whoever already sponsors it keeps being charged**: the script warns in the build
log, and the NGO sorts it out with the sponsor (another animal, or cancelling under
Assinaturas in the Mercado Pago dashboard).

The page of each available animal has the "Apadrinhar {name}" button, which opens the
section with that animal already selected (`/?apadrinhar=feijao#apadrinhar`).

## Structure

```
src/
  app/          Next routes: layout, home, /mural, /animal/[slug], 404
    api/doacao/ Server route that creates the charge in Mercado Pago
  screens/      Content of each page: Home, AnimalPage and WallPage
  components/   Header, Hero, Gallery, DonateForm, Wall, ...
  data/         Configuration and data
  lib/pix.js    Generates the Pix code (BR Code) in the browser
  lib/fee.js    Card fee and total with the fee built in (screen and server)
  lib/metadata.js          Title and description of each page
  lib/useLocationParts.js  Reads the #anchor and ?parameters of the address
scripts/        Sanity sync, Mercado Pago plans
studio/         Sanity panel where the volunteers register the animals
```

Components with state or events start with `"use client"`. The anchor
links (`/#doar`, `/#galeria`) are plain `<a>`, not `next/link`: that is what makes the
"Uma vez / Todo mês" (once / every month) switch follow the address.

## Animal and wall content

Animals and wall posts (events, adoptions, rescues, behind the scenes) are
registered in Sanity and downloaded at build time by `npm run sync`.

Sanity is the only source. On your computer, `npm run dev` keeps checking
Sanity and refreshes the content by itself; in production, publishing in the
panel calls a Vercel Deploy Hook (Sanity webhook) and the site is rebuilt.
See `studio/README.md`.

**The site never shows sample content as real.** While no animal is published,
the gallery gives way to a "we are registering our animals" panel and the
animal pages redirect to the home page (`animals.seed.js` is kept only as an
example of the data shape). While no wall post is published, the home page
hides the wall section and `/mural` says the wall is being put together.

The wall is a photo clothesline: a page of its own (`/mural`) and two
clotheslines with the 10 most recent photos on the home.

## Publish

Vercel: import the repository from GitHub. Vercel recognises Next by itself
(build `npm run build`). In Settings → Environment Variables, register whatever
is in use: `MP_ACCESS_TOKEN`, `SITE_URL`, `PIX_KEY`,
`SANITY_PROJECT_ID` and `SANITY_DATASET`.
