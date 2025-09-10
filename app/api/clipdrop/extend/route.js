export const runtime = "nodejs";

// Tries both Clipdrop hosts, returns the first success.
async function tryHosts(path, form, apiKey) {
  const hosts = [
    "https://clipdrop-api.co", // many accounts use this
    "https://api.clipdrop.co", // others use this
  ];

  let lastErr = "";
  for (const host of hosts) {
    const r = await fetch(host + path, {
      method: "POST",
      headers: { "x-api-key": apiKey },
      body: form,
      cache: "no-store",
    });

    if (r.ok) return new Response(await r.blob(), {
      headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
    });

    try { lastErr = await r.text(); } catch { lastErr = ""; }

    // If it's not an "Unknown url" style error, stop early and bubble it.
    if (r.status !== 404 && !/Unknown url/i.test(lastErr)) {
      return new Response(`Clipdrop Uncrop error (${r.status}): ${lastErr}`, { status: 502 });
    }
    // else: try next host
  }

  return new Response(`Clipdrop Uncrop error: ${lastErr || "Unknown url"}`, { status: 502 });
}

export async function POST(req) {
  try {
    const cookies = req.headers.get("cookie") || "";
    let isPro = /(?:^|; )pro=1(?:;|$)/.test(cookies);
    let uid = (cookies.match(/(?:^|; )uid=([^;]+)/)?.[1]) || "anon";
    try {
      const { getServerSession } = await import("next-auth");
      const { authOptions } = await import("../../../lib/authOptions.js");
      const { prisma } = await import("../../../lib/prisma.js");
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        uid = session.user.id;
        const sub = await prisma.subscription.findUnique({ where: { userId: uid } });
        isPro = Boolean(sub && (sub.status === "active" || sub.status === "trialing"));
      }
    } catch {}
    const { limit, quotaKey } = await import("../../../lib/ratelimit.js");
    const key = (await quotaKey({ tool: "extend", uid })).toString();
    const max = isPro ? 200 : 10;
    const win = 60 * 60 * 24;
    const resLimit = await limit(key, { max, windowSec: win });
    if (!resLimit.allowed) return new Response("Quota exceeded", { status: 429 });

    const apiKey = process.env.CLIPDROP_API_KEY;
    if (!apiKey) return new Response("Missing CLIPDROP_API_KEY", { status: 500 });

    const fd = await req.formData();
    const file = fd.get("image_file");
    if (!file) return new Response("No image_file provided", { status: 400 });

    // IMPORTANT: Many plans/keys reject extra fields for Uncrop.
    // Send only the image to avoid "Unrecognized key(s)".
    const upstream = new FormData();
    upstream.append("image_file", file);

    return await tryHosts("/uncrop/v1", upstream, apiKey);
  } catch (e) {
    return new Response(`Server error: ${e.message}`, { status: 500 });
  }
}
