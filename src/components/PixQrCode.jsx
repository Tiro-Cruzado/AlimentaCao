"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { colors, fonts } from "../theme.js";

/**
 * Shows the Pix QR and the copy-and-paste code.
 * The code is generated in the browser from the NGO's key — it does not go
 * through any server and has no intermediary fee.
 */
export default function PixQrCode({ code, amount }) {
  const [image, setImage] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    if (!code) {
      setImage("");
      return undefined;
    }
    QRCode.toDataURL(code, { width: 440, margin: 1, errorCorrectionLevel: "M" })
      .then((url) => {
        if (active) {
          setImage(url);
          setError(false);
        }
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [code]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      // If the browser blocks the clipboard, the code stays visible on
      // screen to be copied by hand.
      setCopied(false);
    }
  }

  if (!code) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
      {error ? (
        <p style={{ fontSize: 14.5, color: colors.ink2, margin: 0, textAlign: "center" }}>
          Não consegui desenhar o QR aqui. Use o código copia e cola abaixo, que funciona igual.
        </p>
      ) : (
        image && (
          <img
            src={image}
            alt={
              amount > 0
                ? `QR Code de Pix para doar R$ ${amount}`
                : "QR Code de Pix para doar o valor que você escolher"
            }
            width={220}
            height={220}
            style={{ width: 220, height: 220, borderRadius: 16, border: `1px solid ${colors.line}`, background: "#fff" }}
          />
        )
      )}

      <p style={{ fontFamily: fonts.heading, fontWeight: 600, fontSize: 14, color: colors.ink2, margin: 0, textAlign: "center" }}>
        {amount > 0
          ? `Abra o app do banco, escaneie e confirme os R$ ${amount}.`
          : "Escaneie e digite o valor que quiser doar."}
      </p>

      <div style={{ width: "100%" }}>
        <label
          htmlFor="pix-code"
          style={{ display: "block", fontFamily: fonts.heading, fontWeight: 700, fontSize: 12, letterSpacing: "0.07em", textTransform: "uppercase", color: colors.ink3, marginBottom: 7 }}
        >
          Ou copie o código
        </label>
        <textarea
          id="pix-code"
          readOnly
          value={code}
          rows={3}
          onFocus={(e) => e.target.select()}
          style={{
            // Without this, padding and border add to the width and the box overflows the card.
            boxSizing: "border-box",
            width: "100%", resize: "none", fontFamily: fonts.mono, fontSize: 11.5, lineHeight: 1.5,
            color: colors.ink2, background: colors.backgroundAlt, border: `1px solid ${colors.line}`,
            borderRadius: 12, padding: "10px 12px", wordBreak: "break-all"
          }}
        />
        <button
          type="button"
          onClick={copy}
          style={{ boxSizing: "border-box", width: "100%", marginTop: 10, fontFamily: fonts.heading, fontWeight: 700, fontSize: 15.5, background: colors.greenDark, color: colors.card, border: "none", padding: "14px 20px", borderRadius: 999, cursor: "pointer" }}
        >
          {copied ? "Código copiado" : "Copiar código Pix"}
        </button>
        <span aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
          {copied ? "Código Pix copiado" : ""}
        </span>
      </div>
    </div>
  );
}
