import { NextResponse } from "next/server"
import { findUserByEmail, createUser } from "@/server/models/user"
import bcrypt from "bcryptjs"

export async function POST(request) {
  try {
    const { firstName, lastName, email, password , marketingConsent  } = await request.json()

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
      purchasedAudios: [],
      subscription: {
        plan: "basic",
        status: "active",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    })

    // === Subscribe to Klaviyo ===
    try {
      const API_KEY = process.env.KLAVIYO_PRIVATE_API_KEY;
      const LIST_ID = "R9QVFw"

      // 1. Create/Update Profile
      const profileRes = await fetch("https://a.klaviyo.com/api/profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/vnd.api+json",
          "Accept": "application/vnd.api+json",
          "Authorization": `Klaviyo-API-Key ${API_KEY}`,
          "revision": "2025-07-15",
        },
        body: JSON.stringify({
          data: {
            type: "profile",
            attributes: {
              email,
              first_name: firstName,
              last_name: lastName,
              properties: {
                marketing_consent: marketingConsent ? "yes" : "no"
              }
            },
          },
        }),
      })

      if (!profileRes.ok) {
        const err = await profileRes.json()
        console.error("❌ Klaviyo profile creation failed:", err)
      } else {
        const profileData = await profileRes.json()
        const profileId = profileData.data.id

        // 2. Add profile to list
        const listRes = await fetch(`https://a.klaviyo.com/api/lists/${LIST_ID}/relationships/profiles`, {
          method: "POST",
          headers: {
            "Content-Type": "application/vnd.api+json",
            "Authorization": `Klaviyo-API-Key ${API_KEY}`,
            "revision": "2025-07-15",
          },
          body: JSON.stringify({
            data: [{ type: "profile", id: profileId }],
          }),
        })

        if (!listRes.ok) {
          const err = await listRes.json()
          console.error("❌ Klaviyo list attach failed:", err)
        } else {
          console.log("✅ Subscribed to Klaviyo successfully!")
        }
      }
    } catch (err) {
      console.error("⚠️ Error subscribing to Klaviyo:", err)
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

