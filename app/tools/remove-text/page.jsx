"use client";
import { useRef, useState } from "react";

export default function RemoveTextPage() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const pick = () => inputRef.current?.click();
  const onChange = (e) => { const f=e.target.files?.[0]; if(!f) return; setFile(f); setPreview(URL.createObjectURL(f)); setResult(""); setErr(""); };

  const run = async () => {
    if (!file) return setErr("Choose an image first.");
    setLoading(true); setErr(""); setResult("");
    try {
      const fd = new FormData(); fd.append("image_file", file);
      const res = await fetch("/api/clipdrop/remove-text", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob(); setResult(URL.createObjectURL(blob));
    } catch (e) { setErr(e.message || "Something went wrong."); }
    finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-[#F5F5F4] text-[#2F3E46]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-6"><h1 className="text-3xl font-semibold">Remove Text</h1><p className="mt-2 text-[#2F3E46]/80">Erase text from images while keeping texture and lighting.</p></header>
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-[#E6E6E6]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <div className="aspect-video rounded-xl bg-[#F7F7F7] flex items-center justify-center overflow-hidden border border-[#EDEDED]">
                {preview ? <img className="object-contain max-h-full" src={preview} alt="Preview" /> : <button onClick={pick} className="px-4 py-2 rounded-xl border border-[#2F3E46] hover:bg-[#EDEDED]">Choose Image</button>}
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button onClick={run} disabled={!file || loading} className="rounded-xl bg-[#4ECDC4] px-4 py-2 font-semibold text-[#2F3E46] disabled:opacity-50">{loading ? "Processing..." : "Remove text"}</button>
                <a href="/tools" className="rounded-xl border border-[#2F3E46] px-4 py-2 font-semibold hover:bg-[#EDEDED]">Back to tools</a>
              </div>
              {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
            </div>
            <div>
              <div className="aspect-video rounded-xl bg-[#F7F7F7] flex items-center justify-center overflow-hidden border border-[#EDEDED]">
                {result ? <img className="object-contain max-h-full" src={result} alt="Result" /> : <span className="text-[#2F3E46]/60 text-sm">Result will appear here</span>}
              </div>
              {result && <a href={result} download="remove-text.png" className="mt-4 inline-block rounded-xl border border-[#2F3E46] px-4 py-2 font-semibold hover:bg-[#EDEDED]">Download</a>}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

