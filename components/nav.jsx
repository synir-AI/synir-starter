"use client";
import Link from "next/link";
import { BRAND } from "./brand";

export default function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-charcoal/70 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-neon" />
          <span className="font-semibold tracking-wide">{BRAND.name}</span>
        </Link>
        <div className="flex items-center gap-3 text-sm">
          <Link href="#tools" className="hover:text-white">Tools</Link>
          <Link href="#solutions" className="hover:text-white">Solutions</Link>
          <Link href="#pricing" className="hover:text-white">Pricing</Link>
          <a href="mailto:hello@synir.ai" className="button-primary">Get Started</a>
        </div>
      </div>
    </nav>
  );
}
