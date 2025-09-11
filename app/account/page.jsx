"use client";
import { useEffect, useState } from "react";
import InfoNote from "../../components/InfoNote.jsx";

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const [customer, setCustomer] = useState("");
  const [err, setErr] = useState("");

  // If redirected from Stripe Checkout success
  useEffect(() => {
    (async () => {
      try {
        // Refresh user/subscription view
        const meR = await fetch("/api/me", { cache: "no-store" });
        const mj = await meR.json();
        setMe(mj.user);
        setCustomer(mj.user?.stripeCustomerId || "");
      } catch (e) { setErr(e.message || "Failed to load account"); }
      finally { setLoading(false); }
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
              <div className="text-sm text-[#2F3E46]/60">Plan</div>
              <div>{me?.subscription?.status ? `${me.subscription.plan} (${me.subscription.status})` : "Free"}</div>
            </div>
            <div>
              <div className="text-sm text-[#2F3E46]/60">Stripe customer</div>
              <div className="font-mono break-all">{customer || "–"}</div>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={manageBilling} disabled={!customer} className="rounded-xl bg-[#4ECDC4] px-4 py-2 font-semibold text-[#2F3E46] disabled:opacity-50">Open billing portal</button>
              <button onClick={async ()=>{ await fetch('/api/demo/pro?on=1', { method:'POST' }); window.location.reload(); }} className="rounded-xl border border-[#2F3E46] px-4 py-2 font-semibold hover:bg-[#EDEDED]">Enable Pro (demo)</button>
              <button onClick={async ()=>{ await fetch('/api/demo/pro?on=0', { method:'POST' }); window.location.reload(); }} className="rounded-xl border border-[#2F3E46] px-4 py-2 font-semibold hover:bg-[#EDEDED]">Disable Pro (demo)</button>
              <a href="/tools" className="rounded-xl border border-[#2F3E46] px-4 py-2 font-semibold hover:bg-[#EDEDED]">Go to tools</a>
            </div>
            <InfoNote>Demo Pro sets a temporary cookie for this browser only. Subscriptions stay in sync via webhooks when you add a payment provider.</InfoNote>
            {err && <p className="text-sm text-red-600">{err}</p>}
          </div>
        )}
      </div>
    </main>
  );
}
