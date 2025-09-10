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

    const xenditKey = process.env.XENDIT_SECRET_KEY;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    if (!xenditKey) return new Response("Xendit not configured", { status: 500 });

    // Simple pricing via env amounts (in PHP). Example: 299 for monthly, 2499 for annual.
    const amount = plan === "annual" ? Number(process.env.XENDIT_PRICE_ANNUAL || 2499) : Number(process.env.XENDIT_PRICE_MONTHLY || 299);
    if (!amount || amount < 1) return new Response("Invalid Xendit amount", { status: 500 });

    const externalId = `sub_${plan}_${session.user.id}_${Date.now()}`;
    const payload = {
      external_id: externalId,
      amount,
      currency: "PHP",
      description: `Synir Pro (${plan})`,
      success_redirect_url: `${siteUrl}/account`,
      failure_redirect_url: `${siteUrl}/pricing`,
    };

    const xr = await fetch("https://api.xendit.co/v2/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Basic ${Buffer.from(xenditKey + ":").toString("base64")}` },
      body: JSON.stringify(payload),
    });
    const xj = await xr.json().catch(()=>({}));
    if (!xr.ok) return new Response(xj?.message || "Xendit error", { status: 502 });

    return Response.json({ id: xj.id, url: xj.invoice_url });
  } catch (e) {
    return new Response(`Server error: ${e.message}`, { status: 500 });
  }
}
