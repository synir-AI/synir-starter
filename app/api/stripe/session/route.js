export const runtime = "nodejs";

// Fetch a Checkout Session to read customer/subscription status after redirect
export async function GET(req) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) return new Response("Stripe not configured", { status: 500 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return new Response("Missing session id", { status: 400 });

    const r = await fetch(`https://api.stripe.com/v1/checkout/sessions/${id}`, {
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
    });
    const data = await r.json();
    if (!r.ok) return new Response(data?.error?.message || "Stripe error", { status: 502 });
    return Response.json(data);
  } catch (e) {
    return new Response(`Server error: ${e.message}`, { status: 500 });
  }
}

