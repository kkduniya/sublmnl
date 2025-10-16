// app/api/user/data/route.js
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { connectToDatabase } from "@/server/db"
import { findUserById } from "@/server/models/user"

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Get complete user data including purchasedAudios
    const user = await findUserById(session.user.id)

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        favoriteAudios: user.favoriteAudios || [],
        purchasedAudios: user.purchasedAudios || [],
        hasActiveSubscription: user.hasActiveSubscription || false,
        subscription: user.subscription || 'free',
        stripeCustomerId: user.stripeCustomerId
      }
    })

  } catch (error) {
    console.error("Error fetching user data:", error)
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    )
  }
}
