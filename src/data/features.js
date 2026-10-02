// Turns parts of the site on and off without deleting anything.
//
// gallery:     list of animals on the home page and the /animal/<name> pages.
//              When off (false), shows the "Em breve" (coming soon) panel instead.
// donation:    one-time donation (Pix and card), "Uma vez" tab.
// pix:         Pix inside the one-time donation. When off, the Pix tab shows as
//              "Em breve" and only the card is left (which is enabled in payment.js).
// sponsorship: monthly contribution per animal, "Todo mês" tab.
//              With donation and sponsorship both off, the whole section becomes
//              an "Em breve" panel and the donate buttons disappear from the site.
//              With only one of them off, its tab shows as "Em breve".
//
// After changing, publish again.
export const FEATURES = {
  gallery: true,
  donation: true,
  pix: true,
  sponsorship: false
};
