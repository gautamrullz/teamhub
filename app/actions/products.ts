"use server";

import { z } from "zod";

import { getCurrentUser, requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

export async function createProduct(formData: FormData): Promise<void> {
  const user = await requirePermission("PRODUCT_CREATE");
  const input = {
    name: formData.get("name"),
    sku: formData.get("sku"),
    purchasePrice: formData.get("purchasePrice"),
    sellingPrice: formData.get("sellingPrice"),
  };

  const result = createProductSchema.safeParse(input);

  if (!result.success) {
    console.error(result.error.issues[0]?.message ?? "Invalid product data.");
    return;
  }

  await prisma.product.create({
    data: {
      name: result.data.name,
      sku: result.data.sku,
      purchasePrice: result.data.purchasePrice,
      sellingPrice: result.data.sellingPrice,
      organizationId: user.organizationId,
    },
  });
}

export async function updateProduct(
  productId: string,
  formData: FormData,
): Promise<void> {
  const user = await requirePermission("PRODUCT_UPDATE");

  const input = {
    name: formData.get("name"),
    sku: formData.get("sku"),
    purchasePrice: formData.get("purchasePrice"),
    sellingPrice: formData.get("sellingPrice"),
  };

  const result = createProductSchema.safeParse(input);

  if (!result.success) {
    return;
  }

  await prisma.product.updateMany({
    where: {
      id: productId,
      organizationId: user.organizationId,
    },
    data: {
      name: result.data.name,
      sku: result.data.sku,
      purchasePrice: result.data.purchasePrice,
      sellingPrice: result.data.sellingPrice,
    },
  });

  revalidatePath("/products");
}
