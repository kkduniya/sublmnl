import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { connectToDatabase } from "@/server/db"
import { findAllSubscriptions, findUserSubscription } from "@/server/models/Subscription"
import { findUserById } from "@/server/models/user"

export async function GET(req) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "not_logged_in" }, { status: 401 })
    }

    await connectToDatabase()

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const isAdmin = searchParams.get("admin") === "true"

    // Check if user is admin for admin routes
    const currentUser = await findUserById(session.user.id)
    if (isAdmin && currentUser?.role !== "admin") {
      return NextResponse.json({ error: "unauthorized" }, { status: 403 })
    }

    let subscriptions
    if (isAdmin && !userId) {
      // Admin viewing all subscriptions
      subscriptions = await findAllSubscriptions()
    } else if (userId) {
      // Admin viewing specific user subscription or user viewing their own
      if (!isAdmin && userId !== session.user.id) {
        return NextResponse.json({ error: "unauthorized" }, { status: 403 })
      }
      const subscription = await findUserSubscription(userId)
      subscriptions = subscription ? subscription : []
    } else {
      // User viewing their own subscription
      const subscription = await findUserSubscription(session.user.id)
      subscriptions = subscription ? subscription : []
    }

    // Populate user data for admin view
    if (isAdmin) {
      const userIds = [...new Set(subscriptions.map((s) => s.userId.toString()))]
      const users = await Promise.all(userIds.map((id) => findUserById(id)))
      const userMap = users.reduce((acc, user) => {
        if (user) acc[user._id.toString()] = user
        return acc
      }, {})

      subscriptions = subscriptions.map((subscription) => ({
        ...subscription,
        user: userMap[subscription.userId.toString()],
      }))
    }

    return NextResponse.json({ subscriptions })
  } catch (error) {
    console.error("Error fetching subscriptions:", error)
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
  }
}
