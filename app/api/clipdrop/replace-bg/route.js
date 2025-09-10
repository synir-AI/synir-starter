export const runtime = "nodejs";

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
    const key = (await quotaKey({ tool: "replace-bg", uid })).toString();
    const max = isPro ? 200 : 10;
    const win = 60 * 60 * 24;
    const resLimit = await limit(key, { max, windowSec: win });
    if (!resLimit.allowed) return new Response("Quota exceeded", { status: 429 });

    const apiKey = process.env.CLIPDROP_API_KEY;
    if (!apiKey) return new Response("Missing CLIPDROP_API_KEY", { status: 500 });

    const fd = await req.formData();
    const file = fd.get("image_file");
    const prompt = fd.get("prompt") || "";
    if (!file) return new Response("No image_file provided", { status: 400 });

    const upstream = new FormData(); upstream.append("image_file", file); if (prompt) upstream.append("prompt", prompt);

    async function tryHosts(path) {
      const hosts = ["https://clipdrop-api.co", "https://api.clipdrop.co"];
      let last = "";
      for (const host of hosts) {
        const r = await fetch(host + path, { method: "POST", headers: { "x-api-key": apiKey }, body: upstream, cache: "no-store" });
        if (r.ok) return new Response(await r.blob(), { headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });
        try { last = await r.text(); } catch { last = ""; }
        if (r.status !== 404 && !/Unknown url/i.test(last)) return new Response(`Clipdrop error (${r.status}): ${last}`, { status: 502 });
      }
      return new Response(`Clipdrop error: ${last || "Unknown url"}`, { status: 502 });
    }

    return await tryHosts("/replace-background/v1");
  } catch (err) {
    return new Response(`Server error: ${err.message}`, { status: 500 });
  }
}
