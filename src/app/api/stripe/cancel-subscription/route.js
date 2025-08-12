// app/api/stripe/cancel-subscription/route.js
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import stripe from "@/lib/stripe"
import { connectToDatabase } from "@/server/db"
import { findSubscriptionByStripeId, updateSubscriptionByStripeId } from "@/server/models/Subscription"

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

    // Verify that this subscription belongs to the current user
    const subscription = await findSubscriptionByStripeId(subscriptionId)

    if (!subscription || subscription.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    // Cancel the subscription at the end of the current period
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    // Update the subscription in the database
    await updateSubscriptionByStripeId(subscriptionId, {
      cancelAtPeriodEnd: true
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error canceling subscription:", error)
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 })
  }
}