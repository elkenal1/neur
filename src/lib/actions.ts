'use server'

import { createClient } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { revalidatePath } from "next/cache"

export async function recalculateScore(analysisId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Verify the user owns this analysis before clearing
  const { data } = await supabase
    .from('analyses')
    .select('id')
    .eq('id', analysisId)
    .eq('user_id', user.id)
    .single()

  if (!data) throw new Error('Not found')

  await supabaseAdmin
    .from('analyses')
    .update({ feasibility_score: null })
    .eq('id', analysisId)

  revalidatePath(`/dashboard/reports/${analysisId}`)
}
