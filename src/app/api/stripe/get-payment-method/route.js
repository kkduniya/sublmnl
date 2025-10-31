// app/api/stripe/get-payment-method/route.js
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import stripe from "@/lib/stripe"
import { connectToDatabase } from "@/server/db"
import { findSubscriptionByStripeId } from "@/server/models/Subscription"

export async function GET(req) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "not_logged_in" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const subscriptionId = searchParams.get("subscriptionId")

    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 })
    }

    // Connect to database
    await connectToDatabase()

    // Verify that this subscription belongs to the current user
    const dbSubscription = await findSubscriptionByStripeId(subscriptionId)

    if (!dbSubscription || dbSubscription.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    // Retrieve the subscription from Stripe with expanded payment method
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['default_payment_method', 'default_source', 'latest_invoice.payment_intent.payment_method']
    })

    let paymentMethod = null

    console.log('Subscription default_payment_method:', stripeSubscription.default_payment_method)
    console.log('Subscription default_source:', stripeSubscription.default_source)

    // Method 1: Get payment method from subscription.default_payment_method
    if (stripeSubscription.default_payment_method) {
      try {
        const pmId = typeof stripeSubscription.default_payment_method === 'string' 
          ? stripeSubscription.default_payment_method 
          : stripeSubscription.default_payment_method.id

        const pm = await stripe.paymentMethods.retrieve(pmId)
        
        if (pm && pm.card) {
          paymentMethod = {
            last4: pm.card.last4,
            brand: pm.card.brand, // visa, mastercard, amex, etc.
            expMonth: pm.card.exp_month,
            expYear: pm.card.exp_year,
          }
          console.log('Found payment method from default_payment_method:', paymentMethod)
        }
      } catch (error) {
        console.error('Error retrieving payment method from default_payment_method:', error)
      }
    }
    
    // Method 2: Try to get from latest invoice if default_payment_method is not available
    if (!paymentMethod && stripeSubscription.latest_invoice) {
      try {
        const invoiceId = typeof stripeSubscription.latest_invoice === 'string'
          ? stripeSubscription.latest_invoice
          : stripeSubscription.latest_invoice.id

        const invoice = await stripe.invoices.retrieve(invoiceId, {
          expand: ['payment_intent.payment_method']
        })

        if (invoice.payment_intent) {
          const paymentIntentId = typeof invoice.payment_intent === 'string'
            ? invoice.payment_intent
            : invoice.payment_intent.id

          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
            expand: ['payment_method']
          })

          if (paymentIntent.payment_method) {
            const pmId = typeof paymentIntent.payment_method === 'string'
              ? paymentIntent.payment_method
              : paymentIntent.payment_method.id

            const pm = await stripe.paymentMethods.retrieve(pmId)
            
            if (pm && pm.card) {
              paymentMethod = {
                last4: pm.card.last4,
                brand: pm.card.brand,
                expMonth: pm.card.exp_month,
                expYear: pm.card.exp_year,
              }
              console.log('Found payment method from latest invoice:', paymentMethod)
            }
          }
        }
      } catch (error) {
        console.error('Error retrieving payment method from latest invoice:', error)
      }
    }

    // Method 3: Try default_source (for older subscriptions)
    if (!paymentMethod && stripeSubscription.default_source) {
      try {
        const sourceId = typeof stripeSubscription.default_source === 'string'
          ? stripeSubscription.default_source
          : stripeSubscription.default_source.id

        const source = await stripe.sources.retrieve(sourceId)
        
        if (source && source.card) {
          paymentMethod = {
            last4: source.card.last4,
            brand: source.card.brand,
            expMonth: source.card.exp_month,
            expYear: source.card.exp_year,
          }
          console.log('Found payment method from default_source:', paymentMethod)
        }
      } catch (error) {
        console.error('Error retrieving payment method from default_source:', error)
      }
    }

    // Method 4: Try to get from customer's default payment method
    if (!paymentMethod && stripeSubscription.customer) {
      try {
        const customerId = typeof stripeSubscription.customer === 'string'
          ? stripeSubscription.customer
          : stripeSubscription.customer.id

        const customer = await stripe.customers.retrieve(customerId, {
          expand: ['invoice_settings.default_payment_method']
        })

        if (customer.invoice_settings?.default_payment_method) {
          const pmId = typeof customer.invoice_settings.default_payment_method === 'string'
            ? customer.invoice_settings.default_payment_method
            : customer.invoice_settings.default_payment_method.id

          const pm = await stripe.paymentMethods.retrieve(pmId)
          
          if (pm && pm.card) {
            paymentMethod = {
              last4: pm.card.last4,
              brand: pm.card.brand,
              expMonth: pm.card.exp_month,
              expYear: pm.card.exp_year,
            }
            console.log('Found payment method from customer default:', paymentMethod)
          }
        }
      } catch (error) {
        console.error('Error retrieving payment method from customer:', error)
      }
    }

    console.log('Final paymentMethod result:', paymentMethod)
    return NextResponse.json({ paymentMethod })
  } catch (error) {
    console.error("Error retrieving payment method:", error)
    return NextResponse.json({ error: "Failed to retrieve payment method" }, { status: 500 })
  }
}

