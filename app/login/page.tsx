import Link from "next/link";

import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Sign in to TeamHub</h1>

          <p className="text-muted-foreground">
            Enter your credentials to continue.
          </p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium underline">
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
