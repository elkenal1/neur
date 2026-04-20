import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { plan, userId, email } = body

    // Validate plan
    if (!plan || !['monthly', 'annual'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan. Must be monthly or annual.' }, { status: 400 })
    }

    // Validate required fields
    if (!userId || !email) {
      return NextResponse.json({ error: 'userId and email are required.' }, { status: 400 })
    }

    // Check if user already has a Stripe customer ID
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    let customerId: string = profile?.stripe_customer_id ?? ''

    if (!customerId) {
      // Create a new Stripe customer and save immediately
      const customer = await stripe.customers.create({
        email,
        metadata: { userId },
      })
      customerId = customer.id

      await supabaseAdmin
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId)
    }

    // Resolve price by lookup key
    const lookupKey = plan === 'monthly' ? 'neur_monthly' : 'neur_annual'
    const prices = await stripe.prices.list({ lookup_keys: [lookupKey] })

    if (!prices.data.length) {
      console.error(`[checkout] Price not found for lookup key: ${lookupKey}`)
      return NextResponse.json(
        { error: `Price not configured. Please contact support.` },
        { status: 500 }
      )
    }

    const priceId = prices.data[0].id

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?payment=cancelled`,
      metadata: { userId, plan },
      subscription_data: {
        metadata: { userId, plan },
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[checkout] Error creating checkout session:', err)
    return NextResponse.json({ error: 'Failed to create checkout session.' }, { status: 500 })
  }
}
