import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/server/db"
import { findUserById } from "@/server/models/user"
import { findUserSubscription } from "@/server/models/Subscription"
import { ObjectId } from "mongodb"

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10
    const search = searchParams.get("search") || ""
    const sortField = searchParams.get("sortField") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    // Connect to the database
    const db = await connectToDatabase()

    // Build query
    let query = {}

    // Add search functionality
    if (search) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { role: { $regex: search, $options: "i" } },
        ],
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get total count for pagination
    const totalCount = await db.collection("users").countDocuments(query)

    // Get total admin count (not affected by search/pagination)
    const totalAdminCount = await db.collection("users").countDocuments({ role: "admin" })

    // Fetch users with pagination and sorting
    const users = await db
      .collection("users")
      .find(query)
      .sort({ [sortField]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Transform the data to ensure _id is a string
    const formattedUsers = users.map((user) => ({
      ...user,
      _id: user._id.toString(),
    }))

    return NextResponse.json({
      success: true,
      data: formattedUsers,
      totalAdminCount,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const { role } = await request.json()

    if (!id || !role) {
      return NextResponse.json({ success: false, message: "User ID and role are required" }, { status: 400 })
    }

    const db = await connectToDatabase()

    const result = await db.collection("users").updateOne({ _id: new ObjectId(id) }, { $set: { role } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "User role updated successfully",
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user role",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const currentUser = await findUserById(session.user.id)
    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json({ success: false, message: "Admin access required" }, { status: 403 })
    }

    // Get user ID from query parameters
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ success: false, message: "User ID is required" }, { status: 400 })
    }

    // Prevent deleting yourself
    if (id === session.user.id) {
      return NextResponse.json({ success: false, message: "Cannot delete your own account" }, { status: 400 })
    }

    const db = await connectToDatabase()
    const userId = new ObjectId(id)

    // Verify user exists
    const userToDelete = await db.collection("users").findOne({ _id: userId })
    if (!userToDelete) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Prevent deleting admin users
    if (userToDelete.role === "admin") {
      return NextResponse.json({ success: false, message: "Cannot delete admin users" }, { status: 400 })
    }

    // Step 1: Cancel all subscriptions for this user (set cancelAtPeriodEnd: true)
    const subscriptions = await findUserSubscription(userId)
    if (subscriptions && subscriptions.length > 0) {
      for (const subscription of subscriptions) {
        // Only cancel active subscriptions
        if (subscription.status === "active" && !subscription.cancelAtPeriodEnd) {
          await db.collection("subscriptions").updateOne(
            { _id: subscription._id },
            { $set: { cancelAtPeriodEnd: true, status: "canceled", updatedAt: new Date() } }
          )
        }
      }
    }

    // Step 2: Delete all audios created by this user
    const audioResult = await db.collection("audios").deleteMany({ userId: userId })
    console.log(`Deleted ${audioResult.deletedCount} audio(s) for user ${id}`)

    // Step 3: Delete the user
    const userResult = await db.collection("users").deleteOne({ _id: userId })

    if (userResult.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
      deletedAudios: audioResult.deletedCount,
    })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete user",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

