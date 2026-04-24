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
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/neurlogo.png" alt="Neur" width={26} height={26} className="object-contain invert" />
          <span className="text-lg font-extrabold text-white tracking-tight">NEUR</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
          <Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
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
