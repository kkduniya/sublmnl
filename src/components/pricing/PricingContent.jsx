"use client"

import { CheckoutButton } from "@/components/stripe/checkout/CheckoutButton"
import { useTheme } from "@/context/ThemeContext"
import { Toaster } from "../ui/toaster"

// Define Stripe price IDs for our products
const STRIPE_PRICE_IDS = {
  oneTimeAudio: process.env.NEXT_PUBLIC_STRIPE_ONE_TIME_PRICE_ID,
  subscription: process.env.NEXT_PUBLIC_STRIPE_SUBSCRIPTION_PRICE_ID,
}

export default function PricingContent() {
  const { currentTheme } = useTheme()

  // Get theme colors from the current theme
  const getThemeColor = (index, fallback) => {
    if (!currentTheme || !currentTheme.palettes) return fallback

    const activePalette = currentTheme.palettes.find((p) => p.isActive) || currentTheme.palettes[0]
    if (!activePalette || !activePalette.colors || activePalette.colors.length <= index) {
      return fallback
    }

    return activePalette.colors[index]
  }

  // Theme colors with fallbacks
  const primaryColor = getThemeColor(0, "#4169E1") // Primary (indigo)
  const secondaryColor = getThemeColor(1, "#87CEEB") // Secondary (light blue)
  const accentColor = getThemeColor(2, "#1E90FF") // Accent (dodger blue)
  const mutedColor = getThemeColor(3, "#6495ED") // Muted (cornflower blue)

  return (
    <div className="max-w-6xl mx-auto">
      
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Choose the plan that works for you. All plans include access to our AI-powered affirmation generator.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Pay Per Audio Option */}
        <div className="bg-[#232a32] rounded-2xl shadow-lg p-10 flex flex-col h-full border border-[#232a32]">
          <h2 className="text-2xl font-bold mb-2 text-white">Pay Per Track</h2>
          <div className="flex items-end mb-2">
            <span className="text-4xl font-extrabold text-white">CAD 45</span>
            <span className="text-gray-300 ml-1 text-lg">/track</span>
          </div>
          <div className="mb-4 text-gray-300">One-time payment for those who want to focus on a specific goal.</div>
          <ul className="mb-8 flex-grow space-y-3">
            <li className="flex items-center text-white"><span className="text-pink-400 mr-2">✔</span>Lifetime access to your custom track</li>
            <li className="flex items-center text-white"><span className="text-pink-400 mr-2">✔</span>Access to full music + voice library</li>
            <li className="flex items-center text-white"><span className="text-pink-400 mr-2">✔</span>High-definition audio quality</li>
            <li className="flex items-center text-white"><span className="text-pink-400 mr-2">✔</span>No recurring payments</li>
          </ul>
          <CheckoutButton
            priceId={STRIPE_PRICE_IDS.oneTimeAudio}
            mode="payment"
            variant="outline"
            className="w-full text-black font-semibold bg-gradient-to-r from-pink-200 to-pink-500 hover:from-pink-300 hover:to-pink-600 rounded-lg py-3 mt-2"
            colorIndices={[1, 2]}
          >
            Create Single Audio
          </CheckoutButton>
        </div>

        {/* Monthly Subscription Option */}
        <div className="relative rounded-2xl shadow-lg p-10 flex flex-col h-full border-2 border-pink-400">
          <div className="absolute -top-4 right-6 z-10">
            <span className="bg-pink-500 text-white text-xs font-bold px-4 py-1 rounded-t-lg">BEST VALUE</span>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-white">Monthly Subscription</h2>
          <div className="flex items-end mb-2">
            <span className="text-4xl font-extrabold text-white">CAD 7.99</span>
            <span className="text-gray-300 ml-1 text-lg">/month</span>
          </div>
          <div className="mb-4 text-gray-300">Unlimited audio track creation, for multi-goal manifestors.</div>
          <ul className="mb-8 flex-grow space-y-3">
            <li className="flex items-center text-white"><span className="text-pink-400 mr-2">✔</span><b className="mr-1">Unlimited </b>  audio tracks creation</li>
            <li className="flex items-center text-white"><span className="text-pink-400 mr-2">✔</span>Access to full music + voice library</li>
            <li className="flex items-center text-white"><span className="text-pink-400 mr-2">✔</span>High-definition audio quality</li>
            <li className="flex items-center text-white"><span className="text-pink-400 mr-2">✔</span>Edit your tracks anytime</li>
            <li className="flex items-center text-white"><span className="text-pink-400 mr-2">✔</span>Ideal for active manifestors and daily listeners</li>
          </ul>
          <CheckoutButton
            priceId={STRIPE_PRICE_IDS.subscription}
            mode="subscription"
            variant="primary"
            className="w-full text-black font-semibold bg-gradient-to-r from-pink-200 to-pink-500 hover:from-pink-300 hover:to-pink-600 rounded-lg py-3 mt-2"
            colorIndices={[0, 1]}
            gradientDirection="to right"
          >
            Start Subscription
          </CheckoutButton>
        </div>
      </div>

      {/* <div className="mt-16 glass-card p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>

        <div className="max-w-3xl mx-auto mt-8 space-y-6 text-left">
          <div>
            <h3 className="text-xl font-semibold mb-2">What happens to my audio tracks if I cancel my subscription?</h3>
            <p className="text-gray-300">
              If you cancel your subscription, you'll lose access to your created audio tracks. However, we offer the
              option to purchase your favorite tracks at 50% off the regular price ($22.50 per track) so you can keep
              them forever.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Is there a free trial?</h3>
            <p className="text-gray-300">
              Yes, we offer a 7-day free trial for our subscription plan. You can create up to 3 subliminal audio tracks
              during your trial period.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Which option is better for me?</h3>
            <p className="text-gray-300">
              If you plan to create more than one audio track, the subscription is likely your best value. For just
              $7.99/month, you can create unlimited tracks, compared to $45 for a single track with the pay-per-audio
              option.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">How do I cancel my subscription?</h3>
            <p className="text-gray-300">
              You can cancel your subscription at any time from your account settings. Before cancellation is complete,
              we'll offer you the option to purchase your created tracks at a 50% discount.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <CheckoutButton
            priceId={STRIPE_PRICE_IDS.subscription}
            mode="subscription"
            variant="primary"
            colorIndices={[0, 1]}
            gradientDirection="to right"
          >
            Start Your Free Trial
          </CheckoutButton>
        </div>
      </div> */}
    </div>
  )
}
