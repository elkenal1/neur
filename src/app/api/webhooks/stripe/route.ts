import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  try {
    // Read raw body — required for Stripe signature verification
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('[webhook] Missing stripe-signature header')
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('[webhook] Signature verification failed:', err)
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
    }

    // Handle events
    switch (event.type) {

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const plan   = session.metadata?.plan

        if (!userId || !plan) {
          console.error('[webhook] checkout.session.completed — missing userId or plan in metadata')
          break
        }

        await supabaseAdmin
          .from('profiles')
          .update({
            plan,
            stripe_customer_id:     session.customer    as string,
            stripe_subscription_id: session.subscription as string,
            subscription_expires_at: null,
          })
          .eq('id', userId)

        console.log(`[webhook] Plan updated for user ${userId}: ${plan}`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (!userId) {
          console.error('[webhook] customer.subscription.updated — missing userId in metadata')
          break
        }

        if (subscription.status === 'active' || subscription.status === 'trialing') {
          // current_period_end is a Unix timestamp (number) on the Stripe Subscription object
          const periodEnd = (subscription as unknown as { current_period_end: number }).current_period_end
          const expiresAt = new Date(periodEnd * 1000).toISOString()
          await supabaseAdmin
            .from('profiles')
            .update({ subscription_expires_at: expiresAt })
            .eq('id', userId)
        } else if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
          console.warn(`[webhook] Subscription past due for user ${userId}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (!userId) {
          console.error('[webhook] customer.subscription.deleted — missing userId in metadata')
          break
        }

        await supabaseAdmin
          .from('profiles')
          .update({
            plan:                    'free',
            stripe_subscription_id:  null,
            subscription_expires_at: null,
          })
          .eq('id', userId)

        console.log(`[webhook] Subscription cancelled for user ${userId} — plan reset to free`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.warn(`[webhook] Payment failed for customer ${invoice.customer} — Stripe will retry`)
        break
      }

      default:
        // Always return 200 for unknown events — never let Stripe keep retrying
        break
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[webhook] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
