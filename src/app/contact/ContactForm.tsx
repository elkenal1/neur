'use client'

import { useState } from 'react'
import { Mail, MessageSquare, Clock } from 'lucide-react'

const CATEGORIES = [
  'General Question',
  'Technical Issue',
  'Billing & Payments',
  'Feedback',
  'Partnership',
  'Other',
]

export default function ContactForm() {
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [category, setCategory] = useState('')
  const [message, setMessage]   = useState('')
  const [status, setStatus]     = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, category, message }),
      })
      const json = await res.json()
      if (!res.ok) { setErrorMsg(json.error || 'Something went wrong.'); setStatus('error'); return }
      setStatus('sent')
    } catch {
      setErrorMsg('Could not send your message. Please try again.')
      setStatus('error')
    }
  }

  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-10">

        {/* Info cards */}
        <div className="space-y-4">
          {[
            { icon: Clock,         title: 'Response time',      body: 'We aim to reply within 24 hours on business days.' },
            { icon: Mail,          title: 'Email us directly',   body: 'Prefer email? Reach us at hello@neur.co' },
            { icon: MessageSquare, title: 'Feedback welcome',    body: "Tell us what you love, what needs work, or what you wish existed." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="bg-white rounded-2xl border border-[var(--color-border)] p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="bg-[var(--color-navy)] text-white rounded-xl p-2 shrink-0">
                  <Icon size={16} />
                </div>
                <div>
                  <div className="font-semibold text-[var(--color-navy)] text-sm">{title}</div>
                  <div className="text-xs text-[var(--color-slate)] mt-0.5 leading-relaxed">{body}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="md:col-span-2">
          {status === 'sent' ? (
            <div className="bg-white rounded-2xl border border-[var(--color-border)] p-10 text-center shadow-sm">
              <div className="text-4xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-[var(--color-navy)] mb-2">Message received</h2>
              <p className="text-[var(--color-slate)] text-sm mb-6">
                Thanks, <strong>{name}</strong>. We&apos;ll get back to you at <strong>{email}</strong> within 24 hours.
              </p>
              <button
                onClick={() => { setStatus('idle'); setName(''); setEmail(''); setCategory(''); setMessage('') }}
                className="text-sm font-semibold text-[var(--color-blue)] hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[var(--color-border)] p-8 shadow-sm">
              <h2 className="text-lg font-bold text-[var(--color-navy)] mb-6">Send a message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm outline-none focus:border-[var(--color-blue)] focus:ring-2 focus:ring-blue-100 transition bg-white text-[var(--color-foreground)]"
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your question or concern in as much detail as helpful..."
                    className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-border)] text-sm outline-none focus:border-[var(--color-blue)] focus:ring-2 focus:ring-blue-100 transition resize-none"
                  />
                </div>

                {status === 'error' && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full bg-[var(--color-navy)] text-white font-bold py-3 rounded-xl hover:bg-[var(--color-navy-light)] transition-colors disabled:opacity-60"
                >
                  {status === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
