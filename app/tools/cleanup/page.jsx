"use client";
import { useEffect, useRef, useState } from "react";

export default function CleanupPage() {
  const inputRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [brush, setBrush] = useState(30);
  const [drawing, setDrawing] = useState(false);

  const pick = () => inputRef.current?.click();
  const onChange = (e) => {
    const f = e.target.files?.[0]; if (!f) return;
    setFile(f); setPreview(URL.createObjectURL(f)); setResult(""); setErr("");
  };

  useEffect(() => {
    if (!preview) return;
    const img = new Image(); imgRef.current = img;
    img.onload = () => {
      const canvas = canvasRef.current; if (!canvas) return;
      const ratio = img.width / img.height;
      // Fit into a 16:9 area visually; canvas will be image size for export
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext("2d"); ctx.clearRect(0,0,canvas.width,canvas.height);
    };
    img.src = preview;
  }, [preview]);

  const startDraw = (e) => { setDrawing(true); draw(e, true); };
  const endDraw = () => setDrawing(false);
  const draw = (e, first=false) => {
    if (!drawing && !first) return;
    const canvas = canvasRef.current; const img = imgRef.current; if (!canvas || !img) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = canvas.width / rect.width; const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white"; // white indicates removal
    ctx.beginPath(); ctx.arc(x, y, brush, 0, Math.PI*2); ctx.fill();
  };

  const run = async () => {
    if (!file) return setErr("Choose an image first.");
    if (!canvasRef.current) return setErr("Mask not ready.");
    setLoading(true); setErr(""); setResult("");
    try {
      // Export mask
      const maskBlob = await new Promise((res) => canvasRef.current.toBlob(res, "image/png"));
      const fd = new FormData();
      fd.append("image_file", file);
      fd.append("mask_file", maskBlob, "mask.png");
      const r = await fetch("/api/clipdrop/cleanup", { method: "POST", body: fd });
      if (!r.ok) throw new Error(await r.text());
      const blob = await r.blob(); setResult(URL.createObjectURL(blob));
    } catch (e) { setErr(e.message || "Something went wrong."); }
    finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-[#F5F5F4] text-[#2F3E46]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-6"><h1 className="text-3xl font-semibold">Cleanup (Remove Objects)</h1><p className="mt-2 text-[#2F3E46]/80">Paint over objects to remove; the AI fills the area.</p></header>
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-[#E6E6E6]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="aspect-video rounded-xl bg-[#F7F7F7] flex items-center justify-center overflow-hidden border border-[#EDEDED] relative">
                {preview ? (
                  <>
                    <img className="absolute inset-0 h-full w-full object-contain" src={preview} alt="Preview" />
                    <div className="relative w-full h-full" onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}>
                      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" style={{mixBlendMode:"multiply"}} />
                    </div>
                  </>
                ) : (
                  <button onClick={pick} className="px-4 py-2 rounded-xl border border-[#2F3E46] hover:bg-[#EDEDED]">Choose Image</button>
                )}
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
              </div>
              {preview && (
              <div className="mt-3 flex items-center gap-3">
                <label className="text-sm">Brush: <input type="range" min={5} max={100} value={brush} onChange={(e)=>setBrush(parseInt(e.target.value))} /></label>
                <button onClick={()=>{const ctx=canvasRef.current?.getContext("2d"); if(ctx) ctx.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);}} className="rounded-xl border border-[#2F3E46] px-3 py-1 text-sm">Clear mask</button>
              </div>)}
              <div className="mt-4 flex items-center gap-3">
                <button onClick={run} disabled={!file || loading} className="rounded-xl bg-[#4ECDC4] px-4 py-2 font-semibold text-[#2F3E46] disabled:opacity-50">{loading ? "Processing..." : "Remove objects"}</button>
                <a href="/tools" className="rounded-xl border border-[#2F3E46] px-4 py-2 font-semibold hover:bg-[#EDEDED]">Back to tools</a>
              </div>
              {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
            </div>
            <div>
              <div className="aspect-video rounded-xl bg-[#F7F7F7] flex items-center justify-center overflow-hidden border border-[#EDEDED]">
                {result ? <img className="object-contain max-h-full" src={result} alt="Result" /> : <span className="text-[#2F3E46]/60 text-sm">Result will appear here</span>}
              </div>
              {result && <a href={result} download="cleanup.png" className="mt-4 inline-block rounded-xl border border-[#2F3E46] px-4 py-2 font-semibold hover:bg-[#EDEDED]">Download</a>}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

