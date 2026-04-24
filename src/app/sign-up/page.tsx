'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-browser'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M18 9a9 9 0 1 0-10.406 8.89v-6.288H5.31V9h2.284V7.017c0-2.255 1.343-3.501 3.4-3.501.985 0 2.015.176 2.015.176v2.215h-1.135c-1.119 0-1.468.694-1.468 1.407V9h2.496l-.399 2.602H10.406V17.89A9.003 9.003 0 0 0 18 9Z" fill="#1877F2"/>
      <path d="m12.503 11.602.399-2.602H10.406V7.314c0-.713.349-1.407 1.468-1.407H13V3.692s-1.03-.176-2.015-.176c-2.057 0-3.4 1.246-3.4 3.501V9H5.31v2.602h2.276v6.288a9.064 9.064 0 0 0 2.82 0v-6.288h2.097Z" fill="#fff"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <path d="M14.94 13.44c-.27.62-.59 1.2-.96 1.73-.5.72-.92 1.21-1.24 1.48-.49.45-1.02.68-1.59.69-.41 0-.9-.12-1.47-.35-.57-.23-1.1-.35-1.58-.35-.5 0-1.04.12-1.62.35-.58.23-1.05.35-1.41.37-.55.02-1.09-.22-1.61-.72-.35-.29-.78-.8-1.3-1.55-.55-.79-1.01-1.72-1.37-2.77C1.07 11.22.9 10.1.9 9.02c0-1.24.27-2.31.8-3.2a4.7 4.7 0 0 1 1.68-1.7 4.51 4.51 0 0 1 2.27-.64c.45 0 1.03.14 1.75.41.72.27 1.18.41 1.38.41.15 0 .67-.16 1.53-.48.82-.3 1.52-.42 2.09-.38 1.54.12 2.7.73 3.47 1.82-1.38.84-2.06 2.01-2.05 3.52.01 1.17.44 2.15 1.27 2.92.38.36.8.63 1.27.83-.1.3-.21.59-.34.88ZM11.56 1.08c0 .92-.34 1.78-1 2.57-.8.94-1.78 1.48-2.83 1.4a2.87 2.87 0 0 1-.02-.35c0-.88.38-1.82 1.06-2.59.34-.39.77-.71 1.29-.97.52-.26 1.01-.4 1.47-.42.01.12.03.24.03.36Z"/>
    </svg>
  )
}

// Polls the profiles table until the row exists (created by DB trigger after signUp)
async function waitForProfile(
  userId: string,
  supabase: ReturnType<typeof createClient>,
  maxAttempts = 10,
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()
    if (data) return true
    await new Promise(r => setTimeout(r, 500))
  }
  return false
}

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
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)

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

    // If a paid plan was selected, wait for the profiles row then redirect to Stripe
    if (validPlan && data.user) {
      setCheckoutLoading(true)
      try {
        await waitForProfile(data.user.id, supabase)

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

  async function handleOAuth(provider: 'google' | 'facebook' | 'apple') {
    setOauthLoading(provider)
    const supabase = createClient()
    const callbackUrl = validPlan
      ? `${window.location.origin}/auth/callback?plan=${validPlan}`
      : `${window.location.origin}/auth/callback`
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: callbackUrl },
    })
  }

  const glassPage = (children: React.ReactNode) => (
    <div
      className="grain min-h-screen flex items-center justify-center px-6 py-12"
      style={{ background: 'linear-gradient(140deg, #06061a 0%, #12126B 55%, #080824 100%)' }}
    >
      {children}
    </div>
  )

  const glassCard = (children: React.ReactNode) => (
    <div
      className="rounded-2xl p-8 max-w-md w-full"
      style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
      }}
    >
      {children}
    </div>
  )

  // Checkout redirect in progress
  if (checkoutLoading) {
    return glassPage(glassCard(
      <div className="text-center py-2">
        <div className="text-4xl mb-4">⏳</div>
        <h2 className="text-xl font-bold text-white mb-2">Setting up your subscription...</h2>
        <p className="text-white/50 text-sm">
          You&apos;ll be redirected to Stripe to complete your payment.
        </p>
      </div>
    ))
  }

  // Free signup — confirm email
  if (success) {
    return glassPage(glassCard(
      <div className="text-center py-2">
        <div className="text-4xl mb-4">📬</div>
        <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
        <p className="text-white/50 text-sm">
          We sent a confirmation link to <strong className="text-white/80">{email}</strong>. Click it to activate your account.
        </p>
      </div>
    ))
  }

  return (
    <div
      className="grain min-h-screen flex items-center justify-center px-6 py-12"
      style={{ background: 'linear-gradient(140deg, #06061a 0%, #12126B 55%, #080824 100%)' }}
    >
      <div
        className="rounded-2xl p-8 max-w-md w-full"
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
        }}
      >

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Image src="/neurlogo.png" alt="Neur" width={28} height={28} className="object-contain" />
            <span className="text-lg font-bold text-white tracking-tight">NEUR</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-white">Create your account</h1>
          <p className="text-sm text-white/50 mt-1">Start finding your perfect business opportunity</p>
          {validPlan && (
            <div
              className="mt-3 inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--color-gold)', border: '1px solid rgba(245,158,11,0.3)' }}
            >
              {validPlan === 'monthly' ? '📅 Monthly Plan — $29/mo' : '📆 Annual Plan — $299/yr'}
            </div>
          )}
        </div>

        {/* OAuth buttons */}
        <div className="space-y-2 mb-5">
          <button
            onClick={() => handleOAuth('google')}
            disabled={!!oauthLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 transition-colors disabled:opacity-60"
            style={{ border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <GoogleIcon />
            {oauthLoading === 'google' ? 'Redirecting...' : 'Continue with Google'}
          </button>
          <button
            onClick={() => handleOAuth('facebook')}
            disabled={!!oauthLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 transition-colors disabled:opacity-60"
            style={{ border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <FacebookIcon />
            {oauthLoading === 'facebook' ? 'Redirecting...' : 'Continue with Facebook'}
          </button>
          <button
            onClick={() => handleOAuth('apple')}
            disabled={!!oauthLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 transition-colors disabled:opacity-60"
            style={{ border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <AppleIcon />
            {oauthLoading === 'apple' ? 'Redirecting...' : 'Continue with Apple'}
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="px-2 text-white/30">or</span>
          </div>
        </div>

        {/* Email/password form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-white/30 outline-none transition"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-white/30 outline-none transition"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-white/30 outline-none transition"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
            />
          </div>

          {error && (
            <div className="text-sm text-red-300 bg-red-900/30 border border-red-500/30 rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
            style={{ background: 'var(--color-gold)', color: 'var(--color-navy)' }}
          >
            {loading
              ? 'Creating account...'
              : validPlan
              ? 'Create Account & Continue to Payment'
              : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-white/40 mt-6">
          Already have an account?{' '}
          <Link href="/sign-in" className="text-[var(--color-gold)] font-semibold hover:underline">
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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(140deg, #06061a 0%, #12126B 55%, #080824 100%)' }}
      >
        <div className="text-white/40 text-sm">Loading...</div>
      </div>
    }>
      <SignUpInner />
    </Suspense>
  )
}
