'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-browser'

function SignUpInner() {
  const searchParams = useSearchParams()
  const rawPlan = searchParams.get('plan')
  const validPlan: 'monthly' | 'annual' | null =
    rawPlan === 'monthly' || rawPlan === 'annual' ? rawPlan : null

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    // If a paid plan was selected, redirect to Stripe checkout
    if (validPlan && data.user) {
      setCheckoutLoading(true)
      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: validPlan,
            userId: data.user.id,
            email,
          }),
        })
        const json = await res.json()
        if (json.url) {
          window.location.href = json.url
          return
        }
        setError('Failed to set up checkout. Please try again.')
        setCheckoutLoading(false)
      } catch {
        setError('Failed to set up checkout. Please try again.')
        setCheckoutLoading(false)
      }
      return
    }

    // No plan — show confirm email screen
    setSuccess(true)
  }

  // Checkout redirect in progress
  if (checkoutLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-6">
        <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-10 max-w-md w-full text-center">
          <div className="text-4xl mb-4">⏳</div>
          <h2 className="text-xl font-bold text-[var(--color-navy)] mb-2">Setting up your subscription...</h2>
          <p className="text-[var(--color-slate)] text-sm">
            You&apos;ll be redirected to Stripe to complete your payment.
          </p>
        </div>
      </div>
    )
  }

  // Free signup — confirm email
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-6">
        <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-10 max-w-md w-full text-center">
          <div className="text-4xl mb-4">📬</div>
          <h2 className="text-xl font-bold text-[var(--color-navy)] mb-2">Check your email</h2>
          <p className="text-[var(--color-slate)] text-sm">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-6">
      <div className="bg-white rounded-2xl border border-[var(--color-border)] shadow-sm p-8 max-w-md w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image src="/neurlogo.png" alt="Neur" width={28} height={28} className="object-contain" />
            <span className="text-lg font-bold text-[var(--color-navy)] tracking-tight">NEUR</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-[var(--color-navy)]">Create your account</h1>
          <p className="text-sm text-[var(--color-slate)] mt-1">Start finding your perfect business opportunity</p>
          {validPlan && (
            <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              {validPlan === 'monthly' ? '📅 Monthly Plan — $20/mo' : '📆 Annual Plan — $200/yr'}
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm outline-none focus:border-[var(--color-blue)] focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm outline-none focus:border-[var(--color-blue)] focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm outline-none focus:border-[var(--color-blue)] focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-navy)] text-white font-bold py-3 rounded-xl hover:bg-[var(--color-navy-light)] transition-colors disabled:opacity-60"
          >
            {loading
              ? 'Creating account...'
              : validPlan
              ? 'Create Account & Continue to Payment'
              : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--color-slate)] mt-6">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-[var(--color-blue)] font-semibold hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}

export default function SignUp() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="text-[var(--color-slate)] text-sm">Loading...</div>
      </div>
    }>
      <SignUpInner />
    </Suspense>
  )
}
