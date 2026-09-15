import { Prisma } from "@/app/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { generateTransactionNumber } from "@/lib/services/reference-numbers";
import { getCurrentUser } from "../auth";

type TransactionDbClient = typeof prisma | Prisma.TransactionClient;

type CreateTransactionInput = {
  organizationId: string;
  userId?: string;

  productId?: string;
  batchId?: string;

  type: "PURCHASE" | "SALE" | "RETURN" | "ADJUSTMENT";

  quantity: number;

  productName: string;
  sku: string;
  batchCode?: string;
  expiryDate?: Date | null;
};

export async function createInventoryTransaction(
  db: TransactionDbClient,
  input: CreateTransactionInput,
) {
  const transactionNumber = await generateTransactionNumber(db);

  return db.inventoryTransaction.create({
    data: {
      transactionNumber,

      organizationId: input.organizationId,

      // Historical references only.
      productId: input.productId,
      batchId: input.batchId,
      userId: input.userId,

      type: input.type,
      quantity: input.quantity,

      // Historical snapshots.
      productName: input.productName,
      sku: input.sku,
      batchCode: input.batchCode,
      expiryDate: input.expiryDate,
    },
  });
}

export async function getInventoryTransactions(
  page = 1,
  pageSize = 20,
  type?: "PURCHASE" | "SALE" | "RETURN" | "ADJUSTMENT",
  from?: string,
  to?: string,
) {
  const user = await getCurrentUser();

  const safePage = Math.max(page, 1);
  const safePageSize = Math.min(Math.max(pageSize, 1), 100);

  const where = {
    organizationId: user.organizationId,

    ...(type ? { type } : {}),

    ...(from || to
      ? {
          createdAt: {
            ...(from
              ? {
                  gte: new Date(`${from}T00:00:00`),
                }
              : {}),

            ...(to
              ? {
                  lt: new Date(`${to}T00:00:00`),
                }
              : {}),
          },
        }
      : {}),
  };

  const [transactions, total] = await Promise.all([
    prisma.inventoryTransaction.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    }),

    prisma.inventoryTransaction.count({
      where,
    }),
  ]);

  return {
    transactions,
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.ceil(total / safePageSize),
  };
}
