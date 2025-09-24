import { NextResponse } from "next/server"
import { findUserByEmail, createUser } from "@/server/models/user"
import bcrypt from "bcryptjs"

export async function POST(request) {
  try {
    const { firstName, lastName, email, password } = await request.json()

    // Validate required fields
    if (!email || !password || !firstName) {
      return NextResponse.json({ success: false, message: "Required fields are missing" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await findUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ success: false, message: "Email already in use" }, { status: 409 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the user
    const newUser = await createUser({
      email,
      firstName,
      lastName,
      password: password,
      role: "user",
      favoriteAudios: [],
      subscription: {
        plan: "basic",
        status: "active",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    })

    // === Subscribe to Klaviyo ===
    try {
      const klaviyoApiUrl = `https://a.klaviyo.com/api/v2/list/Vh6uXH/subscribe`
      const privateApiKey = "pk_745e48284d87ef17bbec96989ff45f4a14"

      const response = await fetch(klaviyoApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          api_key: privateApiKey,
          profiles: [
            {
              email,
              first_name: firstName,
              last_name: lastName,
            },
          ],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Klaviyo subscription failed:", errorData)
        // don’t fail registration if Klaviyo fails
      }
    } catch (klaviyoErr) {
      console.error("Error subscribing to Klaviyo:", klaviyoErr)
    }

    return NextResponse.json({
      success: true,
      message: "User registered successfully",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "An error occurred during registration" }, { status: 500 })
  }
}

