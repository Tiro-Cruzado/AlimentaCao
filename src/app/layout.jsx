import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Analytics from "../components/Analytics.jsx";
import { SITE, SITE_ORIGIN, toNextMetadata, organizationJsonLd } from "../lib/metadata.js";
import "../styles.css";

// Frame of every page: fonts, header and footer.

export const metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  ...toNextMetadata({ title: SITE.title, description: SITE.description }),
  icons: { icon: "/favicon.svg", apple: "/apple-touch-icon.png" },
  // Google Search Console ownership check (the "Tag HTML" method): only the
  // code from content="...", set on Vercel as GOOGLE_SITE_VERIFICATION.
  ...(process.env.GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } } : {})
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
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()).replace(/</g, "\\u003c") }}
        />
        {/* "clip" instead of "hidden": hidden would break the position: sticky of the opening. */}
        <div style={{ overflowX: "clip" }}>
          <Header />
          {children}
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  );
}
