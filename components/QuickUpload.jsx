"use client";
import { useRef, useState } from "react";

export default function QuickUpload() {
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  async function handleUpload(api) {
    if (!inputRef.current?.files?.[0]) return;
    const fd = new FormData();
    fd.append("image", inputRef.current.files[0]);
    if (api === "/api/outpaint") {
      fd.append("prompt", "extend naturally");
      fd.append("aspect", "16:9");
    }
    const res = await fetch(api, { method: "POST", body: fd });
    if (!res.ok) { alert("Processing failed"); return; }
    const blob = await res.blob();
    setPreview(URL.createObjectURL(blob));
  }

  return (
    <div className="card mt-8">
      <h3 className="font-semibold">Quick Demo</h3>
      <p className="text-sm text-softgray/80 mt-2">Upload an image and try a tool:</p>

      <input ref={inputRef} type="file" accept="image/*" className="mt-4" />
      <div className="flex gap-3 mt-4">
        <button className="button-primary" onClick={() => handleUpload("/api/remove-bg")}>Remove BG</button>
        <button className="button-primary" onClick={() => handleUpload("/api/upscale")}>Upscale ×4</button>
        <button className="button-primary" onClick={() => handleUpload("/api/outpaint")}>Extend 16:9</button>
      </div>

      {preview && (
        <div className="mt-6">
          <img src={preview} alt="Result" className="rounded-xl border border-white/10" />
        </div>
      )}
    </div>
  );
}
