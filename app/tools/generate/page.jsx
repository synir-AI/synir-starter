"use client";
import { useState } from "react";

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [seed, setSeed] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const run = async () => {
    if (!prompt.trim()) return setErr("Write a prompt first.");
    setLoading(true); setErr(""); setResult("");
    try {
      const fd = new FormData();
      fd.append("prompt", prompt);
      if (seed) fd.append("seed", seed);
     const res = await fetch("/api/clipdrop/text-to-image", { method: "POST", body: fd })
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob(); setResult(URL.createObjectURL(blob));
    } catch (e) { setErr(e.message || "Something went wrong."); }
    finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-[#F5F5F4] text-[#2F3E46]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-6"><h1 className="text-3xl font-semibold">Generate AI Image</h1><p className="mt-2 text-[#2F3E46]/80">Create high‑quality images from text prompts.</p></header>
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-[#E6E6E6]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium">Prompt</span>
                <textarea className="mt-2 w-full rounded-xl border border-[#CFCFCF] bg-white p-3 outline-none focus:ring-2 focus:ring-[#4ECDC4]" rows={5}
                  placeholder="a product photo of a black leather wallet on marble, soft daylight"
                  value={prompt} onChange={(e)=>setPrompt(e.target.value)} />
              </label>
              <label className="block">
                <span className="text-sm font-medium">Seed (optional)</span>
                <input className="mt-2 w-full rounded-xl border border-[#CFCFCF] bg-white p-3 outline-none focus:ring-2 focus:ring-[#4ECDC4]" placeholder="fixed number for reproducibility"
                  value={seed} onChange={(e)=>setSeed(e.target.value)} />
              </label>
              <div className="flex gap-3">
                <button onClick={run} disabled={loading || !prompt.trim()} className="rounded-xl bg-[#4ECDC4] px-4 py-2 font-semibold text-[#2F3E46] disabled:opacity-50">
                  {loading ? "Generating…" : "Generate"}
                </button>
                <a href="/tools" className="rounded-xl border border-[#2F3E46] px-4 py-2 font-semibold hover:bg-[#EDEDED]">Back to tools</a>
              </div>
              {err && <p className="text-sm text-red-600">{err}</p>}
            </div>
            <div>
              <div className="aspect-video rounded-xl bg-[#EDEDED] flex items-center justify-center overflow-hidden">
                {result ? <img className="object-contain max-h-full" src={result} alt="Result" /> : <span className="text-[#2F3E46]/60 text-sm">Result preview will appear here</span>}
              </div>
              {result && <a href={result} download="generated.png" className="mt-4 inline-block rounded-xl border border-[#2F3E46] px-4 py-2 font-semibold hover:bg-[#EDEDED]">Download</a>}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
