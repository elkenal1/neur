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

  const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition bg-white border border-[var(--color-border)] text-[var(--color-navy)] focus:border-[var(--color-navy)] focus:ring-2 focus:ring-[var(--color-navy)]/10"

  return (
    <div className="max-w-2xl mx-auto">

      {/* Profile banner */}
      <div
        className="grain text-white px-8 py-8 mb-0"
        style={{ background: 'linear-gradient(135deg, #06061a 0%, #12126B 60%, #1a1a8a 100%)' }}
      >
        <div className="flex items-center gap-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold shrink-0"
            style={{ background: 'var(--color-gold)', color: 'var(--color-navy)' }}
          >
            {initial}
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white">{name || email}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-sm text-white/50">{email}</span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${planMeta.color}`}>
                {planMeta.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">

        {/* Account info */}
        <section
          className="bg-white rounded-2xl border border-[var(--color-border)] p-6"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
        >
          <h2 className="text-base font-bold text-[var(--color-navy)] mb-5">Account Information</h2>
          <form onSubmit={saveName} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2.5 rounded-xl text-sm cursor-not-allowed"
                style={{ background: '#F7F4EF', border: '1px solid var(--color-border)', color: 'var(--color-slate)' }}
              />
              <p className="text-xs text-[var(--color-slate)] mt-1">Email cannot be changed here. Contact support if needed.</p>
            </div>
            <button
              type="submit"
              disabled={nameStatus === 'saving'}
              className="text-sm font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60"
              style={{ background: 'var(--color-navy)', color: 'white' }}
            >
              {nameStatus === 'saving' ? 'Saving...' : nameStatus === 'saved' ? '✓ Saved' : 'Save Changes'}
            </button>
          </form>
        </section>

        {/* Password */}
        {isEmailUser && (
          <section
            className="bg-white rounded-2xl border border-[var(--color-border)] p-6"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
          >
            <h2 className="text-base font-bold text-[var(--color-navy)] mb-1">Change Password</h2>
            <p className="text-sm text-[var(--color-slate)] mb-5">Choose a strong password of at least 8 characters.</p>
            <form onSubmit={changePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">New Password</label>
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  minLength={8}
                  placeholder="At least 8 characters"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Repeat new password"
                  className={inputCls}
                />
              </div>
              {pwError && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{pwError}</div>
              )}
              <button
                type="submit"
                disabled={pwStatus === 'saving' || !newPw || !confirmPw}
                className="text-sm font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60"
                style={{ background: 'var(--color-navy)', color: 'white' }}
              >
                {pwStatus === 'saving' ? 'Updating...' : pwStatus === 'saved' ? '✓ Password Updated' : 'Update Password'}
              </button>
            </form>
          </section>
        )}

        {/* Subscription */}
        <section
          className="bg-white rounded-2xl border border-[var(--color-border)] p-6"
          style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
        >
          <h2 className="text-base font-bold text-[var(--color-navy)] mb-1">Subscription</h2>
          <p className="text-sm text-[var(--color-slate)] mb-5">Manage your billing, payment method, and plan.</p>

          <div
            className="flex items-center justify-between rounded-xl px-5 py-4 mb-5"
            style={{ background: '#F7F4EF' }}
          >
            <div>
              <div className="text-sm font-semibold text-[var(--color-navy)]">Current Plan</div>
              <div className={`inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${planMeta.color}`}>
                {planMeta.label}
              </div>
            </div>
            {plan === 'free' && (
              <a
                href="/sign-up?plan=monthly"
                className="text-sm font-bold px-4 py-2 rounded-xl transition-colors"
                style={{ background: 'var(--color-gold)', color: 'var(--color-navy)' }}
              >
                Upgrade
              </a>
            )}
          </div>

          {hasStripe && plan !== 'free' && (
            <button
              onClick={openBillingPortal}
              disabled={billingLoading}
              className="text-sm font-semibold border border-[var(--color-border)] px-5 py-2.5 rounded-xl hover:bg-[var(--color-muted)] transition-colors disabled:opacity-60 text-[var(--color-navy)]"
            >
              {billingLoading ? 'Opening...' : 'Manage Billing & Payment'}
            </button>
          )}
        </section>

      </div>
    </div>
  )
}
