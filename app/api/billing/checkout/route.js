export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const plan = body.plan || "monthly"; // 'monthly' | 'annual'
    const price = plan === "annual" ? process.env.STRIPE_PRICE_ANNUAL : process.env.STRIPE_PRICE_MONTHLY;
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret || !price) return new Response("Stripe not configured", { status: 500 });

    const customerEmail = body.email || ""; // optional if you collect it

    // Create Checkout Session via Stripe REST API
    const params = new URLSearchParams();
    params.append("mode", "subscription");
    params.append("success_url", `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/account?session_id={CHECKOUT_SESSION_ID}`);
    params.append("cancel_url", `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/pricing`);
    params.append("line_items[0][price]", price);
    params.append("line_items[0][quantity]", "1");
    if (customerEmail) params.append("customer_email", customerEmail);

    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}` },
      body: params,
    });
    const data = await r.json();
    if (!r.ok) return new Response(data?.error?.message || "Stripe error", { status: 502 });
    return Response.json({ id: data.id, url: data.url });
  } catch (e) {
    return new Response(`Server error: ${e.message}`, { status: 500 });
  }
}

