// app/api/user/subscription-status/route.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/server/db";
import { findUserById } from "@/server/models/user";
import { findActiveSubscriptionByUserId } from "@/server/models/Subscription";
import { findSuccessfulPaymentsByUserId } from "@/server/models/Payment";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId || userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Check for active subscription
    const activeSubscription = await findActiveSubscriptionByUserId(userId);
    const hasActiveSubscription = !!activeSubscription;

    // Check for successful one-time payments
    const oneTimePayments = await findSuccessfulPaymentsByUserId(userId);
    const hasOneTimePayments = oneTimePayments && oneTimePayments.length > 0;

    // Check for purchased audios (alternative method)
    const user = await findUserById(userId);
    const hasPurchasedAudios = user?.purchasedAudios && user.purchasedAudios.length > 0;

    return NextResponse.json({
      hasActiveSubscription,
      hasOneTimePayments,
      hasPurchasedAudios,
      hasActivePlan: hasActiveSubscription || hasOneTimePayments || hasPurchasedAudios,
      subscriptionDetails: activeSubscription,
      paymentCount: oneTimePayments?.length || 0
    });

  } catch (error) {
    console.error("Error checking subscription status:", error);
    return NextResponse.json(
      { error: "Failed to check subscription status" },
      { status: 500 }
    );
  }
}