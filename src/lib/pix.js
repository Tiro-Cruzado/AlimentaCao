// Generation of the "Pix Copia e Cola" (BR Code / EMV MPM) right in the browser.
//
// It does not depend on a bank, an API or a gateway account: the code is built
// from the NGO's Pix key and read by any banking app. Zero cost and no
// intermediary fee.
//
// Reference: Manual de Padrões para Iniciação do Pix, Banco Central.

// Each BR Code field is ID + length (2 digits) + value.
function field(id, value) {
  const v = String(value);
  return id + String(v.length).padStart(2, "0") + v;
}

// The standard accepts ASCII only. An accented letter becomes a plain letter
// instead of breaking the field's byte count.
function asciiOnly(text) {
  return String(text)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
}

// CRC-16/CCITT-FALSE: polynomial 0x1021, initial value 0xFFFF.
export function crc16(text) {
  let crc = 0xffff;
  for (let i = 0; i < text.length; i++) {
    crc ^= text.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Builds the Pix Copia e Cola (copy-and-paste code).
 *
 * @param {object} options
 * @param {string} options.key      The NGO's Pix key (CNPJ, e-mail, phone or random)
 * @param {string} options.name     Recipient name, up to 25 characters
 * @param {string} options.city     Recipient city, up to 15 characters
 * @param {number} [options.amount] Amount in reais. Omitted = the donor types how much
 * @param {string} [options.txid]   Up to 25 characters, no spaces. Shows up in reconciliation
 * @param {string} [options.description] Message that goes with the Pix ("Informações
 *   adicionais"). Most banking apps show it to the donor before confirming and
 *   in the receipt. Trimmed to fit: key + description share 99 characters.
 * @returns {string} code ready to be copied or turned into a QR
 */
export function buildPixPayload({ key, name, city, amount, txid = "***", description = "" }) {
  if (!key) return "";

  const cleanName = asciiOnly(name || "RECEBEDOR").slice(0, 25) || "RECEBEDOR";
  const cleanCity = asciiOnly(city || "BRASIL").slice(0, 15) || "BRASIL";
  const cleanTxid = asciiOnly(txid).replace(/\s+/g, "").slice(0, 25) || "***";

  let pixAccount = field("00", "br.gov.bcb.pix") + field("01", asciiOnly(key));
  // Field 26 holds at most 99 characters; the description gets whatever is left.
  const room = 99 - pixAccount.length - 4;
  const cleanDescription = asciiOnly(description).slice(0, Math.max(0, room)).trim();
  if (cleanDescription) pixAccount += field("02", cleanDescription);

  let payload =
    field("00", "01") +
    // 11 = reusable QR: several people can donate by reading the same code.
    field("01", "11") +
    field("26", pixAccount) +
    field("52", "0000") +
    field("53", "986");

  const numericAmount = Number(amount);
  if (Number.isFinite(numericAmount) && numericAmount > 0) {
    payload += field("54", numericAmount.toFixed(2));
  }

  payload +=
    field("58", "BR") +
    field("59", cleanName) +
    field("60", cleanCity) +
    field("62", field("05", cleanTxid));

  // The CRC is calculated over the payload already ending in "6304".
  const withMarker = payload + "6304";
  return withMarker + crc16(withMarker);
}
