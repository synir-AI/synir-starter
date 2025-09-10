export const runtime = "nodejs";

export async function POST(req) {
  try {
    // Basic quota limiting (free vs. pro via cookie)
    const cookies = req.headers.get("cookie") || "";
    const isPro = /(?:^|; )pro=1(?:;|$)/.test(cookies);
    const uid = (cookies.match(/(?:^|; )uid=([^;]+)/)?.[1]) || "anon";
    const { limit, quotaKey } = await import("../../../lib/ratelimit.js");
    const key = (await quotaKey({ tool: "remove-bg", uid })).toString();
    const max = isPro ? 200 : 10;
    const win = 60 * 60 * 24; // 1 day
    const resLimit = await limit(key, { max, windowSec: win });
    if (!resLimit.allowed) return new Response("Quota exceeded", { status: 429 });

    const apiKey = process.env.CLIPDROP_API_KEY;
    if (!apiKey) return new Response("Missing CLIPDROP_API_KEY", { status: 500 });

    const fd = await req.formData();
    const file = fd.get("image_file");
    if (!file) return new Response("No image_file provided", { status: 400 });

    const upstream = new FormData();
    upstream.append("image_file", file);

    const r = await fetch("https://api.clipdrop.co/remove-background/v1", {
      method: "POST",
      headers: { "x-api-key": apiKey },
      body: upstream,
    });
    if (!r.ok) return new Response(`Clipdrop error: ${await r.text()}`, { status: 502 });

    return new Response(await r.blob(), { headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });
  } catch (err) {
    return new Response(`Server error: ${err.message}`, { status: 500 });
  }
}
