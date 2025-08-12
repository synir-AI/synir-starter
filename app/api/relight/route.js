export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const image = formData.get('image');
    const prompt = formData.get('prompt');

    if (!image || !prompt) {
      return new Response(JSON.stringify({ error: 'Image and prompt are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Send to Clipdrop Replace Background API
    const clipdropResponse = await fetch('https://clipdrop-api.co/replace-background/v1', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLIPDROP_API_KEY,
      },
      body: (() => {
        const body = new FormData();
        body.append('image_file', image);
        body.append('prompt', prompt);
        return body;
      })(),
    });

    if (!clipdropResponse.ok) {
      const errorText = await clipdropResponse.text();
      return new Response(JSON.stringify({ error: errorText }), {
        status: clipdropResponse.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Return the image directly
    const arrayBuffer = await clipdropResponse.arrayBuffer();
    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
      },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
