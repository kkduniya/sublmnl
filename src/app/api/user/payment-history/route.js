// app/api/user/payment-history/route.js
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/server/db"
import { findUserPayments } from "@/server/models/Payment"

export async function GET(request) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions)

    // Check if user is authenticated
    if (!session || !session.user) {
      return Response.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      )
    }

    // Connect to database
    await connectToDatabase()

    // Get user ID from session
    const userId = session.user.id

    // Fetch user's payment history
    const payments = await findUserPayments(userId)

    // Format the payments for the frontend
    const formattedPayments = payments.map(payment => ({
      id: payment._id.toString(),
      description: payment.metadata?.description || 
                  (payment.type === "subscription" 
                    ? "Monthly Subscription" 
                    : "One-time Payment"),
      date: payment.createdAt,
      amount: payment.amount / 100, // Assuming amount is stored in cents
      status: payment.status,
      type: payment.type,
      currency: payment.currency,
      // Include any other fields needed by your frontend
    }))

    return Response.json({
      success: true,
      payments: formattedPayments,
    })
  } catch (error) {
    console.error("Error fetching payment history:", error)
    
    return Response.json(
      {
        success: false,
        message: "Failed to fetch payment history",
      },
      { status: 500 }
    )
  }
}