"use client";

import { useEffect, useState } from "react";

// Hash and parameters of the current address, for components that react to links such as
// /#apadrinhar or /?pagamento=aprovado#doar.
//
// Next does not expose the hash in any hook, so we read straight from window. The
// site's anchor links are plain <a> (not next/link): on the same page the
// browser fires "hashchange"; coming from another page, the home loads from scratch
// and this hook reads the address on mount.
export function useLocationParts() {
  const [parts, setParts] = useState({ hash: "", search: "" });

  useEffect(() => {
    const read = () => setParts({ hash: window.location.hash, search: window.location.search });
    read();
    window.addEventListener("hashchange", read);
    window.addEventListener("popstate", read);
    return () => {
      window.removeEventListener("hashchange", read);
      window.removeEventListener("popstate", read);
    };
  }, []);

  return parts;
}
