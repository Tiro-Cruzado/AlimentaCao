"use client";

import { useEffect, useState } from "react";

// false in the HTML generated at build time and on the first paint; true right after.
//
// Used for texts that depend on today's date ("Esperando há 3 meses"): the
// HTML is generated on the day of publishing, and the visitor may arrive weeks later.
// Using the value as `key`, together with suppressHydrationWarning, the build
// text is accepted on hydration and then swapped for today's value.
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
