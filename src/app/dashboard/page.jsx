"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import AudioPlayer from "@/components/create/AudioPlayer"
import {
  CalendarIcon,
  CreditCardIcon,
  PlayIcon,
  PauseIcon,
  SettingsIcon,
  TrendingUpIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  DollarSign
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow, format } from "date-fns"
import AllTracksSection from "@/components/dashboard/AllTracksSection"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()
  router.push("/dashboard/audios")
  return null
  const { user, requireAuth } = useAuth()
  const [audios, setAudios] = useState([])
  const [favoriteAudios, setFavoriteAudios] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [currentAudio, setCurrentAudio] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioError, setAudioError] = useState(false)

  // New state for dynamic data
  const [payments, setPayments] = useState([])
  const [subscription, setSubscription] = useState(null)
  const [isLoadingPayments, setIsLoadingPayments] = useState(true)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true)

  useEffect(() => {
    if (!requireAuth()) return

    fetchAudios()
    fetchPayments()
    fetchSubscription()
  }, [requireAuth])

  const fetchAudios = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/user/audios")
      const data = await response?.json()

      if (data.success) {
        setAudios(data.audios)
      } else {
        console.error("Error fetching audios:", data.message)
      }
    } catch (error) {
      console.error("Error fetching audios:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchPayments = async () => {
    try {
      setIsLoadingPayments(true)
      const response = await fetch("/api/admin/payments")
      const data = await response?.json()

      if (response.ok) {
        setPayments(data.payments || [])
      } else {
        console.error("Error fetching payments:", data.error)
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setIsLoadingPayments(false)
    }
  }

  const fetchSubscription = async () => {
    try {
      setIsLoadingSubscription(true)
      const response = await fetch("/api/admin/subscriptions")
      const data = await response?.json()

      if (response.ok) {
        const activeSubscription = data?.subscriptions.filter((sub) => sub.status === "active")
        setSubscription(activeSubscription[0])
      } else {
        console.error("Error fetching subscription:", data.error)
      }
    } catch (error) {
      console.error("Error fetching subscription:", error)
    } finally {
      setIsLoadingSubscription(false)
    }
  }

  const handlePlay = (audio) => {
    try {
      setAudioError(false)

      if (currentAudio && currentAudio.id === audio.id) {
        setIsPlaying(!isPlaying)
      } else {
        setCurrentAudio(audio)
        setIsPlaying(true)
      }
    } catch (error) {
      console.error("Audio control error:", error)
      setAudioError(true)
      setIsPlaying(false)
    }
  }

  const handleDownload = (audio) => {
    const link = document.createElement("a")
    link.href = audio.audioUrl
    link.download = `${audio.name}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatCurrency = (amount, currency = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount) // Amount is already in dollars
  }

  const getSubscriptionStatus = () => {
    if (!subscription) return { status: "inactive", plan: "Free", color: "bg-gray-500/20 text-gray-400" }

    const statusColors = {
      active: "bg-green-500/20 text-green-400",
      canceled: "bg-yellow-500/20 text-yellow-400",
      past_due: "bg-red-500/20 text-red-400",
      unpaid: "bg-red-500/20 text-red-400",
      trialing: "bg-blue-500/20 text-blue-400",
      incomplete: "bg-orange-500/20 text-orange-400",
    }

    return {
      status: subscription.status,
      plan: subscription.status === "active" ? "Premium" : "Free",
      color: statusColors[subscription.status] || "bg-gray-500/20 text-gray-400",
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    }
  }

  const getRemainingDays = () => {
    if (!subscription || !subscription.currentPeriodEnd) return 0
    const endDate = new Date(subscription.currentPeriodEnd)
    const today = new Date()
    return Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)))
  }

  const getPaymentStats = () => {
    const successfulPayments = payments.filter((p) => p.status === "succeeded")
    const totalSpent = successfulPayments.reduce((sum, p) => sum + p.amount, 0)
    const lastPayment = payments.length > 0 ? payments[0] : null

    return {
      totalSpent: totalSpent / 100, // Convert from cents
      totalPayments: payments.length,
      lastPayment,
    }
  }

  if (!user) {
    return null
  }

  const subscriptionInfo = getSubscriptionStatus()
  const remainingDays = getRemainingDays()
  const paymentStats = getPaymentStats()
  const displayedAudios = activeTab === "favorites" ? favoriteAudios : audios


  return (
    <div className="max-w-8xl mx-auto  sm:px-6 lg:px-8  sm:py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          Your Dashboard
        </h1>
        <Link
          href="/create"
          className="bg-gradient-to-r from-primary to-purple-500 rounded-md py-2 px-4 sm:px-5 hover:opacity-90 transition-opacity text-white font-medium text-center w-full sm:w-auto"
        >
          Create New Audio
        </Link>
      </div>

      <div className="mb-8">
        {/* Enhanced Subscription Card */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <CardTitle className="text-lg sm:text-xl font-semibold flex items-center">
                <CreditCardIcon className="h-5 w-5 mr-2 text-primary" />
                Your Subscription
              </CardTitle>
              <Link href="/dashboard/subscriptions" className="text-primary hover:underline text-sm flex items-center self-start sm:self-auto">
                <SettingsIcon className="h-4 w-4 mr-1" />
                Manage
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingSubscription ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) :
              subscription && subscription?.status === "active" ?
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-primary/20 to-purple-500/20 flex items-center justify-center mx-auto sm:mx-0 sm:mr-4">
                      {subscriptionInfo.status === "active" ? (
                        <CheckCircleIcon className="h-8 w-8 text-green-400" />
                      ) : (
                        <AlertCircleIcon className="h-8 w-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center mb-2 gap-2">
                        <span className="text-xl sm:text-2xl font-bold capitalize">{subscriptionInfo.plan}</span>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                          <Badge variant="outline" className={`${subscriptionInfo.color}`}>
                            {subscriptionInfo.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {subscriptionInfo?.cancelAtPeriodEnd ? "Cancels at period end" : "Renews automatically"}
                          </Badge>
                        </div>
                      </div>
                      {subscription && (
                        <div className="space-y-1">
                          <p className="text-gray-300 flex items-center text-sm">
                            <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                            {subscriptionInfo.status === "active"
                              ? `${subscriptionInfo.cancelAtPeriodEnd ? "Ends" : "Renews"} on ${format(new Date(subscription.currentPeriodEnd), "MMM dd, yyyy")}`
                              : `Ended on ${format(new Date(subscription.currentPeriodEnd), "MMM dd, yyyy")}`}
                          </p>
                          {subscriptionInfo.status === "active" && remainingDays > 0 && (
                            <p className="text-sm text-gray-400">{remainingDays} days remaining</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-2">Plan Features</p>
                      <ul className="space-y-1">
                        {subscriptionInfo.status === "active" ? (
                          <>
                            <li className="text-sm flex items-center">
                              <CheckCircleIcon className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                              Unlimited audio creation
                            </li>
                            <li className="text-sm flex items-center">
                              <CheckCircleIcon className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                              Premium voices
                            </li>
                            <li className="text-sm flex items-center">
                              <CheckCircleIcon className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                              Background music
                            </li>
                          </>
                        ) : (
                          <>
                            <li className="text-sm flex items-center text-gray-500">
                              <AlertCircleIcon className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                              Limited features
                            </li>
                            <li className="text-sm">
                              <Link href="/pricing" className="text-primary hover:underline">
                                Upgrade to unlock all features
                              </Link>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <p className="text-gray-400 text-sm mb-2">Usage</p>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Audio Created</span>
                          <span>
                            {audios.length}
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{
                              // width:
                              //   subscriptionInfo.status === "active"
                              //     ? "100%"
                              //     : `${Math.min((audios.length / 5) * 100, 100)}%`,
                              width: "100%",
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4 sm:col-span-2 lg:col-span-1">
                      <p className="text-gray-400 text-sm mb-2">
                        {subscriptionInfo.status === "active" ? "Next Payment" : "Subscription"}
                      </p>
                      {subscriptionInfo.status === "active" && !subscriptionInfo.cancelAtPeriodEnd ? (
                        <div>
                          <p className="text-lg font-semibold">CA$ 7.99</p>
                          <p className="text-sm text-gray-400">
                            on {format(new Date(subscription.currentPeriodEnd), "MMM dd")}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm mb-2">
                            {subscriptionInfo.cancelAtPeriodEnd ? "Subscription ending" : "No active subscription"}
                          </p>
                          <Link href="/pricing" className="text-primary text-sm hover:underline">
                            {subscriptionInfo.cancelAtPeriodEnd ? "Reactivate" : "View plans"}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </>
                :
                <div className="my-8 text-center">
                  <p>No Active Subscription Found.</p>
                  <Link href="/pricing" className="text-primary hover:underline text-base flex items-center justify-center my-2">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Get Subscription.
                  </Link>
                </div>
            }

          </CardContent>
        </Card>

        {/* Enhanced Recent Payments Card */}
        {/* <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-semibold flex items-center">
                <TrendingUpIcon className="h-5 w-5 mr-2 text-primary" />
                Recent Payments
              </CardTitle>
              <Link href="/dashboard/payments" className="text-primary hover:underline text-sm">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingPayments ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-6">
                <AlertCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-400 mb-2">No payment history yet</p>
                <Link href="/pricing" className="text-primary hover:underline text-sm">
                  View pricing plans
                </Link>
              </div>
            ) : (
              <>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Total Spent</p>
                    <p className="text-lg font-semibold text-green-400">${paymentStats.totalSpent.toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <p className="text-gray-400 text-xs mb-1">Payments</p>
                    <p className="text-lg font-semibold">{paymentStats.totalPayments}</p>
                  </div>
                </div>

               
                <div className="space-y-3">
                  {payments.slice(0, 3).map((payment) => (
                    <div
                      key={payment._id}
                      className="flex justify-between items-center p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <Badge
                            variant={payment.type === "subscription" ? "outline" : "secondary"}
                            className="text-xs mr-2"
                          >
                            {payment.type}
                          </Badge>
                          <Badge
                            variant={payment.status === "succeeded" ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {payment.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400">
                          {formatDistanceToNow(new Date(payment.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-medium ${
                            payment.status === "succeeded" ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {formatCurrency(payment.amount, payment.currency)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card> */}
      </div>

      {audioError && (
        <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4 text-red-200">
          Audio playback is not available in the preview. This would work in the actual application.
        </div>
      )}

      {currentAudio && (
        <Card className="mb-6 sm:mb-8 bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700">
          <CardContent className="p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Now Playing</h3>
            <div className="flex flex-col sm:flex-row sm:items-center mb-4 gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto sm:mx-0 sm:mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
              <div className="text-center sm:text-left">
                <h4 className="font-medium text-sm sm:text-base break-words">{currentAudio.name}</h4>
                <p className="text-xs sm:text-sm text-gray-400">Created on {formatDate(currentAudio.createdAt)}</p>
              </div>
            </div>

            <AudioPlayer
              audioUrl={currentAudio.audioUrl}
              onError={() => setAudioError(true)}
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              showAffirmations={true}
              affirmationsVolume={0.3}
            />
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border-gray-700">
        <CardContent className="p-4 sm:p-6">
          <AllTracksSection />
        </CardContent>
      </Card>
    </div>
  )
}
