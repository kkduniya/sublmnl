import { NextResponse } from "next/server"
import { connectToDatabase } from "@/server/db"

export async function POST(request) {
  try {
    // Parse request body
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    // Connect to database
    const db = await connectToDatabase()

    console.log("Connected to database, looking for user with email:", email)

    // Try to find the user
    const user = await db.collection("users").findOne({ email })

    // If user doesn't exist, create one (for demo purposes)
    if (!user) {
      console.log("User not found, creating new user")
      // In a real app, you would return an error or require registration
      // For demo purposes, we'll create a new user
      const newUser = {
        email,
        firstName: email.split("@")[0],
        lastName: "",
        role: "user",
        createdAt: new Date(),
        subscription: "free",
        favoriteAudios: [],
      }

      const result = await db.collection("users").insertOne(newUser)

      // Return the newly created user
      return NextResponse.json({
        success: true,
        user: {
          id: result.insertedId.toString(),
          ...newUser,
        },
      })
    }

    console.log("User found:", user)

    // In a real app, you would verify the password here
    // For demo purposes, we'll just return the user

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        role: user.role || "user",
        subscription: user.subscription || "free",
        favoriteAudios: user.favoriteAudios || [],
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Login failed", error: error.message }, { status: 500 })
  }
}

