import Link from "next/link";

import { logoutUser } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/auth";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="font-bold">
            TeamHub
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard">Dashboard</Link>

            <Link href="/products">Products</Link>

            {user.role === "OWNER" && <Link href="/users">Users</Link>}

            <div className="flex items-center gap-3">
              <span className="text-muted-foreground">
                {user.name ?? user.email}
              </span>

              <form action={logoutUser}>
                <button type="submit" className="text-sm underline">
                  Sign out
                </button>
              </form>
            </div>
          </nav>
        </div>
      </header>

      {children}
    </div>
  );
}
