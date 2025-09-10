export const runtime = "nodejs";

export async function POST(req) {
  try {
    const apiKey = process.env.CLIPDROP_API_KEY;
    if (!apiKey) return new Response("Missing CLIPDROP_API_KEY", { status: 500 });

    const fd = await req.formData();
    const file = fd.get("image_file");
    if (!file) return new Response("No image_file provided", { status: 400 });

    const upstream = new FormData();
    upstream.append("image_file", file);

    const r = await fetch("https://api.clipdrop.co/super-resolution/v1", {
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
