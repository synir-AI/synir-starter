"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ContactPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setOk(""); setErr("");
    if (!name.trim() || !email.trim() || !message.trim()) { setErr("Please fill all fields."); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ name, email, message, website }),
      });
      if (!r.ok) throw new Error(await r.text());
      setOk("Thanks! We received your message.");
      setName(""); setEmail(""); setMessage(""); setWebsite("");
      // Redirect to thank-you page
      router.push("/contact/thanks");
    } catch (e) {
      setErr(e.message || "Failed to send. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F5F4] text-[#2F3E46]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-semibold">Contact</h1>
        <p className="mt-3 text-[#2F3E46]/80">Send us a message and we’ll get back to you.</p>
        <form onSubmit={submit} className="mt-6 rounded-2xl bg-white border border-[#E6E6E6] p-6 shadow-sm space-y-4">
          {/* Honeypot field: keep invisible to humans */}
          <label className="block sr-only" aria-hidden>
            <span>Website</span>
            <input tabIndex={-1} autoComplete="off" value={website} onChange={(e)=>setWebsite(e.target.value)} />
          </label>
          {/* Turnstile widget (optional) */}
          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
            <div className="mt-2">
              <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
              <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}></div>
            </div>
          )}
          <label className="block">
            <span className="text-sm font-medium">Name</span>
            <input className="mt-2 w-full rounded-xl border border-[#CFCFCF] bg-white p-3 outline-none focus:ring-2 focus:ring-[#4ECDC4]" value={name} onChange={(e)=>setName(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input type="email" className="mt-2 w-full rounded-xl border border-[#CFCFCF] bg-white p-3 outline-none focus:ring-2 focus:ring-[#4ECDC4]" value={email} onChange={(e)=>setEmail(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm font-medium">Message</span>
            <textarea rows={5} className="mt-2 w-full rounded-xl border border-[#CFCFCF] bg-white p-3 outline-none focus:ring-2 focus:ring-[#4ECDC4]" value={message} onChange={(e)=>setMessage(e.target.value)} />
          </label>
          <div className="flex items-center gap-3">
            <button disabled={loading} className="rounded-xl bg-[#4ECDC4] px-4 py-2 font-semibold text-[#2F3E46] disabled:opacity-50">
              {loading ? "Sending..." : "Send message"}
            </button>
            {ok && <span className="text-sm text-green-700">{ok}</span>}
            {err && <span className="text-sm text-red-600">{err}</span>}
          </div>
        </form>
      </div>
    </main>
  );
}
