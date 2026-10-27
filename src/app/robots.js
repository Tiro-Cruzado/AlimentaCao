import { SITE_ORIGIN } from "../lib/metadata.js";

// /robots.txt: everything open to Google, except the payment route, and the
// address of the sitemap.
export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
    host: SITE_ORIGIN
  };
}
