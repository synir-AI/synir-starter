export const runtime = "nodejs";

// Uses OpenAI image edits to outpaint to an exact size using an image + mask
export async function POST(req) {
  try {
    const key = process.env.OPENAI_API_KEY;
    if (!key) return new Response("Missing OPENAI_API_KEY", { status: 500 });

    const fd = await req.formData();
    const image = fd.get("image_file");
    const mask = fd.get("mask_file");
    const promptRaw = fd.get("prompt") || "";
    const targetW = fd.get("target_width");
    const targetH = fd.get("target_height");
    if (!image || !mask || !targetW || !targetH) return new Response("image_file, mask_file, target_width, target_height required", { status: 400 });

    const size = `${targetW}x${targetH}`;
    const prompt = String(promptRaw).trim() ||
      "Fill the extended canvas areas realistically, matching the original image's background, lighting, perspective, textures, and style.";
    const upstream = new FormData();
    upstream.append("model", "gpt-image-1");
    upstream.append("image", image, "image.png");
    upstream.append("mask", mask, "mask.png");
    upstream.append("size", size);
    upstream.append("prompt", prompt);

    const r = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: upstream,
    });
    if (!r.ok) return new Response(`OpenAI outpaint error (${r.status}): ${await r.text()}`, { status: 502 });
    const json = await r.json();
    const b64 = json?.data?.[0]?.b64_json;
    if (!b64) return new Response("No image returned", { status: 502 });
    const buf = Buffer.from(b64, "base64");
    return new Response(buf, { headers: { "Content-Type": "image/png", "Cache-Control": "no-store" } });
  } catch (e) {
    return new Response(`Server error: ${e.message}`, { status: 500 });
  }
}
