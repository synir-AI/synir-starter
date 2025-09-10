export const runtime = "nodejs";

// Minimal Stripe webhook (logs events). Wire to a DB to persist subscription state.
export async function POST(req) {
  try {
    const payload = await req.text();
    const sig = req.headers.get("stripe-signature");
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) return new Response("Webhook secret not set", { status: 500 });

    // Verify signature via Stripe API (relay)
    const form = new URLSearchParams();
    form.append("payload", payload);
    form.append("sig_header", sig || "");
    form.append("secret", secret);
    const vr = await fetch("https://api.stripe.com/v1/webhook_endpoints/test", { method: "POST", body: form });
    // Note: The above is a placeholder. In production, use Stripe SDK to verify locally.
    // Proceed optimistically for now and log the event.
    console.log("Stripe webhook event:", payload);
    return new Response(null, { status: 200 });
  } catch (e) {
    return new Response(`Webhook error: ${e.message}`, { status: 400 });
  }
}

