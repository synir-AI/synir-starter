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

    const targetW = fd.get("target_width");
    const targetH = fd.get("target_height");
    const prompt = fd.get("prompt");

    const hosts = ["https://clipdrop-api.co", "https://api.clipdrop.co"];

    async function attempt(form) {
      let lastErr = "";
      for (const host of hosts) {
        const r = await fetch(host + "/uncrop/v1", { method: "POST", headers: { "x-api-key": apiKey }, body: form, cache: "no-store" });
        if (r.ok) return new Response(await r.blob(), { headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });
        try { lastErr = await r.text(); } catch { lastErr = ""; }
        if (r.status !== 404 && !/Unknown url/i.test(lastErr)) {
          return new Response(`Clipdrop Uncrop error (${r.status}): ${lastErr}`, { status: 502 });
        }
      }
      return new Response(`Clipdrop Uncrop error: ${lastErr || "Unknown url"}`, { status: 502 });
    }

    // First try: include optional fields if provided
    if (targetW || targetH || prompt) {
      const form = new FormData();
      form.append("image_file", file);
      if (targetW) form.append("target_width", targetW);
      if (targetH) form.append("target_height", targetH);
      if (prompt) form.append("prompt", prompt);

      const resp = await (async () => {
        // We need to inspect error text to detect unsupported keys (400)
        let lastText = "";
        for (const host of hosts) {
          const r = await fetch(host + "/uncrop/v1", { method: "POST", headers: { "x-api-key": apiKey }, body: form, cache: "no-store" });
          if (r.ok) return new Response(await r.blob(), { headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });
          try { lastText = await r.text(); } catch { lastText = ""; }
          // Unsupported keys? fall back below
          if (r.status === 400 && /Unrecognized key\(s\)/i.test(lastText)) {
            lastText = `Unsupported params: ${lastText}`;
            break;
          }
          if (r.status !== 404 && !/Unknown url/i.test(lastText)) {
            return new Response(`Clipdrop Uncrop error (${r.status}): ${lastText}`, { status: 502 });
          }
        }
        // Fall back: try minimal payload
        const minimal = new FormData(); minimal.append("image_file", file);
        return await attempt(minimal);
      })();
      return resp;
    }

    // Minimal attempt (image only)
    const minimal = new FormData(); minimal.append("image_file", file);
    return await attempt(minimal);
  } catch (e) {
    return new Response(`Server error: ${e.message}`, { status: 500 });
  }
}
