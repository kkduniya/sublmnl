import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { connectToDatabase } from "@/server/db"
import { findAllPayments, findUserPayments } from "@/server/models/Payment"
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

    // Get current user to check admin status
    const currentUser = await findUserById(session.user.id)
  console.log(`Current user:231231`, currentUser, session.user.id)
    // Check if user is admin for admin routes
    if (isAdmin && currentUser?.role !== "admin") {
      return NextResponse.json({ error: "unauthorized - admin access required" }, { status: 403 })
    }

    let payments

    if (isAdmin && !userId) {
      // ADMIN: Get ALL payments from ALL users
      console.log("Admin requesting ALL payments from ALL users")
      payments = await findAllPayments()
    } else if (isAdmin && userId) {
      // ADMIN: Get payments for a specific user
      console.log(`Admin requesting payments for user: ${userId}`)
      payments = await findUserPayments(userId)
    } else if (userId && userId === session.user.id) {
      // USER: Get their own payments only
      console.log(`User requesting their own payments: ${userId}`)
      payments = await findUserPayments(session.user.id)
    } else if (!userId) {
      // USER: Get their own payments (default)
      console.log(`User requesting their own payments (default): ${session.user.id}`)
      payments = await findUserPayments(session.user.id)
    } else {
      // USER trying to access someone else's payments - FORBIDDEN
      return NextResponse.json({ error: "unauthorized - cannot access other user's payments" }, { status: 403 })
    }

    // For admin view, populate user data for ALL payments
    if (isAdmin) {
      console.log(`Populating user data for ${payments.length} payments`)
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

    console.log(`Returning ${payments.length} payments`)
    return NextResponse.json({
      payments,
      totalCount: payments.length,
      isAdmin: isAdmin,
    })
  } catch (error) {
    console.error("Error fetching payments:", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}
