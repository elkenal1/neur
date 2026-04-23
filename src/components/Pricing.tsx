'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'

type UserPlan = 'free' | 'monthly' | 'annual' | 'consultant' | 'admin' | null

const plans = [
  {
    key: 'consultation',
    name: 'One-Time',
    price: null,
    label: 'From $99',
    description: 'A single in-depth consultation with a personalized report.',
    features: [
      'Full intake questionnaire',
      'Business & location analysis',
      'Interactive dashboard access',
      'Downloadable PDF report',
      'Human review included',
    ],
    cta: 'Book a Consultation',
    href: '/contact?plan=consultation',
    highlight: false,
    stripePlan: null as null,
  },
  {
    key: 'monthly',
    name: 'Monthly',
    price: '$29',
    label: 'per month',
    description: 'Full platform access — browse, analyze, and plan on your schedule.',
    features: [
      'Up to 5 analyses per month',
      'Full report with all data',
      'Comparable cities engine',
      'PDF downloads (3/month)',
      'Business launch tracker',
      'Unlimited article access',
    ],
    cta: 'Get Started',
    href: '/sign-up?plan=monthly',
    highlight: true,
    stripePlan: 'monthly' as const,
  },
  {
    key: 'annual',
    name: 'Annual',
    price: '$299',
    label: 'per year',
    description: 'Everything in Monthly — save over 2 months free.',
    features: [
      'Up to 10 analyses per month',
      'Everything in Monthly',
      'PDF downloads (5/month)',
      'Priority support',
      'Early access to new features',
    ],
    cta: 'Get Started',
    href: '/sign-up?plan=annual',
    highlight: false,
    stripePlan: 'annual' as const,
  },
]

export default function Pricing() {
  const [userPlan, setUserPlan] = useState<UserPlan>(null)
  const [userId, setUserId]     = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [upgrading, setUpgrading] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoaded(true); return }

      setUserId(user.id)
      setUserEmail(user.email ?? null)

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()

      setUserPlan((profile?.plan as UserPlan) ?? 'free')
      setLoaded(true)
    }
    loadUser()
  }, [])

  async function handleUpgrade(plan: 'monthly' | 'annual') {
    if (!userId || !userEmail) {
      window.location.href = `/sign-up?plan=${plan}`
      return
    }
    setUpgrading(plan)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, userId, email: userEmail }),
      })
      const json = await res.json()
      if (json.url) window.location.href = json.url
    } catch {
      setUpgrading(null)
    }
  }

  function renderButton(plan: typeof plans[number]) {
    const isPaidPlan = plan.stripePlan === 'monthly' || plan.stripePlan === 'annual'

    if (!isPaidPlan) {
      return (
        <Link
          href={plan.href}
          className={`text-center text-sm font-bold px-4 py-3 rounded-xl transition-colors ${
            plan.highlight
              ? 'bg-[var(--color-gold)] text-[var(--color-navy)] hover:bg-[var(--color-gold-light)]'
              : 'bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy-light)]'
          }`}
        >
          {plan.cta}
        </Link>
      )
    }

    if (!loaded) {
      return (
        <div className={`text-center text-sm font-bold px-4 py-3 rounded-xl opacity-50 ${
          plan.highlight ? 'bg-[var(--color-gold)] text-[var(--color-navy)]' : 'bg-[var(--color-navy)] text-white'
        }`}>
          {plan.cta}
        </div>
      )
    }

    if (!userPlan) {
      return (
        <Link
          href={plan.href}
          className={`text-center text-sm font-bold px-4 py-3 rounded-xl transition-colors ${
            plan.highlight
              ? 'bg-[var(--color-gold)] text-[var(--color-navy)] hover:bg-[var(--color-gold-light)]'
              : 'bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy-light)]'
          }`}
        >
          {plan.cta}
        </Link>
      )
    }

    const isCurrentPlan =
      userPlan === plan.stripePlan ||
      ((userPlan === 'consultant' || userPlan === 'admin') && plan.stripePlan === 'annual')

    if (isCurrentPlan) {
      return (
        <div className={`text-center text-sm font-bold px-4 py-3 rounded-xl ${
          plan.highlight ? 'bg-white/20 text-white' : 'bg-[var(--color-muted)] text-[var(--color-navy)]'
        }`}>
          ✓ Current Plan
        </div>
      )
    }

    return (
      <button
        onClick={() => handleUpgrade(plan.stripePlan!)}
        disabled={upgrading === plan.stripePlan}
        className={`w-full text-center text-sm font-bold px-4 py-3 rounded-xl transition-colors disabled:opacity-60 ${
          plan.highlight
            ? 'bg-[var(--color-gold)] text-[var(--color-navy)] hover:bg-[var(--color-gold-light)]'
            : 'bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy-light)]'
        }`}
      >
        {upgrading === plan.stripePlan ? 'Redirecting...' : 'Upgrade Now'}
      </button>
    )
  }

  return (
    <section id="pricing" className="py-24 px-6 bg-[var(--color-muted)]">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-blue)] mb-3">Pricing</p>
          <h2 className="text-4xl font-extrabold text-[var(--color-navy)]">Simple, Transparent Pricing</h2>
          <p className="mt-4 text-[var(--color-slate)] max-w-xl mx-auto">
            Start with a one-time consultation or subscribe for ongoing access to all of Neur&apos;s tools and your personalized business tracker.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 flex flex-col border ${
                plan.highlight
                  ? 'bg-[var(--color-navy)] text-white border-[var(--color-navy)] shadow-xl scale-105'
                  : 'bg-white text-[var(--color-foreground)] border-[var(--color-border)] shadow-sm'
              }`}
            >
              {plan.highlight && (
                <div className="text-xs font-bold uppercase tracking-widest text-[var(--color-gold)] mb-3">
                  Most Popular
                </div>
              )}
              <div className="mb-4">
                <h3 className={`text-lg font-bold ${plan.highlight ? 'text-white' : 'text-[var(--color-navy)]'}`}>
                  {plan.name}
                </h3>
                <div className={`mt-1 text-3xl font-extrabold ${plan.highlight ? 'text-[var(--color-gold)]' : 'text-[var(--color-navy)]'}`}>
                  {plan.price ?? plan.label}
                </div>
                {plan.price && (
                  <div className={`text-xs mt-0.5 ${plan.highlight ? 'text-white/60' : 'text-[var(--color-slate)]'}`}>
                    {plan.label}
                  </div>
                )}
              </div>

              <p className={`text-sm mb-5 leading-relaxed ${plan.highlight ? 'text-white/70' : 'text-[var(--color-slate)]'}`}>
                {plan.description}
              </p>

              <ul className="flex-1 space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check size={15} className={`mt-0.5 shrink-0 ${plan.highlight ? 'text-[var(--color-gold)]' : 'text-[var(--color-emerald)]'}`} />
                    <span className={plan.highlight ? 'text-white/80' : 'text-[var(--color-slate)]'}>{f}</span>
                  </li>
                ))}
              </ul>

              {renderButton(plan)}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
