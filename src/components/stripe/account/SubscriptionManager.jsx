"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"

import { Alert } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CheckoutButton } from "@/components/stripe/checkout/CheckoutButton"


export function SubscriptionManager({ subscription }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showReactivateDialog, setShowReactivateDialog] = useState(false)

  const handleCancelSubscription = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: subscription.stripeSubscriptionId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to cancel subscription")
      }

      router.refresh()
    } catch (error) {
      console.error("Error canceling subscription:", error)
    } finally {
      setIsLoading(false)
      setShowCancelDialog(false)
    }
  }

  const handleReactivateSubscription = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/stripe/reactivate-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: subscription.stripeSubscriptionId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to reactivate subscription")
      }

      router.refresh()
    } catch (error) {
      console.error("Error reactivating subscription:", error)
    } finally {
      setIsLoading(false)
      setShowReactivateDialog(false)
    }
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Active Subscription</CardTitle>
          <CardDescription>
            You don't have an active subscription. Subscribe to create unlimited audio tracks.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <CheckoutButton
            priceId={process.env.NEXT_PUBLIC_STRIPE_SUBSCRIPTION_PRICE_ID}
            mode="subscription"
            variant="default"
          >
            Subscribe Now
          </CheckoutButton>
        </CardFooter>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Subscription</CardTitle>
            <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
              {subscription.status === "trialing" ? "Trial" : subscription.status}
            </Badge>
          </div>
          <CardDescription>Manage your monthly subscription and billing information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Subscription Plan</p>
            <p>Monthly Subscription - $7.99/month</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Billing Period</p>
            <p>
              {format(new Date(subscription.currentPeriodStart), "MMMM d, yyyy")} -{" "}
              {format(new Date(subscription.currentPeriodEnd), "MMMM d, yyyy")}
            </p>
          </div>

          {subscription.cancelAtPeriodEnd && (
            <div className="rounded-md bg-amber-500/10 p-4 border border-amber-500/20">
              <p className="text-sm font-medium text-amber-500">
                Your subscription will end on {format(new Date(subscription.currentPeriodEnd), "MMMM d, yyyy")}
              </p>
              <p className="text-sm mt-1">
                You will lose access to your created audio tracks after this date unless you reactivate your
                subscription.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() =>
              window.open("https://billing.stripe.com/p/login/test_28o5kO0Ql2Hl2cg144", "_blank")
            }
          >
            Manage Payment Methods
          </Button>

          {subscription.cancelAtPeriodEnd ? (
            <Button onClick={() => setShowReactivateDialog(true)} disabled={isLoading}>
              {isLoading ? "Processing..." : "Reactivate Subscription"}
            </Button>
          ) : (
            <Button variant="destructive" onClick={() => setShowCancelDialog(true)} disabled={isLoading}>
              {isLoading ? "Processing..." : "Cancel Subscription"}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel your subscription? You will lose access to unlimited audio creation at
              the end of your current billing period.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelSubscription} disabled={isLoading}>
              {isLoading ? "Processing..." : "Yes, Cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reactivate Dialog */}
      <AlertDialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reactivate Subscription</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to reactivate your subscription? Your subscription will continue and you won't lose
              access to your audio tracks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReactivateSubscription} disabled={isLoading}>
              {isLoading ? "Processing..." : "Yes, Reactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
