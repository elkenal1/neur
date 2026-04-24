'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ClipboardList, MapPin, FileText, LogOut, Settings, X } from 'lucide-react'

const navItems = [
  { href: '/dashboard',         label: 'Dashboard',     icon: LayoutDashboard, exact: true },
  { href: '/questionnaire',     label: 'New Analysis',  icon: ClipboardList,   exact: false },
  { href: '/dashboard/map',     label: 'Location Map',  icon: MapPin,          exact: false },
  { href: '/dashboard/reports', label: 'My Reports',    icon: FileText,        exact: false },
]

interface Props {
  userName: string
  userEmail: string
  plan: string
  isOpen?: boolean
  onClose?: () => void
}

const PLAN_LABELS: Record<string, string> = {
  free:       'Free',
  monthly:    'Monthly',
  annual:     'Annual',
  consultant: 'Consultant',
  admin:      'Admin',
}

export default function DashboardSidebar({ userName, userEmail, plan, isOpen = false, onClose }: Props) {
  const pathname = usePathname()
  const initial = userName ? userName[0].toUpperCase() : userEmail[0].toUpperCase()

  function isActive(item: typeof navItems[number]) {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  function handleNavClick() {
    onClose?.()
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed h-full z-40 w-60 bg-[var(--color-navy)] text-white flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" onClick={handleNavClick}>
            <Image src="/neurlogo.png" alt="Neur" width={26} height={26} className="object-contain invert" />
            <span className="text-base font-bold tracking-tight">NEUR</span>
          </Link>
          {/* Close button — mobile only */}
          <button
            className="md:hidden text-white/50 hover:text-white transition-colors"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 text-sm">
          {navItems.map((item) => {
            const active = isActive(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleNavClick}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  active
                    ? 'bg-white/15 text-white font-semibold'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-4 pb-4 space-y-1 border-t border-white/10 pt-4">
          <Link
            href="/dashboard/profile"
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors w-full ${
              pathname === '/dashboard/profile'
                ? 'bg-white/15 text-white font-semibold'
                : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-[var(--color-gold)] text-[var(--color-navy)] text-xs font-bold flex items-center justify-center shrink-0">
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate text-sm font-medium leading-tight">{userName || 'Account'}</div>
              <div className="text-[10px] text-white/50 font-normal leading-tight mt-0.5">
                {PLAN_LABELS[plan] ?? 'Free'} Plan
              </div>
            </div>
            <Settings size={13} className="shrink-0 opacity-50" />
          </Link>

          <form action="/auth/sign-out" method="post">
            <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors text-sm">
              <LogOut size={16} /> Sign Out
            </button>
          </form>
        </div>
      </aside>
    </>
  )
}
