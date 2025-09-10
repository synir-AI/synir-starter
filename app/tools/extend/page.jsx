"use client";
import { useRef, useState } from "react";

export default function ExtendPage() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState("");
  const [prompt, setPrompt] = useState("");
  const [w, setW] = useState("");
  const [h, setH] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [exactSize, setExactSize] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);

  const MAX_DIM = 4096;
  const presets = [
    { label: "Square 1:1 (1024 x 1024)", w: 1024, h: 1024 },
    { label: "Instagram Portrait (1080 x 1350)", w: 1080, h: 1350 },
    { label: "Instagram Landscape (1080 x 566)", w: 1080, h: 566 },
    { label: "YouTube Thumbnail (1280 x 720)", w: 1280, h: 720 },
    { label: "Full HD (1920 x 1080)", w: 1920, h: 1080 },
    { label: "2K (2048 x 1152)", w: 2048, h: 1152 },
    { label: "Square 2048 (2048 x 2048)", w: 2048, h: 2048 },
    { label: "4K UHD (3840 x 2160)", w: 3840, h: 2160 },
  ];

  const pick = () => inputRef.current?.click();
  const onChange = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setFile(f); setPreview(URL.createObjectURL(f)); setResult(""); setErr("");
  };

  const run = async () => {
    if (!file) return setErr("Choose an image first.");
    setLoading(true); setErr(""); setResult(""); setUsedFallback(false);
    try {
      // Resolve target size
      let tw = parseInt(w || "0", 10);
      let th = parseInt(h || "0", 10);
      if (!tw || !th) {
        const imgUrl = URL.createObjectURL(file);
        const imgEl = new Image();
        await new Promise((resolve, reject) => { imgEl.onload = resolve; imgEl.onerror = reject; imgEl.src = imgUrl; });
        const origW = imgEl.naturalWidth; const origH = imgEl.naturalHeight;
        tw = Math.max(origW, 2048); th = Math.max(origH, 2048);
      }
      tw = Math.min(Math.max(1, tw), MAX_DIM);
      th = Math.min(Math.max(1, th), MAX_DIM);

      // Try Clipdrop first
      const fd = new FormData();
      fd.append("image_file", file);
      if (prompt.trim()) fd.append("prompt", prompt.trim());
      fd.append("target_width", String(tw));
      fd.append("target_height", String(th));

      let res = await fetch("/api/clipdrop/extend", { method: "POST", body: fd });
      let usedAI = false;
      if (!res.ok) {
        const txt = await res.text().catch(()=>"");
        if (exactSize && /Unrecognized key\(s\)/i.test(txt)) {
          // Build AI outpaint mask
          const imgUrl = URL.createObjectURL(file);
          const baseImg = new Image();
          await new Promise((resolve, reject) => { baseImg.onload = resolve; baseImg.onerror = reject; baseImg.src = imgUrl; });
          const canvas = document.createElement("canvas"); canvas.width = tw; canvas.height = th;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "white"; ctx.fillRect(0,0,tw,th);
          const x = Math.floor((tw - baseImg.naturalWidth)/2);
          const y = Math.floor((th - baseImg.naturalHeight)/2);
          ctx.fillStyle = "black"; ctx.fillRect(x,y,baseImg.naturalWidth, baseImg.naturalHeight);
          const maskBlob = await new Promise(res2 => canvas.toBlob(res2, "image/png"));

          const fd2 = new FormData();
          fd2.append("image_file", file);
          if (prompt.trim()) fd2.append("prompt", prompt.trim());
          fd2.append("mask_file", maskBlob, "mask.png");
          fd2.append("target_width", String(tw));
          fd2.append("target_height", String(th));
          res = await fetch("/api/openai/outpaint", { method: "POST", body: fd2 });
          usedAI = true;
        }
        if (!res.ok) throw new Error((await res.text().catch(()=>"")) || "Extend failed");
      }

      const blob = await res.blob();
      if (exactSize) {
        const testUrl = URL.createObjectURL(blob);
        const img = new Image();
        await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; img.src = testUrl; });
        if ((img.naturalWidth !== tw || img.naturalHeight !== th) && !usedAI) {
          // AI fallback to enforce exact size
          const imgUrl = URL.createObjectURL(file);
          const baseImg = new Image();
          await new Promise((resolve, reject) => { baseImg.onload = resolve; baseImg.onerror = reject; baseImg.src = imgUrl; });
          const canvas = document.createElement("canvas"); canvas.width = tw; canvas.height = th;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "white"; ctx.fillRect(0,0,tw,th);
          const x = Math.floor((tw - baseImg.naturalWidth)/2);
          const y = Math.floor((th - baseImg.naturalHeight)/2);
          ctx.fillStyle = "black"; ctx.fillRect(x,y,baseImg.naturalWidth, baseImg.naturalHeight);
          const maskBlob = await new Promise(res2 => canvas.toBlob(res2, "image/png"));

          const fd2 = new FormData();
          fd2.append("image_file", file);
          if (prompt.trim()) fd2.append("prompt", prompt.trim());
          fd2.append("mask_file", maskBlob, "mask.png");
          fd2.append("target_width", String(tw));
          fd2.append("target_height", String(th));
          const res2 = await fetch("/api/openai/outpaint", { method: "POST", body: fd2 });
          if (!res2.ok) throw new Error(await res2.text());
          const blob2 = await res2.blob();
          setResult(URL.createObjectURL(blob2));
          setUsedFallback(true);
          return;
        }
      }

      setResult(URL.createObjectURL(blob));
      setUsedFallback(usedAI);
    } catch (e) {
      setErr(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F5F4] text-[#2F3E46]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold">Extend Your Image</h1>
          <p className="mt-2 text-[#2F3E46]/80">Outpaint to a wider canvas with bright, clean results.</p>
        </header>
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-[#E6E6E6]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="aspect-video rounded-xl bg-[#F7F7F7] flex items-center justify-center overflow-hidden border border-[#EDEDED]">
                {preview ? (<img className="object-contain max-h-full" src={preview} alt="Preview" />) : (
                  <button onClick={pick} className="px-4 py-2 rounded-xl border border-[#2F3E46] hover:bg-[#EDEDED]">Choose Image</button>
                )}
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <label className="block">
                  <span className="text-sm font-medium">Common sizes</span>
                  <select className="mt-2 w-full rounded-xl border border-[#CFCFCF] bg-white p-3 outline-none focus:ring-2 focus:ring-[#4ECDC4]" defaultValue="" onChange={(e)=>{ const i = Number(e.target.value); if (!Number.isNaN(i) && presets[i]) { setW(String(presets[i].w)); setH(String(presets[i].h)); } }}>
                    <option value="" disabled>Select a preset…</option>
                    {presets.map((p, i) => (<option key={p.label} value={i}>{p.label}</option>))}
                  </select>
                </label>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="block"><span className="text-sm font-medium">Target width (px)</span>
                  <input className="mt-2 w-full rounded-xl border border-[#CFCFCF] bg-white p-2 outline-none focus:ring-2 focus:ring-[#4ECDC4]" placeholder="e.g., 2048" value={w} onChange={(e)=>setW(e.target.value.replace(/[^0-9]/g, ""))} />
                </label>
                <label className="block"><span className="text-sm font-medium">Target height (px)</span>
                  <input className="mt-2 w-full rounded-xl border border-[#CFCFCF] bg-white p-2 outline-none focus:ring-2 focus:ring-[#4ECDC4]" placeholder="e.g., 2048" value={h} onChange={(e)=>setH(e.target.value.replace(/[^0-9]/g, ""))} />
                </label>
              </div>
              <label className="mt-4 block">
                <span className="text-sm font-medium">Fill prompt (optional)</span>
                <input className="mt-2 w-full rounded-xl border border-[#CFCFCF] bg-white p-3 outline-none focus:ring-2 focus:ring-[#4ECDC4]" placeholder="describe what should appear in the new areas" value={prompt} onChange={(e)=>setPrompt(e.target.value)} />
              </label>
              <label className="mt-3 inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={exactSize} onChange={(e)=>setExactSize(e.target.checked)} />
                <span>Exact size (uses AI fallback when needed)</span>
              </label>
              <div className="mt-4 flex items-center gap-3">
                <button onClick={run} disabled={!file || loading} className="rounded-xl bg-[#4ECDC4] px-4 py-2 font-semibold text-[#2F3E46] disabled:opacity-50">{loading ? "Processing..." : "Extend"}</button>
                <a href="/tools" className="rounded-xl border border-[#2F3E46] px-4 py-2 font-semibold hover:bg-[#EDEDED]">Back to tools</a>
              </div>
              <p className="mt-2 text-xs text-[#2F3E46]/60">Max dimension {MAX_DIM}px. If the primary provider doesn’t accept target sizes, we’ll use an AI fallback to fill borders for exact output.</p>
              {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
            </div>
            <div>
              <div className="aspect-video rounded-xl bg-[#F7F7F7] flex items-center justify-center overflow-hidden border border-[#EDEDED]">
                {result ? (<img className="object-contain max-h-full" src={result} alt="Result" />) : (<span className="text-[#2F3E46]/60 text-sm">Result will appear here</span>)}
              </div>
              {result && (<a href={result} download="extended.png" className="mt-4 inline-block rounded-xl border border-[#2F3E46] px-4 py-2 font-semibold hover:bg-[#EDEDED]">Download</a>)}
              {usedFallback && <p className="mt-2 text-xs text-[#2F3E46]/60">Used AI fallback to achieve exact size.</p>}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

