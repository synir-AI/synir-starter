export const runtime = "nodejs";

export async function POST(req) {
  try {
    const apiKey = process.env.CLIPDROP_API_KEY;
    if (!apiKey) return new Response("Missing CLIPDROP_API_KEY", { status: 500 });

    const fd = await req.formData();
    const image = fd.get("image_file");
    if (!image) return new Response("image_file is required", { status: 400 });

    const upstream = new FormData();
    upstream.append("image_file", image);

    const hosts = ["https://clipdrop-api.co", "https://api.clipdrop.co"];
    let last = "";
    for (const host of hosts) {
      const r = await fetch(host + "/remove-text/v1", {
        method: "POST",
        headers: { "x-api-key": apiKey },
        body: upstream,
        cache: "no-store",
      });
      if (r.ok) return new Response(await r.blob(), { headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });
      try { last = await r.text(); } catch { last = ""; }
      if (r.status !== 404 && !/Unknown url/i.test(last)) return new Response(`Clipdrop remove-text error (${r.status}): ${last}`, { status: 502 });
    }
    return new Response(`Clipdrop remove-text error: ${last || "Unknown url"}`, { status: 502 });
  } catch (e) {
    return new Response(`Server error: ${e.message}`, { status: 500 });
  }
}

