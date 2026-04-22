import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'
import DashboardSidebar from '@/components/DashboardSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single()

  const userName  = user.user_metadata?.full_name ?? ''
  const userEmail = user.email ?? ''
  const plan      = profile?.plan ?? 'free'

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex">
      <DashboardSidebar userName={userName} userEmail={userEmail} plan={plan} />
      <div className="ml-60 flex-1 min-w-0">
        {children}
      </div>
    </div>
  )
}
