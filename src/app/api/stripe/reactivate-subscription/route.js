// app/api/stripe/reactivate-subscription/route.js
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

    // Reactivate the subscription
    await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    })

    // Update the subscription in the database
    await updateSubscriptionByStripeId(subscriptionId, {
      cancelAtPeriodEnd: false
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error reactivating subscription:", error)
    return NextResponse.json({ error: "Failed to reactivate subscription" }, { status: 500 })
  }
}