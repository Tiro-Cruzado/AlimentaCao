// Generates a test Pix without touching the site or starting the server.
//
//   node scripts/test-pix.mjs <key> [amount] [name] [city]
//
// Examples:
//   node scripts/test-pix.mjs 11999998888 0.01
//   node scripts/test-pix.mjs doacao@ong.org.br 1 "AlimentaCao" "Sao Paulo"
//
// Writes pix-teste.png to the project root. Open the file and scan it with
// the bank app on your phone.

import { writeFile } from "node:fs/promises";
import QRCode from "qrcode";
import { buildPixPayload } from "../src/lib/pix.js";

const [key, amountArg, nameArg, cityArg] = process.argv.slice(2);

if (!key) {
  console.error(`
Missing the Pix key.

  node scripts/test-pix.mjs <key> [amount] [name] [city]

Example:
  node scripts/test-pix.mjs 11999998888 0.01
`);
  process.exit(1);
}

const amount = amountArg ? Number(amountArg) : undefined;
if (amountArg && !Number.isFinite(amount)) {
  console.error(`Invalid amount: ${amountArg}. Use a dot as the separator, e.g. 0.01`);
  process.exit(1);
}

const name = nameArg || "Associacao AlimentaCao";
const city = cityArg || "Sao Paulo";

const code = buildPixPayload({
  key, name, city, amount,
  txid: amount ? `TESTE${String(amount).replace(".", "")}` : "TESTE"
});

const file = "pix-teste.png";
await QRCode.toFile(file, code, { width: 600, margin: 2 });

console.log(`
Recipient : ${name} — ${city}
Key       : ${key}
Amount    : ${amount ? `R$ ${amount.toFixed(2)}` : "the payer chooses"}

Copy and paste:
${code}

QR saved to ${file}

Check when scanning:
  [ ] the app shows "${name}" as the recipient
  [ ] the amount is already filled in${amount ? ` (R$ ${amount.toFixed(2)})` : " — or it asks you to type it"}
  [ ] the Pix lands in the right account

Pay from an account DIFFERENT from the receiving one: the bank does not
let you send Pix to your own account at the same institution.
`);
