"use client"

import { CheckoutButton } from "@/components/checkout/CheckoutButton"
import { useTheme } from "@/context/ThemeContext"

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
        <div className="glass-card p-8 border border-gray-700 flex flex-col h-full">
          <h2 className="text-2xl font-bold mb-2">Pay Per Audio</h2>
          <div className="flex items-end mb-4">
            <span className="text-4xl font-bold">$45</span>
            <span className="text-gray-400 ml-1">/audio</span>
          </div>
          <p className="text-gray-300 mb-6">
            One-time payment for those who prefer to own their audio tracks permanently.
          </p>
          <ul className="space-y-4 mb-8 flex-grow">
            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Keep your audio tracks forever</span>
            </li>
            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>High-definition audio quality</span>
            </li>
            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Access to all music tracks and voices</span>
            </li>
            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>No recurring payments</span>
            </li>
            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Perfect for occasional users</span>
            </li>
          </ul>
          <CheckoutButton
            priceId={STRIPE_PRICE_IDS.oneTimeAudio}
            mode="payment"
            variant="outline"
            className="w-full text-white"
            colorIndices={[1, 2]}
          >
            Create Single Audio
          </CheckoutButton>
        </div>

        {/* Subscription Option */}
        <div className="glass-card p-8 border-2 border-primary relative flex flex-col h-full">
          <div
            className="absolute top-0 right-0 bg-primary text-xs font-bold px-3 py-1 transform translate-y-[-50%]"
            style={{ background: secondaryColor }}
          >
            BEST VALUE
          </div>
          <h2 className="text-2xl font-bold mb-2">Monthly Subscription</h2>
          <div className="flex items-end mb-4">
            <span className="text-4xl font-bold">$7.99</span>
            <span className="text-gray-400 ml-1">/month</span>
          </div>
          <p className="text-gray-300 mb-6">Create unlimited audio tracks for a low monthly fee.</p>
          <ul className="space-y-4 mb-8 flex-grow">
            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>
                <strong>Unlimited</strong> audio tracks creation
              </span>
            </li>
            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Access to all premium features</span>
            </li>
            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>High-definition audio quality</span>
            </li>
            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Access to all music tracks and voices</span>
            </li>
            <li className="flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Option to purchase tracks at 50% off if you cancel</span>
            </li>
          </ul>
          <CheckoutButton
            priceId={STRIPE_PRICE_IDS.subscription}
            mode="subscription"
            variant="primary"
            className="w-full"
            colorIndices={[0, 1]}
            gradientDirection="to right"
          >
            Start Subscription
          </CheckoutButton>
        </div>
      </div>

      <div className="mt-16 glass-card p-8 text-center">
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
      </div>
    </div>
  )
}
