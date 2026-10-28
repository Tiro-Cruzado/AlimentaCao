"use client";

import { useEffect, useRef, useState } from "react";
import Hero from "./Hero.jsx";
import Benefits from "./Benefits.jsx";
import { OPENING_SLIDES, OPENING_INTERVAL } from "../data/opening.js";

// Home opening: green panel with the text on the left and the NGO's photos on
// the right (on the phone, photo on top and panel below), separated by a soft
// curve with a dark outline. The photos and phrases come from
// src/data/opening.js and fade from one to the other. Below, the "how to help"
// cards come in one by one as they reach the screen.
//
// Whoever asked the system for less motion (prefers-reduced-motion) sees the
// first photo, still, and the cards without animation.

// Curve between panel and photo. Drawn in a fixed box and stretched to the
// section; the outline keeps its thickness (non-scaling-stroke).
const EDGE_DESKTOP = "M46 0 C 140 190, 30 430, 112 654";
const EDGE_MOBILE = "M0 34 C 110 8, 250 60, 390 26";
const PANEL = "#467333";
const OUTLINE = "#23312F";

export default function Opening() {
  const root = useRef(null);
  // Carousel: slide on screen, and whether the other photos may load yet
  // (only after the page is up, so the first one arrives fast).
  const [current, setCurrent] = useState(0);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const total = OPENING_SLIDES.length;

  useEffect(() => {
    setReady(true);
  }, []);

  // Next slide every few seconds. Stops when the tab is hidden or paused, and
  // never starts for whoever asked the system for less motion. Choosing a
  // slide by hand restarts the count.
  useEffect(() => {
    if (total < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setCurrent((i) => (i + 1) % total);
    }, OPENING_INTERVAL * 1000);
    return () => window.clearInterval(timer);
  }, [total, paused, current]);

  // Cards: entrance when they appear on screen.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    const cards = el.querySelectorAll(".benefit");
    el.classList.add("animate");
    const observer = new IntersectionObserver(
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
    return () => observer.disconnect();
  }, []);

  const go = (i) => setCurrent(((i % total) + total) % total);

  return (
    <section className="opening" ref={root}>
      <div className="hero-split">
        <div className="hero-photos" aria-hidden="true">
          {OPENING_SLIDES.map((s, i) =>
            i === 0 || ready ? (
              <img
                key={s.src}
                className={`opening-photo${i === current ? " is-current" : ""}`}
                src={s.src}
                alt=""
                width={s.width}
                height={s.height}
                fetchPriority={i === 0 ? "high" : "low"}
                decoding="async"
                style={{ "--focus-desktop": s.focus?.desktop, "--focus-mobile": s.focus?.mobile }}
              />
            ) : null
          )}
        </div>

        <svg className="hero-edge hero-edge-desktop" viewBox="0 0 170 654" preserveAspectRatio="none" aria-hidden="true">
          <path d={`${EDGE_DESKTOP} L0 654 L0 0 Z`} fill={PANEL} />
          <path d={EDGE_DESKTOP} fill="none" stroke={OUTLINE} strokeWidth="5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <svg className="hero-edge hero-edge-mobile" viewBox="0 0 390 60" preserveAspectRatio="none" aria-hidden="true">
          <path d={`${EDGE_MOBILE} L390 60 L0 60 Z`} fill={PANEL} />
          <path d={EDGE_MOBILE} fill="none" stroke={OUTLINE} strokeWidth="4" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>

        <Hero
          slides={OPENING_SLIDES}
          current={current}
          onSelect={go}
          paused={paused}
          onTogglePause={() => setPaused((p) => !p)}
        />
      </div>
      <Benefits />
    </section>
  );
}
