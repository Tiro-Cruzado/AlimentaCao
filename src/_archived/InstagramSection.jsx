import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { INSTAGRAM, instagramProfile, hasInstagram } from "../data/social.js";
import { colors, fonts, maxWidth, gutter } from "../theme.js";

function Posts({ urls }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ dragFree: true, align: "start", containScroll: "trimSnaps" });
  const [ready, setReady] = useState(false);
  // Ad blockers often knock out embed.js. Without this state,
  // whoever uses a blocker would be staring at "carregando" forever.
  const [failed, setFailed] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  useEffect(() => {
    if (!emblaApi) return undefined;

    function update() {
      setCanGoBack(emblaApi.canScrollPrev());
      setCanGoForward(emblaApi.canScrollNext());
    }

    update();
    emblaApi.on("select", update);
    emblaApi.on("reInit", update);
    return () => {
      emblaApi.off("select", update);
      emblaApi.off("reInit", update);
    };
  }, [emblaApi]);

  // The Instagram iframes change the size of the slides after loading —
  // without this Embla would measure the track too early.
  useEffect(() => {
    if (!ready || !emblaApi) return undefined;
    const delay = window.setTimeout(() => emblaApi.reInit(), 300);
    return () => window.clearTimeout(delay);
  }, [ready, emblaApi]);

  useEffect(() => {
    function processEmbeds() {
      if (window.instgrm?.Embeds) {
        window.instgrm.Embeds.process();
        setReady(true);
      }
    }

    const giveUp = window.setTimeout(() => {
      setReady((wasReady) => {
        if (!wasReady) setFailed(true);
        return wasReady;
      });
    }, 8000);

    const existing = document.querySelector('script[src*="instagram.com/embed.js"]');
    if (existing) {
      processEmbeds();
      return () => window.clearTimeout(giveUp);
    }

    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    script.onload = processEmbeds;
    script.onerror = () => setFailed(true);
    document.body.appendChild(script);
    return () => window.clearTimeout(giveUp);
  }, []);

  // When the script does not arrive, we show the links instead of empty frames.
  if (failed && !ready) {
    return (
      <div style={{ background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 26, padding: "24px 26px", maxWidth: 520, margin: "0 auto" }}>
        <p style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 16, color: colors.ink, margin: 0 }}>
          As publicações não carregaram aqui
        </p>
        <p style={{ fontSize: 14.5, lineHeight: 1.6, color: colors.ink2, margin: "8px 0 16px" }}>
          Costuma ser bloqueador de anúncios. Os links abaixo abrem direto no Instagram.
        </p>
        <div style={{ display: "grid", gap: 10 }}>
          {urls.map((url, i) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 15, color: colors.greenDark, background: colors.greenLight, padding: "13px 18px", borderRadius: 14, textDecoration: "none" }}
            >
              Publicação {i + 1} no Instagram
            </a>
          ))}
        </div>
      </div>
    );
  }

  const hasMany = urls.length > 1;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {!ready && (
        <p style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 14.5, color: colors.ink3, margin: 0, textAlign: "center" }}>
          Carregando as publicações…
        </p>
      )}

      <div style={{ position: "relative", minWidth: 0 }}>
        <div ref={emblaRef} style={{ overflow: "hidden", cursor: "grab" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 18, padding: "2px 2px 6px" }}>
            {urls.map((url) => (
              <blockquote
                key={url}
                className="instagram-media"
                data-instgrm-permalink={url}
                data-instgrm-version="14"
                style={{
                  background: colors.card, border: `1px solid ${colors.line}`, borderRadius: 18, margin: 0, padding: 0,
                  flex: "0 0 min(360px,82vw)", minWidth: 0
                }}
              >
                <a href={url} style={{ display: "block", padding: "18px 20px", fontFamily: fonts.heading, fontWeight: 600, color: colors.greenDark }}>
                  Ver publicação no Instagram
                </a>
              </blockquote>
            ))}
          </div>
        </div>

        {hasMany && canGoBack && (
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Publicação anterior"
            style={{
              position: "absolute", top: "50%", left: -6, transform: "translateY(-50%)",
              width: 40, height: 40, borderRadius: 999, border: `1px solid ${colors.line}`, background: colors.card,
              color: colors.greenDark, fontSize: 18, lineHeight: 1, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
            }}
          >
            ‹
          </button>
        )}

        {hasMany && canGoForward && (
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Próxima publicação"
            style={{
              position: "absolute", top: "50%", right: -6, transform: "translateY(-50%)",
              width: 40, height: 40, borderRadius: 999, border: `1px solid ${colors.line}`, background: colors.card,
              color: colors.greenDark, fontSize: 18, lineHeight: 1, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
            }}
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}

export default function InstagramSection() {
  if (!hasInstagram) return null;

  const hasPosts = INSTAGRAM.posts.length > 0;

  return (
    <section id="instagram" style={{ background: colors.backgroundAlt, padding: "clamp(60px,9vw,104px) 0" }}>
      <div style={{ maxWidth: maxWidth, margin: "0 auto", padding: gutter }}>
        <div style={{ maxWidth: "40em", margin: "0 auto", textAlign: "center" }}>
          <span style={{ display: "inline-block", fontFamily: fonts.heading, fontWeight: 600, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: colors.greenDark, background: colors.greenLight, padding: "8px 16px", borderRadius: 999 }}>
            O dia a dia
          </span>

          <h2 style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: "clamp(30px,5vw,42px)", lineHeight: 1.1, letterSpacing: "-0.02em", margin: "20px 0 0", color: colors.ink, textWrap: "balance" }}>
            O resgate acontece antes da foto bonita
          </h2>

          <p style={{ fontSize: "clamp(16px,2vw,18px)", lineHeight: 1.65, color: colors.ink2, margin: "18px auto 0", maxWidth: "34em" }}>
            É no Instagram que mostramos o trabalho enquanto ele acontece: o resgate de madrugada, a fila do veterinário, o primeiro banho, o dia da adoção. Quem acompanha por lá entende para onde vai cada doação.
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, flexWrap: "wrap", marginTop: 28 }}>
            <a
              href={instagramProfile}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 16, background: colors.green, color: colors.card, padding: "15px 26px", borderRadius: 999, textDecoration: "none" }}
            >
              Ver no Instagram
            </a>
            <span style={{ fontFamily: fonts.mono, fontSize: 15, color: colors.ink3 }}>
              @{INSTAGRAM.username}
            </span>
          </div>
        </div>

        {hasPosts && (
          <div style={{ marginTop: "clamp(36px,5vw,56px)" }}>
            <Posts urls={INSTAGRAM.posts} />
          </div>
        )}
      </div>
    </section>
  );
}
