import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      organizationId: string;
      role: "OWNER" | "ADMIN" | "STAFF";
    } & DefaultSession["user"];
  }

  interface User {
    organizationId: string;
    role: "OWNER" | "ADMIN" | "STAFF";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    organizationId?: string;
    role?: "OWNER" | "ADMIN" | "STAFF";
  }
}