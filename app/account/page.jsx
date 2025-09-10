"use client";
import { useEffect, useState } from "react";

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [customer, setCustomer] = useState("");
  const [err, setErr] = useState("");

  // If redirected from Stripe Checkout success
  useEffect(() => {
    const url = new URL(window.location.href);
    const sid = url.searchParams.get("session_id");
    if (!sid) { setLoading(false); return; }
    (async () => {
      try {
        const r = await fetch(`/api/stripe/session?id=${encodeURIComponent(sid)}`);
        if (!r.ok) throw new Error(await r.text());
        const data = await r.json();
        setSession(data);
        const cust = data.customer || data.customer_details?.email || "";
        if (typeof cust === "string") setCustomer(cust);
        // Mark user as pro for this browser (temporary until auth is added)
        document.cookie = `pro=1; Path=/; SameSite=Lax; Max-Age=${60*60*24*30}`;
      } catch (e) {
        setErr(e.message || "Failed to load session");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const manageBilling = async () => {
    try {
      const r = await fetch("/api/billing/portal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customer }) });
      if (!r.ok) throw new Error(await r.text());
      const j = await r.json();
      window.location.href = j.url;
    } catch (e) { setErr(e.message || "Failed to open billing portal"); }
  };

  return (
    <main className="min-h-screen bg-[#F5F5F4] text-[#2F3E46]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-semibold">Account</h1>
        <p className="mt-2 text-[#2F3E46]/80">Manage your subscription and billing.</p>
        {loading ? (
          <p className="mt-6 text-[#2F3E46]/80">Loading...</p>
        ) : (
          <div className="mt-6 rounded-2xl bg-white border border-[#E6E6E6] p-6 shadow-sm space-y-4">
            <div>
              <div className="text-sm text-[#2F3E46]/60">Stripe customer</div>
              <div className="font-mono break-all">{customer || "–"}</div>
            </div>
            <div className="flex gap-3">
              <button onClick={manageBilling} disabled={!customer} className="rounded-xl bg-[#4ECDC4] px-4 py-2 font-semibold text-[#2F3E46] disabled:opacity-50">Open billing portal</button>
              <a href="/tools" className="rounded-xl border border-[#2F3E46] px-4 py-2 font-semibold hover:bg-[#EDEDED]">Go to tools</a>
            </div>
            {err && <p className="text-sm text-red-600">{err}</p>}
          </div>
        )}
      </div>
    </main>
  );
}

