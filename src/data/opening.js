// Photos and phrases of the home opening (carousel). One slide every few
// seconds, fading from one to the other. To change: put the photo in
// public/abertura/ (horizontal or vertical, up to ~1600px, .webp or .jpg) and
// edit the list below. The order here is the order on screen.
//
// focus: which part of the photo stays visible when it is cut to fit its frame
//   desktop: the photo fills the right half of the screen (a tall frame);
//   mobile:  the photo sits on top, above the green panel (a wide frame).
// Values are "horizontal% vertical%" (0% 0% = top left corner).
export const OPENING_SLIDES = [
  {
    src: "/abertura/03.webp",
    width: 720,
    height: 960,
    alt: "Voluntária da AlimentaCão segurando um filhote resgatado no colo",
    phrase: "Cada resgate começa com alguém que parou.",
    focus: { desktop: "42% 40%", mobile: "45% 30%" }
  },
  {
    src: "/abertura/04.webp",
    width: 1200,
    height: 1600,
    alt: "Três gatos resgatados deitados juntos esperando um lar",
    phrase: "Um prato cheio e um lar à vista.",
    focus: { desktop: "45% 34%", mobile: "45% 38%" }
  },
  {
    src: "/abertura/02.webp",
    width: 1200,
    height: 1600,
    alt: "Voluntárias com a camiseta do Projeto AlimentaCão na barraca do projeto",
    phrase: "Feito por gente de Assis, para os animais de Assis.",
    focus: { desktop: "58% 30%", mobile: "62% 30%" }
  },
  {
    src: "/abertura/05.webp",
    width: 960,
    height: 1280,
    alt: "Voluntárias e o mascote com sacos de ração doados",
    phrase: "Ração, vacina, carinho. E um lar no final.",
    focus: { desktop: "50% 40%", mobile: "50% 30%" }
  },
  {
    src: "/abertura/06.webp",
    width: 1600,
    height: 1200,
    alt: "Voluntárias e o palhaço em uma ação da AlimentaCão em Assis",
    phrase: "Cada voluntário é um pedaço dessa história.",
    focus: { desktop: "48% 45%", mobile: "50% 40%" }
  },
  {
    src: "/abertura/07.webp",
    width: 1200,
    height: 1600,
    alt: "Mascote da AlimentaCão entre sacos de ração arrecadados",
    phrase: "Cada saco de ração é uma semana de cuidado.",
    focus: { desktop: "55% 45%", mobile: "55% 40%" }
  },
  {
    src: "/abertura/01.webp",
    width: 1080,
    height: 1080,
    alt: "Cachorra resgatada amamentando os filhotes",
    phrase: "Toda vida importa. Até a que ninguém viu.",
    focus: { desktop: "92% 40%", mobile: "78% 40%" }
  }
];

// Seconds each slide stays on screen.
export const OPENING_INTERVAL = 6.5;
