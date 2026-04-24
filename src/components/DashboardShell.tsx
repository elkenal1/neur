'use client'

import { useState } from 'react'
import DashboardSidebar from './DashboardSidebar'
import DashboardHeader from './DashboardHeader'

interface Props {
  children: React.ReactNode
  userName: string
  userEmail: string
  plan: string
}

export default function DashboardShell({ children, userName, userEmail, plan }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex overflow-x-hidden" style={{ background: '#F7F4EF' }}>
      <DashboardSidebar
        userName={userName}
        userEmail={userEmail}
        plan={plan}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 min-w-0 flex flex-col md:ml-60">
        <DashboardHeader
          userName={userName}
          userEmail={userEmail}
          plan={plan}
          onMenuOpen={() => setSidebarOpen(true)}
        />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
