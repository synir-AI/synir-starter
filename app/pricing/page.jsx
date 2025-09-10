"use client";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#F5F5F4] text-[#2F3E46]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold">Pricing</h1>
          <p className="mt-2 text-[#2F3E46]/80">Simple plans to get started. (Placeholder)</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: "Free", price: "$0", features: ["Basic tools", "Watermark", "Daily limits"] },
            { name: "Pro (Monthly)", price: "$12/mo", plan: "monthly", features: ["HD exports", "Priority queue", "No watermark"] },
            { name: "Pro (Annual)", price: "$99/yr", plan: "annual", features: ["2 months free", "HD exports", "No watermark"] },
          ].map((p) => (
            <div key={p.name} className="rounded-2xl bg-white border border-[#E6E6E6] p-6 shadow-sm">
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <div className="mt-2 text-2xl font-bold">{p.price}</div>
              <ul className="mt-4 space-y-2 text-sm text-[#2F3E46]/80">
                {p.features.map((f) => (<li key={f}>• {f}</li>))}
              </ul>
              {p.plan ? (
                <form className="mt-6" onSubmit={async (e) => {
                  e.preventDefault();
                  const res = await fetch('/api/billing/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: p.plan }) });
                  if (!res.ok) { alert(await res.text()); return; }
                  const j = await res.json();
                  window.location.href = j.url;
                }}>
                  <button className="w-full rounded-xl bg-[#4ECDC4] px-4 py-2 font-semibold text-[#2F3E46] hover:opacity-90">Choose {p.name}</button>
                </form>
              ) : (
                <a href="/tools" className="mt-6 inline-block rounded-xl border border-[#2F3E46] px-4 py-2 font-semibold hover:bg-[#EDEDED]">Get started</a>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8">
          <a href="/" className="rounded-xl border border-[#2F3E46] px-4 py-2 font-semibold hover:bg-[#EDEDED]">Back to home</a>
        </div>
      </div>
    </main>
  );
}
