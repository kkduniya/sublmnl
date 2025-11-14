import { NextResponse } from "next/server"
import { connectToDatabase } from "@/server/db"
import { ObjectId } from "mongodb"
import { findUserSubscription } from "@/server/models/Subscription"

// Shared function to extract userId
const getUserIdFromAuth = (authHeader) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null
  return authHeader.split(" ")[1]
}

// --- GET: Fetch user profile ---
export async function GET(request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = getUserIdFromAuth(authHeader)

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "Authentication error",
        error: "No valid authorization token found",
      }, { status: 401 })
    }

    const db = await connectToDatabase()
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "User profile fetched successfully",
      user: {
        id: user._id.toString(),
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email,
        role: user.role || "user",
        favoriteAudios: user.favoriteAudios || [],
        purchasedAudios: user.purchasedAudios || [],
        subscription: user.subscription || 'free',
      },
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    }, { status: 500 })
  }
}

// --- PUT: Update user profile ---
export async function PUT(request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = getUserIdFromAuth(authHeader)

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "Authentication error",
        error: "No valid authorization token found",
      }, { status: 401 })
    }

    const { firstName, lastName, email } = await request.json()

    if (!firstName && !lastName && !email) {
      return NextResponse.json({ success: false, message: "At least one field must be provided" }, { status: 400 })
    }

    const db = await connectToDatabase()

    const updateFields = {}
    if (firstName !== undefined) updateFields.firstName = firstName
    if (lastName !== undefined) updateFields.lastName = lastName
    if (email !== undefined) updateFields.email = email

    const result = await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateFields }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    const updatedUser = await db.collection("users").findOne({ _id: new ObjectId(userId) })

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id.toString(),
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName || "",
        email: updatedUser.email,
        role: updatedUser.role,
        favoriteAudios: updatedUser.favoriteAudios || [],
        purchasedAudios: updatedUser.purchasedAudios || [],
      },
    })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    }, { status: 500 })
  }
}

// --- DELETE: Delete user account ---
export async function DELETE(request) {
  try {
    const authHeader = request.headers.get("Authorization")
    const userId = getUserIdFromAuth(authHeader)

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "Authentication error",
        error: "No valid authorization token found",
      }, { status: 401 })
    }

    const db = await connectToDatabase()
    const userObjectId = new ObjectId(userId)

    // Verify user exists
    const existingUser = await db.collection("users").findOne({ _id: userObjectId })
    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      )
    }

    // Cancel subscriptions (if any)
    const subscriptions = await findUserSubscription(userObjectId)
    if (subscriptions && subscriptions.length > 0) {
      for (const subscription of subscriptions) {
        if (subscription.status === "active" && !subscription.cancelAtPeriodEnd) {
          await db.collection("subscriptions").updateOne(
            { _id: subscription._id },
            {
              $set: {
                cancelAtPeriodEnd: true,
                status: "canceled",
                updatedAt: new Date(),
              },
            },
          )
        }
      }
    }

    // Delete all audios created by the user
    const audioResult = await db.collection("audios").deleteMany({ userId: userObjectId })
    console.log(`Deleted ${audioResult.deletedCount} audios for user ${userId}`)

    // Finally delete the user
    const userResult = await db.collection("users").deleteOne({ _id: userObjectId })

    if (userResult.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "User deletion failed" },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
      deletedAudios: audioResult.deletedCount,
    })
  } catch (error) {
    console.error("Error deleting user account:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete account",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

