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
import { coverPhoto } from "../data/animals.js";
import { DONATABLE, findDonatable, donatableLabel, pixDescription, pixTxid } from "../lib/donation.js";
import { useLocationParts } from "../lib/useLocationParts.js";

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

// Amount cards: icon + amount + what it pays for.
function amountCardStyle(active) {
  return {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    boxSizing: "border-box",
    textAlign: "left",
    padding: "13px 15px",
    borderRadius: 18,
    cursor: "pointer",
    border: `1.5px solid ${active ? colors.greenDark : colors.lineStrong}`,
    background: active ? colors.greenLight : colors.card,
    transition: "border-color .15s, background .15s",
  };
}

function amountIconStyle(active) {
  return {
    flex: "none",
    width: 42,
    height: 42,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: active ? colors.greenDark : colors.amberLight,
    color: active ? colors.card : "#8A5A12",
    transition: "background .15s, color .15s",
  };
}

// Line icons (24×24, stroke = currentColor). The key comes from `icon` in AMOUNTS.
const ICON_PATHS = {
  bowl: ["M4 11h16a8 8 0 0 1-16 0z", "M8 20h8", "M9 4c0 1.5 1 2 1 3.5", "M13 4c0 1.5 1 2 1 3.5"],
  vaccine: ["M17 3l4 4", "M19 5l-4.5 4.5", "M11.5 6.5l6 6", "M16.5 11.5l-7 7h-3v-3l7-7", "M9 13l1.5 1.5", "M3 21l3.5-3.5"],
  vet: ["M6 4H5a2 2 0 0 0-2 2v3.5a5.5 5.5 0 0 0 11 0V6a2 2 0 0 0-2-2h-1", "M8.5 15v1a5 5 0 0 0 10 0v-2", "M18.5 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"],
  heart: ["M19.5 12.6 12 20l-7.5-7.4A5 5 0 1 1 12 6a5 5 0 1 1 7.5 6.6z"],
};

function AmountIcon({ name }) {
  const paths = ICON_PATHS[name] || ICON_PATHS.heart;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths.map((d) => <path key={d} d={d} />)}
    </svg>
  );
}

function AmountCard({ active, onClick, icon, title, detail }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} style={amountCardStyle(active)}>
      <span style={amountIconStyle(active)}>
        <AmountIcon name={icon} />
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 18.5, lineHeight: 1.2, color: colors.ink }}>{title}</span>
        <span style={{ fontFamily: fonts.heading, fontWeight: 500, fontSize: 13.5, lineHeight: 1.35, color: colors.ink2 }}>{detail}</span>
      </span>
    </button>
  );
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

// "Para quem é a doação?": general (the most urgent need) or one animal. The
// chosen animal goes in the Pix description, in the "Avisar que doei" message
// and in the card payment.
function ForAnimal({ value, animal, onChange }) {
  const photo = animal ? coverPhoto(animal) : null;
  return (
    <div>
      <label
        htmlFor="donation-animal"
        style={{ display: "block", fontFamily: fonts.heading, fontWeight: 700, fontSize: 24, color: colors.ink, marginBottom: 12 }}
      >
        Para quem é a doação?
      </label>
      <div style={{ position: "relative" }}>
        <select
          id="donation-animal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ ...inputStyle, appearance: "none", WebkitAppearance: "none", paddingRight: 44, cursor: "pointer" }}
        >
          <option value="">Onde for mais urgente</option>
          {DONATABLE.map((a) => (
            <option key={a.slug} value={a.slug}>
              {donatableLabel(a)}
            </option>
          ))}
        </select>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.ink3} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
        {animal &&
          (photo ? (
            <img
              src={photo.thumbnail || photo.src}
              alt=""
              onError={(e) => { e.currentTarget.style.display = "none"; }}
              style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", objectPosition: photo.focus, flex: "none", background: colors.backgroundAlt }}
            />
          ) : null)}
        <p style={{ fontSize: 14, lineHeight: 1.5, color: colors.ink2, margin: 0 }}>
          {animal ? (
            <>
              A doação vai para os cuidados {animal.sex === "Fêmea" ? "da" : "do"} {animal.name}.{" "}
              <a href={`/animal/${animal.slug}`} style={{ color: colors.greenDark, fontWeight: 600 }}>Ver a história</a>
            </>
          ) : (
            "Vai para o gasto mais urgente da semana, que quase sempre é ração ou cirurgia."
          )}
        </p>
      </div>
    </div>
  );
}

// One-time donation: text on the left and a card with Pix / Card on the right.
// The surrounding section (background, "Uma vez / Todo mês" selector) is Contribute.jsx.
export default function DonateForm({ switcher = null, centered = false }) {
  const [selected, setSelected] = useState(90); // number or "custom"
  const [typedAmount, setTypedAmount] = useState("");
  const [tab, setTab] = useState(FEATURES.pix ? "pix" : "mp");
  const [clicked, setClicked] = useState(false);
  const [coverFee, setCoverFee] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cardError, setCardError] = useState("");
  const [returnStatus, setReturnStatus] = useState(null);
  // Animal the donation is for ("" = wherever it is most urgent).
  const [forSlug, setForSlug] = useState("");
  const forAnimal = findDonatable(forSlug);
  const { search } = useLocationParts();

  // /?doar=lala#doar ("Ajudar com uma doação" on the animal's page) opens with
  // that animal already chosen.
  useEffect(() => {
    const requested = new URLSearchParams(search).get("doar");
    if (requested && findDonatable(requested)) setForSlug(requested);
  }, [search]);

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
        txid: pixTxid(qrAmount, forAnimal),
        description: pixDescription(forAnimal, PIX.description),
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
        body: JSON.stringify({ amount: chosenAmount, coverFee, animal: forAnimal?.slug }),
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

  const donationNotice = `Olá! Acabei de doar para ${forAnimal ? `${forAnimal.sex === "Fêmea" ? "a" : "o"} ${forAnimal.name}` : "a AlimentaCão"}${chosenAmount > 0 ? ` (R$ ${chosenAmount})` : ""}. Meu nome é `;
  const noticeLink = CONTACT.whatsapp
    ? `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(donationNotice)}`
    : `mailto:${CONTACT.email}?subject=${encodeURIComponent("Acabei de doar")}&body=${encodeURIComponent(donationNotice)}`;

  return (
    <>
      <div style={centered ? { textAlign: "center", maxWidth: 620 } : undefined}>
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
            margin: centered ? "14px auto 0" : "18px 0 0",
            maxWidth: "32em",
          }}
        >
          Sem compromisso mensal. Escolha um animal para ajudar ou deixe a
          gente decidir onde é mais urgente.
        </p>
        {switcher}
      </div>

      <div style={centered ? { ...card, width: "100%", maxWidth: 620, boxSizing: "border-box" } : card}>
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

        {DONATABLE.length > 0 && (
          <ForAnimal value={forSlug} animal={forAnimal} onChange={setForSlug} />
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
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,190px),1fr))",
            gap: 10,
          }}
        >
          {AMOUNTS.map((v) => (
            <AmountCard
              key={v.amount}
              active={selected === v.amount}
              onClick={() => chooseAmount(v.amount)}
              icon={v.icon}
              title={`R$ ${v.amount}`}
              detail={v.covers}
            />
          ))}
          <AmountCard
            active={selected === "custom"}
            onClick={() => chooseAmount("custom")}
            icon="heart"
            title="Outro valor"
            detail="você escolhe quanto"
          />
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

        {/* The Pix / Cartão choice only shows when both are enabled. While the
            card is off, the form goes straight to Pix. */}
        {FEATURES.pix && MERCADO_PAGO.cardEnabled && (
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
        )}

        {tab === "pix" &&
          FEATURES.pix &&
          (!PIX.key ? (
            // PIX_KEY is missing from the environment (Vercel or .env.local).
            <Notice title="Pix em breve">
              Estamos terminando de configurar o Pix do projeto. Tente de novo em
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
                data-track="pix_gerar_qr"
                data-track-value={chosenAmount > 0 ? chosenAmount : undefined}
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
                inteiro na conta do projeto.
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
                      ? `Assim o projeto recebe os ${formatBRL(chosenAmount)} inteiros. O Mercado Pago cobra ${(CARD_FEE * 100).toLocaleString("pt-BR")}% por pagamento.`
                      : "Assim o projeto recebe o valor inteiro que você escolheu."}
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
                      O projeto recebe cerca de {formatBRL(breakdown.net)} depois da
                      taxa.
                    </p>
                  )}
                </div>
              )}

              <button
                type="button"
                disabled={!canPayByCard}
                onClick={payByCard}
                data-track="cartao_pagar"
                data-track-value={chosenAmount > 0 ? chosenAmount : undefined}
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
              data-track="avisar_doacao"
              data-track-value={chosenAmount > 0 ? chosenAmount : undefined}
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
