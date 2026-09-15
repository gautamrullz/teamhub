import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getBatches() {
  const user = await getCurrentUser();

  return prisma.batch.findMany({
    where: {
      organizationId: user.organizationId,
    },
    orderBy: {
      createdAt: "desc",
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
}