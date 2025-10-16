// app/api/stripe/purchase-multiple-audios/route.js
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import stripe from "@/lib/stripe"
import { connectToDatabase } from "@/server/db"
import { findUserById } from "@/server/models/user"
import { findUserAudios } from "@/server/models/audio"

export async function POST(req) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: "not_logged_in" }, { status: 401 })
    }

    const { audioIds } = await req.json()

    if (!audioIds || !Array.isArray(audioIds) || audioIds.length === 0) {
      return NextResponse.json({ error: "Invalid audio IDs" }, { status: 400 })
    }

    // Connect to database
    await connectToDatabase()

    // Verify user owns these audios and they're not already purchased
    const user = await findUserById(session.user.id)
    const userAudios = await findUserAudios(session.user.id)
    const purchasedAudioIds = user?.purchasedAudios || []

    // Filter out already purchased audios
    const availableAudios = userAudios.filter(audio => 
      audioIds.includes(audio._id.toString()) && 
      !purchasedAudioIds.some(purchasedId => purchasedId.toString() === audio._id.toString())
    )

    if (availableAudios.length === 0) {
      return NextResponse.json({ error: "No available audios to purchase" }, { status: 400 })
    }

    // Create a single checkout session with quantity
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.NEXT_PUBLIC_STRIPE_INDIVIDUAL_AUDIO_PRICE_ID,
          quantity: availableAudios.length, // Use quantity instead of multiple line items
        },
      ],
      metadata: {
        userId: session.user.id,
        audioIds: JSON.stringify(availableAudios.map(audio => audio._id.toString())),
        audioNames: JSON.stringify(availableAudios.map(audio => audio.name)),
        purchaseType: "multiple_individual_audios",
        totalAudios: availableAudios.length.toString()
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}payment/success?session_id={CHECKOUT_SESSION_ID}&multiple_audios=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}dashboard/subscriptions`,
    })

    return NextResponse.json({ 
      success: true,
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
      totalAudios: availableAudios.length,
      totalPrice: availableAudios.length * 22.50,
      audioIds: availableAudios.map(audio => audio._id.toString())
    })

  } catch (error) {
    console.error("Error creating multiple audio purchase:", error)
    return NextResponse.json({ 
      error: "Failed to create purchase session",
      details: error.message 
    }, { status: 500 })
  }
}
