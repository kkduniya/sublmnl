// app/api/stripe/create-portal-session/route.js
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import stripe from "@/lib/stripe"
import { connectToDatabase } from "@/server/db"
import { findSubscriptionByStripeId } from "@/server/models/Subscription"

export async function POST(req) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "not_logged_in" }, { status: 401 })
    }

    const { subscriptionId } = await req.json()

    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 })
    }

    // Connect to database
    await connectToDatabase()

    // Verify that this subscription belongs to the current user in our database
    const dbSubscription = await findSubscriptionByStripeId(subscriptionId)

    if (!dbSubscription || dbSubscription.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    // Retrieve the subscription from Stripe to get the current customer ID
    // This ensures we're using the correct customer ID from Stripe's source of truth
    let stripeSubscription
    let customerId

    try {
      stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId)
      customerId = stripeSubscription.customer

      // Handle both string customer IDs and expanded customer objects
      if (typeof customerId === 'string') {
        // Customer ID is already a string
      } else if (customerId && customerId.id) {
        // Customer is an expanded object
        customerId = customerId.id
      } else {
        throw new Error("Invalid customer ID format from Stripe")
      }
    } catch (error) {
      console.error("Error retrieving subscription from Stripe:", error)
      // Fallback to database customer ID if Stripe retrieval fails
      customerId = dbSubscription.stripeCustomerId
      
      if (!customerId) {
        return NextResponse.json({ 
          error: "Customer ID not found. Please contact support." 
        }, { status: 404 })
      }
    }

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID not found" }, { status: 404 })
    }

    // Create a billing portal session
    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}dashboard/subscriptions`,
      })

      return NextResponse.json({ url: portalSession.url })
    } catch (error) {
      // If customer doesn't exist in Stripe, update the database with the correct customer ID
      if (error.code === 'resource_missing' && stripeSubscription) {
        // Update database with correct customer ID from Stripe
        try {
          const { updateSubscriptionByStripeId } = await import("@/server/models/Subscription")
          await updateSubscriptionByStripeId(subscriptionId, {
            stripeCustomerId: stripeSubscription.customer
          })
          
          // Retry creating portal session
          const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeSubscription.customer,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}dashboard/subscriptions`,
          })
          
          return NextResponse.json({ url: portalSession.url })
        } catch (updateError) {
          console.error("Error updating subscription customer ID:", updateError)
          return NextResponse.json({ 
            error: "Unable to create payment portal. The customer account may need to be recreated. Please contact support." 
          }, { status: 500 })
        }
      }
      
      // Handle Stripe Billing Portal configuration error
      if (error.message && error.message.includes("No configuration provided")) {
        console.error("Stripe Billing Portal not configured:", error)
        return NextResponse.json({ 
          error: "Billing portal not configured. Please configure the Customer Portal in your Stripe Dashboard.",
          details: "Go to Stripe Dashboard → Settings → Billing → Customer portal and save your settings.",
          stripeError: "BILLING_PORTAL_NOT_CONFIGURED"
        }, { status: 400 })
      }
      
      throw error
    }
  } catch (error) {
    console.error("Error creating portal session:", error)
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 })
  }
}

