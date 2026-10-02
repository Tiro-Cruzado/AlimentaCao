"use client";

import { useEffect, useState } from "react";
import { MERCADO_PAGO, PIX, AMOUNTS } from "../data/payment.js";
import {
  calculateCard,
  validateAmount,
  formatBRL,
  CARD_FEE,
} from "../lib/fee.js";
import { CONTACT } from "../data/contact.js";
import { buildPixPayload } from "../lib/pix.js";
import PixQrCode from "./PixQrCode.jsx";
import { colors, fonts } from "../theme.js";
import { FEATURES } from "../data/features.js";
import { ComingSoonBadge } from "./ComingSoon.jsx";
import { card } from "./cardStyle.js";

const inputStyle = {
  width: "100%",
  // Without this, padding and border add to the width and the field overflows the card.
  boxSizing: "border-box",
  fontSize: 16,
  color: colors.ink,
  background: colors.background,
  border: `1.5px solid ${colors.lineStrong}`,
  borderRadius: 16,
  padding: "15px 16px",
  fontFamily: fonts.heading,
  fontWeight: 600,
};

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

function tabStyle(active) {
  return {
    flex: 1,
    fontFamily: fonts.heading,
    fontWeight: 700,
    fontSize: 15,
    padding: "12px 10px",
    borderRadius: 14,
    cursor: "pointer",
    border: "none",
    background: active ? colors.card : "transparent",
    color: active ? colors.ink : colors.ink3,
    boxShadow: active ? "0 1px 3px rgba(35,49,47,0.12)" : "none",
  };
}

function primaryButton(active, background = colors.greenDark, ink = colors.card) {
  return {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    textAlign: "center",
    fontFamily: fonts.heading,
    fontWeight: 700,
    fontSize: 16.5,
    background: active ? background : "#E7E2DA",
    color: active ? ink : "#9AA5A2",
    border: "none",
    padding: "16px 24px",
    borderRadius: 999,
    textDecoration: "none",
    cursor: active ? "pointer" : "not-allowed",
  };
}

function Notice({ title, children }) {
  return (
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
        {title}
      </p>
      <p
        style={{
          fontSize: 14.5,
          lineHeight: 1.6,
          color: colors.ink2,
          margin: "7px 0 0",
        }}
      >
        {children}
      </p>
    </div>
  );
}

// Messages for whoever comes back from Mercado Pago (the route's back_urls).
// The keys are the values of the `pagamento` query param, so they stay as is.
const RETURN_STATUS = {
  aprovado: {
    title: "Recebemos sua doação. Obrigado!",
    text: "O comprovante chega no seu e-mail pelo Mercado Pago.",
    background: colors.greenLight,
    ink: "#34492A",
  },
  pendente: {
    title: "Pagamento em análise",
    text:
      "O Mercado Pago está conferindo o pagamento. Você recebe um e-mail assim que for aprovado.",
    background: colors.blueLight,
    ink: "#2E4A66",
  },
  falhou: {
    title: "O pagamento não foi concluído",
    text:
      "Nenhum valor foi cobrado. Você pode tentar de novo com outro cartão ou doar por Pix.",
    background: colors.amberLight,
    ink: colors.amberInk,
  },
};

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

// No payment method enabled: Pix switched off in features.js and card
// switched off in payment.js. The form gives way to this notice.
const NO_PAYMENT = !FEATURES.pix && !MERCADO_PAGO.cardEnabled;

function DonationComingSoon() {
  const text = "Olá! Quero fazer uma doação para a AlimentaCão.";
  const link = CONTACT.whatsapp
    ? `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`
    : `mailto:${CONTACT.email}?subject=${encodeURIComponent("Quero doar")}&body=${encodeURIComponent(text)}`;
  return (
    <>
      <div>
        <ComingSoonBadge />
      </div>
      <h3 style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 24, lineHeight: 1.2, margin: 0, color: colors.ink }}>
        Doação pelo site
      </h3>
      <p style={{ fontSize: 16, lineHeight: 1.6, color: colors.ink2, margin: 0 }}>
        Estamos terminando de preparar o pagamento por aqui. Enquanto isso, quem quiser ajudar pode combinar a doação direto com a gente.
      </p>
      <a
        href={link}
        target={CONTACT.whatsapp ? "_blank" : undefined}
        rel={CONTACT.whatsapp ? "noopener noreferrer" : undefined}
        style={{ ...primaryButton(true), textDecoration: "none" }}
      >
        {CONTACT.whatsapp ? "Quero doar pelo WhatsApp" : "Quero doar"}
      </a>
    </>
  );
}

// One-time donation: text on the left and a card with Pix / Card on the right.
// The surrounding section (background, "Uma vez / Todo mês" selector) is Contribute.jsx.
export default function DonateForm() {
  const [selected, setSelected] = useState(90); // number or "custom"
  const [typedAmount, setTypedAmount] = useState("");
  const [tab, setTab] = useState(FEATURES.pix ? "pix" : "mp");
  const [clicked, setClicked] = useState(false);
  const [coverFee, setCoverFee] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cardError, setCardError] = useState("");
  const [returnStatus, setReturnStatus] = useState(null);

  // Back from Mercado Pago: /?pagamento=aprovado#doar
  useEffect(() => {
    const status = new URLSearchParams(window.location.search).get(
      "pagamento",
    );
    if (RETURN_STATUS[status]) {
      setReturnStatus(status);
      setTab("mp");
      if (status === "aprovado") setClicked(true);
    }
  }, []);

  // The QR is only created when the donor confirms. We keep the amount that
  // generated the code: if they change their mind later, the old QR goes away
  // instead of staying on screen charging an amount that is no longer the chosen one.
  const [qrAmount, setQrAmount] = useState(null);

  const chosenAmount =
    selected === "custom" ? Number(typedAmount) || 0 : selected;
  const qrVisible = qrAmount !== null && qrAmount === chosenAmount;

  const pixCode = qrVisible
    ? buildPixPayload({
        key: PIX.key,
        name: PIX.recipientName,
        city: PIX.city,
        amount: qrAmount,
        txid: `DOACAO${qrAmount}`,
      })
    : "";

  const cardProblem =
    chosenAmount > 0 ? validateAmount(chosenAmount) : null;
  const breakdown =
    chosenAmount > 0 && !cardProblem
      ? calculateCard(chosenAmount, coverFee)
      : null;
  const feeIfCovered =
    chosenAmount > 0 && !cardProblem
      ? calculateCard(chosenAmount, true).fee
      : 0;
  const canPayByCard = Boolean(breakdown) && !submitting;

  async function payByCard() {
    if (!canPayByCard) return;
    setSubmitting(true);
    setCardError("");
    try {
      const r = await fetch("/api/doacao", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount: chosenAmount, coverFee }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.url)
        throw new Error(data.message || "Falha ao criar o pagamento.");
      window.location.href = data.url;
    } catch (e) {
      setCardError(e.message || "Falha ao criar o pagamento.");
      setSubmitting(false);
    }
  }

  function chooseAmount(v) {
    setSelected(v);
    setQrAmount(null);
    setCardError("");
    if (v !== "custom") setTypedAmount("");
  }

  const donationNotice = `Olá! Acabei de doar para a AlimentaCão${chosenAmount > 0 ? ` (R$ ${chosenAmount})` : ""}. Meu nome é `;
  const noticeLink = CONTACT.whatsapp
    ? `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(donationNotice)}`
    : `mailto:${CONTACT.email}?subject=${encodeURIComponent("Acabei de doar")}&body=${encodeURIComponent(donationNotice)}`;

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
          Doação única
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
          Sem compromisso mensal. O valor vai para o gasto mais urgente da
          semana, que quase sempre é ração ou cirurgia.
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
          {AMOUNTS.map((v) => (
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
                  background: colors.amber,
                  marginTop: 8,
                  flex: "none",
                }}
              />
              R$ {v.amount} — {v.covers}
            </li>
          ))}
        </ul>
      </div>

      <div style={card}>
        {NO_PAYMENT ? (
          <DonationComingSoon />
        ) : (
        <>
        {returnStatus && (
          <div
            role="status"
            style={{
              background: RETURN_STATUS[returnStatus].background,
              borderRadius: 20,
              padding: "16px 18px",
            }}
          >
            <p
              style={{
                fontFamily: fonts.heading,
                fontWeight: 700,
                fontSize: 15.5,
                color: RETURN_STATUS[returnStatus].ink,
                margin: 0,
              }}
            >
              {RETURN_STATUS[returnStatus].title}
            </p>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: colors.ink2,
                margin: "6px 0 0",
              }}
            >
              {RETURN_STATUS[returnStatus].text}
            </p>
          </div>
        )}

        <h3
          style={{
            fontFamily: fonts.heading,
            fontWeight: 700,
            fontSize: 24,
            margin: 0,
            color: colors.ink,
          }}
        >
          Escolha o valor
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(90px,1fr))",
            gap: 10,
          }}
        >
          {AMOUNTS.map((v) => (
            <button
              key={v.amount}
              type="button"
              onClick={() => chooseAmount(v.amount)}
              aria-pressed={selected === v.amount}
              style={optionStyle(selected === v.amount)}
            >
              R$ {v.amount}
            </button>
          ))}
          <button
            type="button"
            onClick={() => chooseAmount("custom")}
            aria-pressed={selected === "custom"}
            style={optionStyle(selected === "custom")}
          >
            Outro
          </button>
        </div>

        {selected === "custom" && (
          <div>
            <label
              htmlFor="custom-amount"
              style={{
                display: "block",
                fontFamily: fonts.heading,
                fontWeight: 600,
                fontSize: 13.5,
                color: colors.ink2,
                marginBottom: 7,
              }}
            >
              Quanto você quer doar?
            </label>
            <input
              id="custom-amount"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={typedAmount}
              onChange={(e) => {
                setTypedAmount(e.target.value);
                setQrAmount(null);
              }}
              placeholder="Valor em reais"
              style={inputStyle}
            />
          </div>
        )}

        <div
          role="tablist"
          aria-label="Como doar"
          style={{
            display: "flex",
            gap: 6,
            background: colors.backgroundAlt,
            padding: 5,
            borderRadius: 18,
          }}
        >
          <button
            role="tab"
            aria-selected={tab === "pix"}
            type="button"
            disabled={!FEATURES.pix}
            title={FEATURES.pix ? undefined : "Pix em breve"}
            onClick={() => FEATURES.pix && setTab("pix")}
            style={{ ...tabStyle(tab === "pix"), display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: FEATURES.pix ? "pointer" : "not-allowed" }}
          >
            Pix
            {!FEATURES.pix && <ComingSoonBadge small />}
          </button>
          <button
            role="tab"
            aria-selected={tab === "mp"}
            type="button"
            disabled={!MERCADO_PAGO.cardEnabled}
            title={MERCADO_PAGO.cardEnabled ? undefined : "Cartão em breve"}
            onClick={() => MERCADO_PAGO.cardEnabled && setTab("mp")}
            style={{ ...tabStyle(tab === "mp"), display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: MERCADO_PAGO.cardEnabled ? "pointer" : "not-allowed" }}
          >
            Cartão
            {!MERCADO_PAGO.cardEnabled && <ComingSoonBadge small />}
          </button>
        </div>

        {tab === "pix" &&
          FEATURES.pix &&
          (!PIX.key ? (
            // PIX_KEY is missing from the environment (Vercel or .env.local).
            <Notice title="Pix em breve">
              Estamos terminando de configurar o Pix da ONG. Tente de novo em
              breve.
            </Notice>
          ) : qrVisible ? (
            <>
              <PixQrCode code={pixCode} amount={qrAmount} />
              <p
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  color: colors.ink2,
                  margin: 0,
                  textAlign: "center",
                }}
              >
                Confira se o recebedor é{" "}
                <strong style={{ color: colors.ink }}>{PIX.legalName}</strong>
                {PIX.recipientRole ? `, ${PIX.recipientRole},` : ""} antes de
                confirmar. Se aparecer outro nome, não conclua e nos avise.
              </p>
              {PIX.recipientNote && (
                <p
                  style={{
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: colors.ink3,
                    margin: "-8px 0 0",
                    textAlign: "center",
                  }}
                >
                  {PIX.recipientNote}
                </p>
              )}
              <button
                type="button"
                onClick={() => setQrAmount(null)}
                style={{
                  fontFamily: fonts.heading,
                  fontWeight: 700,
                  fontSize: 14.5,
                  background: "transparent",
                  color: colors.greenDark,
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Escolher outro valor
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={chosenAmount <= 0}
                onClick={() => setQrAmount(chosenAmount)}
                style={primaryButton(chosenAmount > 0)}
              >
                {chosenAmount > 0
                  ? `Gerar QR Code de R$ ${chosenAmount}`
                  : "Digite um valor"}
              </button>
              <p
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  color: colors.ink3,
                  margin: "-8px 0 0",
                  textAlign: "center",
                }}
              >
                O código já vem com o valor preenchido. Pix não tem taxa: chega
                inteiro na conta da ONG.
              </p>
            </>
          ))}

        {tab === "mp" &&
          (!MERCADO_PAGO.cardEnabled ? (
            <Notice title="Cartão ainda não configurado">
              Falta cadastrar o token do Mercado Pago no Cloudflare e ligar{" "}
              {inlineCode("cardEnabled")} em {inlineCode("src/data/payment.js")}. Até
              lá o botão fica desligado de propósito — melhor não receber do que
              fingir que recebeu.
            </Notice>
          ) : (
            <>
              {cardProblem && (
                <p
                  role="alert"
                  style={{
                    fontFamily: fonts.heading,
                    fontWeight: 600,
                    fontSize: 14,
                    color: "#A34428",
                    margin: 0,
                  }}
                >
                  {cardProblem}
                </p>
              )}

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
                    {feeIfCovered > 0
                      ? `Adicionar ${formatBRL(feeIfCovered)} para cobrir a taxa do cartão`
                      : "Cobrir a taxa do cartão"}
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
                    {chosenAmount > 0 && !cardProblem
                      ? `Assim a ONG recebe os ${formatBRL(chosenAmount)} inteiros. O Mercado Pago cobra ${(CARD_FEE * 100).toLocaleString("pt-BR")}% por pagamento.`
                      : "Assim a ONG recebe o valor inteiro que você escolheu."}
                  </span>
                </span>
              </label>

              {breakdown && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    padding: "2px 4px",
                  }}
                >
                  <Row label="Doação" value={formatBRL(breakdown.amount)} />
                  {coverFee && (
                    <Row label="Taxa do cartão" value={formatBRL(breakdown.fee)} />
                  )}
                  <div
                    style={{
                      borderTop: `1px solid ${colors.line}`,
                      margin: "2px 0",
                    }}
                  />
                  <Row
                    label="Total no cartão"
                    value={formatBRL(breakdown.total)}
                    strong
                  />
                  {!coverFee && (
                    <p
                      style={{
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: colors.ink3,
                        margin: "2px 0 0",
                      }}
                    >
                      A ONG recebe cerca de {formatBRL(breakdown.net)} depois da
                      taxa.
                    </p>
                  )}
                </div>
              )}

              <button
                type="button"
                disabled={!canPayByCard}
                onClick={payByCard}
                style={primaryButton(
                  canPayByCard,
                  colors.amber,
                  colors.amberInk,
                )}
              >
                {submitting
                  ? "Abrindo o Mercado Pago…"
                  : breakdown
                    ? `Pagar ${formatBRL(breakdown.total)} com cartão`
                    : "Digite um valor"}
              </button>

              {cardError && (
                <p
                  role="alert"
                  style={{
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: "#A34428",
                    margin: "-6px 0 0",
                    textAlign: "center",
                  }}
                >
                  {cardError} Tente de novo em instantes, ou doe por Pix.
                </p>
              )}

              <p
                style={{
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  color: colors.ink3,
                  margin: "-8px 0 0",
                  textAlign: "center",
                }}
              >
                Você vai para o Mercado Pago para digitar o cartão. Pagamento à
                vista, crédito ou débito.
              </p>
            </>
          ))}

        {clicked && (
          <div
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
                fontSize: 15,
                color: "#34492A",
                margin: 0,
              }}
            >
              Depois de doar, nos avise
            </p>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.6,
                color: colors.ink2,
                margin: "6px 0 12px",
              }}
            >
              O extrato mostra só o valor. Com seu nome, conseguimos te
              agradecer e mandar notícias de quem você ajudou.
            </p>
            <a
              href={noticeLink}
              style={{
                display: "inline-block",
                fontFamily: fonts.heading,
                fontWeight: 700,
                fontSize: 14.5,
                background: colors.greenDark,
                color: colors.card,
                padding: "11px 18px",
                borderRadius: 999,
                textDecoration: "none",
              }}
            >
              Avisar que doei
            </a>
          </div>
        )}
        </>
        )}
      </div>
    </>
  );
}
