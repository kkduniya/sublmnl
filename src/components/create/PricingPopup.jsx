"use client"

import { CheckoutButton } from "@/components/stripe/checkout/CheckoutButton"
import { useTheme } from "@/context/ThemeContext"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

// Define Stripe price IDs for our products
const STRIPE_PRICE_IDS = {
  oneTimeAudio: process.env.NEXT_PUBLIC_STRIPE_ONE_TIME_PRICE_ID,
  subscription: process.env.NEXT_PUBLIC_STRIPE_SUBSCRIPTION_PRICE_ID,
}

export default function PricingPopup({ 
  open, 
  onOpenChange, 
  onClose,
  audioId 
}) {
  const { currentTheme } = useTheme()

  const handleOpenChange = (isOpen) => {
    onOpenChange(isOpen)
    if (!isOpen && onClose) {
      onClose()
    }
  }

  // Get theme colors from the current theme
  const getThemeColor = (index, fallback) => {
    if (!currentTheme || !currentTheme.palettes) return fallback

    const activePalette = currentTheme.palettes.find((p) => p.isActive) || currentTheme.palettes[0]
    if (!activePalette || !activePalette.colors || activePalette.colors.length <= index) {
      return fallback
    }

    return activePalette.colors[index]
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[90vw] max-w-[800px] bg-gray-900 text-white border-gray-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl">Choose Your Plan</DialogTitle>
              <DialogDescription className="text-gray-400">
                Choose the plan that works for you. All plans include access to our AI-powered affirmation generator.
              </DialogDescription>
            </div>
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button> */}
          </div>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Pay Per Audio Option */}
          <div className="bg-[#232a32] rounded-xl shadow-lg p-6 flex flex-col h-full border border-[#232a32]">
            <h3 className="text-xl font-bold mb-2 text-white">Pay Per Track</h3>
            <div className="flex items-end mb-2">
              <span className="text-3xl font-extrabold text-white">CAD 45</span>
              <span className="text-gray-300 ml-1 text-base">/track</span>
            </div>
            <div className="mb-4 text-gray-300 text-sm">One-time payment for those who want to focus on a specific goal.</div>
            <ul className="mb-6 flex-grow space-y-2 text-sm">
              <li className="flex items-center text-white">
                <span className="text-pink-400 mr-2">✔</span>Lifetime access to your custom track
              </li>
              <li className="flex items-center text-white">
                <span className="text-pink-400 mr-2">✔</span>Access to full music + voice library
              </li>
              <li className="flex items-center text-white">
                <span className="text-pink-400 mr-2">✔</span>High-definition audio quality
              </li>
              <li className="flex items-center text-white">
                <span className="text-pink-400 mr-2">✔</span>No recurring payments
              </li>
            </ul>
            <CheckoutButton
              priceId={STRIPE_PRICE_IDS.oneTimeAudio}
              mode="payment"
              audioId={audioId}
              variant="outline"
              className="w-full text-black font-semibold bg-gradient-to-r from-pink-200 to-pink-500 hover:from-pink-300 hover:to-pink-600 rounded-lg py-2"
              colorIndices={[1, 2]}
            >
              Create Single Audio
            </CheckoutButton>
          </div>

          {/* Monthly Subscription Option */}
          <div className="relative rounded-xl shadow-lg p-6 flex flex-col h-full border-2 border-pink-400">
            <div className="absolute -top-3 right-4 z-10">
              <span className="bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-t-lg">BEST VALUE</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">Monthly Subscription</h3>
            <div className="flex items-end mb-2">
              <span className="text-3xl font-extrabold text-white">CAD 7.99</span>
              <span className="text-gray-300 ml-1 text-base">/month</span>
            </div>
            <div className="mb-4 text-gray-300 text-sm">Unlimited audio track creation, for multi-goal manifestors.</div>
            <ul className="mb-6 flex-grow space-y-2 text-sm">
              <li className="flex items-center text-white">
                <span className="text-pink-400 mr-2">✔</span><b className="mr-1">Unlimited</b> audio tracks creation
              </li>
              <li className="flex items-center text-white">
                <span className="text-pink-400 mr-2">✔</span>Access to full music + voice library
              </li>
              <li className="flex items-center text-white">
                <span className="text-pink-400 mr-2">✔</span>High-definition audio quality
              </li>
              <li className="flex items-center text-white">
                <span className="text-pink-400 mr-2">✔</span>Edit your tracks anytime
              </li>
              <li className="flex items-center text-white">
                <span className="text-pink-400 mr-2">✔</span>Ideal for active manifestors and daily listeners
              </li>
              <li className="flex items-center text-white">
                <span className="text-pink-400 mr-2">✔</span>Cancel anytime
              </li>
            </ul>
            <CheckoutButton
              priceId={STRIPE_PRICE_IDS.subscription}
              mode="subscription"
              audioId={audioId}
              variant="primary"
              className="w-full text-black font-semibold bg-gradient-to-r from-pink-200 to-pink-500 hover:from-pink-300 hover:to-pink-600 rounded-lg py-2"
              colorIndices={[0, 1]}
              gradientDirection="to right"
            >
              Start Subscription
            </CheckoutButton>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}
