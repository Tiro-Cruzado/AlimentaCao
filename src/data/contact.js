// Fill in with the project's real data. The site uses this in the adoption buttons.
// Donation data lives in ./payment.js.
// whatsapp: digits only, with country and area code. E.g. "5511999998888".
export const CONTACT = {
  whatsapp: "5518996399691",
  email: "ongassis.alimentacao@gmail.com"
};

export function adoptionLink(name) {
  const text = `Ola! Vi o perfil do(a) ${name} no site e tenho interesse em adotar.`;
  if (CONTACT.whatsapp) {
    return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
  }
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(
    `Interesse em adotar ${name}`
  )}&body=${encodeURIComponent(text)}`;
}

// Opens a conversation with the project: WhatsApp if there is a number, e-mail if not.
export function chatLink(text, subject = "Contato pelo site") {
  if (CONTACT.whatsapp) {
    return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
  }
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
}
