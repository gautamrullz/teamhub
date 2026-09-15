"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requirePermission } from "@/lib/auth";
import { createAudit } from "@/lib/services/audit";
import { prisma } from "@/lib/prisma";

const createProductSchema = z.object({
  name: z.string().trim().min(2, "Product name is required."),
  sku: z.string().trim().min(1, "SKU is required."),
  purchasePrice: z.coerce
    .number()
    .positive("Purchase price must be greater than 0."),
  sellingPrice: z.coerce
    .number()
    .positive("Selling price must be greater than 0."),
});

export type CreateProductState = {
  success: boolean;
  message: string;
};

export async function createProduct(
  formData: FormData,
): Promise<CreateProductState> {
  const input = {
    name: formData.get("name"),
    sku: formData.get("sku"),
    purchasePrice: formData.get("purchasePrice"),
    sellingPrice: formData.get("sellingPrice"),
  };

  const result = createProductSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message ?? "Invalid product data.",
    };
  }

  const user = await requirePermission("PRODUCT_CREATE");

  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          name: result.data.name,
          sku: result.data.sku,
          purchasePrice: result.data.purchasePrice,
          sellingPrice: result.data.sellingPrice,
          organizationId: user.organizationId,
        },
      });

      await createAudit(tx, {
        organizationId: user.organizationId,
        userId: user.id,

        productId: product.id,

        action: "PRODUCT_CREATED",

        productName: product.name,
        sku: product.sku,

        details: {
          purchasePrice: result.data.purchasePrice,
          sellingPrice: result.data.sellingPrice,
        },
      });
    });

    revalidatePath("/products");

    return {
      success: true,
      message: "Product added successfully.",
    };
  } catch (error) {
    console.error("Create product failed:", error);

    return {
      success: false,
      message: "Unable to add product. Please try again.",
    };
  }
}

export type UpdateProductState = {
  success: boolean;
  message: string;
};

export async function updateProduct(
  productId: string,
  formData: FormData,
): Promise<UpdateProductState> {
  const user = await requirePermission("PRODUCT_UPDATE");

  const input = {
    name: formData.get("name"),
    sku: formData.get("sku"),
    purchasePrice: formData.get("purchasePrice"),
    sellingPrice: formData.get("sellingPrice"),
  };

  const result = createProductSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message ?? "Invalid product data.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existingProduct = await tx.product.findFirst({
        where: {
          id: productId,
          organizationId: user.organizationId,
        },
      });

      if (!existingProduct) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      const updatedProduct = await tx.product.update({
        where: {
          id: productId,
        },
        data: {
          name: result.data.name,
          sku: result.data.sku,
          purchasePrice: result.data.purchasePrice,
          sellingPrice: result.data.sellingPrice,
        },
      });

      await createAudit(tx, {
        organizationId: user.organizationId,
        userId: user.id,

        productId: updatedProduct.id,

        action: "PRODUCT_UPDATED",

        productName: updatedProduct.name,
        sku: updatedProduct.sku,

        details: {
          changes: {
            name: {
              from: existingProduct.name,
              to: updatedProduct.name,
            },
            sku: {
              from: existingProduct.sku,
              to: updatedProduct.sku,
            },
            purchasePrice: {
              from: existingProduct.purchasePrice.toString(),
              to: updatedProduct.purchasePrice.toString(),
            },
            sellingPrice: {
              from: existingProduct.sellingPrice.toString(),
              to: updatedProduct.sellingPrice.toString(),
            },
          },
        },
      });
    });

    revalidatePath("/products");

    return {
      success: true,
      message: "Product updated successfully.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      return {
        success: false,
        message: "Product not found.",
      };
    }

    console.error("Update product failed:", error);

    return {
      success: false,
      message: "Unable to update product. Please try again.",
    };
  }
}

export type DeleteProductState = {
  success: boolean;
  message: string;
};

export async function deleteProduct(
  productId: string,
): Promise<DeleteProductState> {
  const user = await requirePermission("PRODUCT_DISCONTINUE");

  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: {
          id: productId,
          organizationId: user.organizationId,
        },
        include: {
          batches: {
            select: {
              id: true,
              batchCode: true,
              quantity: true,
              expiryDate: true,
            },
          },
        },
      });

      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      const totalStock = product.batches.reduce(
        (total, batch) => total + batch.quantity,
        0,
      );

      if (totalStock > 0) {
        throw new Error("PRODUCT_HAS_STOCK");
      }

      await createAudit(tx, {
        organizationId: user.organizationId,
        userId: user.id,

        productId: product.id,

        action: "PRODUCT_DELETED",

        productName: product.name,
        sku: product.sku,

        details: {
          deletedBatchCount: product.batches.length,
        },
      });

      await tx.batch.deleteMany({
        where: {
          productId: product.id,
          organizationId: user.organizationId,
          quantity: 0,
        },
      });

      await tx.product.delete({
        where: {
          id: product.id,
        },
      });
    });

    revalidatePath("/products");

    return {
      success: true,
      message: "Product deleted successfully.",
    };
  } catch (error) {
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      return {
        success: false,
        message: "Product not found.",
      };
    }

    if (error instanceof Error && error.message === "PRODUCT_HAS_STOCK") {
      return {
        success: false,
        message: "Product cannot be deleted while it has stock.",
      };
    }

    console.error("Delete product failed:", error);

    return {
      success: false,
      message: "Unable to delete product. Please try again.",
    };
  }
}
