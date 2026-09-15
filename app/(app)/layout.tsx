import { logoutUser } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth";

import AppShell from "./AppShell";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <AppShell
      user={{
        name: user.name ?? null,
        email: user.email,
        role: user.role,
      }}
      onSignOut={logoutUser}
    >
      {children}
    </AppShell>
  );
}
