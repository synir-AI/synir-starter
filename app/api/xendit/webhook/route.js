export const runtime = "nodejs";
import { prisma } from "../../../lib/prisma";

export async function POST(req) {
  try {
    const token = req.headers.get("x-callback-token") || "";
    const expected = process.env.XENDIT_CALLBACK_TOKEN || "";
    if (expected && token !== expected) return new Response("Invalid token", { status: 401 });

    const json = await req.json().catch(()=>null);
    if (!json) return new Response("Invalid JSON", { status: 400 });

    // Xendit sends event/object. For invoices, look at status and external_id
    const data = json.data || json; // support both shapes
    const status = (data.status || "").toUpperCase();
    const external = data.external_id || "";

    if (!external) return new Response(null, { status: 200 });
    // external_id shape: sub_<plan>_<userId>_<ts>
    const parts = external.split("_");
    if (parts.length < 3) return new Response(null, { status: 200 });
    const plan = parts[1] || "monthly";
    const userId = parts[2];

    if (!userId) return new Response(null, { status: 200 });

    if (status === "PAID" || status === "SETTLED") {
      const periodEnd = new Date(Date.now() + (plan === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000);
      await prisma.subscription.upsert({
        where: { userId },
        update: { plan, status: "active", currentPeriodEnd: periodEnd },
        create: { userId, plan, status: "active", stripeSubscriptionId: data.id || external, currentPeriodEnd: periodEnd },
      });
    }

    if (status === "EXPIRED" || status === "CANCELLED") {
      await prisma.subscription.updateMany({ where: { userId }, data: { status: "canceled" } });
    }

    return new Response(null, { status: 200 });
  } catch (e) {
    return new Response(`Webhook error: ${e.message}`, { status: 400 });
  }
}

