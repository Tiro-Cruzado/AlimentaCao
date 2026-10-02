"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ANIMALS,
  PER_PAGE,
  STATUS,
  SIZES,
  SPECIES,
  speciesName,
  waitingTime,
  coverPhoto,
} from "../data/animals.js";
import { colors, fonts, maxWidth, gutter } from "../theme.js";
import { useMounted } from "../lib/useMounted.js";

const SPECIES_FILTER = [
  { value: "all", label: "Todos" },
  { value: "dog", label: SPECIES.dog.plural },
  { value: "cat", label: SPECIES.cat.plural },
  { value: "other", label: SPECIES.other.plural },
];

const SIZE_FILTER = [
  { value: "all", label: "Todos" },
  { value: "small", label: SIZES.small.label },
  { value: "medium", label: SIZES.medium.label },
  { value: "large", label: SIZES.large.label },
];

const SITUATION_FILTER = [
  { value: "waiting", label: "Esperando um lar" },
  { value: "urgent", label: "Cuidado urgente" },
  { value: "adopted", label: "Já adotados" },
  { value: "all", label: "Todos" },
];

function chip(active) {
  return {
    fontFamily: fonts.heading,
    fontWeight: 700,
    fontSize: 14.5,
    padding: "10px 16px",
    borderRadius: 999,
    cursor: "pointer",
    transition: "background .15s, border-color .15s, color .15s",
    border: `1.5px solid ${active ? colors.greenDark : colors.lineStrong}`,
    background: active ? colors.greenDark : colors.card,
    color: active ? colors.card : colors.ink2,
  };
}

function navStyle(disabled) {
  return {
    fontFamily: fonts.heading,
    fontWeight: 700,
    fontSize: 15,
    padding: "12px 20px",
    borderRadius: 999,
    border: `1.5px solid ${colors.lineStrong}`,
    background: colors.card,
    color: disabled ? "#C3CCC2" : colors.greenDark,
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

function FilterGroup({ title, options, value, onChange }) {
  return (
    <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
      <legend
        style={{
          fontFamily: fonts.heading,
          fontWeight: 700,
          fontSize: 12.5,
          letterSpacing: "0.07em",
          textTransform: "uppercase",
          color: colors.ink3,
          padding: 0,
          marginBottom: 9,
        }}
      >
        {title}
      </legend>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={value === o.value}
            style={chip(value === o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

// Until the NGO does the photo shoot, the photo frame stays on the card, with
// a little paw in the colour of the situation. That way the grid keeps its
// rhythm and, when the photo lands in Sanity, it takes the same place without
// changing the layout.
function noPhotoBackground(animal, st) {
  if (animal.status === "adopted") return "#ECEFE8";
  if (animal.urgent) return "#FBEEDF";
  return st.background;
}

function NoPhoto({ color: tone }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
      }}
    >
      <svg
        width="34%"
        viewBox="0 0 100 100"
        style={{ maxWidth: 110, opacity: 0.4 }}
      >
        <g fill={tone}>
          <ellipse cx="50" cy="66" rx="22" ry="18" />
          <ellipse
            cx="22"
            cy="44"
            rx="9"
            ry="12"
            transform="rotate(-18 22 44)"
          />
          <ellipse
            cx="39"
            cy="26"
            rx="9"
            ry="12.5"
            transform="rotate(-6 39 26)"
          />
          <ellipse
            cx="61"
            cy="26"
            rx="9"
            ry="12.5"
            transform="rotate(6 61 26)"
          />
          <ellipse
            cx="78"
            cy="44"
            rx="9"
            ry="12"
            transform="rotate(18 78 44)"
          />
        </g>
      </svg>
      <span
        style={{
          fontFamily: fonts.heading,
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: tone,
          opacity: 0.75,
        }}
      >
        foto em breve
      </span>
    </div>
  );
}

export default function Gallery() {
  const mounted = useMounted();
  const [species, setSpecies] = useState("all");
  const [size, setSize] = useState("all");
  const [situation, setSituation] = useState("waiting");
  const [page, setPage] = useState(1);
  const listTop = useRef(null);

  // Changing page takes you back to the top of the list (the "7 animais
  // encontrados" count, right above the cards). Without this, whoever clicks
  // "Próxima" down there keeps looking at the bottom of the list and does not
  // see the new animals. Focus goes along, for keyboard or screen-reader users.
  function goToPage(n) {
    setPage(n);
    requestAnimationFrame(() => {
      const target = listTop.current;
      if (!target) return;
      const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;
      target.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "start",
      });
      target.focus({ preventScroll: true });
    });
  }

  function change(setter) {
    return (v) => {
      setter(v);
      setPage(1);
    };
  }

  const filtered = useMemo(() => {
    return ANIMALS.filter((a) => {
      if (species !== "all" && a.species !== species) return false;
      if (size !== "all" && a.size !== size) return false;
      if (situation === "waiting" && a.status === "adopted") return false;
      if (situation === "urgent" && !a.urgent) return false;
      if (situation === "adopted" && a.status !== "adopted") return false;
      return true;
    });
  }, [species, size, situation]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, pageCount);
  const pageItems = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE,
  );
  const clearFilters = () => {
    setSpecies("all");
    setSize("all");
    setSituation("waiting");
    setPage(1);
  };

  return (
    <section
      id="galeria"
      style={{ background: colors.backgroundAlt, padding: "clamp(60px,9vw,104px) 0" }}
    >
      <div style={{ maxWidth: maxWidth, margin: "0 auto", padding: gutter }}>
        <h2
          style={{
            fontFamily: fonts.heading,
            fontWeight: 700,
            fontSize: "clamp(30px,5vw,42px)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            margin: 0,
            color: colors.ink,
            textWrap: "balance",
          }}
        >
          Quem está esperando
        </h2>
        <p
          style={{
            fontSize: "clamp(16px,2vw,18px)",
            lineHeight: 1.6,
            color: colors.ink2,
            margin: "14px 0 0",
            maxWidth: "34em",
          }}
        >
          Cada um chegou de um jeito diferente. Clique em um nome para conhecer
          a história inteira.
        </p>

        <div
          style={{
            display: "flex",
            gap: "22px 40px",
            flexWrap: "wrap",
            marginTop: 30,
            paddingBottom: 24,
            borderBottom: `1px solid ${colors.line}`,
          }}
        >
          <FilterGroup
            title="Tipo"
            options={SPECIES_FILTER}
            value={species}
            onChange={change(setSpecies)}
          />
          <FilterGroup
            title="Porte"
            options={SIZE_FILTER}
            value={size}
            onChange={change(setSize)}
          />
          <FilterGroup
            title="Situação"
            options={SITUATION_FILTER}
            value={situation}
            onChange={change(setSituation)}
          />
        </div>

        <p
          ref={listTop}
          tabIndex={-1}
          aria-live="polite"
          className="gallery-list-top"
          style={{
            fontFamily: fonts.heading,
            fontWeight: 600,
            fontSize: 14.5,
            color: colors.ink3,
            margin: "16px 0 0",
            outline: "none",
          }}
        >
          {filtered.length === 0
            ? "Nenhum animal com esses filtros."
            : filtered.length === 1
              ? "1 animal encontrado"
              : `${filtered.length} animais encontrados`}
        </p>

        {filtered.length === 0 && (
          <div
            style={{
              background: colors.card,
              border: `1px solid ${colors.line}`,
              borderRadius: 24,
              padding: "30px 28px",
              marginTop: 20,
              maxWidth: 520,
            }}
          >
            <p
              style={{
                fontSize: 16.5,
                lineHeight: 1.6,
                color: colors.ink2,
                margin: "0 0 16px",
              }}
            >
              Ninguém com esse perfil está disponível agora — mas isso muda toda
              semana.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              style={{ ...chip(true), fontSize: 15 }}
            >
              Limpar filtros
            </button>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))",
            gap: "clamp(20px,3vw,34px)",
            marginTop: 26,
          }}
        >
          {pageItems.map((a) => {
            const st = STATUS[a.status];
            const waiting = waitingTime(a.rescueDate);
            const adopted = a.status === "adopted";
            const cover = coverPhoto(a);
            return (
              <article
                key={a.slug}
                style={{
                  background: colors.card,
                  border: `1px solid ${colors.line}`,
                  borderRadius: 30,
                  padding: 14,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Link
                  href={`/animal/${a.slug}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "1/1",
                      borderRadius: 22,
                      overflow: "hidden",
                      background: cover ? colors.backgroundAlt : noPhotoBackground(a, st),
                    }}
                  >
                    {cover ? (
                      <img
                        src={cover.src}
                        alt={cover.alt || `Foto de ${a.name}`}
                        loading="lazy"
                        style={{
                          position: "absolute",
                          inset: 0,
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: cover.focus,
                        }}
                      />
                    ) : (
                      <NoPhoto
                        color={
                          adopted ? colors.ink3 : a.urgent ? "#B8741A" : st.color
                        }
                      />
                    )}
                    {a.urgent && !adopted && (
                      <span
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          fontFamily: fonts.heading,
                          fontWeight: 700,
                          fontSize: 11,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          background: colors.amber,
                          color: colors.amberInk,
                          padding: "6px 12px",
                          borderRadius: 999,
                        }}
                      >
                        cuidado urgente
                      </span>
                    )}
                    {adopted && (
                      <span
                        style={{
                          position: "absolute",
                          top: 12,
                          right: 12,
                          fontFamily: fonts.heading,
                          fontWeight: 700,
                          fontSize: 11,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          background: colors.ink,
                          color: colors.card,
                          padding: "6px 12px",
                          borderRadius: 999,
                        }}
                      >
                        adotado
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      padding: "16px 8px 8px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 10,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <h3
                        style={{
                          fontFamily: fonts.heading,
                          fontWeight: 700,
                          fontSize: 22,
                          margin: 0,
                          color: colors.ink,
                        }}
                      >
                        {a.name}
                      </h3>
                      <span
                        style={{
                          fontFamily: fonts.heading,
                          fontWeight: 700,
                          fontSize: 11.5,
                          letterSpacing: "0.05em",
                          textTransform: "uppercase",
                          background: st.background,
                          color: st.color,
                          padding: "5px 10px",
                          borderRadius: 999,
                        }}
                      >
                        {st.label}
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: fonts.heading,
                        fontWeight: 600,
                        fontSize: 13,
                        color: colors.ink3,
                        margin: 0,
                        letterSpacing: "0.02em",
                      }}
                    >
                      {speciesName(a)} · {a.age} · Porte{" "}
                      {SIZES[a.size].label} · {a.sex}
                    </p>
                    <p
                      style={{
                        fontSize: 15,
                        lineHeight: 1.55,
                        color: colors.ink2,
                        margin: 0,
                        flex: 1,
                      }}
                    >
                      {a.summary}
                    </p>
                    {!adopted && waiting && (
                      <p
                        key={mounted ? "today" : "build"}
                        suppressHydrationWarning
                        style={{
                          fontFamily: fonts.heading,
                          fontWeight: 600,
                          fontSize: 13,
                          color: colors.ink3,
                          margin: 0,
                        }}
                      >
                        Esperando há {waiting}
                      </p>
                    )}
                  </div>
                </Link>

                <Link
                  href={`/animal/${a.slug}`}
                  style={{
                    fontFamily: fonts.heading,
                    fontWeight: 700,
                    fontSize: 15,
                    textAlign: "center",
                    background: adopted ? colors.card : colors.greenDark,
                    color: adopted ? colors.greenDark : colors.card,
                    border: adopted
                      ? `1.5px solid ${colors.lineStrong}`
                      : "1.5px solid transparent",
                    padding: "12px 18px",
                    borderRadius: 999,
                    textDecoration: "none",
                    margin: "6px 8px 4px",
                  }}
                >
                  {adopted
                    ? `Ver a história do ${a.name}`
                    : `Conhecer ${a.name}`}
                </Link>
              </article>
            );
          })}
        </div>

        {pageCount > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              flexWrap: "wrap",
              marginTop: "clamp(28px,4vw,44px)",
            }}
          >
            <button
              type="button"
              onClick={() => goToPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={navStyle(currentPage === 1)}
            >
              Anterior
            </button>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => goToPage(n)}
                aria-current={currentPage === n ? "page" : undefined}
                style={{ ...chip(currentPage === n), minWidth: 44 }}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => goToPage(Math.min(pageCount, currentPage + 1))}
              disabled={currentPage === pageCount}
              style={navStyle(currentPage === pageCount)}
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
