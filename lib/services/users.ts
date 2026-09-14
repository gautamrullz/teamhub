import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getUsers() {
  const user = await requireRole(["OWNER"]);

  return prisma.user.findMany({
    where: {
      organizationId: user.organizationId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}
