export default function ChangelogPage() {
  const items = [
    { date: "2025-09-10", title: "v0.1.1", body: "Adds placeholder pages and deploy docs." },
    { date: "2025-09-10", title: "v0.1.0", body: "Initial tools routes and landing." },
  ];

  return (
    <main className="min-h-screen bg-[#F5F5F4] text-[#2F3E46]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-semibold">Changelog</h1>
        <div className="mt-6 space-y-5">
          {items.map((it) => (
            <div key={it.title} className="rounded-2xl bg-white border border-[#E6E6E6] p-5 shadow-sm">
              <div className="text-xs text-[#2F3E46]/60">{it.date}</div>
              <h2 className="text-xl font-semibold mt-1">{it.title}</h2>
              <p className="mt-2 text-[#2F3E46]/80">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

