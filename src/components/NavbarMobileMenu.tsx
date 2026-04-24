'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function NavbarMobileMenu({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button className="md:hidden text-white/70 hover:text-white transition-colors" onClick={() => setOpen(!open)}>
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div
          className="md:hidden absolute top-16 left-0 right-0 px-6 py-5 flex flex-col gap-4 text-sm font-medium"
          style={{ background: 'rgba(6,6,26,0.97)', borderTop: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
        >
          <Link href="/#how-it-works" onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors">How It Works</Link>
          <Link href="/#pricing" onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors">Pricing</Link>
          <Link href="/about" onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors">About</Link>
          <hr className="border-white/10" />
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="px-4 py-2.5 rounded-xl text-center font-bold"
              style={{ background: 'var(--color-gold)', color: 'var(--color-navy)' }}
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="text-white/60 hover:text-white font-medium transition-colors" onClick={() => setOpen(false)}>
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="px-4 py-2.5 rounded-xl text-center font-bold"
                style={{ background: 'var(--color-gold)', color: 'var(--color-navy)' }}
                onClick={() => setOpen(false)}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </>
  )
}
