"use client";

import { useEffect, useRef } from "react";
import Hero from "./Hero.jsx";
import Benefits from "./Benefits.jsx";

// Home opening: the dog photo stays still in the background while the title
// and the cards pass over it. As the scroll advances:
//   - the title moves up and fades out (--exit goes from 0 to 1)
//   - the veil over the photo darkens, so the white cards stand out
//   - each card slides in from below when it reaches the screen
// It is all CSS; the JS only writes --exit and marks the cards visible. Whoever
// asked for less motion in the system (prefers-reduced-motion) sees the static version.
export default function Opening() {
  const root = useRef(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Cards: entrance when they appear on screen.
    const cards = el.querySelectorAll(".benefit");
    let observer;
    if (!reducedMotion && "IntersectionObserver" in window) {
      el.classList.add("animate");
      observer = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add("visible");
              observer.unobserve(e.target);
            }
          }
        },
        { threshold: 0.2, rootMargin: "0px 0px -8% 0px" }
      );
      cards.forEach((c) => observer.observe(c));
    }

    if (reducedMotion) return () => observer?.disconnect();

    // Title and veil: follow the scroll.
    const heroContent = el.querySelector(".hero-content");
    let frame = 0;
    function update() {
      frame = 0;
      const height = heroContent.offsetHeight || window.innerHeight;
      const scrolled = Math.max(0, -el.getBoundingClientRect().top);
      const exit = Math.min(1, scrolled / (height * 0.75));
      el.style.setProperty("--exit", exit.toFixed(3));
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, []);

  return (
    <section className="opening" ref={root}>
      <div className="opening-track" aria-hidden="true">
        <div className="opening-backdrop">
          <img
          className="opening-photo"
          src="/hero-cachorro.webp"
          alt=""
          width="984"
          height="656"
          fetchPriority="high"
          />
        </div>
      </div>
      <Hero />
      <Benefits />
    </section>
  );
}
