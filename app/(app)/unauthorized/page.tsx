import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="max-w-md space-y-4 text-center">
        <h1 className="text-3xl font-bold">
          Access denied
        </h1>

        <p className="text-muted-foreground">
          You do not have permission to access this page.
        </p>

        <Link
          href="/dashboard"
          className="inline-block rounded-md bg-black px-4 py-2 text-sm text-white"
        >
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}