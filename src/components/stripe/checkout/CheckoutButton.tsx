"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast";
import { ThemedButton } from "@/components/ui/themed-button"

interface CheckoutButtonProps {
  priceId: string
  mode: "payment" | "subscription"
  audioId?: string
  children: React.ReactNode
  className?: string
  variant?: "default" | "outline" | "primary"
  colorIndices?: number[]
  gradientDirection?: string
}

export function CheckoutButton({
  priceId,
  mode,
  audioId,
  children,
  className,
  variant = "default",
  colorIndices,
  gradientDirection,
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleCheckout = async () => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          mode,
          audioId,
        }),
      })

            
      const data = await response.json()
      if(data?.error=="Unauthorized" || data?.error=="not_logged_in"){
        toast({
          title: "Checkout Error",
          description: "Please login and try again.",
          variant: "destructive",
        })
        router.push("/auth")
      }

      if (!response.ok) {
        toast({
          title: "Checkout Error",
          description: "Failed to initiate checkout. Please login and try again.",
          variant: "destructive",
        })
        throw new Error(data.error || "Failed to create checkout session")
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Checkout Error",
        description: "Failed to initiate checkout. Please login and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ThemedButton
      href={false}
      onClick={handleCheckout}
      disabled={isLoading}
      className={className}
      data-color-indices={colorIndices?.join(",")}
      data-gradient-direction={gradientDirection}
      variant="primary" 
      colorIndices={[0, 1]} 
      gradientDirection="to right"
    >
      {isLoading ? "Processing..." : children}
    </ThemedButton>
  )
}
