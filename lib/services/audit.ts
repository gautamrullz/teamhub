import { Prisma } from "@/app/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { generateAuditNumber } from "@/lib/services/reference-numbers";

type CreateAuditInput = {
  organizationId: string;
  userId?: string;
  productId?: string;
  batchId?: string;

  action:
    | "PRODUCT_CREATED"
    | "PRODUCT_UPDATED"
    | "PRODUCT_DELETED"
    | "BATCH_CREATED"
    | "BATCH_UPDATED"
    | "BATCH_DELETED";

  productName?: string;
  sku?: string;
  batchCode?: string;
  quantity?: number;
  expiryDate?: Date | null;

  details?: Prisma.InputJsonValue;
};

type AuditDbClient = typeof prisma | Prisma.TransactionClient;

export async function createAudit(db: AuditDbClient, input: CreateAuditInput) {
  const auditNumber = await generateAuditNumber(db);

  return db.auditLog.create({
    data: {
      auditNumber,
      organizationId: input.organizationId,

      userId: input.userId,
      productId: input.productId,
      batchId: input.batchId,

      action: input.action,

      productName: input.productName,
      sku: input.sku,
      batchCode: input.batchCode,
      quantity: input.quantity,
      expiryDate: input.expiryDate,

      details: input.details,
    },
  });
}
