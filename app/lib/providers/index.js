// Minimal helpers that return { ok, blob?, text?, status? }

export async function callRemoveBG(file, key) {
  if (!key) return { ok: false, text: "REMOVE_BG_API_KEY missing" };
  const form = new FormData();
  form.append("image_file", file);
  const r = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": key },
    body: form,
  });
  if (!r.ok) return { ok: false, status: r.status, text: await r.text().catch(()=> "") };
  return { ok: true, blob: await r.blob() };
}

async function postClipdrop(path, form, key) {
  if (!key) return { ok: false, text: "CLIPDROP_API_KEY missing" };
  const urls = [
    "https://api.clipdrop.co" + path,
    "https://clipdrop-api.co" + path, // some accounts
  ];
  let last = { status: 502, text: "Unknown error" };
  for (const u of urls) {
    const r = await fetch(u, { method: "POST", headers: { "x-api-key": key }, body: form, cache: "no-store" });
    if (r.ok) return { ok: true, blob: await r.blob() };
    last = { status: r.status, text: await r.text().catch(()=> "") };
    if (r.status !== 404 && !/Unknown url|Missing id token/i.test(last.text)) break;
  }
  return { ok: false, ...last };
}

export async function callClipdropRemoveBG(file, key) {
  const f = new FormData(); f.append("image_file", file);
  return postClipdrop("/remove-background/v1", f, key);
}
export async function callClipdropReplaceBG(file, prompt, key) {
  const f = new FormData(); f.append("image_file", file); if (prompt) f.append("prompt", prompt);
  return postClipdrop("/replace-background/v1", f, key);
}
export async function callClipdropUncrop(file, { prompt, target_width, target_height } = {}, key) {
  const f = new FormData(); f.append("image_file", file);
  if (prompt) f.append("prompt", prompt);
  if (target_width) f.append("target_width", target_width);
  if (target_height) f.append("target_height", target_height);
  return postClipdrop("/uncrop/v1", f, key);
}
export async function callClipdropUpscale(file, key) {
  const f = new FormData(); f.append("image_file", file);
  return postClipdrop("/super-resolution/v1", f, key);
}

export async function callOpenAIImage(prompt, key) {
  if (!key) return { ok: false, text: "OPENAI_API_KEY missing" };
  const r = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-image-1", prompt, size: "1024x1024" }),
  });
  if (!r.ok) return { ok: false, status: r.status, text: await r.text().catch(()=> "") };
  const data = await r.json();
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) return { ok: false, status: 502, text: "No image data returned" };
  const buf = Buffer.from(b64, "base64");
  return { ok: true, blob: new Blob([buf], { type: "image/png" }) };
}

// Optional fallbacks
export async function callSlazzer(file, key) {
  if (!key) return { ok: false, text: "SLAZZER_API_KEY missing" };
  const f = new FormData(); f.append("source_image", file);
  const r = await fetch("https://api.slazzer.com/v2.0/remove_image_background", {
    method: "POST",
    headers: { "API-KEY": key },
    body: f,
  });
  if (!r.ok) return { ok: false, status: r.status, text: await r.text().catch(()=> "") };
  return { ok: true, blob: await r.blob() };
}
export async function callCutoutPro(file, key) {
  if (!key) return { ok: false, text: "CUTOUTPRO_API_KEY missing" };
  const f = new FormData(); f.append("image_file", file);
  const r = await fetch("https://www.cutout.pro/api/v1/matting3", {
    method: "POST",
    headers: { "APIKEY": key },
    body: f,
  });
  if (!r.ok) return { ok: false, status: r.status, text: await r.text().catch(()=> "") };
  return { ok: true, blob: await r.blob() };
}

// Replicate Real-ESRGAN (optional upscale fallback)
export async function callReplicateUpscale(file, token) {
  if (!token) return { ok: false, text: "REPLICATE_API_TOKEN missing" };
  // Upload to Replicate's blob store
  const upload = await fetch("https://api.replicate.com/v1/files", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: (() => { const f = new FormData(); f.append("file", file); return f; })(),
  });
  if (!upload.ok) return { ok: false, status: upload.status, text: await upload.text().catch(()=> "") };
  const upJson = await upload.json();
  const imageUrl = upJson?.urls?.get;
  if (!imageUrl) return { ok: false, status: 502, text: "Upload failed" };

  // Run prediction
  const body = {
    version: "e6d2a9cb8a2f17e3dd50e14c6b5e621ec3bd3ef00cf5a4f0e53e04f0b0b5c2b8", // Real-ESRGAN 4x (example public version)
    input: { image: imageUrl },
  };
  const pred = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!pred.ok) return { ok: false, status: pred.status, text: await pred.text().catch(()=> "") };
  const pj = await pred.json();

  // Poll
  let resJ = pj;
  for (let i = 0; i < 30 && resJ.status !== "succeeded" && resJ.status !== "failed" && resJ.status !== "canceled"; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const p2 = await fetch(`https://api.replicate.com/v1/predictions/${resJ.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    resJ = await p2.json();
  }
  if (resJ.status !== "succeeded") return { ok: false, status: 502, text: `Replicate status: ${resJ.status}` };

  const outUrl = Array.isArray(resJ.output) ? resJ.output[0] : resJ.output;
  const img = await fetch(outUrl);
  return { ok: true, blob: await img.blob() };
}
