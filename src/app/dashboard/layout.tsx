import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/DashboardSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex">
      <DashboardSidebar />
      <div className="ml-60 flex-1 min-w-0">
        {children}
      </div>
    </div>
  )
}
