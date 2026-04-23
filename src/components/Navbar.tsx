import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase-server'
import NavbarMobileMenu from './NavbarMobileMenu'

export default async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isLoggedIn = !!user

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
          <Link href="/about" className="hover:text-[var(--color-navy)] transition-colors">About</Link>
        </nav>

        {/* Desktop CTA — auth-aware */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="text-sm font-semibold bg-[var(--color-navy)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-navy-light)] transition-colors"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/sign-in" className="text-sm font-medium text-[var(--color-navy)] hover:underline">
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="text-sm font-semibold bg-[var(--color-navy)] text-white px-4 py-2 rounded-lg hover:bg-[var(--color-navy-light)] transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <NavbarMobileMenu isLoggedIn={isLoggedIn} />
      </div>
    </header>
  )
}
