// Google Analytics 4, loaded only after the visitor accepts cookies (LGPD).
//
// The measurement ID comes from the GA_ID environment variable (G-XXXXXXXXXX),
// passed to the browser by next.config.mjs and read when the site is built.
// Without it, nothing loads and the cookie banner does not show.

export const GA_ID = process.env.GA_ID || "";

const STORAGE_KEY = "alimentacao-cookies";
export const OPEN_PREFERENCES_EVENT = "alimentacao:cookie-preferences";

// "accepted", "rejected" or null (not answered yet).
export function readConsent() {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch {
    return null;
  }
}

export function saveConsent(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Private mode or storage blocked: the choice lasts only for this visit.
  }
}

let loaded = false;

export function loadAnalytics() {
  if (loaded || !GA_ID || typeof window === "undefined") return;
  loaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  // Page views on client-side navigation are counted by GA4 itself
  // ("page changes based on browser history", on by default).
  window.gtag("config", GA_ID);
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(script);
}

// Removes the _ga cookies when the visitor withdraws consent.
export function clearAnalyticsCookies() {
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0].trim();
    if (!name.startsWith("_ga")) return;
    domains.forEach((d) => {
      document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
    });
  });
}

// Records an action (event names in Portuguese, as they show up in GA).
// Does nothing if GA was not loaded (no consent or no ID).
export function track(name, params = {}) {
  if (!loaded || typeof window.gtag !== "function") return;
  window.gtag("event", name, params);
}
