import { colors } from "../theme.js";

// White card that holds the form, the same in the one-time donation and in
// the sponsorship, so switching between the two does not "jump" on screen.
export const card = {
  background: colors.card,
  border: `1px solid ${colors.line}`,
  borderRadius: 34,
  padding: "clamp(24px,4vw,36px)",
  display: "flex",
  flexDirection: "column",
  gap: 20,
  boxShadow: "0 18px 50px rgba(35,49,47,0.08)"
};
