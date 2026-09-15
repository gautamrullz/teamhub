-- AlterTable
ALTER TABLE "InventoryTransaction" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "InventoryTransaction_organizationId_userId_idx" ON "InventoryTransaction"("organizationId", "userId");
