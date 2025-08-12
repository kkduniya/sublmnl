import { NextResponse } from "next/server"
import { findValidToken, deleteToken } from "@/server/models/passwordReset"
import { findUserById, updateUser } from "@/server/models/user"

export async function POST(req) {
  try {
    const { token, password } = await req.json()

    if (!token || !password) {
      return NextResponse.json({ error: "Token and password are required" }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // Find the valid token
    const resetToken = await findValidToken(token)

    if (!resetToken) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 })
    }

    // Find the user
    const user = await findUserById(resetToken.userId)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update the user's password
    await updateUser(user._id, { password })

    // Delete the used token
    await deleteToken(resetToken._id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in reset password:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
