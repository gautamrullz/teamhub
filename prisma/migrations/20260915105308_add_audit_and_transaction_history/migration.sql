/*
  Warnings:

  - A unique constraint covering the columns `[batchCode]` on the table `Batch` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transactionNumber]` on the table `InventoryTransaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `batchCode` to the `Batch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionNumber` to the `InventoryTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('PRODUCT_CREATED', 'PRODUCT_UPDATED', 'PRODUCT_DELETED', 'BATCH_CREATED', 'BATCH_UPDATED', 'BATCH_DELETED');

-- DropForeignKey
ALTER TABLE "InventoryTransaction" DROP CONSTRAINT "InventoryTransaction_batchId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryTransaction" DROP CONSTRAINT "InventoryTransaction_productId_fkey";

-- AlterTable
ALTER TABLE "Batch" ADD COLUMN     "batchCode" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "InventoryTransaction" ADD COLUMN     "batchCode" TEXT,
ADD COLUMN     "transactionNumber" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "auditNumber" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "productId" TEXT,
    "batchId" TEXT,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "productName" TEXT,
    "sku" TEXT,
    "batchCode" TEXT,
    "quantity" INTEGER,
    "expiryDate" TIMESTAMP(3),
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AuditLog_auditNumber_key" ON "AuditLog"("auditNumber");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_createdAt_idx" ON "AuditLog"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_productId_idx" ON "AuditLog"("organizationId", "productId");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_batchId_idx" ON "AuditLog"("organizationId", "batchId");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_userId_idx" ON "AuditLog"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_action_idx" ON "AuditLog"("organizationId", "action");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_batchCode_key" ON "Batch"("batchCode");

-- CreateIndex
CREATE UNIQUE INDEX "InventoryTransaction_transactionNumber_key" ON "InventoryTransaction"("transactionNumber");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
