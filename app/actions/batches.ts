"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAudit } from "@/lib/services/audit";
import { generateBatchCode } from "@/lib/services/reference-numbers";

const batchSchema = z.object({
  productId: z.string().min(1, "Product is required."),
  expiryDate: z.coerce.date().optional(),
  quantity: z.coerce
    .number()
    .int("Quantity must be a whole number.")
    .min(0, "Quantity cannot be negative."),
});

export type CreateBatchState = {
  success: boolean;
  message: string;
};

export async function createBatch(
  formData: FormData,
): Promise<CreateBatchState> {
  const input = {
    productId: formData.get("productId"),
    expiryDate: formData.get("expiryDate"),
    quantity: formData.get("quantity"),
  };

  const result = batchSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message:
        result.error.issues[0]?.message ?? "Invalid batch data.",
    };
  }

  const user = await requirePermission("INVENTORY_MANAGE");

  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: {
          id: result.data.productId,
          organizationId: user.organizationId,
        },
      });

      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      const batchCode = await generateBatchCode(tx);

      const batch = await tx.batch.create({
        data: {
          batchCode,
          organizationId: user.organizationId,
          productId: product.id,
          expiryDate: result.data.expiryDate,
          quantity: result.data.quantity,
          status:
            result.data.quantity === 0
              ? "DEPLETED"
              : "ACTIVE",
        },
      });

      await createAudit(tx, {
        organizationId: user.organizationId,
        userId: user.id,

        productId: product.id,
        batchId: batch.id,

        action: "BATCH_CREATED",

        productName: product.name,
        sku: product.sku,
        batchCode: batch.batchCode,
        quantity: batch.quantity,
        expiryDate: batch.expiryDate,

        details: {
          quantity: batch.quantity,
          expiryDate: batch.expiryDate,
        },
      });
    });

    revalidatePath("/batches");

    return {
      success: true,
      message: "Batch created successfully.",
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "PRODUCT_NOT_FOUND"
    ) {
      return {
        success: false,
        message: "Product not found.",
      };
    }

    console.error("Create batch failed:", error);

    return {
      success: false,
      message:
        "Unable to create batch. Please try again.",
    };
  }
}

export type UpdateBatchState = {
  success: boolean;
  message: string;
};

export async function updateBatch(
  batchId: string,
  formData: FormData,
): Promise<UpdateBatchState> {
  const user = await requirePermission("INVENTORY_MANAGE");

  const input = {
    expiryDate: formData.get("expiryDate"),
  };

  const result = z
    .object({
      expiryDate: z.coerce.date().optional(),
    })
    .safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message:
        result.error.issues[0]?.message ?? "Invalid batch data.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existingBatch = await tx.batch.findFirst({
        where: {
          id: batchId,
          organizationId: user.organizationId,
        },
        include: {
          product: {
            select: {
              name: true,
              sku: true,
            },
          },
        },
      });

      if (!existingBatch) {
        throw new Error("BATCH_NOT_FOUND");
      }

      const updatedBatch = await tx.batch.update({
        where: {
          id: existingBatch.id,
        },
        data: {
          expiryDate: result.data.expiryDate,
        },
      });

      await createAudit(tx, {
        organizationId: user.organizationId,
        userId: user.id,

        productId: existingBatch.productId,
        batchId: existingBatch.id,

        action: "BATCH_UPDATED",

        productName: existingBatch.product.name,
        sku: existingBatch.product.sku,
        batchCode: existingBatch.batchCode,
        quantity: updatedBatch.quantity,
        expiryDate: updatedBatch.expiryDate,

        details: {
          changes: {
            expiryDate: {
              from: existingBatch.expiryDate,
              to: updatedBatch.expiryDate,
            },
          },
        },
      });
    });

    revalidatePath("/batches");

    return {
      success: true,
      message: "Batch updated successfully.",
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "BATCH_NOT_FOUND"
    ) {
      return {
        success: false,
        message: "Batch not found.",
      };
    }

    console.error("Update batch failed:", error);

    return {
      success: false,
      message:
        "Unable to update batch. Please try again.",
    };
  }
}

export type DeleteBatchState = {
  success: boolean;
  message: string;
};

export async function deleteBatch(
  batchId: string,
): Promise<DeleteBatchState> {
  const user = await requirePermission("INVENTORY_MANAGE");

  try {
    await prisma.$transaction(async (tx) => {
      const batch = await tx.batch.findFirst({
        where: {
          id: batchId,
          organizationId: user.organizationId,
        },
        include: {
          product: {
            select: {
              name: true,
              sku: true,
            },
          },
        },
      });

      if (!batch) {
        throw new Error("BATCH_NOT_FOUND");
      }

      if (batch.quantity !== 0) {
        throw new Error("BATCH_HAS_STOCK");
      }

      await createAudit(tx, {
        organizationId: user.organizationId,
        userId: user.id,

        productId: batch.productId,
        batchId: batch.id,

        action: "BATCH_DELETED",

        productName: batch.product.name,
        sku: batch.product.sku,
        batchCode: batch.batchCode,
        quantity: batch.quantity,
        expiryDate: batch.expiryDate,

        details: {
          quantity: batch.quantity,
          expiryDate: batch.expiryDate,
        },
      });

      await tx.batch.delete({
        where: {
          id: batch.id,
        },
      });
    });

    revalidatePath("/batches");

    return {
      success: true,
      message: "Batch deleted successfully.",
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "BATCH_NOT_FOUND"
    ) {
      return {
        success: false,
        message: "Batch not found.",
      };
    }

    if (
      error instanceof Error &&
      error.message === "BATCH_HAS_STOCK"
    ) {
      return {
        success: false,
        message:
          "Batch cannot be deleted while it has stock.",
      };
    }

    console.error("Delete batch failed:", error);

    return {
      success: false,
      message:
        "Unable to delete batch. Please try again.",
    };
  }
}