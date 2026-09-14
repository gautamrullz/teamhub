import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { hasPermission, Permission, UserRole } from "./permissions";

export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return session.user;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await getCurrentUser();

  if (!allowedRoles.includes(user.role)) {
    redirect("/unauthorized");
  }

  return user;
}

export async function requirePermission(permission: Permission) {
  const user = await getCurrentUser();

  if (!hasPermission(user.role, permission)) {
    redirect("/unauthorized");
  }

  return user;
}
