import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold">Check your email</h1>
      <p className="text-sm text-muted-foreground">
        We sent you a confirmation link. Click it to activate your account, then sign in.
      </p>
      <Link href="/login" className="text-sm text-primary underline">
        Back to sign in
      </Link>
    </main>
  );
}
