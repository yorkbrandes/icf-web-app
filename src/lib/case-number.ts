import { randomInt } from "crypto";
import { prisma } from "./db";

export async function generateCaseNumber(): Promise<string> {
  const year = new Date().getFullYear();
  let caseNumber: string;
  do {
    const seq = String(randomInt(100000, 999999));
    caseNumber = `ICF-${year}-${seq}`;
  } while (await prisma.case.findUnique({ where: { caseNumber } }));
  return caseNumber;
}
