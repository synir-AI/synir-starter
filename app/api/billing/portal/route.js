export const runtime = "nodejs";

export async function POST(req) {
  try {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret) return new Response("Stripe not configured", { status: 500 });
    const body = await req.json().catch(() => ({}));
    const { customer } = body; // expect client to send Stripe customer id (from /account page)
    if (!customer) return new Response("Missing customer", { status: 400 });

    const params = new URLSearchParams();
    params.append("customer", customer);
    params.append("return_url", `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/account`);

    const r = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}` },
      body: params,
    });
    const data = await r.json();
    if (!r.ok) return new Response(data?.error?.message || "Stripe error", { status: 502 });
    return Response.json({ url: data.url });
  } catch (e) {
    return new Response(`Server error: ${e.message}`, { status: 500 });
  }
}

