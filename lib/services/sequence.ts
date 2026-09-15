import { Prisma } from "@/app/generated/prisma/client";

import { prisma } from "@/lib/prisma";

type SequenceDbClient =
  | typeof prisma
  | Prisma.TransactionClient;

export async function getNextSequence(
  db: SequenceDbClient,
  key: string,
): Promise<number> {
  const sequence = await db.sequence.upsert({
    where: {
      key,
    },
    create: {
      key,
      value: 1,
    },
    update: {
      value: {
        increment: 1,
      },
    },
  });

  return sequence.value;
}