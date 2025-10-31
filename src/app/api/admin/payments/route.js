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
    const typeFilter = searchParams.get("type") || "all"

    // Get current user to check admin status
    const currentUser = await findUserById(session.user.id)
    console.log(`Current user:231231`, currentUser, session.user.id)
    // Check if user is admin for admin routes
    if (isAdmin && currentUser?.role !== "admin") {
      return NextResponse.json({ error: "unauthorized - admin access required" }, { status: 403 })
    }

    // Build query filter
    let queryFilter = {}

    // User filter
    if (isAdmin && userId) {
      // ADMIN: Get payments for a specific user
      queryFilter.userId = new ObjectIdClass(userId)
    } else if (!isAdmin || (userId && userId !== session.user.id)) {
      // USER: Get their own payments only
      if (userId && userId !== session.user.id) {
        return NextResponse.json({ error: "unauthorized - cannot access other user's payments" }, { status: 403 })
      }
      queryFilter.userId = new ObjectIdClass(session.user.id)
    }

    // Status filter
    if (statusFilter !== "all") {
      queryFilter.status = statusFilter
    }

    // Type filter
    if (typeFilter !== "all") {
      queryFilter.type = typeFilter
    }

    // Search filter - search by stripePaymentId (for user email/name, would require aggregation)
    if (searchTerm) {
      queryFilter.stripePaymentId = { $regex: searchTerm, $options: "i" }
    }

    // Get total count for pagination
    const totalCount = await db.collection("payments").countDocuments(queryFilter)

    // Calculate skip
    const skip = (page - 1) * limit

    // Fetch paginated payments
    let payments = await db
      .collection("payments")
      .find(queryFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // For admin view, populate user data
    if (isAdmin) {
      const userIds = [...new Set(payments.map((p) => p.userId.toString()))]
      const users = await Promise.all(userIds.map((id) => findUserById(id)))
      const userMap = users.reduce((acc, user) => {
        if (user) acc[user._id.toString()] = user
        return acc
      }, {})

      payments = payments.map((payment) => ({
        ...payment,
        user: userMap[payment.userId.toString()],
      }))
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)

    console.log(`Returning ${payments.length} payments (page ${page} of ${totalPages})`)
    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      isAdmin: isAdmin,
    })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}
