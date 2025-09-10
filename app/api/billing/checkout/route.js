import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";
import { prisma } from "../../../lib/prisma";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

    const body = await req.json().catch(() => ({}));
    const plan = body.plan || "monthly"; // 'monthly' | 'annual'
    const price = plan === "annual" ? process.env.STRIPE_PRICE_ANNUAL : process.env.STRIPE_PRICE_MONTHLY;
    const secret = process.env.STRIPE_SECRET_KEY;
    if (!secret || !price) return new Response("Stripe not configured", { status: 500 });

    // Ensure user has stripeCustomerId
    let user = await prisma.user.findUnique({ where: { id: session.user.id } });
    let stripeCustomerId = user?.stripeCustomerId || null;
    if (!stripeCustomerId) {
      // Create a new Stripe customer via API
      const cp = new URLSearchParams();
      if (user?.email) cp.append("email", user.email);
      if (user?.name) cp.append("name", user.name);
      const c = await fetch("https://api.stripe.com/v1/customers", { method: "POST", headers: { Authorization: `Bearer ${secret}` }, body: cp });
      const cj = await c.json();
      if (!c.ok) return new Response(cj?.error?.message || "Stripe customer error", { status: 502 });
      stripeCustomerId = cj.id;
      await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId } });
    }

    // Create Checkout Session via Stripe REST API
    const params = new URLSearchParams();
    params.append("mode", "subscription");
    params.append("success_url", `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/account`);
    params.append("cancel_url", `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/pricing`);
    params.append("line_items[0][price]", price);
    params.append("line_items[0][quantity]", "1");
    params.append("customer", stripeCustomerId);
    params.append("client_reference_id", session.user.id);

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
