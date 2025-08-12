export const runtime = 'edge';

export async function POST(req) {
  try {
    const form = await req.formData();
    const file = form.get('image');
    if (!file) return new Response('No image', { status: 400 });

    const body = new FormData();
    body.append('image_file', file);
    body.append('size', 'auto');

    const r = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': process.env.REMOVE_BG_API_KEY },
      body
    });

    if (!r.ok) {
      const txt = await r.text();
      return new Response(txt || 'Upstream error', { status: r.status });
    }

    const arrayBuf = await r.arrayBuffer();
    return new Response(arrayBuf, {
      status: 200,
      headers: { 'Content-Type': 'image/png' }
    });
  } catch (e) {
    return new Response('Server error', { status: 500 });
  }
}
