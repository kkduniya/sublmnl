"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { useAuth } from "@/context/AuthContext"
import { CreditCard, Calendar, Settings, Clock, CalendarCheck } from "lucide-react"
import AudioSelectionPopup from "./AudioSelectionPopup"

export function ActiveSubscriptionCard({ onManagementStateChange }) {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showManagementScreen, setShowManagementScreen] = useState(false)
  const [showCancelPopup, setShowCancelPopup] = useState(false)
  const [showAudioSelectionPopup, setShowAudioSelectionPopup] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [reactivating, setReactivating] = useState(false)
  const [updatingPayment, setUpdatingPayment] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState(null)
  const { user } = useAuth()

  console.log(paymentMethod);
  

  useEffect(() => {
    fetchActiveSubscription()
  }, [user?.id])

  const fetchActiveSubscription = async () => {
    try {
      const response = await fetch(`/api/admin/subscriptions?userId=${user?.id}`)
      const data = await response.json()

      if (response.ok && data.subscriptions) {
        // Find the most recent active subscription
        const activeSubscription = data.subscriptions.find(
          sub => sub.status === 'active' && new Date(sub.currentPeriodEnd) > new Date()
        )
        setSubscription(activeSubscription)
        
        // Fetch payment method if subscription exists
        if (activeSubscription?.stripeSubscriptionId) {
          await fetchPaymentMethod(activeSubscription.stripeSubscriptionId)
        }
      }
    } catch (error) {
      console.error("Error fetching subscription:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPaymentMethod = async (subscriptionId) => {
    try {
      const response = await fetch(`/api/stripe/get-payment-method?subscriptionId=${subscriptionId}`)
      const data = await response.json()
      
      if (response.ok) {
        if (data.paymentMethod) {
          setPaymentMethod(data.paymentMethod)
        } else {
          console.log("No payment method found for subscription:", subscriptionId)
          setPaymentMethod(null)
        }
      } else {
        console.error("Error fetching payment method:", data.error)
        setPaymentMethod(null)
      }
    } catch (error) {
      console.error("Error fetching payment method:", error)
      setPaymentMethod(null)
    }
  }

  const handleManageSubscription = () => {
    // Show the management screen inline
    setShowManagementScreen(true)
    onManagementStateChange?.(true)
  }

  const handleKeepSubscription = () => {
    // Hide the management screen
    setShowManagementScreen(false)
    onManagementStateChange?.(false)
  }

  const handleCancelSubscription = () => {
    // Show the cancellation popup instead of directly canceling
    setShowCancelPopup(true)
  }

  const handlePurchaseAudios = () => {
    // Close the cancellation popup and open the audio selection popup
    setShowCancelPopup(false)
    setShowAudioSelectionPopup(true)
  }

  const handleAudioPurchaseComplete = () => {
    // Close all popups and management screen
    setShowAudioSelectionPopup(false)
    setShowManagementScreen(false)
    onManagementStateChange?.(false)
    // Refresh user data to show updated purchased audios
    window.location.reload()
  }

  const handleCancelAnyway = async () => {
    try {
      setCancelling(true)
      
      if (!subscription?.stripeSubscriptionId) {
        console.error("No subscription ID found")
        return
      }

      // Call the cancel subscription API
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          subscriptionId: subscription.stripeSubscriptionId 
        }),
      })

      if (response.ok) {
        // Close popups and refresh the page to show updated subscription status
        setShowCancelPopup(false)
        setShowManagementScreen(false)
        onManagementStateChange?.(false)
        
        // Refresh the page to show the updated subscription status
        window.location.reload()
      } else {
        const data = await response.json()
        console.error("Failed to cancel subscription:", data.error)
        alert("Failed to cancel subscription. Please try again.")
      }
    } catch (error) {
      console.error("Error canceling subscription:", error)
      alert("Error canceling subscription. Please try again.")
    } finally {
      setCancelling(false)
    }
  }

  const handleReactivateSubscription = async (subscriptionId) => {
    try {
      setReactivating(true)
      const response = await fetch("/api/stripe/reactivate-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      })
      if (response.ok) {
        await fetchActiveSubscription()
      }else {
        console.error("Failed to reactivate subscription")
      }
    } catch (error) {
      console.error("Error reactivating subscription:", error)
    } finally {
      setReactivating(false)
    }
  }

  const handleUpdatePayment = async () => {
    try {
      setUpdatingPayment(true)
      
      if (!subscription?.stripeSubscriptionId) {
        console.error("No subscription ID found")
        alert("Subscription not found. Please try again.")
        return
      }

      // Call the create portal session API
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          subscriptionId: subscription.stripeSubscriptionId 
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Redirect to Stripe Billing Portal
        window.location.href = data.url
      } else {
        const data = await response.json()
        console.error("Failed to create portal session:", data.error)
        
        // Handle specific error cases
        if (data.stripeError === "BILLING_PORTAL_NOT_CONFIGURED") {
          alert(
            "Payment portal is not yet configured. Please contact support to set up payment updates.\n\n" +
            "If you're an admin, configure the Customer Portal in Stripe Dashboard → Settings → Billing → Customer portal"
          )
        } else {
          alert(`Failed to open payment update page: ${data.error || "Please try again."}`)
        }
      }
    } catch (error) {
      console.error("Error updating payment:", error)
      alert("Error updating payment. Please try again.")
    } finally {
      setUpdatingPayment(false)
    }
  }

  // Cancellation Popup Component
  const CancellationPopup = () => (
    <Dialog open={showCancelPopup} onOpenChange={setShowCancelPopup}>
      <DialogContent className="sm:max-w-lg bg-gray-900 border-gray-700 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-white">
            Wait, don't lose your audios!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 text-center">
          <p className="text-gray-200 text-base">
            You've already created powerful tracks tailored to you. If you cancel, you'll lose access permanently.
          </p>
          
          <div className="bg-gray-800 border border-gray-600 rounded-lg p-6">
            <p className="text-white font-semibold text-lg">
              Get lifetime access to all your existing audios today, for 50% off. That's just $22.50 per track.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handlePurchaseAudios}
              className="w-full text-black font-semibold bg-gradient-to-r from-pink-200 to-pink-500 hover:from-pink-300 hover:to-pink-600 rounded-lg py-3 transition-all duration-200"
            >
              Yes, purchase my audios (50% off)
            </Button>
            
            <Button 
              onClick={handleCancelAnyway}
              variant="outline"
              disabled={cancelling}
              className="w-full text-gray-200 font-semibold border border-gray-600 hover:bg-gray-700 hover:text-white rounded-lg py-3 transition-all duration-200"
            >
              {cancelling ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full mr-2"></div>
                  Cancelling...
                </>
              ) : (
                "No thanks, cancel anyway"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  if (loading) {
    return (
      <>
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          </CardContent>
        </Card>
        <CancellationPopup />
      </>
    )
  }

  // Show management screen if requested
  if (showManagementScreen) {
    return (
      <>
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-2">
              <span className="capitalize">{user?.name || 'User'}</span>, Thinking of Canceling?
            </h2>
            <p className="text-white text-lg">
              We get it - life's busy. But before you go, remember your subscription gives you exclusive features to keep you motivated, consistent, and supported.
            </p>
          </div>

          {/* Main Management Card */}
          <Card className="overflow-hidden max-w-4xl mx-auto">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                {/* Left side - Visual */}
                <div className="w-full md:w-1/3 h-64 md:h-auto relative overflow-hidden">
                  <img 
                    src="/images/banner.png" 
                    alt="Sublmnl Banner" 
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                </div>

                {/* Right side - Details */}
                <div className="flex-1 bg-gray-900 p-6 md:p-8 text-white">
                  <div className="mb-6">
                    <h3 className="text-white text-2xl font-bold mb-2">Sublmnl Membership</h3>
                  </div>

                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3">
                      <span className="text-pink-400 text-lg">✔</span>
                      <span className="text-gray-200"><b className="mr-1">Unlimited</b> audio tracks creation</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-pink-400 text-lg">✔</span>
                      <span className="text-gray-200">Access to full music + voice library</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-pink-400 text-lg">✔</span>
                      <span className="text-gray-200">High-definition audio quality</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-pink-400 text-lg">✔</span>
                      <span className="text-gray-200">Edit your tracks anytime</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-pink-400 text-lg">✔</span>
                      <span className="text-gray-200">Ideal for active manifestors and daily listeners</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-pink-400 text-lg">✔</span>
                      <span className="text-gray-200">Cancel anytime</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button 
              onClick={handleKeepSubscription}
              className="text-black font-semibold bg-gradient-to-r from-pink-200 to-pink-500 hover:from-pink-300 hover:to-pink-600 rounded-lg py-3 px-8 transition-all duration-200 flex-1 sm:flex-none"
            >
              Keep my subscription
            </Button>
            <Button 
              onClick={handleCancelSubscription}
              variant="outline"
              className="text-white font-semibold border-2 border-gray-600 hover:bg-gray-700 hover:border-gray-500 rounded-lg py-3 px-8 transition-all duration-200 flex-1 sm:flex-none"
            >
              Cancel subscription
            </Button>
          </div>
        </div>
        <CancellationPopup />
        <AudioSelectionPopup 
          open={showAudioSelectionPopup}
          onOpenChange={setShowAudioSelectionPopup}
          onPurchaseComplete={handleAudioPurchaseComplete}
        />
      </>
    )
  }

  if (!subscription) {
    return (
      <>
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Active Subscription</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You don't have an active subscription. Subscribe to unlock unlimited audio creation.
              </p>
              <Button onClick={() => window.location.href = '/pricing'}>
                View Plans
              </Button>
            </div>
          </CardContent>
        </Card>
        <CancellationPopup />
        <AudioSelectionPopup 
          open={showAudioSelectionPopup}
          onOpenChange={setShowAudioSelectionPopup}
          onPurchaseComplete={handleAudioPurchaseComplete}
        />
      </>
    )
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Left side - Visual */}
            <div className="w-full md:w-1/4 h-48 md:h-auto relative overflow-hidden">
              <img 
                src="/images/banner.png" 
                alt="Sublmnl Banner" 
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-black/20"></div>
            </div>

            {/* Right side - Details */}
            <div className="flex flex-col justify-between w-full">
              <div className="p-4 md:p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1">
                      Sublmnl Membership
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-green-500">
                        Active
                      </Badge>
                      <Badge variant="default" className={`${subscription.cancelAtPeriodEnd ? "bg-red-500" : "bg-neutral-700 text-white"}`}>
                        {subscription.cancelAtPeriodEnd
                        ? "Cancels at period end"
                        : "Renews automatically"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CalendarCheck className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Plan:</span>
                      <span className="ml-2 font-medium">Monthly</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <CreditCard className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Price:</span>
                      <span className="ml-2 font-medium">CAD $7.99/month</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Renewal date:</span>
                      <span className="ml-2 font-medium">
                        {subscription.cancelAtPeriodEnd ? "No auto renewal" : format(new Date(subscription.currentPeriodEnd), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Current period :</span>
                      <span className="ml-2 font-medium">
                        {format(new Date(subscription.currentPeriodStart), "MMM dd, yyyy")} - {format(new Date(subscription.currentPeriodEnd), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-between gap-3 px-4 md:px-6 py-2 bg-gray-800">
                {paymentMethod && (
                  <div className="flex items-center gap-2 text-sm text-white">
                    <CreditCard className="h-4 w-4" />
                    <span className="font-mono text-white">
                      **** **** {paymentMethod.last4}
                    </span>
                    <span className="capitalize text-xs text-white">
                      {paymentMethod.brand}
                    </span>
                  </div>
                )}
                <Button 
                  variant="outline" 
                  onClick={handleUpdatePayment}
                  disabled={updatingPayment}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto ms-auto"
                >
                  {updatingPayment ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                      Opening...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Update Payment
                    </>
                  )}
                </Button>
              </div>
            </div>
        </div>

        {/* Manage Subscription Plan Section */}
        <div className="border-t bg-gray-50 dark:bg-gray-800/50 p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {
                subscription.cancelAtPeriodEnd ? (
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Reactivate Subscription Renewal
                  </h4>
                ) : (
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    Manage Subscription Plan
                  </h4>
                )
              }
              {
                subscription.cancelAtPeriodEnd ? (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Reactivate your subscription renewal to continue accessing your created audios.
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Adjust your plan anytime to better suit your needs.
                  </p>
                )
              }
            </div>
            {
              subscription.cancelAtPeriodEnd ? (
                <Button 
                  variant="outline" 
                  onClick={() => handleReactivateSubscription(subscription.stripeSubscriptionId)}
                  disabled={reactivating}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Clock className="h-4 w-4" />
                  {reactivating ? "Reactivating..." : "Reactivate Subscription Renewal"}
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={handleManageSubscription}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  <Settings className="h-4 w-4" />
                  Manage Subscription
                </Button>
            )
            }
          </div>
        </div>
      </CardContent>
    </Card>
    <CancellationPopup />
    <AudioSelectionPopup 
      open={showAudioSelectionPopup}
      onOpenChange={setShowAudioSelectionPopup}
      onPurchaseComplete={handleAudioPurchaseComplete}
    />
    </>
  )
}