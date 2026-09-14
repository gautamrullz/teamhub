"use server";

import argon2 from "argon2";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { signIn, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  organizationName: z
    .string()
    .trim()
    .min(2, "Organization name must be at least 2 characters."),
});

export type RegisterState = {
  success: boolean;
  message: string;
  values?: {
    name: string;
    organizationName: string;
    email: string;
  };
};

export async function registerUser(
  _previousState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const input = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    organizationName: formData.get("organizationName"),
  };

  const result = registerSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message ?? "Invalid input.",
      values: {
        name: typeof input.name === "string" ? input.name : "",
        organizationName:
          typeof input.organizationName === "string"
            ? input.organizationName
            : "",
        email: typeof input.email === "string" ? input.email : "",
      },
    };
  }

  const { name, email, password, organizationName } = result.data;

  const normalizedEmail = email.toLowerCase();

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return {
        success: false,
        message: "An account with this email already exists.",
        values: {
          name,
          organizationName,
          email: normalizedEmail,
        },
      };
    }

    const passwordHash = await argon2.hash(password);

    await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
        },
      });

      await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
          role: "OWNER",
          organizationId: organization.id,
        },
      });
    });
  } catch (error) {
    console.error("Registration failed:", error);

    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
  redirect("/login");
}

export type LoginState = {
  success: boolean;
  message: string;
};

export async function loginUser(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return {
      success: false,
      message: "Email and password are required.",
    };
  }

  try {
    await signIn("credentials", {
      email: email.trim().toLowerCase(),
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    throw error;
  }

  return {
    success: true,
    message: "",
  };
}

export async function logoutUser(): Promise<void> {
  await signOut({
    redirectTo: "/login",
  });
}
