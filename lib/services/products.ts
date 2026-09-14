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