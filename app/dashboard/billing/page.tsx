import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession, createPortalSession } from "@/lib/stripe/actions";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();
  const tier = profile?.subscription_tier ?? "free";

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, current_period_end")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <h1 className="text-2xl font-semibold">Billing</h1>

      {checkout === "success" && (
        <p className="rounded-md bg-green-50 px-4 py-2 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
          Subscription updated. It may take a moment to reflect below.
        </p>
      )}
      {checkout === "canceled" && (
        <p className="rounded-md bg-gray-50 px-4 py-2 text-sm text-gray-600 dark:bg-gray-900 dark:text-gray-400">
          Checkout canceled.
        </p>
      )}

      <div className="rounded-md border border-gray-200 p-4 dark:border-gray-800">
        <p className="text-sm text-gray-500">Current plan</p>
        <p className="text-lg font-medium capitalize">{tier}</p>
        {subscription && (
          <p className="mt-1 text-sm text-gray-500">
            Status: {subscription.status}
            {subscription.current_period_end &&
              ` · renews ${new Date(subscription.current_period_end).toLocaleDateString()}`}
          </p>
        )}
      </div>

      {tier === "free" ? (
        <form action={createCheckoutSession}>
          <button
            type="submit"
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background"
          >
            Upgrade to Pro
          </button>
        </form>
      ) : (
        <form action={createPortalSession}>
          <button
            type="submit"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
          >
            Manage subscription
          </button>
        </form>
      )}
    </div>
  );
}
