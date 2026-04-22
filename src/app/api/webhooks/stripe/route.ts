import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase-admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Retries a profile update 3×, waiting for the row to exist if needed
async function updateProfileWithRetry(
  userId: string,
  updates: Record<string, unknown>,
  maxAttempts = 3,
): Promise<void> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (!existing) {
      if (attempt < maxAttempts) {
        console.warn(`[webhook] Profile not found for user ${userId} (attempt ${attempt}/${maxAttempts}), retrying...`)
        await new Promise(r => setTimeout(r, 1000 * attempt))
        continue
      }
      console.error(`[webhook] Profile never found for user ${userId} after ${maxAttempts} attempts`)
      return
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (!error) return

    if (attempt < maxAttempts) {
      console.warn(`[webhook] Update failed for user ${userId} (attempt ${attempt}/${maxAttempts}):`, error)
      await new Promise(r => setTimeout(r, 1000 * attempt))
    } else {
      console.error(`[webhook] Update permanently failed for user ${userId}:`, error)
    }
  }
}

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

    console.log(`[webhook] Received event: ${event.type} (${event.id})`)

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

        await updateProfileWithRetry(userId, {
          plan,
          stripe_customer_id:      session.customer    as string,
          stripe_subscription_id:  session.subscription as string,
          subscription_expires_at: null,
        })

        console.log(`[webhook] checkout.session.completed — user ${userId} upgraded to ${plan}`)
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
          const periodEnd = (subscription as unknown as { current_period_end: number }).current_period_end
          const expiresAt = new Date(periodEnd * 1000).toISOString()
          await updateProfileWithRetry(userId, { subscription_expires_at: expiresAt })
          console.log(`[webhook] customer.subscription.updated — user ${userId} expires at ${expiresAt}`)
        } else if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
          console.warn(`[webhook] customer.subscription.updated — subscription past_due/unpaid for user ${userId}`)
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

        // stripe_customer_id is preserved intentionally — the customer may resubscribe
        await updateProfileWithRetry(userId, {
          plan:                    'free',
          stripe_subscription_id:  null,
          subscription_expires_at: null,
        })

        console.log(`[webhook] customer.subscription.deleted — user ${userId} reset to free`)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.warn(`[webhook] invoice.payment_failed — customer ${invoice.customer}, Stripe will retry`)
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
