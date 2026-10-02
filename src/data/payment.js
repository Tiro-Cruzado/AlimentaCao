// AlimentaCão donation settings.
//
// Two ways to donate:
//
// 1. Pix — the QR is generated on the site itself with the NGO's key (below).
//    No fee, no intermediary.
// 2. Card — through Mercado Pago (Checkout Pro). The amount with the fee built
//    in is calculated in src/lib/fee.js and the charge is created by the function
//    src/app/api/doacao/route.js, which keeps the API token away from the browser.
//
// To enable the card:
//   a. In Vercel (Settings → Environment Variables), register the MP_ACCESS_TOKEN secret with the token
//      of the NGO's account (Mercado Pago → Suas integrações → Credenciais).
//   b. Check the instant-payout card fee in src/lib/fee.js.
//   c. Change `cardEnabled` to true and publish.
//
// While `cardEnabled` is false, the card tab shows an honest "not configured
// yet" notice — it never pretends that the donation happened.

export const MERCADO_PAGO = {
  cardEnabled: false,
};

export const PIX = {
  // Pix key of the account that RECEIVES. It is system configuration, never
  // user input: the donor only scans the QR or pastes the code into their bank.
  //
  // The key is NOT kept in the code or in the repository: it comes from the
  // PIX_KEY environment variable.
  //   - On your computer: `.env.local` file at the root (already in .gitignore):
  //         PIX_KEY=your-key-here
  //   - On Vercel: Settings → Environment Variables.
  //
  // Without the variable, the site shows "Pix ainda não configurado" instead of the QR.
  //
  // This takes the key out of Git, but does not make it secret: it has to go
  // inside the QR Code for the payment to work, so whoever donates always gets it.
  key: process.env.PIX_KEY || "",

  // Name and city go into the QR code. Maximum of 25 and 15 characters — the
  // Central Bank standard cuts off whatever goes beyond that.
  //
  // The donor's app shows the real name of the key's owner, not this one. This
  // field is informational inside the code.
  recipientName: "Rosemeire Maria de Lima",
  city: "Assis",

  // While the NGO's legal registration is in progress, the Pix goes to the
  // account of the treasurer, who is responsible for the project's finances.
  // When the NGO has its own account: change the key (PIX_KEY), the two names
  // here, and clear recipientRole and recipientNote.

  // Account holder's name, shown in full on screen so the donor can check it
  // against what the bank app shows.
  legalName: "Rosemeire Maria de Lima",
  // Who that person is, shown right after the name. "" hides it.
  recipientRole: "tesoureira da AlimentaCão",
  // Why the donation goes to a person and not to the NGO. "" hides it.
  recipientNote:
    "A AlimentaCão está em processo de formalização. Enquanto isso, as doações são recebidas pela tesoureira, responsável pelas finanças do projeto.",
};

// Suggested amounts and what each one pays for. Being concrete converts better
// than asking for "any amount".
export const AMOUNTS = [
  { amount: 30, covers: "um saco de ração para os filhotes" },
  { amount: 90, covers: "a vacinação completa de um animal" },
  { amount: 220, covers: "uma castração" },
];

// Turn on (true) while testing with a personal account or Mercado Pago test
// credentials.
// The site then shows an orange banner warning that it is not a real donation —
// that is what keeps a test link from going live without anyone noticing.
// TURN OFF before publishing with the NGO's definitive account.
export const TEST_MODE = true;

// Sponsorship: monthly contribution on the credit card, through Mercado Pago
// subscriptions, for an animal chosen among those available for adoption.
//
// Each animal × amount becomes TWO plans in Mercado Pago — with the card fee
// built in and without — created by scripts/create-mercado-pago-plans.mjs, which
// runs by itself in `npm run build` when the token is configured. A new animal
// in Sanity gets its plans on the next publish.
//
// Adjust the `covers` texts to the NGO's reality.
export const SPONSORSHIP = {
  amounts: [
    { amount: 20, covers: "ajuda na ração do mês" },
    { amount: 30, covers: "ração do mês garantida" },
    { amount: 50, covers: "ração e vermífugo em dia" },
    { amount: 100, covers: "ração, vacinas e uma reserva para emergências" },
  ],
};
