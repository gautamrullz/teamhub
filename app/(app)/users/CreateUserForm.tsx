"use client";

import { useActionState } from "react";

import { createUser, type CreateUserState } from "@/app/actions/users";

const initialState: CreateUserState = {
  success: false,
  message: "",
};

export default function CreateUserForm() {
  const [state, formAction, isPending] = useActionState(
    createUser,
    initialState,
  );

  return (
    <form action={formAction} className="max-w-md space-y-5">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          required
          minLength={2}
          className="w-full rounded-md border px-3 py-2"
          placeholder="User name"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>

        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border px-3 py-2"
          placeholder="user@example.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Temporary Password
        </label>

        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          className="w-full rounded-md border px-3 py-2"
          placeholder="At least 8 characters"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="role" className="text-sm font-medium">
          Role
        </label>

        <select
          id="role"
          name="role"
          defaultValue="STAFF"
          className="w-full rounded-md border px-3 py-2"
        >
          <option value="STAFF">Staff</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {state.message && (
        <p
          className={
            state.success ? "text-sm text-green-600" : "text-sm text-red-600"
          }
        >
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isPending ? "Creating user..." : "Create user"}
      </button>
    </form>
  );
}
