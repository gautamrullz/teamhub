"use server";

import argon2 from "argon2";
import { z } from "zod";

import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const createUserSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["ADMIN", "STAFF"]),
});

export type CreateUserState = {
  success: boolean;
  message: string;
};

export async function createUser(
  _previousState: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  const input = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  };

  const result = createUserSchema.safeParse(input);

  if (!result.success) {
    return {
      success: false,
      message: result.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  const { name, email, password, role } = result.data;

  const normalizedEmail = email.toLowerCase();

  // 🔐 Authentication + authorization
  const owner = await requireRole(["OWNER"]);

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
      };
    }

    const passwordHash = await argon2.hash(password);

    await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        passwordHash,
        role,
        organizationId: owner.organizationId,
      },
    });

    return {
      success: true,
      message: "User created successfully.",
    };
  } catch (error) {
    console.error("User creation failed:", error);

    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
}
