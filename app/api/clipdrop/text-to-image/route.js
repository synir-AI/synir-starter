export const runtime = "nodejs";

async function callClipdrop(apiKey, form, url) {
  return fetch(url, { method: "POST", headers: { "x-api-key": apiKey }, body: form });
}

export async function POST(req) {
  try {
    const cookies = req.headers.get("cookie") || "";
    const isPro = /(?:^|; )pro=1(?:;|$)/.test(cookies);
    const uid = (cookies.match(/(?:^|; )uid=([^;]+)/)?.[1]) || "anon";
    const { limit, quotaKey } = await import("../../../lib/ratelimit.js");
    const key = (await quotaKey({ tool: "text-to-image", uid })).toString();
    const max = isPro ? 100 : 5; // generation is heavier
    const win = 60 * 60 * 24;
    const resLimit = await limit(key, { max, windowSec: win });
    if (!resLimit.allowed) return new Response("Quota exceeded", { status: 429 });

    const apiKey = process.env.CLIPDROP_API_KEY;
    if (!apiKey) return new Response("Missing CLIPDROP_API_KEY", { status: 500 });

    const fd = await req.formData();
    const prompt = fd.get("prompt");
    const seed = fd.get("seed") || "";

    if (!prompt || !prompt.trim()) return new Response("Missing prompt", { status: 400 });

    const upstream = new FormData();
    upstream.append("prompt", prompt);
    if (seed) upstream.append("seed", seed);

    // ✅ Use the correct host for generation
    const endpoints = [
      "https://clipdrop-api.co/text-to-image/v1",
      "https://clipdrop-api.co/text-to-image",
      "https://api.clipdrop.co/text-to-image/v1",
      "https://api.clipdrop.co/text-to-image",
    ];

    let lastText = "";
    for (const url of endpoints) {
      const res = await callClipdrop(apiKey, upstream, url);
      if (res.ok) {
        const blob = await res.blob();
        return new Response(blob, {
          headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
        });
      }
      lastText = await res.text().catch(() => "");
      // If it's not a "path not found" kind of error, bubble it up
      if (res.status !== 404 && !/Unknown url/i.test(lastText)) {
        return new Response(`Clipdrop error (${res.status}): ${lastText}`, { status: 502 });
      }
    }

    return new Response(
      `Clipdrop text-to-image endpoint not available for this key or path. Details: ${lastText || "Unknown url"}`,
      { status: 502 }
    );
  } catch (err) {
    return new Response(`Server error: ${err.message}`, { status: 500 });
  }
}
