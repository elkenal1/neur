'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ClipboardList, MapPin, FileText, LogOut } from 'lucide-react'

const navItems = [
  { href: '/dashboard',         label: 'Dashboard',     icon: LayoutDashboard, exact: true },
  { href: '/questionnaire',     label: 'New Analysis',  icon: ClipboardList,   exact: false },
  { href: '/dashboard/map',     label: 'Location Map',  icon: MapPin,          exact: false },
  { href: '/dashboard/reports', label: 'My Reports',    icon: FileText,        exact: false },
]

export default function DashboardSidebar() {
  const pathname = usePathname()

  function isActive(item: typeof navItems[number]) {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <aside className="w-60 bg-[var(--color-navy)] text-white flex flex-col fixed h-full z-30">
      <div className="px-6 py-5 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/neurlogo.png" alt="Neur" width={26} height={26} className="object-contain invert" />
          <span className="text-base font-bold tracking-tight">NEUR</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 text-sm">
        {navItems.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
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

      <div className="px-4 py-4 border-t border-white/10">
        <form action="/auth/sign-out" method="post">
          <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors text-sm">
            <LogOut size={16} /> Sign Out
          </button>
        </form>
      </div>
    </aside>
  )
}
