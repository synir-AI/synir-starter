"use client";
import { useState } from "react";

export default function Home() {
  // ===== Remove Background (remove.bg) =====
  const [rbOutUrl, setRbOutUrl] = useState(null);
  const [rbLoading, setRbLoading] = useState(false);
  const [rbErr, setRbErr] = useState("");

  async function handleRemoveBg(e) {
    e.preventDefault();
    setRbErr(""); setRbOutUrl(null);
    const file = e.target.image.files?.[0];
    if (!file) { setRbErr("Pick an image first."); return; }

    const maxMb = 8;
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      setRbErr("Please select a PNG, JPG, or WEBP image."); return;
    }
    if (file.size > maxMb * 1024 * 1024) {
      setRbErr(`File too large. Max ${maxMb} MB.`); return;
    }

    setRbLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/removebg", { method: "POST", body: fd });
      if (!res.ok) {
        const txt = await res.text();
        setRbErr(txt || "Failed to process image. Please try again.");
        return;
      }
      const blob = await res.blob();
      setRbOutUrl(URL.createObjectURL(blob));
    } catch {
      setRbErr("Network error. Please try again.");
    } finally {
      setRbLoading(false);
    }
  }

  // ===== Prompt Background + Relight (Clipdrop) =====
  const [pbOutUrl, setPbOutUrl] = useState(null);
  const [pbLoading, setPbLoading] = useState(false);
  const [pbErr, setPbErr] = useState("");

  async function handlePromptBg(e) {
    e.preventDefault();
    setPbErr(""); setPbOutUrl(null);

    const file = e.target.image.files?.[0];
    const prompt = e.target.prompt.value.trim();

    if (!file) { setPbErr("Pick a subject image."); return; }
    if (!prompt) { setPbErr("Write a background prompt."); return; }
    if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) {
      setPbErr("Please select a PNG, JPG, or WEBP image."); return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setPbErr("File too large. Max 8 MB."); return;
    }

    setPbLoading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);      // IMPORTANT: field name is 'image'
      fd.append("prompt", prompt);   // and 'prompt' to match the API route

      const res = await fetch("/api/relight", { method: "POST", body: fd });
      if (!res.ok) {
        const txt = await res.text();
        setPbErr(txt || "Failed to generate composite.");
        return;
      }
      const blob = await res.blob();
      setPbOutUrl(URL.createObjectURL(blob));
    } catch {
      setPbErr("Network error. Please try again.");
    } finally {
      setPbLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/favicon.svg" className="h-8 w-8" alt="Synir logo" />
            <span className="font-semibold tracking-tight">Synir</span>
          </div>
          <nav className="text-sm">
            <a className="px-3 py-2 rounded hover:bg-gray-100" href="#features">Features</a>
            <a className="px-3 py-2 rounded hover:bg-gray-100" href="#how">How it works</a>
            <a className="px-3 py-2 rounded hover:bg-gray-100" href="#cta">Remove BG</a>
            <a className="px-3 py-2 rounded hover:bg-gray-100" href="#prompt-bg">Prompt BG</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              See beyond. <span className="text-indigo-600">Edit smarter.</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Synir is a professional AI photo tool for background removal, background replacement,
              upscaling, and image generation — without complex software.
            </p>
            <div className="mt-6 flex gap-3">
              <a href="#cta" className="inline-flex items-center justify-center rounded-xl bg-indigo-600 text-white px-5 py-3 font-medium hover:bg-indigo-700 transition">
                Get Started (Free)
              </a>
              <a href="#features" className="inline-flex items-center justify-center rounded-xl border px-5 py-3 font-medium hover:bg-gray-100 transition">
                Explore Features
              </a>
            </div>
            <p className="mt-3 text-sm text-gray-500">No credit card required.</p>
          </div>
          <div className="bg-white border rounded-2xl shadow-sm p-4">
            <div className="aspect-video rounded-xl bg-gray-100 grid place-items-center text-gray-500">
              Demo preview
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <li className="border rounded-xl p-3 bg-white">🪄 Background removal</li>
              <li className="border rounded-xl p-3 bg-white">🌅 Prompt background (relight)</li>
              <li className="border rounded-xl p-3 bg-white">🔍 4× Upscaling</li>
              <li className="border rounded-xl p-3 bg-white">🧭 Outpainting</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <h2 className="text-2xl font-bold">Features</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            {[
              {title:'Background Removal',desc:'Clean cutouts with one click.'},
              {title:'Background Replacement',desc:'On-brand scenes via prompt or library.'},
              {title:'Upscale',desc:'Sharpen and enlarge up to 4×.'},
              {title:'Generate',desc:'Create product scenes from prompts.'},
              {title:'Extend (Outpaint)',desc:'Widen frames for social formats.'},
              {title:'Presets',desc:'IG, FB, Shopee, Lazada, Amazon sizes.'},
            ].map((f) => (
              <div key={f.title} className="border rounded-2xl p-5 bg-white">
                <div className="text-lg font-semibold">{f.title}</div>
                <div className="mt-2 text-gray-600">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="border-t bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <h2 className="text-2xl font-bold">How it works</h2>
          <ol className="mt-6 grid md:grid-cols-3 gap-6 text-sm text-gray-700">
            <li className="border rounded-2xl p-5 bg-white">Upload a photo</li>
            <li className="border rounded-2xl p-5 bg-white">Pick a tool (remove, replace, upscale, generate)</li>
            <li className="border rounded-2xl p-5 bg-white">Download results instantly</li>
          </ol>
        </div>
      </section>

      {/* Remove BG */}
      <section id="cta" className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-xl font-semibold">Try Background Removal (Free)</h3>
            <p className="mt-2 text-gray-600">Upload a photo and get a transparent PNG in seconds.</p>
          </div>

          <form onSubmit={handleRemoveBg} className="bg-gray-50 border rounded-2xl p-4 grid gap-3">
            <input name="image" type="file" accept="image/*" className="border rounded-xl px-4 py-3" />
            <button
              disabled={rbLoading}
              className="rounded-xl bg-indigo-600 text-white px-5 py-3 font-medium hover:bg-indigo-700 disabled:opacity-60"
            >
              {rbLoading ? "Processing…" : "Remove background"}
            </button>
            {rbErr && <p className="text-sm text-red-600">{rbErr}</p>}
          </form>
        </div>

        {rbOutUrl && (
          <div className="max-w-6xl mx-auto px-6 pb-14">
            <div className="border rounded-2xl p-4 bg-white">
              <img alt="Result" src={rbOutUrl} className="max-h-96 mx-auto" />
              <div className="mt-3">
                <a href={rbOutUrl} download="synir-removed-bg.png" className="text-sm underline">
                  Download PNG
                </a>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Prompt Background + Relight */}
      <section id="prompt-bg" className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-xl font-semibold">Change Background by Prompt</h3>
            <p className="mt-2 text-gray-600">
              Upload a subject, describe the scene (e.g., “sunset beach, soft golden hour light”),
              and we’ll match lighting, shadows, and color automatically.
            </p>
          </div>

          <form onSubmit={handlePromptBg} className="bg-gray-50 border rounded-2xl p-4 grid gap-3">
            <input name="image" type="file" accept="image/*" className="border rounded-xl px-4 py-3" />
            <input name="prompt" type="text" placeholder='e.g., "sunset beach, soft golden hour"' className="border rounded-xl px-4 py-3" />
            <button
              disabled={pbLoading}
              className="rounded-xl bg-indigo-600 text-white px-5 py-3 font-medium hover:bg-indigo-700 disabled:opacity-60"
            >
              {pbLoading ? "Processing…" : "Make it real"}
            </button>
            {pbErr && <p className="text-sm text-red-600">{pbErr}</p>}
          </form>
        </div>

        {pbOutUrl && (
          <div className="max-w-6xl mx-auto px-6 pb-14">
            <div className="border rounded-2xl p-4 bg-white">
              <img alt="Composite result" src={pbOutUrl} className="max-h-96 mx-auto" />
              <div className="mt-3">
                <a href={pbOutUrl} download="synir-composite.png" className="text-sm underline">Download PNG</a>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-gray-500">
          © {new Date().getFullYear()} Synir — All rights reserved.
        </div>
      </footer>
    </main>
  );
}
