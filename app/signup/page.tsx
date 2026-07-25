"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpWithPassword, type AuthActionState } from "@/lib/auth/actions";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

const initialState: AuthActionState = { error: null };

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signUpWithPassword, initialState);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-semibold">Create your JobLens account</h1>
        <p className="mt-1 text-sm text-gray-500">
          Free plan includes 3 resumes + 1 cover letter.
        </p>
      </div>

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
            minLength={8}
            className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-950"
          />
        </label>
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {isPending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
