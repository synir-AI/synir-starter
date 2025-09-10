export const runtime = "nodejs";
import Stripe from "stripe";
import { prisma } from "../../../lib/prisma";

export async function POST(req) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const sk = process.env.STRIPE_SECRET_KEY;
  if (!secret || !sk) return new Response("Stripe not configured", { status: 500 });
  const stripe = new Stripe(sk, { apiVersion: "2024-06-20" });
  let event;
  try {
    const payload = await req.text();
    const sig = req.headers.get("stripe-signature");
    event = stripe.webhooks.constructEvent(payload, sig, secret);
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object;
        const userId = s.client_reference_id;
        const customer = s.customer;
        if (userId && customer) {
          await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: String(customer) } });
        }
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object;
        const customerId = sub.customer;
        const user = await prisma.user.findFirst({ where: { stripeCustomerId: String(customerId) } });
        if (user) {
          await prisma.subscription.upsert({
            where: { userId: user.id },
            update: {
              plan: sub.items?.data?.[0]?.plan?.interval === "year" ? "annual" : "monthly",
              status: sub.status,
              stripeSubscriptionId: String(sub.id),
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
            create: {
              userId: user.id,
              plan: sub.items?.data?.[0]?.plan?.interval === "year" ? "annual" : "monthly",
              status: sub.status,
              stripeSubscriptionId: String(sub.id),
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
            },
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customerId = sub.customer;
        const user = await prisma.user.findFirst({ where: { stripeCustomerId: String(customerId) } });
        if (user) {
          await prisma.subscription.deleteMany({ where: { userId: user.id } });
        }
        break;
      }
      default:
        break;
    }
  } catch (e) {
    console.error("Webhook handler error", e);
    return new Response("Webhook handler error", { status: 500 });
  }
  return new Response(null, { status: 200 });
}
