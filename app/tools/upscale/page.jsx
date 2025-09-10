"use client";
import { useRef, useState } from "react";

export default function UpscalePage() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const pick = () => inputRef.current?.click();
  const onChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult("");
    setErr("");
  };

  const run = async () => {
    if (!file) return setErr("Choose an image first.");
    setLoading(true);
    setErr("");
    setResult("");
    try {
      const fd = new FormData();
      fd.append("image_file", file);
      const res = await fetch("/api/clipdrop/upscale", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob();
      setResult(URL.createObjectURL(blob));
    } catch (e) {
      setErr(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title="Upscale Your Image" subtitle="Increase resolution while preserving sharp detail.">
      <Editor
        pick={pick}
        onChange={onChange}
        preview={preview}
        run={run}
        loading={loading}
        err={err}
        result={result}
        primaryLabel="Upscale 2x"
        downloadName="upscaled.png"
      />
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onChange} />
    </PageShell>
  );
}

function PageShell({ title, subtitle, children }) {
  return (
    <main className="min-h-screen bg-[#F5F5F4] text-[#2F3E46]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-6"><h1 className="text-3xl font-semibold">{title}</h1><p className="mt-2 text-[#2F3E46]/80">{subtitle}</p></header>
        <section className="rounded-2xl bg-white p-6 shadow-sm border border-[#E6E6E6]">{children}</section>
      </div>
    </main>
  );
}

function Editor({ pick, onChange, preview, run, loading, err, result, primaryLabel, downloadName }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <div className="aspect-video rounded-xl bg-[#EDEDED] flex items-center justify-center overflow-hidden">
          {preview ? (
            <img className="object-contain max-h-full" src={preview} alt="Preview" />
          ) : (
            <button onClick={pick} className="px-4 py-2 rounded-xl border border-[#2F3E46] hover:bg-[#EDEDED]">Choose Image</button>
          )}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={run} disabled={loading || !preview} className="rounded-xl bg-[#4ECDC4] px-4 py-2 font-semibold text-[#2F3E46] disabled:opacity-50">
            {loading ? "Processing..." : primaryLabel}
          </button>
          <button onClick={pick} className="rounded-xl border border-[#2F3E46] px-4 py-2 font-semibold hover:bg-[#EDEDED]">Change image</button>
          <a href="/tools" className="ml-auto rounded-xl border border-[#2F3E46] px-4 py-2 font-semibold hover:bg-[#EDEDED]">Back to tools</a>
        </div>
        {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
      </div>
      <div>
        <div className="aspect-video rounded-xl bg-[#EDEDED] flex items-center justify-center overflow-hidden">
          {result ? (
            <img className="object-contain max-h-full" src={result} alt="Result" />
          ) : (
            <span className="text-[#2F3E46]/60 text-sm">Result will appear here</span>
          )}
        </div>
        {result && (
          <a href={result} download={downloadName} className="mt-4 inline-block rounded-xl border border-[#2F3E46] px-4 py-2 font-semibold hover:bg-[#EDEDED]">Download</a>
        )}
      </div>
    </div>
  );
}

