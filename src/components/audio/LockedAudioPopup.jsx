"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckoutButton } from "@/components/stripe/checkout/CheckoutButton"
import { Lock, Crown, Sparkles } from "lucide-react"

export default function LockedAudioPopup({ 
  open, 
  onOpenChange, 
  audioName,
  audioId 
}) {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-yellow-500" />
            Premium Audio
          </DialogTitle>
          <DialogDescription>
            This audio track requires a subscription or individual purchase to access.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Audio Info */}
          <div className="bg-gray-800/30 rounded-lg p-4">
            <h3 className="font-medium text-white mb-2">{audioName}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Crown className="h-4 w-4 text-yellow-500" />
              <span>Premium Content</span>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {/* Subscription Option */}
            <div className="border border-pink-500/30 rounded-lg p-4 bg-pink-500/5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-pink-400" />
                    Monthly Subscription
                  </h4>
                  <p className="text-sm text-gray-400">Unlimited access to all audio tracks</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">CAD 7.99</div>
                  <div className="text-xs text-gray-400">/month</div>
                </div>
              </div>
              <CheckoutButton
                priceId={process.env.NEXT_PUBLIC_STRIPE_SUBSCRIPTION_PRICE_ID}
                mode="subscription"
                variant="primary"
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
              >
                Get Subscription
              </CheckoutButton>
            </div>

            {/* Individual Purchase Option */}
            <div className="border border-gray-600/30 rounded-lg p-4 bg-gray-800/20">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    <Crown className="h-4 w-4 text-yellow-500" />
                    Purchase This Track
                  </h4>
                  <p className="text-sm text-gray-400">One-time purchase for lifetime access</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">CAD 45</div>
                  <div className="text-xs text-gray-400">one-time</div>
                </div>
              </div>
              <CheckoutButton
                priceId={process.env.NEXT_PUBLIC_STRIPE_ONE_TIME_PRICE_ID}
                mode="payment"
                audioId={audioId}
                variant="outline"
                className="w-full border-gray-600 hover:bg-gray-700/50 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
              >
                Purchase Track
              </CheckoutButton>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
