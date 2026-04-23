import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  try {
    const { name, email, category, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Name, email, and message are required.' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('contact_submissions')
      .insert({ name, email, category: category || 'General', message })

    if (error) {
      console.error('[contact] Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to submit. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
