import { NextResponse } from "next/server"
import { connectToDatabase } from "@/server/db"
import { ObjectId } from "mongodb"
import bcrypt from "bcryptjs"

export async function PUT(request) {
  try {
    const authHeader = request.headers.get("Authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication error",
          error: "No valid authorization token found",
        },
        { status: 401 }
      )
    }

    // Extract userId (as token)
    const userId = authHeader.split(" ")[1]

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication error",
          error: "No user ID token provided",
        },
        { status: 401 }
      )
    }

    // Parse request body
    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password and new password are required",
        },
        { status: 400 }
      )
    }

    // Connect to DB
    const db = await connectToDatabase()

    // Find user
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Current password is incorrect" },
        { status: 401 }
      )
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { password: hashedNewPassword } }
    )

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
    })
  } catch (error) {
    console.error("Error updating password:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update password",
        error: error.message,
      },
      { status: 500 }
    )
  }
}
