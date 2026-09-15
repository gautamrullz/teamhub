import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function getProducts() {
  const user = await getCurrentUser();

  return prisma.product.findMany({
    where: {
      organizationId: user.organizationId,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function getProductsForBatch() {
  const user = await getCurrentUser();

  return prisma.product.findMany({
    where: {
      organizationId: user.organizationId,
      status: "ACTIVE",
    },
    select: {
      id: true,
      name: true,
      sku: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}
