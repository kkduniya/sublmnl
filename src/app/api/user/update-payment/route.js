import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/server/db"
import { updatePayment } from "@/server/models/Payment"
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

    return NextResponse.json({ success: true, message: "Payment updated successfully" })
  } catch (error) {
    console.error("Error updating payment:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
