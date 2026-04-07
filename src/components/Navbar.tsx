"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-b border-[var(--color-border)]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/neurlogo.png" alt="Neur" width={32} height={32} className="object-contain" />
          <span className="text-xl font-bold text-[var(--color-navy)] tracking-tight">NEUR</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--color-slate)]">
          <Link href="#how-it-works" className="hover:text-[var(--color-navy)] transition-colors">How It Works</Link>
          <Link href="#pricing" className="hover:text-[var(--color-navy)] transition-colors">Pricing</Link>
          <Link href="#" className="hover:text-[var(--color-navy)] transition-colors">Consultants</Link>
        </nav>

        {/* CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/sign-in" className="text-sm font-medium text-[var(--color-navy)] hover:underline">
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="text-sm font-semibold bg-[var(--color-navy)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-navy-light)] transition-colors"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden text-[var(--color-navy)]" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-[var(--color-border)] px-6 py-4 flex flex-col gap-4 text-sm font-medium text-[var(--color-slate)]">
          <Link href="#how-it-works" onClick={() => setOpen(false)}>How It Works</Link>
          <Link href="#pricing" onClick={() => setOpen(false)}>Pricing</Link>
          <Link href="#" onClick={() => setOpen(false)}>Consultants</Link>
          <hr className="border-[var(--color-border)]" />
          <Link href="/sign-in" className="text-[var(--color-navy)] font-semibold">Sign In</Link>
          <Link href="/sign-up" className="bg-[var(--color-navy)] text-white px-4 py-2 rounded-lg text-center font-semibold">
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}
