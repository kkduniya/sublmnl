import { NextResponse } from "next/server"
import { findUserByEmail } from "@/server/models/user"
import { createPasswordReset } from "@/server/models/passwordReset"
import { sendPasswordResetEmail } from "@/lib/nodemailer"
import crypto from "crypto"

export async function POST(req) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Find the user by email
    const user = await findUserByEmail(email.toLowerCase())

    // If no user is found, still return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true })
    }

    // Generate a random token
    const token = crypto.randomBytes(32).toString("hex")

    // Set expiration time (1 hour from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    // Delete any existing tokens first (optional, as createPasswordReset already does this)
    // await deleteAllUserTokens(user._id)

    // Create a new password reset token
    await createPasswordReset(user._id, token, expiresAt)

    // Send the password reset email
    const emailResult = await sendPasswordResetEmail(user.email, token)

    if (!emailResult.success) {
      return NextResponse.json({ error: "Failed to send reset email" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in forgot password:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
