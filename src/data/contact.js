// Fill in with the NGO's real data. The site uses this in the adoption buttons.
// Donation data lives in ./payment.js.
// whatsapp: digits only, with country and area code. E.g. "5511999998888".
export const CONTACT = {
  whatsapp: "5518996399691",
  email: "contato@alimentacao.org.br",
  legalName: "Associação AlimentaCão"
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

// Opens a conversation with the NGO: WhatsApp if there is a number, e-mail if not.
export function chatLink(text, subject = "Contato pelo site") {
  if (CONTACT.whatsapp) {
    return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`;
  }
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
}
