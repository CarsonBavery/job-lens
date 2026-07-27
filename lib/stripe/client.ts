import Stripe from "stripe";

let cachedClient: Stripe | null = null;

// Server-only. Never import from a Client Component. Lazily constructed --
// see lib/gemini/client.ts's getGeminiClient() for why: top-level
// construction gets evaluated at build time for every page that
// transitively imports this module (most of them, via Server Actions),
// which both warns noisily when the API key is empty and does needless
// work for routes that never call Stripe.
export function getStripeClient(): Stripe {
  if (!cachedClient) {
    cachedClient = new Stripe(process.env.STRIPE_SECRET_KEY!, { typescript: true });
  }
  return cachedClient;
}
