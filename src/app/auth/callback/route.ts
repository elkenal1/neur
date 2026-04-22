import { createClient } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Polls until the profiles row exists (created by DB trigger after OAuth sign-up)
async function waitForProfile(userId: string, maxAttempts = 10): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    const { data } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()
    if (data) return true
    await new Promise(r => setTimeout(r, 500))
  }
  return false
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawPlan = searchParams.get('plan')
  const plan: 'monthly' | 'annual' | null =
    rawPlan === 'monthly' || rawPlan === 'annual' ? rawPlan : null
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // OAuth sign-up with a paid plan — create Stripe checkout and redirect
      if (plan) {
        const profileReady = await waitForProfile(data.user.id)
        if (profileReady) {
          try {
            const { data: profile } = await supabaseAdmin
              .from('profiles')
              .select('stripe_customer_id')
              .eq('id', data.user.id)
              .single()

            let customerId = profile?.stripe_customer_id ?? ''
            if (!customerId) {
              const customer = await stripe.customers.create({
                email: data.user.email,
                metadata: { userId: data.user.id },
              })
              customerId = customer.id
              await supabaseAdmin
                .from('profiles')
                .update({ stripe_customer_id: customerId })
                .eq('id', data.user.id)
            }

            const lookupKey = plan === 'monthly' ? 'neur_monthly' : 'neur_annual'
            const prices = await stripe.prices.list({ lookup_keys: [lookupKey] })

            if (prices.data.length) {
              const session = await stripe.checkout.sessions.create({
                mode: 'subscription',
                customer: customerId,
                line_items: [{ price: prices.data[0].id, quantity: 1 }],
                success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment=success`,
                cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?payment=cancelled`,
                metadata: { userId: data.user.id, plan },
                subscription_data: {
                  metadata: { userId: data.user.id, plan },
                },
              })
              if (session.url) {
                return NextResponse.redirect(session.url)
              }
            }
          } catch (err) {
            console.error('[callback] Stripe checkout error:', err)
          }
        }
        // Fallback if checkout fails — send to dashboard
        return NextResponse.redirect(`${origin}/dashboard`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/sign-in?error=auth_callback_failed`)
}
