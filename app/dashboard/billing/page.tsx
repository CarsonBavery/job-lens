import { createClient } from "@/lib/supabase/server";
import { createCheckoutSession, createPortalSession } from "@/lib/stripe/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
        <Alert>
          <AlertDescription>
            Subscription updated. It may take a moment to reflect below.
          </AlertDescription>
        </Alert>
      )}
      {checkout === "canceled" && (
        <Alert>
          <AlertDescription>Checkout canceled.</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Current plan</p>
          <Badge variant="secondary" className="w-fit text-base capitalize">
            {tier}
          </Badge>
          {subscription && (
            <p className="text-sm text-muted-foreground">
              Status: {subscription.status}
              {subscription.current_period_end &&
                ` · renews ${new Date(subscription.current_period_end).toLocaleDateString()}`}
            </p>
          )}
        </CardContent>
      </Card>

      {tier === "free" ? (
        <form action={createCheckoutSession}>
          <Button type="submit">Upgrade to Pro</Button>
        </form>
      ) : (
        <form action={createPortalSession}>
          <Button type="submit" variant="outline">
            Manage subscription
          </Button>
        </form>
      )}
    </div>
  );
}
