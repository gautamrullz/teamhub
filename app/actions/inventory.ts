"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createInventoryTransaction } from "@/lib/services/transactions";

const stockMovementSchema = z
  .object({
    batchId: z.string().min(1, "Batch is required."),
    type: z.enum(["PURCHASE", "SALE", "RETURN", "ADJUSTMENT"]),
    quantity: z.coerce
      .number()
      .int("Quantity must be a whole number.")
      .min(0, "Quantity cannot be negative."),
  })
  .superRefine((data, ctx) => {
    if (data.type !== "ADJUSTMENT" && data.quantity === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["quantity"],
        message: "Quantity must be greater than 0.",
      });
    }
  });

const saleSchema = z.object({
  productId: z.string().min(1, "Product is required."),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number.")
    .min(1, "Quantity must be greater than 0."),
});

export type StockMovementState = {
  success: boolean;
  message: string;
};

export async function createStockMovement(
  formData: FormData,
): Promise<StockMovementState> {
  const input = {
    batchId: formData.get("batchId"),
    type: formData.get("type"),
    quantity: formData.get("quantity"),
  };

  const result = stockMovementSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message ?? "Invalid stock movement.",
    };
  }

  const user = await requirePermission("INVENTORY_MANAGE");

  try {
    await prisma.$transaction(async (tx) => {
      const batch = await tx.batch.findFirst({
        where: {
          id: result.data.batchId,
          organizationId: user.organizationId,
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
      });

      if (!batch) {
        throw new Error("BATCH_NOT_FOUND");
      }

      const { type, quantity } = result.data;

      let newQuantity = batch.quantity;

      switch (type) {
        case "PURCHASE":
        case "RETURN":
          newQuantity = batch.quantity + quantity;
          break;

        case "SALE":
          if (quantity > batch.quantity) {
            throw new Error("INSUFFICIENT_STOCK");
          }

          newQuantity = batch.quantity - quantity;
          break;

        case "ADJUSTMENT":
          newQuantity = quantity;
          break;
      }

      const newStatus = newQuantity === 0 ? "DEPLETED" : "ACTIVE";

      await tx.batch.update({
        where: {
          id: batch.id,
        },
        data: {
          quantity: newQuantity,
          status: newStatus,
        },
      });

      await createInventoryTransaction(tx, {
        organizationId: user.organizationId,
        userId: user.id,

        productId: batch.product.id,
        batchId: batch.id,

        type,
        quantity,

        productName: batch.product.name,
        sku: batch.product.sku,
        batchCode: batch.batchCode,
        expiryDate: batch.expiryDate,
      });
    });

    revalidatePath("/batches");
    revalidatePath("/inventory");

    return {
      success: true,
      message: "Stock movement recorded successfully.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "BATCH_NOT_FOUND") {
      return {
        success: false,
        message: "Batch not found.",
      };
    }

    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK") {
      return {
        success: false,
        message: "Insufficient stock for this sale.",
      };
    }

    console.error("Create stock movement failed:", error);

    return {
      success: false,
      message: "Unable to record stock movement. Please try again.",
    };
  }
}