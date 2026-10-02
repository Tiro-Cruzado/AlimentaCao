/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The Pix key is read in the browser (it builds the QR code). Next only
  // exposes variables that start with NEXT_PUBLIC_ to the browser, so PIX_KEY
  // is passed on here. It is read when the site is built: after changing it
  // on Vercel, redeploy.
  env: {
    PIX_KEY: process.env.PIX_KEY || ""
  }
};

export default nextConfig;
