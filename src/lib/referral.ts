import { randomBytes } from "crypto";

export function generateReferralCode(): string {
  // 8 bytes = 16 hex chars, cryptographically random, not guessable
  return randomBytes(8).toString("hex").toUpperCase();
}
