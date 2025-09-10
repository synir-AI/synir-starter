export default function ToolsIndexPage() {
  const tools = [
    { name: "Generate AI Image", href: "/tools/generate", desc: "Create images from text prompts.", badge: "Beta" },
    { name: "Remove Background", href: "/tools/remove-bg", desc: "Instantly isolate your subject with clean edges." },
    { name: "Replace Background", href: "/tools/replace-bg", desc: "Swap scenes while keeping realism." },
    { name: "Extend Your Image", href: "/tools/extend", desc: "Outpaint to a wider canvas." },
    { name: "Upscale Your Image", href: "/tools/upscale", desc: "Boost resolution & detail." },
  ];

  return (
    <main className="min-h-screen bg-[#F5F5F4] text-[#2F3E46]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold">Tools</h1>
          <p className="mt-2 text-[#2F3E46]/80">Pick a tool to get started.</p>
        </header>
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((t) => (
            <a key={t.href} href={t.href} className="rounded-2xl bg-white border border-[#E6E6E6] p-5 shadow-sm hover:shadow transition">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t.name}</h3>
                {t.badge && (
                  <span className="text-xs rounded-full bg-[#4ECDC4]/20 text-[#2F3E46] px-2 py-1">{t.badge}</span>
                )}
              </div>
              <p className="mt-2 text-sm text-[#2F3E46]/80">{t.desc}</p>
            </a>
          ))}
        </section>
        <div className="mt-8">
          <a href="/" className="rounded-xl border border-[#2F3E46] px-4 py-2 font-semibold hover:bg-[#EDEDED]">Back to home</a>
        </div>
      </div>
    </main>
  );
}

