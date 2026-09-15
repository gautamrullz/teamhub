import { Prisma } from "@/app/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { getNextSequence } from "@/lib/services/sequence";

type SequenceDbClient =
  | typeof prisma
  | Prisma.TransactionClient;

function padNumber(value: number, length = 6): string {
  return value.toString().padStart(length, "0");
}

function getDatePart(date: Date): string {
  return date.toISOString().slice(0, 10).replaceAll("-", "");
}

export async function generateBatchCode(
  db: SequenceDbClient,
): Promise<string> {
  const sequence = await getNextSequence(db, "BATCH");

  return `BATCH-${padNumber(sequence)}`;
}

export async function generateTransactionNumber(
  db: SequenceDbClient,
  date = new Date(),
): Promise<string> {
  const sequence = await getNextSequence(
    db,
    "TRANSACTION",
  );

  return `TXN-${getDatePart(date)}-${padNumber(sequence)}`;
}

export async function generateAuditNumber(
  db: SequenceDbClient,
  date = new Date(),
): Promise<string> {
  const sequence = await getNextSequence(db, "AUDIT");

  return `AUD-${getDatePart(date)}-${padNumber(sequence)}`;
}