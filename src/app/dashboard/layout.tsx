import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/DashboardShell'

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
    <DashboardShell userName={userName} userEmail={userEmail} plan={plan}>
      {children}
    </DashboardShell>
  )
}
