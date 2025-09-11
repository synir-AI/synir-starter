"use client";

import { useState } from "react";

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const tools = [
    { name: "Generate", href: "/tools/generate", desc: "Text to image", badge: "Beta" },
    { name: "Remove BG", href: "/tools/remove-bg", desc: "Cutout subject" },
    { name: "Replace BG", href: "/tools/replace-bg", desc: "Swap backgrounds" },
    { name: "Extend", href: "/tools/extend", desc: "Outpaint canvas" },
    { name: "Upscale", href: "/tools/upscale", desc: "Enhance detail" },
    { name: "Cleanup", href: "/tools/cleanup", desc: "Remove objects" },
    { name: "Remove Text", href: "/tools/remove-text", desc: "Erase text" },
  ];

  const why = [
    { title: "Pro-grade quality", body: "Clean edges, realistic textures, and color-true outputs — great for ecommerce and social." },
    { title: "Fast & affordable", body: "API-first stack for speed today, room for our own models later." },
    { title: "Private by default", body: "Images are processed server-side. Keys stay on the backend." },
    { title: "Simple workflow", body: "Upload -> choose a tool -> download. Minimal clicks, maximal results." },
  ];

  return (
    <main className="min-h-screen bg-[#F5F5F4] text-[#2F3E46]">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-[#E0E0E0]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <a href="/" className="font-semibold tracking-tight text-lg">Synir AI</a>
            <nav className="hidden md:flex items-center gap-8">
              <a href="/tools" className="hover:text-[#4ECDC4]">Tools</a>
              <a href="/pricing" className="hover:text-[#4ECDC4]">Pricing</a>
              <a href="/login" className="hover:text-[#4ECDC4]">Login</a>
              <a href="/signup" className="inline-flex items-center rounded-xl bg-[#4ECDC4] px-4 py-2 font-medium text-[#2F3E46] shadow-sm hover:opacity-90">Sign Up</a>
            </nav>
            <button
              onClick={() => setMobileOpen(v => !v)}
              className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-[#EDEDED]"
              aria-label="Toggle navigation"
            >
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                {mobileOpen
                  ? <path strokeWidth="2" strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
                  : <path strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-[#E0E0E0] bg-white">
            <div className="px-4 py-3 space-y-2">
              <a href="/tools" className="block py-2 hover:text-[#4ECDC4]">Tools</a>
              <a href="/pricing" className="block py-2 hover:text-[#4ECDC4]">Pricing</a>
              <a href="/login" className="block py-2 hover:text-[#4ECDC4]">Login</a>
              <a href="/signup" className="mt-2 inline-flex w-full justify-center rounded-xl bg-[#4ECDC4] px-4 py-2 font-medium text-[#2F3E46]">Sign Up</a>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-[#F5F5F4]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-semibold leading-tight tracking-tight">
              Bright, clean image tools for everyone.
            </h1>
            <p className="mt-4 text-lg text-[#2F3E46]/80">
              Generate, resize, remove/replace backgrounds, cleanup objects, outpaint and upscale — all in one simple workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/tools" className="inline-flex items-center rounded-xl bg-[#4ECDC4] px-5 py-3 font-semibold text-[#2F3E46] shadow hover:opacity-90">Start using the tools</a>
              <a href="#tools" className="inline-flex items-center rounded-xl border border-[#2F3E46] px-5 py-3 font-semibold text-[#2F3E46] hover:bg-[#EDEDED]">See all tools</a>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section id="tools" className="bg-white border-y border-[#E0E0E0]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-semibold">Tools</h2>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {tools.map(t => (
              <a key={t.href} href={t.href} className="group rounded-2xl bg-white border border-[#E6E6E6] p-5 shadow-sm hover:shadow transition">
                <div className="aspect-square rounded-xl bg-[#F7F7F7] border border-[#EDEDED] flex items-center justify-center text-[#2F3E46]/60 group-hover:bg-[#F2FFFC]">
                  <ToolIcon />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <h3 className="text-base font-semibold">{t.name}</h3>
                  {t.badge && <span className="text-[10px] rounded-full bg-[#4ECDC4]/20 text-[#2F3E46] px-2 py-0.5">{t.badge}</span>}
                </div>
                <p className="mt-1 text-xs text-[#2F3E46]/70">{t.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {why.map((w) => (
              <div key={w.title} className="rounded-xl border border-[#E6E6E6] bg-white p-5">
                <div className="flex items-center gap-3">
                  <CheckIcon />
                  <h3 className="font-semibold">{w.title}</h3>
                </div>
                <p className="mt-2 text-[#2F3E46]/80">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white border-y border-[#E0E0E0]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-[#2F3E46]/80">
            <div className="rounded-xl border border-[#E6E6E6] bg-white p-5">"The background tools saved our product shoot." — <b>Elena, Shop Owner</b></div>
            <div className="rounded-xl border border-[#E6E6E6] bg-white p-5">"Best upscale quality for the price." — <b>Marcus, Designer</b></div>
            <div className="rounded-xl border border-[#E6E6E6] bg-white p-5">"Clean UI. Our team adopted it instantly." — <b>Ray, Marketer</b></div>
          </div>
        </div>
      </section>

      {/* Big CTA */}
      <section className="bg-[#F5F5F4]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold">Start creating in seconds — free.</h2>
          <p className="mt-3 text-lg text-[#2F3E46]/80">No credit card needed. Upgrade anytime for higher resolution and watermark-free exports.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <a href="/signup" className="inline-flex items-center rounded-xl bg-[#4ECDC4] px-6 py-3 font-semibold text-[#2F3E46] shadow hover:opacity-90">Start creating for free</a>
            <a href="/pricing" className="inline-flex items-center rounded-xl border border-[#2F3E46] px-6 py-3 font-semibold text-[#2F3E46] hover:bg-[#EDEDED]">See pricing</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2F3E46] text-[#F5F5F4]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
            <div>
              <h4 className="font-semibold">Tools</h4>
              <ul className="mt-3 space-y-2 text-sm text-white/80">
                <li><a className="hover:text-[#4ECDC4]" href="/tools/generate">Generate AI Image</a></li>
                <li><a className="hover:text-[#4ECDC4]" href="/tools/remove-bg">Remove Background</a></li>
                <li><a className="hover:text-[#4ECDC4]" href="/tools/replace-bg">Replace Background</a></li>
                <li><a className="hover:text-[#4ECDC4]" href="/tools/extend">Extend Your Image</a></li>
                <li><a className="hover:text-[#4ECDC4]" href="/tools/upscale">Upscale Your Image</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Products</h4>
              <ul className="mt-3 space-y-2 text-sm text-white/80">
                <li><a className="hover:text-[#4ECDC4]" href="/pricing">Pricing</a></li>
                <li><a className="hover:text-[#4ECDC4]" href="/api">API</a></li>
                <li><a className="hover:text-[#4ECDC4]" href="/changelog">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Resources</h4>
              <ul className="mt-3 space-y-2 text-sm text-white/80">
                <li><a className="hover:text-[#4ECDC4]" href="/help">Help Center</a></li>
                <li><a className="hover:text-[#4ECDC4]" href="/blog">Blog</a></li>
                <li><a className="hover:text-[#4ECDC4]" href="/guides">Guides</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Company</h4>
              <ul className="mt-3 space-y-2 text-sm text-white/80">
                <li><a className="hover:text-[#4ECDC4]" href="/about">About</a></li>
                <li><a className="hover:text-[#4ECDC4]" href="/contact">Contact</a></li>
                <li><a className="hover:text-[#4ECDC4]" href="/legal">Legal</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold">Get started</h4>
              <div className="mt-3">
                <a href="/signup" className="inline-flex items-center rounded-xl bg-[#4ECDC4] px-4 py-2 font-semibold text-[#2F3E46] hover:opacity-90">Create free account</a>
              </div>
              <p className="mt-3 text-xs text-white/70">© {new Date().getFullYear()} Synir AI. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function StarIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 17.3l6.18 3.7-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ToolIcon() {
  return (
    <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="3" width="7" height="7" strokeWidth="2" rx="1" />
      <rect x="14" y="3" width="7" height="7" strokeWidth="2" rx="1" />
      <rect x="3" y="14" width="7" height="7" strokeWidth="2" rx="1" />
      <rect x="14" y="14" width="7" height="7" strokeWidth="2" rx="1" />
    </svg>
  );
}
