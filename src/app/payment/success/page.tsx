"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      router.push("/")
      return
    }

    const fetchPaymentDetails = async () => {
      try {
        const response = await fetch(`/api/stripe/payment-details?sessionId=${sessionId}`)
        const data = await response.json()

        if (response.ok) {
          setPaymentDetails(data)
            setTimeout(() => {
              router.replace("/dashboard/audios")
          }, 5000);
        } else {
          console.error("Failed to fetch payment details:", data.error)
        }
      } catch (error) {
        console.error("Error fetching payment details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentDetails()
  }, [searchParams, router])

  return (
    <div className="container max-w-lg mx-auto py-12">
      <div className="glass-card p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>

        {loading ? (
          <p className="text-gray-300 mb-6">Loading payment details...</p>
        ) : paymentDetails ? (
          <div className="text-left mb-8">
            <p className="text-gray-300 mb-6 text-center">
              Thank you for your purchase. Your payment has been processed successfully.
            </p>

            <div className="space-y-3 bg-gray-800/50 p-4 rounded-md">
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Type:</span>
                <span className="font-medium">
                  {paymentDetails.mode === "subscription" ? "Subscription" : "One-time Payment"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span className="font-medium">
                  ${(paymentDetails.amount_total / 100).toFixed(2)} {paymentDetails.currency.toUpperCase()}
                </span>
              </div>

              {paymentDetails.mode === "subscription" && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Billing Cycle:</span>
                  <span className="font-medium">Monthly</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-400">Payment ID:</span>
                <span className="font-medium text-sm truncate">{paymentDetails.payment_intent}</span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-300 mb-6">
            We couldn't retrieve your payment details, but your payment has been processed successfully.
          </p>
        )}

        <div className="flex flex-col space-y-3">
          {paymentDetails?.mode === "subscription" ? (
            <Button onClick={() => router.push("/create")}>Create Your First Audio</Button>
          ) : (
            <Button onClick={() => router.push("/dashboard/audios")}>View Your Purchased Audio</Button>
          )}

          <Button variant="outline" onClick={() => router.push("/")}>
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
