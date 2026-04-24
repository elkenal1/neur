import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import NavbarMobileMenu from './NavbarMobileMenu'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md"
      style={{ background: 'rgba(6,6,26,0.85)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <Image src="/neurlogo.png" alt="Neur" width={26} height={26} className="object-contain invert" />
          <span className="text-lg font-extrabold text-white tracking-tight">NEUR</span>
        </Link>

        {/* Desktop nav — absolutely centered */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-8 text-sm font-medium text-white/60">
          {[
            { href: "/#how-it-works", label: "How It Works" },
            { href: "/#pricing",      label: "Pricing" },
            { href: "/about",        label: "About" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="relative py-1 hover:text-white transition-colors group"
            >
              {label}
              <span className="absolute bottom-0 left-0 w-full h-px bg-[var(--color-gold)] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="text-sm font-bold px-5 py-2 rounded-lg transition-colors"
              style={{ background: 'var(--color-gold)', color: 'var(--color-navy)' }}
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="text-sm font-medium text-white/60 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="text-sm font-bold px-5 py-2 rounded-lg transition-colors"
                style={{ background: 'var(--color-gold)', color: 'var(--color-navy)' }}
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        <NavbarMobileMenu isLoggedIn={isLoggedIn} />
      </div>
    </header>
  )
}
