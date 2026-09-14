"use client";

import { useActionState } from "react";

import { registerUser, type RegisterState } from "@/app/actions/auth";

const initialState: RegisterState = {
  success: false,
  message: "",
};

export default function RegisterForm() {
  const [state, formAction, isPending] = useActionState(
    registerUser,
    initialState,
  );

  const formKey = state.values
    ? `${state.values.name}-${state.values.organizationName}-${state.values.email}`
    : "initial";

  return (
    <form key={formKey} action={formAction} className="space-y-5">
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
          defaultValue={state.values?.name ?? ""}
          className="w-full rounded-md border px-3 py-2"
          placeholder="Your name"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="organizationName" className="text-sm font-medium">
          Organization
        </label>

        <input
          id="organizationName"
          name="organizationName"
          type="text"
          required
          minLength={2}
          defaultValue={state.values?.organizationName ?? ""}
          className="w-full rounded-md border px-3 py-2"
          placeholder="Your company name"
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
          defaultValue={state.values?.email ?? ""}
          className="w-full rounded-md border px-3 py-2"
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
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
        className="w-full rounded-md bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isPending ? "Creating account..." : "Create account"}
      </button>
    </form>
  );
}
