'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export default function NavbarMobileMenu({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button className="md:hidden text-[var(--color-navy)]" onClick={() => setOpen(!open)}>
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-t border-[var(--color-border)] px-6 py-4 flex flex-col gap-4 text-sm font-medium text-[var(--color-slate)] shadow-lg">
          <Link href="#how-it-works" onClick={() => setOpen(false)}>How It Works</Link>
          <Link href="#pricing" onClick={() => setOpen(false)}>Pricing</Link>
          <Link href="#" onClick={() => setOpen(false)}>Consultants</Link>
          <hr className="border-[var(--color-border)]" />
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              onClick={() => setOpen(false)}
              className="bg-[var(--color-navy)] text-white px-4 py-2 rounded-lg text-center font-semibold"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="text-[var(--color-navy)] font-semibold" onClick={() => setOpen(false)}>
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-[var(--color-navy)] text-white px-4 py-2 rounded-lg text-center font-semibold"
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
