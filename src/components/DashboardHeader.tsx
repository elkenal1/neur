'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Settings, LogOut } from 'lucide-react'

const PAGE_TITLES: { path: string; label: string; exact?: boolean }[] = [
  { path: '/dashboard',         label: 'Dashboard',          exact: true },
  { path: '/dashboard/reports', label: 'My Reports',         exact: false },
  { path: '/dashboard/map',     label: 'Location Map',       exact: false },
  { path: '/dashboard/profile', label: 'Account & Settings', exact: false },
  { path: '/questionnaire',     label: 'New Analysis',       exact: false },
]

const PLAN_LABELS: Record<string, { label: string; cls: string }> = {
  free:       { label: 'Free',        cls: 'bg-gray-100 text-gray-500' },
  monthly:    { label: 'Pro Monthly', cls: 'bg-blue-50 text-blue-700' },
  annual:     { label: 'Pro Annual',  cls: 'bg-emerald-50 text-emerald-700' },
  consultant: { label: 'Consultant',  cls: 'bg-purple-50 text-purple-700' },
  admin:      { label: 'Admin',       cls: 'bg-red-50 text-red-600' },
}

interface Props {
  userName: string
  userEmail: string
  plan: string
}

export default function DashboardHeader({ userName, userEmail, plan }: Props) {
  const pathname  = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const pageTitle = PAGE_TITLES.find(p =>
    p.exact ? pathname === p.path : pathname.startsWith(p.path)
  )?.label ?? 'Dashboard'

  const initial  = (userName || userEmail || 'U')[0].toUpperCase()
  const planMeta = PLAN_LABELS[plan] ?? PLAN_LABELS.free

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="h-14 bg-white border-b border-[var(--color-border)] flex items-center justify-between px-8 shrink-0 sticky top-0 z-20">
      <span className="text-sm font-bold text-[var(--color-navy)]">{pageTitle}</span>

      <div ref={ref} className="relative">
        {/* Avatar button */}
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2.5 hover:bg-[var(--color-muted)] rounded-xl px-2.5 py-1.5 transition-colors"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--color-navy)] text-xs font-extrabold shrink-0"
            style={{ background: 'var(--color-gold)' }}
          >
            {initial}
          </div>
          <span className="hidden sm:block text-sm font-medium text-[var(--color-navy)] max-w-[120px] truncate">
            {userName || 'Account'}
          </span>
          <ChevronDown
            size={13}
            className={`text-[var(--color-slate)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown */}
        {open && (
          <div
            className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden z-50"
            style={{ boxShadow: '0 12px 40px rgba(0,0,0,0.12)' }}
          >
            {/* Profile card */}
            <div className="px-4 py-4 bg-[var(--color-muted)] border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-[var(--color-navy)] text-lg font-extrabold shrink-0"
                  style={{ background: 'var(--color-gold)' }}
                >
                  {initial}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-[var(--color-navy)] text-sm truncate leading-tight">
                    {userName || 'Account'}
                  </div>
                  <div className="text-[11px] text-[var(--color-slate)] truncate mt-0.5">{userEmail}</div>
                  <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${planMeta.cls}`}>
                    {planMeta.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-2">
              <Link
                href="/dashboard/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--color-muted)] transition-colors text-sm text-[var(--color-navy)] font-medium"
              >
                <Settings size={14} className="text-[var(--color-slate)] shrink-0" />
                Profile &amp; Settings
              </Link>
              <form action="/auth/sign-out" method="post">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-sm text-red-500 font-medium">
                  <LogOut size={14} className="shrink-0" />
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
