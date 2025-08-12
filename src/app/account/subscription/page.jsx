import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from "@/server/db"
import { findUserSubscription } from "@/server/models/Subscription"
import { SubscriptionManager } from "@/components/stripe/account/SubscriptionManager"

export default async function AccountSubscriptionPage() {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated
  if (!session || !session.user) {
    redirect("/auth")
  }

  // Connect to database
  await connectToDatabase()

  // Fetch user's subscription using the new function
  const subscription = await findUserSubscription(session.user.id)
  
  // Only pass active or trialing subscriptions to the component
  const activeSubscription = subscription && 
    (subscription.status === "active" || subscription.status === "trialing") 
    ? subscription 
    : null

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Manage Subscription</h1>

      <SubscriptionManager subscription={activeSubscription} />
    </div>
  )
}