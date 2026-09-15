"use client";

import Link from "next/link";
import { Boxes, LayoutDashboard, Package, Users } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

type AppShellProps = {
  children: React.ReactNode;
  user: {
    name: string | null;
    email: string;
    role: "OWNER" | "ADMIN" | "STAFF";
  };
  onSignOut: () => void;
};

export default function AppShell({ children, user, onSignOut }: AppShellProps) {
  const navigation = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Products",
      href: "/products",
      icon: Package,
    },
    {
      title: "Batches",
      href: "/batches",
      icon: Boxes,
    },
    {
      title: "inventory",
      href: "/inventory",
      icon: Boxes,
    },
    {
      title: "transactions",
      href: "/transactions",
      icon: Boxes,
    },
    ...(user.role === "OWNER"
      ? [
          {
            title: "Users",
            href: "/users",
            icon: Users,
          },
        ]
      : []),
  ];

  return (
    <TooltipProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="lg">
                  <Link href="/dashboard">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      T
                    </div>

                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">TeamHub</span>
                      <span className="truncate text-xs text-muted-foreground">
                        Business management
                      </span>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Workspace</SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild tooltip={item.title}>
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex items-center gap-2 px-2 py-2">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {(user.name ?? user.email).charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                    <p className="truncate text-sm font-medium">
                      {user.name ?? user.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.role}
                    </p>
                  </div>
                </div>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <form action={onSignOut}>
                  <SidebarMenuButton type="submit">
                    <span>Sign out</span>
                  </SidebarMenuButton>
                </form>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-14 items-center gap-2 border-b px-4">
            <SidebarTrigger />
          </header>

          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
