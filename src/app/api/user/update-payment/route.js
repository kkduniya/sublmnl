import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/server/db"
import { updatePayment, findPaymentById } from "@/server/models/Payment"
import { updateUser } from "@/server/models/user"
import { ObjectId } from "mongodb"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const body = await request.json()
    const { id, updates } = body

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid or missing payment ID" }, { status: 400 })
    }

    if (!updates || typeof updates !== "object") {
      return NextResponse.json({ success: false, message: "Invalid or missing update data" }, { status: 400 })
    }

    const result = await updatePayment(new ObjectId(id), updates)

    if (result.modifiedCount === 0) {
      return NextResponse.json({ success: false, message: "No payment updated" }, { status: 404 })
    }

    // If audioId is being added to the payment, also add it to user's purchasedAudios array
    if (updates.audioId) {
      try {
        // Get the payment to find the userId
        const payment = await findPaymentById(new ObjectId(id))
        if (payment && payment.userId) {
          // Add the audioId to user's purchasedAudios array
          await updateUser(payment.userId, {
            $addToSet: { purchasedAudios: new ObjectId(updates.audioId) }
          })
          console.log(`Added audio ${updates.audioId} to user ${payment.userId} purchasedAudios array`)
        }
      } catch (error) {
        console.error("Error updating user purchasedAudios:", error)
        // Don't fail the entire request if this fails, just log the error
      }
    }

    return NextResponse.json({ success: true, message: "Payment updated successfully" })
  } catch (error) {
    console.error("Error updating payment:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
