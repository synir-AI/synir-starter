export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const form = await req.formData();
    const image = form.get("image");
    const targetWidth = form.get("target_width");
    const targetHeight = form.get("target_height");

    if (!image) {
      return new Response("No image provided.", { status: 400 });
    }
    if (!targetWidth || !targetHeight) {
      return new Response("Missing target_width/target_height.", { status: 400 });
    }
    if (!process.env.CLIPDROP_API_KEY) {
      return new Response("Server missing CLIPDROP_API_KEY.", { status: 500 });
    }

    const body = new FormData();
    body.append("image_file", image);
    body.append("target_width", String(targetWidth));
    body.append("target_height", String(targetHeight));

    // Correct Clipdrop upscaling endpoint
    const r = await fetch("https://clipdrop-api.co/image-upscaling/v1/upscale", {
      method: "POST",
      headers: { "x-api-key": process.env.CLIPDROP_API_KEY },
      body
    });

    if (!r.ok) {
      // bubble up the real provider error so you can see why
      const txt = await r.text();
      return new Response(txt || "Upscale failed.", { status: r.status });
    }

    const buf = await r.arrayBuffer();
    const contentType = r.headers.get("content-type") || "image/jpeg";
    return new Response(buf, { status: 200, headers: { "Content-Type": contentType } });
  } catch (e) {
    return new Response(e?.message || "Server error during upscale.", { status: 500 });
  }
}
