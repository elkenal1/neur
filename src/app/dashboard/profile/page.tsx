export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { redirect } from 'next/navigation'
import ProfileForms from './ProfileForms'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan, stripe_customer_id')
    .eq('id', user.id)
    .single()

  const name       = user.user_metadata?.full_name ?? ''
  const email      = user.email ?? ''
  const plan       = profile?.plan ?? 'free'
  const hasStripe  = !!profile?.stripe_customer_id

  // Detect email/password vs OAuth accounts
  const provider   = user.app_metadata?.provider ?? 'email'
  const isEmailUser = provider === 'email'

  return (
    <ProfileForms
      name={name}
      email={email}
      plan={plan}
      isEmailUser={isEmailUser}
      hasStripe={hasStripe}
    />
  )
}
