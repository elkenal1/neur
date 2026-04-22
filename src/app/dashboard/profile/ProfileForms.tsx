'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  free:       { label: 'Free',       color: 'bg-gray-100 text-gray-600' },
  monthly:    { label: 'Monthly',    color: 'bg-blue-50 text-blue-700' },
  annual:     { label: 'Annual',     color: 'bg-emerald-50 text-emerald-700' },
  consultant: { label: 'Consultant', color: 'bg-purple-50 text-purple-700' },
  admin:      { label: 'Admin',      color: 'bg-red-50 text-red-700' },
}

interface Props {
  name: string
  email: string
  plan: string
  isEmailUser: boolean
  hasStripe: boolean
}

export default function ProfileForms({ name: initialName, email, plan, isEmailUser, hasStripe }: Props) {
  const [name, setName]               = useState(initialName)
  const [nameStatus, setNameStatus]   = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const [currentPw, setCurrentPw]     = useState('')
  const [newPw, setNewPw]             = useState('')
  const [confirmPw, setConfirmPw]     = useState('')
  const [pwStatus, setPwStatus]       = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [pwError, setPwError]         = useState('')

  const [billingLoading, setBillingLoading] = useState(false)

  const initial = name ? name[0].toUpperCase() : email[0].toUpperCase()
  const planMeta = PLAN_LABELS[plan] ?? PLAN_LABELS.free

  async function saveName(e: React.FormEvent) {
    e.preventDefault()
    setNameStatus('saving')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ data: { full_name: name } })
    setNameStatus(error ? 'error' : 'saved')
    setTimeout(() => setNameStatus('idle'), 3000)
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    setPwError('')
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return }
    if (newPw.length < 8)    { setPwError('Password must be at least 8 characters.'); return }
    setPwStatus('saving')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPw })
    if (error) { setPwError(error.message); setPwStatus('error') }
    else {
      setPwStatus('saved')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      setTimeout(() => setPwStatus('idle'), 3000)
    }
  }

  async function openBillingPortal() {
    setBillingLoading(true)
    try {
      const res = await fetch('/api/billing-portal', { method: 'POST' })
      const json = await res.json()
      if (json.url) window.location.href = json.url
    } catch {
      setBillingLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">

      {/* Profile header */}
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-[var(--color-navy)] text-white text-2xl font-bold flex items-center justify-center shrink-0">
          {initial}
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-[var(--color-navy)]">{name || email}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-[var(--color-slate)]">{email}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${planMeta.color}`}>
              {planMeta.label}
            </span>
          </div>
        </div>
      </div>

      {/* Account info */}
      <section className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
        <h2 className="text-base font-bold text-[var(--color-navy)] mb-5">Account Information</h2>
        <form onSubmit={saveName} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm outline-none focus:border-[var(--color-blue)] focus:ring-2 focus:ring-blue-100 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">Email</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm bg-[var(--color-muted)] text-[var(--color-slate)] cursor-not-allowed"
            />
            <p className="text-xs text-[var(--color-slate)] mt-1">Email cannot be changed here. Contact support if needed.</p>
          </div>
          <button
            type="submit"
            disabled={nameStatus === 'saving'}
            className="bg-[var(--color-navy)] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[var(--color-navy-light)] transition-colors disabled:opacity-60"
          >
            {nameStatus === 'saving' ? 'Saving...' : nameStatus === 'saved' ? '✓ Saved' : 'Save Changes'}
          </button>
        </form>
      </section>

      {/* Password — only for email/password accounts */}
      {isEmailUser && (
        <section className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
          <h2 className="text-base font-bold text-[var(--color-navy)] mb-1">Change Password</h2>
          <p className="text-sm text-[var(--color-slate)] mb-5">Choose a strong password of at least 8 characters.</p>
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">New Password</label>
              <input
                type="password"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                minLength={8}
                placeholder="At least 8 characters"
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm outline-none focus:border-[var(--color-blue)] focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm outline-none focus:border-[var(--color-blue)] focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
            {pwError && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{pwError}</div>
            )}
            <button
              type="submit"
              disabled={pwStatus === 'saving' || !newPw || !confirmPw}
              className="bg-[var(--color-navy)] text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-[var(--color-navy-light)] transition-colors disabled:opacity-60"
            >
              {pwStatus === 'saving' ? 'Updating...' : pwStatus === 'saved' ? '✓ Password Updated' : 'Update Password'}
            </button>
          </form>
        </section>
      )}

      {/* Subscription */}
      <section className="bg-white rounded-2xl border border-[var(--color-border)] p-6">
        <h2 className="text-base font-bold text-[var(--color-navy)] mb-1">Subscription</h2>
        <p className="text-sm text-[var(--color-slate)] mb-5">Manage your billing, payment method, and plan.</p>

        <div className="flex items-center justify-between bg-[var(--color-muted)] rounded-xl px-5 py-4 mb-5">
          <div>
            <div className="text-sm font-semibold text-[var(--color-navy)]">Current Plan</div>
            <div className={`inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${planMeta.color}`}>
              {planMeta.label}
            </div>
          </div>
          {plan === 'free' && (
            <a
              href="/sign-up?plan=monthly"
              className="text-sm font-bold bg-[var(--color-navy)] text-white px-4 py-2 rounded-xl hover:bg-[var(--color-navy-light)] transition-colors"
            >
              Upgrade
            </a>
          )}
        </div>

        {hasStripe && plan !== 'free' && (
          <button
            onClick={openBillingPortal}
            disabled={billingLoading}
            className="text-sm font-semibold text-[var(--color-navy)] border border-[var(--color-border)] px-5 py-2.5 rounded-xl hover:bg-[var(--color-muted)] transition-colors disabled:opacity-60"
          >
            {billingLoading ? 'Opening...' : 'Manage Billing & Payment'}
          </button>
        )}
      </section>

    </div>
  )
}
