"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocationParts } from "../lib/useLocationParts.js";
import { SPONSORSHIP, TEST_MODE } from "../data/payment.js";
import { ANIMALS, SPECIES } from "../data/animals.js";
import generated from "../data/sponsorship.generated.json";
import { calculateCard, formatBRL, CARD_FEE } from "../lib/fee.js";
import { canBeSponsored } from "../lib/sponsorship.js";
import { colors, fonts } from "../theme.js";
import { card } from "./cardStyle.js";

// Sponsorship: a monthly card contribution for an animal picked among the ones
// available for adoption. Each animal × amount has two plans already created
// on Mercado Pago (with and without the fee built in — see
// scripts/create-mercado-pago-plans.mjs); the screen only picks which link to
// open. There is no server code here.
//
// /?apadrinhar=feijao#apadrinhar opens with Feijão already selected (button on
// the animal page).

const SPONSORABLE = ANIMALS.filter(canBeSponsored);

// Native select: with dozens of animals it is what works well on phones (opens
// the system wheel/list) and on the keyboard (typing the initial jumps to the
// name).
const selectStyle = {
  width: "100%",
  boxSizing: "border-box",
  appearance: "none",
  WebkitAppearance: "none",
  fontFamily: fonts.heading,
  fontWeight: 700,
  fontSize: 16,
  color: colors.ink,
  background: `${colors.background} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='9' viewBox='0 0 14 9'%3E%3Cpath d='M1 1l6 6 6-6' fill='none' stroke='%234C7A38' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") no-repeat right 16px center`,
  border: `1.5px solid ${colors.lineStrong}`,
  borderRadius: 16,
  padding: "15px 44px 15px 16px",
  cursor: "pointer",
};

// Dogs and cats in separate groups, each group in alphabetical order.
const GROUPS = Object.entries(SPECIES)
  .map(([species, info]) => ({
    species,
    label: info.plural,
    animals: SPONSORABLE.filter((a) => a.species === species).sort((x, y) =>
      x.name.localeCompare(y.name, "pt-BR"),
    ),
  }))
  .filter((g) => g.animals.length);

function optionStyle(active) {
  return {
    fontFamily: fonts.heading,
    fontWeight: 700,
    fontSize: 15,
    textAlign: "center",
    padding: "14px 8px",
    borderRadius: 18,
    cursor: "pointer",
    border: `1.5px solid ${active ? colors.green : colors.lineStrong}`,
    background: active ? colors.greenLight : colors.background,
    color: active ? "#34492A" : "#5A6A68",
  };
}

function buttonStyle(active) {
  return {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    textAlign: "center",
    fontFamily: fonts.heading,
    fontWeight: 700,
    fontSize: 16.5,
    background: active ? colors.greenDark : "#E7E2DA",
    color: active ? colors.card : "#9AA5A2",
    padding: "16px 24px",
    borderRadius: 999,
    textDecoration: "none",
    cursor: active ? "pointer" : "not-allowed",
  };
}

function Row({ label, value, strong }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        fontFamily: fonts.heading,
        fontWeight: strong ? 700 : 600,
        fontSize: strong ? 16 : 14.5,
        color: strong ? colors.ink : colors.ink2,
      }}
    >
      <span>{label}</span>
      <span style={{ fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

const inlineCode = (t) => (
  <code
    style={{
      fontFamily: fonts.mono,
      fontSize: 13,
      background: colors.backgroundAlt,
      padding: "1px 5px",
      borderRadius: 5,
    }}
  >
    {t}
  </code>
);

export default function Sponsorship() {
  const amounts = SPONSORSHIP.amounts;
  const { search } = useLocationParts();
  const [slug, setSlug] = useState(GROUPS[0]?.animals[0]?.slug);
  const [amount, setAmount] = useState(
    amounts.find((v) => v.amount === 30)?.amount ?? amounts[0]?.amount,
  );
  const [coverFee, setCoverFee] = useState(true);
  const [returnedWith, setReturnedWith] = useState(null); // name of the sponsored animal

  useEffect(() => {
    const q = new URLSearchParams(search);
    const requested = q.get("apadrinhar");
    if (requested && SPONSORABLE.some((a) => a.slug === requested)) setSlug(requested);
    if (q.get("apadrinhamento") === "ok") {
      const returned = ANIMALS.find((a) => a.slug === q.get("animal"));
      setReturnedWith(returned?.name || "");
    }
  }, [search]);

  const animal = SPONSORABLE.find((a) => a.slug === slug);
  const charge = calculateCard(amount, coverFee);
  const feeIfCovered = calculateCard(amount, true).fee;
  const plan =
    generated?.animals?.[slug]?.plans?.[amount]?.[
      coverFee ? "withFee" : "withoutFee"
    ];

  // The link is only valid if the plan was created with the same amount the
  // screen shows. If the fee changed in src/lib/fee.js and nobody recreated the
  // plans, the button stays disabled instead of sending the sponsor to a
  // different amount.
  const configured = Object.keys(generated?.animals || {}).length > 0;
  const planValid = Boolean(plan?.url) && plan.total === charge.total;

  return (
    <>
      <div>
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
          Apadrinhe
        </h2>
        <p
          style={{
            fontSize: "clamp(16px,2vw,18px)",
            lineHeight: 1.65,
            color: colors.ink2,
            margin: "18px 0 0",
            maxWidth: "32em",
          }}
        >
          Escolha um dos animais que estão esperando adoção e contribua todo mês
          com os cuidados dele. Com o valor garantido, a ONG consegue planejar
          ração, vacinas e veterinário.
        </p>
        <ul
          style={{
            margin: "26px 0 0",
            padding: 0,
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {amounts.map((v) => (
            <li
              key={v.amount}
              style={{
                fontSize: 16,
                color: colors.ink2,
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: colors.green,
                  marginTop: 8,
                  flex: "none",
                }}
              />
              R$ {v.amount} por mês — {v.covers}
            </li>
          ))}
        </ul>
        <p
          style={{
            fontSize: 14.5,
            lineHeight: 1.6,
            color: colors.ink3,
            margin: "22px 0 0",
            maxWidth: "32em",
          }}
        >
          Cobrança automática no cartão de crédito. Você cancela quando quiser,
          em Assinaturas, na sua conta do Mercado Pago. Quando o seu afilhado
          for adotado, a gente entra em contato para você decidir se continua
          com outro animal.
        </p>
      </div>

      <div style={card}>
        {returnedWith !== null && (
          <div
            role="status"
            style={{
              background: colors.greenLight,
              borderRadius: 20,
              padding: "16px 18px",
            }}
          >
            <p
              style={{
                fontFamily: fonts.heading,
                fontWeight: 700,
                fontSize: 15.5,
                color: "#34492A",
                margin: 0,
              }}
            >
              {returnedWith
                ? `Obrigado por apadrinhar ${returnedWith}!`
                : "Obrigado por apadrinhar!"}
            </p>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: colors.ink2,
                margin: "6px 0 0",
              }}
            >
              Assim que o Mercado Pago confirmar a primeira cobrança, você
              recebe o comprovante por e-mail.
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="sponsored-animal"
            style={{
              display: "block",
              fontFamily: fonts.heading,
              fontWeight: 700,
              fontSize: 22,
              margin: "0 0 12px",
              color: colors.ink,
            }}
          >
            Quem você quer apadrinhar?
          </label>
          {SPONSORABLE.length === 0 ? (
            <p
              style={{
                fontSize: 14.5,
                lineHeight: 1.6,
                color: colors.ink2,
                margin: 0,
              }}
            >
              Nenhum animal disponível para apadrinhar agora. Volte em breve —
              isso muda toda semana.
            </p>
          ) : (
            <>
              <select
                id="sponsored-animal"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                style={selectStyle}
              >
                {GROUPS.map((g) => (
                  <optgroup
                    key={g.species}
                    label={`${g.label} (${g.animals.length})`}
                  >
                    {g.animals.map((a) => (
                      <option key={a.slug} value={a.slug}>
                        {a.name} · {a.age}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {animal && (
                <p
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.5,
                    color: colors.ink2,
                    margin: "10px 2px 0",
                  }}
                >
                  {animal.summary}{" "}
                  <Link
                    href={`/animal/${animal.slug}`}
                    style={{
                      fontFamily: fonts.heading,
                      fontWeight: 700,
                      color: colors.greenDark,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Ver a história →
                  </Link>
                </p>
              )}
            </>
          )}
        </div>

        <div>
          <h3
            style={{
              fontFamily: fonts.heading,
              fontWeight: 700,
              fontSize: 22,
              margin: "0 0 12px",
              color: colors.ink,
            }}
          >
            Quanto por mês?
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${amounts.length},minmax(0,1fr))`,
              gap: 8,
            }}
          >
            {amounts.map((v) => (
              <button
                key={v.amount}
                type="button"
                onClick={() => setAmount(v.amount)}
                aria-pressed={amount === v.amount}
                style={{
                  ...optionStyle(amount === v.amount),
                  padding: "14px 2px",
                  whiteSpace: "nowrap",
                  fontSize: "clamp(13px,3.8vw,15px)",
                }}
              >
                R$ {v.amount}
              </button>
            ))}
          </div>
        </div>

        <label
          style={{
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
            background: colors.background,
            border: `1.5px solid ${coverFee ? colors.green : colors.lineStrong}`,
            borderRadius: 18,
            padding: "14px 16px",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={coverFee}
            onChange={(e) => setCoverFee(e.target.checked)}
            style={{
              width: 20,
              height: 20,
              marginTop: 2,
              accentColor: colors.greenDark,
              flex: "none",
            }}
          />
          <span>
            <span
              style={{
                display: "block",
                fontFamily: fonts.heading,
                fontWeight: 700,
                fontSize: 15,
                color: colors.ink,
              }}
            >
              Adicionar {formatBRL(feeIfCovered)} por mês para cobrir a taxa do
              cartão
            </span>
            <span
              style={{
                display: "block",
                fontSize: 13.5,
                lineHeight: 1.5,
                color: colors.ink2,
                marginTop: 3,
              }}
            >
              Assim a ONG recebe os {formatBRL(amount)} inteiros todo mês. O Mercado
              Pago cobra {(CARD_FEE * 100).toLocaleString("pt-BR")}% por
              cobrança.
            </span>
          </span>
        </label>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: "2px 4px",
          }}
        >
          <Row
            label={
              animal ? `Apadrinhamento de ${animal.name}` : "Apadrinhamento"
            }
            value={formatBRL(charge.amount)}
          />
          {coverFee && (
            <Row label="Taxa do cartão" value={formatBRL(charge.fee)} />
          )}
          <div
            style={{ borderTop: `1px solid ${colors.line}`, margin: "2px 0" }}
          />
          <Row label="Por mês no cartão" value={formatBRL(charge.total)} strong />
          {!coverFee && (
            <p
              style={{
                fontSize: 13,
                lineHeight: 1.5,
                color: colors.ink3,
                margin: "2px 0 0",
              }}
            >
              A ONG recebe cerca de {formatBRL(charge.net)} por mês depois da
              taxa.
            </p>
          )}
        </div>

        {!configured ? (
          <div
            style={{
              background: colors.amberLight,
              border: `1px solid ${colors.amber}`,
              borderRadius: 20,
              padding: "16px 18px",
            }}
          >
            <p
              style={{
                fontFamily: fonts.heading,
                fontWeight: 700,
                fontSize: 15,
                color: colors.amberInk,
                margin: 0,
              }}
            >
              Apadrinhamento ainda não configurado
            </p>
            <p
              style={{
                fontSize: 14.5,
                lineHeight: 1.6,
                color: colors.ink2,
                margin: "7px 0 0",
              }}
            >
              Falta criar os planos no Mercado Pago — o{" "}
              {inlineCode("npm run build")} faz isso quando o token está configurado
              (ver README). Até lá o botão fica desligado de propósito.
            </p>
          </div>
        ) : animal && !generated?.animals?.[slug] ? (
          <div
            style={{
              background: colors.amberLight,
              border: `1px solid ${colors.amber}`,
              borderRadius: 20,
              padding: "16px 18px",
            }}
          >
            <p
              style={{
                fontFamily: fonts.heading,
                fontWeight: 700,
                fontSize: 15,
                color: colors.amberInk,
                margin: 0,
              }}
            >
              {animal.name} ainda não tem plano
            </p>
            <p
              style={{
                fontSize: 14.5,
                lineHeight: 1.6,
                color: colors.ink2,
                margin: "7px 0 0",
              }}
            >
              Chegou há pouco — o plano é criado na próxima publicação do site.
              Enquanto isso, escolha outro animal ou faça uma doação.
            </p>
          </div>
        ) : !planValid ? (
          <div
            style={{
              background: colors.amberLight,
              border: `1px solid ${colors.amber}`,
              borderRadius: 20,
              padding: "16px 18px",
            }}
          >
            <p
              style={{
                fontFamily: fonts.heading,
                fontWeight: 700,
                fontSize: 15,
                color: colors.amberInk,
                margin: 0,
              }}
            >
              Plano desatualizado
            </p>
            <p
              style={{
                fontSize: 14.5,
                lineHeight: 1.6,
                color: colors.ink2,
                margin: "7px 0 0",
              }}
            >
              O valor deste plano no Mercado Pago não bate com o da tela. Rode{" "}
              {inlineCode("npm run plans:mp")} de novo.
            </p>
          </div>
        ) : null}

        <a
          href={planValid && animal ? plan.url : undefined}
          aria-disabled={!(planValid && animal)}
          style={buttonStyle(planValid && Boolean(animal))}
        >
          {animal
            ? `Apadrinhar ${animal.name} por ${formatBRL(charge.total)}/mês`
            : `Apadrinhar por ${formatBRL(charge.total)}/mês`}
        </a>
        <p
          style={{
            fontSize: 13.5,
            lineHeight: 1.55,
            color: colors.ink3,
            margin: "-8px 0 0",
            textAlign: "center",
          }}
        >
          Você vai para o Mercado Pago para cadastrar o cartão de crédito.
        </p>
      </div>
    </>
  );
}
