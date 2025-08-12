"use client"

import PricingContent from "@/components/pricing/PricingContent"
import { useAuth } from "@/context/AuthContext";
import { saveAudioToLibrary } from "@/lib/audio-utils";
import { Loader } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PricingPage({ }) {
  const { user } = useAuth()
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const [hasActivePlan, setHasActivePlan] = useState(false)
  const router = useRouter()
  const [checkingSubscription, setCheckingSubscription] = useState(false)

  const fetchSubscriptionStatus = async () => {
    setCheckingSubscription(true)
    try {
      if (!user?.id) return
      const response = await fetch(`/api/user/subscription-status?userId=${user?.id}`)
      if (response.ok) {
        const data = await response?.json()
        setHasActivePlan(data?.hasActiveSubscription || data?.hasOneTimePayments);
      } else {
        console.error("Error fetching subscription-status:", data.message)
        return false
      }
    } catch (error) {
      console.error("Error fetching subscription-status:", error)
      return false
    } finally {
      setCheckingSubscription(false)
    }
  }

  useEffect(() => {
    if (user?.id && returnTo === "create") {
      fetchSubscriptionStatus();
    }
  }, [user, returnTo])

  useEffect(() => {
    if (returnTo === "create" && hasActivePlan && !checkingSubscription) {
      router.replace("/dashboard/audios")
    }
  }, [returnTo, hasActivePlan, checkingSubscription])

  // ✅ Show spinner until check is complete
  if (checkingSubscription) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20 px-6 md:px-12">
      <PricingContent />
    </div>
  )
}
