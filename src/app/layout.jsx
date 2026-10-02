import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import { SITE, toNextMetadata } from "../lib/metadata.js";
import "../styles.css";

// Frame of every page: fonts, header and footer.

// Public address of the site, used in the sharing links. On Vercel,
// set SITE_URL; without it, the address Vercel itself reports is used.
const origin =
  process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata = {
  metadataBase: new URL(origin),
  ...toNextMetadata({ title: SITE.title, description: SITE.description }),
  icons: { icon: "/favicon.svg", apple: "/apple-touch-icon.png" }
};

export const viewport = { themeColor: "#FBF8F4" };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Quicksand:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* "clip" instead of "hidden": hidden would break the position: sticky of the opening. */}
        <div style={{ overflowX: "clip" }}>
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  );
}
