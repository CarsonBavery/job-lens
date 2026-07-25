"use client";

import { createClient } from "@/lib/supabase/client";

export function GoogleSignInButton() {
  const handleClick = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
    >
      Continue with Google
    </button>
  );
}
