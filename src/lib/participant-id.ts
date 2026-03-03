import { randomInt } from "crypto";

export function generateParticipantId(): string {
  const num = randomInt(100000, 999999);
  return `TN-${num}`;
}
