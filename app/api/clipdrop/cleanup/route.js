export const runtime = "nodejs";

// Brush-based cleanup: expects an image and a mask (white = remove/fill, black = keep)
export async function POST(req) {
  try {
    const apiKey = process.env.CLIPDROP_API_KEY;
    if (!apiKey) return new Response("Missing CLIPDROP_API_KEY", { status: 500 });

    const fd = await req.formData();
    const image = fd.get("image_file");
    const mask = fd.get("mask_file");
    if (!image || !mask) return new Response("image_file and mask_file are required", { status: 400 });

    const upstream = new FormData();
    upstream.append("image_file", image);
    upstream.append("mask_file", mask);

    const hosts = ["https://clipdrop-api.co", "https://api.clipdrop.co"];
    let last = "";
    for (const host of hosts) {
      const r = await fetch(host + "/cleanup/v1", {
        method: "POST",
        headers: { "x-api-key": apiKey },
        body: upstream,
        cache: "no-store",
      });
      if (r.ok) return new Response(await r.blob(), { headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });
      try { last = await r.text(); } catch { last = ""; }
      if (r.status !== 404 && !/Unknown url/i.test(last)) return new Response(`Clipdrop cleanup error (${r.status}): ${last}`, { status: 502 });
    }
    return new Response(`Clipdrop cleanup error: ${last || "Unknown url"}`, { status: 502 });
  } catch (e) {
    return new Response(`Server error: ${e.message}`, { status: 500 });
  }
}

