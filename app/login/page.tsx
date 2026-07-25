"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInWithPassword, type AuthActionState } from "@/lib/auth/actions";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

const initialState: AuthActionState = { error: null };

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signInWithPassword, initialState);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold">Sign in to JobLens</h1>

      <GoogleSignInButton />

      <div className="flex items-center gap-3 text-sm text-gray-500">
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
        or
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
          />
        </label>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        No account?{" "}
        <Link href="/signup" className="underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
