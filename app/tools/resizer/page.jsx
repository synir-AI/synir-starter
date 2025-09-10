"use client";
import { useRef, useState } from "react";

export default function ResizerPage() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState("");
  const [w, setW] = useState("");
  const [h, setH] = useState("");
  const [mode, setMode] = useState("auto"); // auto | upscale | outpaint
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const pick = () => inputRef.current?.click();
  const onChange = (e) => { const f=e.target.files?.[0]; if(!f) return; setFile(f); setPreview(URL.createObjectURL(f)); setResult(""); setErr(""); };

  const run = async () => {
    if (!file) return setErr("Choose an image first.");
    const tw = parseInt(w||"0",10); const th = parseInt(h||"0",10);
    if (!tw || !th) return setErr("Enter target width and height.");
    setLoading(true); setErr(""); setResult("");
    try {
      // Load original to compare sizes
      const imgUrl = URL.createObjectURL(file); const base = new Image();
      await new Promise((res,rej)=>{ base.onload=res; base.onerror=rej; base.src=imgUrl; });
      const origW = base.naturalWidth, origH = base.naturalHeight;

      if (tw <= origW && th <= origH && mode !== "outpaint") {
        // Downscale client-side to exact size
        const c = document.createElement("canvas"); c.width = tw; c.height = th;
        const ctx = c.getContext("2d");
        ctx.drawImage(base, 0,0, origW,origH, 0,0, tw,th);
        const blob = await new Promise(res=>c.toBlob(res, "image/png"));
        setResult(URL.createObjectURL(blob));
        return;
      }

      if (mode === "upscale" || (mode === "auto" && (tw>origW || th>origH))) {
        // Use Clipdrop upscale first, then fit exact if needed (letterbox)
        const fd = new FormData(); fd.append("image_file", file);
        const r = await fetch("/api/clipdrop/upscale", { method: "POST", body: fd });
        if (!r.ok) throw new Error(await r.text());
        const upBlob = await r.blob(); const upUrl = URL.createObjectURL(upBlob);
        const up = new Image(); await new Promise((res,rej)=>{ up.onload=res; up.onerror=rej; up.src=upUrl; });
        // Fit exact canvas by letterbox (no crop)
        const c = document.createElement("canvas"); c.width = tw; c.height = th; const ctx=c.getContext("2d");
        ctx.fillStyle = "white"; ctx.fillRect(0,0,tw,th);
        const scale = Math.min(tw/up.naturalWidth, th/up.naturalHeight);
        const dw = Math.round(up.naturalWidth*scale), dh = Math.round(up.naturalHeight*scale);
        const dx = Math.floor((tw-dw)/2), dy = Math.floor((th-dh)/2);
        ctx.drawImage(up, dx,dy, dw,dh);
        const blob = await new Promise(res=>c.toBlob(res, "image/png")); setResult(URL.createObjectURL(blob));
        return;
      }

      // Outpaint to exact size (OpenAI fallback)
      const c = document.createElement("canvas"); c.width = tw; c.height = th; const ctx=c.getContext("2d");
      ctx.fillStyle="white"; ctx.fillRect(0,0,tw,th);
      const x = Math.floor((tw-origW)/2), y = Math.floor((th-origH)/2);
      ctx.fillStyle="black"; ctx.fillRect(x,y,origW,origH);
      const maskBlob = await new Promise(res=>c.toBlob(res, "image/png"));
      const fd2 = new FormData(); fd2.append("image_file", file); fd2.append("mask_file", maskBlob, "mask.png"); fd2.append("target_width", String(tw)); fd2.append("target_height", String(th));
      const r2 = await fetch("/api/openai/outpaint", { method: "POST", body: fd2 });
      if (!r2.ok) throw new Error(await r2.text());
      const blob2 = await r2.blob(); setResult(URL.createObjectURL(blob2));
    } catch (e) { setErr(e.message || "Something went wrong."); }
    finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-[#F5F5F4] text-[#2F3E46]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-6"><h1 className="text-3xl font-semibold">Universal Resizer</h1><p className="mt-2 text-[#2F3E46]/80">Downsize locally, upscale or outpaint for larger exact sizes.</p></header>
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-[#E6E6E6]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="aspect-video rounded-xl bg-[#F7F7F7] flex items-center justify-center overflow-hidden border border-[#EDEDED]">
                {preview ? <img className="object-contain max-h-full" src={preview} alt="Preview" /> : <button onClick={pick} className="px-4 py-2 rounded-xl border border-[#2F3E46] hover:bg-[#EDEDED]">Choose Image</button>}
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <label className="block"><span className="text-sm font-medium">Target width (px)</span>
                  <input className="mt-2 w-full rounded-xl border border-[#CFCFCF] bg-white p-2 outline-none focus:ring-2 focus:ring-[#4ECDC4]" placeholder="e.g., 1920" value={w} onChange={(e)=>setW(e.target.value.replace(/[^0-9]/g, ""))} />
                </label>
                <label className="block"><span className="text-sm font-medium">Target height (px)</span>
                  <input className="mt-2 w-full rounded-xl border border-[#CFCFCF] bg-white p-2 outline-none focus:ring-2 focus:ring-[#4ECDC4]" placeholder="e.g., 1080" value={h} onChange={(e)=>setH(e.target.value.replace(/[^0-9]/g, ""))} />
                </label>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
                <label className="inline-flex items-center gap-2"><input type="radio" name="mode" checked={mode==='auto'} onChange={()=>setMode('auto')} /> Auto</label>
                <label className="inline-flex items-center gap-2"><input type="radio" name="mode" checked={mode==='upscale'} onChange={()=>setMode('upscale')} /> Upscale</label>
                <label className="inline-flex items-center gap-2"><input type="radio" name="mode" checked={mode==='outpaint'} onChange={()=>setMode('outpaint')} /> Outpaint exact</label>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button onClick={run} disabled={!file || loading} className="rounded-xl bg-[#4ECDC4] px-4 py-2 font-semibold text-[#2F3E46] disabled:opacity-50">{loading ? "Processing..." : "Resize"}</button>
                <a href="/tools" className="rounded-xl border border-[#2F3E46] px-4 py-2 font-semibold hover:bg-[#EDEDED]">Back to tools</a>
              </div>
              {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
            </div>
            <div>
              <div className="aspect-video rounded-xl bg-[#F7F7F7] flex items-center justify-center overflow-hidden border border-[#EDEDED]">
                {result ? <img className="object-contain max-h-full" src={result} alt="Result" /> : <span className="text-[#2F3E46]/60 text-sm">Result will appear here</span>}
              </div>
              {result && <a href={result} download="resized.png" className="mt-4 inline-block rounded-xl border border-[#2F3E46] px-4 py-2 font-semibold hover:bg-[#EDEDED]">Download</a>}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

