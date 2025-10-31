import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { connectToDatabase } from "@/server/db"
import { findUserById } from "@/server/models/user"
import { ObjectId as ObjectIdClass } from "mongodb"

export async function GET(req) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "not_logged_in" }, { status: 401 })
    }

    const db = await connectToDatabase()

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const isAdmin = searchParams.get("admin") === "true"
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "10", 10)
    const searchTerm = searchParams.get("search") || ""
    const statusFilter = searchParams.get("status") || "all"

    // Check if user is admin for admin routes
    const currentUser = await findUserById(session.user.id)
    if (isAdmin && currentUser?.role !== "admin") {
      return NextResponse.json({ error: "unauthorized" }, { status: 403 })
    }

    // Build query filter
    let queryFilter = {}

    // User filter
    if (isAdmin && userId) {
      // Admin viewing specific user subscription
      queryFilter.userId = new ObjectIdClass(userId)
    } else if (!isAdmin) {
      // User viewing their own subscription
      if (userId && userId !== session.user.id) {
        return NextResponse.json({ error: "unauthorized" }, { status: 403 })
      }
      queryFilter.userId = new ObjectIdClass(session.user.id)
    }

    // Status filter
    if (statusFilter !== "all") {
      queryFilter.status = statusFilter
    }

    // Search filter - search by stripeSubscriptionId (for user email/name, would require aggregation)
    if (searchTerm) {
      queryFilter.stripeSubscriptionId = { $regex: searchTerm, $options: "i" }
    }

    // Get total count for pagination
    const totalCount = await db.collection("subscriptions").countDocuments(queryFilter)

    // Calculate skip
    const skip = (page - 1) * limit

    // Fetch paginated subscriptions
    let subscriptions = await db
      .collection("subscriptions")
      .find(queryFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

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

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      subscriptions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching subscriptions:", error)
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 })
  }
}
