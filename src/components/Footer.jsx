"use client"

import Link from "next/link"
import { useTheme } from "@/context/ThemeContext"
import Image from "next/image"

export default function Footer() {
  const { currentTheme } = useTheme()
  const currentYear = new Date().getFullYear()

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
  const primaryColor = getThemeColor(0, "#4169E1") // Primary
  const secondaryColor = getThemeColor(1, "#87CEEB") // Secondary

  // Dynamic gradient styles
  const primaryGradient = `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`

  return (
    <footer className="border-t border-gray-800">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <div
                className="rounded-full flex items-center justify-between"
              >
                <Image
                  src={"/images/logowhiteNew.png"}
                  alt="Logo"
                  width={120}
                  height={20}
                  className="h-full"
                  style={{
                    height: "auto",
                  }}
                />
              </div>

            </Link>
            <p className="mt-4 text-gray-400">
              Unlock your potential with personalized subliminal audio tracks designed to transform your mindset.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/create"
                  className="text-gray-400 transition-colors hover:text-gray-200"
                  style={{ "&:hover": { color: primaryColor } }}
                >
                  Create Audio
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/audios"
                  className="text-gray-400 transition-colors hover:text-gray-200"
                  style={{ "&:hover": { color: primaryColor } }}
                >
                  My Library
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-gray-400 transition-colors hover:text-gray-200"
                  style={{ "&:hover": { color: primaryColor } }}
                >
                  Pricing
                </Link>
              </li>

            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">

              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 transition-colors hover:text-gray-200"
                  style={{ "&:hover": { color: primaryColor } }}
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-400 transition-colors hover:text-gray-200"
                  style={{ "&:hover": { color: primaryColor } }}
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-400 transition-colors hover:text-gray-200"
                  style={{ "&:hover": { color: primaryColor } }}
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-400 transition-colors hover:text-gray-200"
                  style={{ "&:hover": { color: primaryColor } }}
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="text-gray-400 transition-colors hover:text-gray-200"
                  style={{ "&:hover": { color: primaryColor } }}
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">© {currentYear} Sublmnl. All rights reserved.</p>

          <div className="flex space-x-6 mt-4 md:mt-0">

            <a
              href="https://www.instagram.com/gosublmnl"
              className="text-gray-400 transition-colors hover:text-[#b1d239]/80"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">Instagram</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                />
              </svg>
            </a>

            <a
              href="https://www.tiktok.com/@gosublmnl"
              className="text-gray-400 transition-colors hover:text-[#b1d239]/80"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="sr-only">TikTok</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 449.45 515.38" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                  fillRule="nonzero"
                  clipRule="evenodd"
                  d="M382.31 103.3c-27.76-18.1-47.79-47.07-54.04-80.82-1.35-7.29-2.1-14.8-2.1-22.48h-88.6l-.15 355.09c-1.48 39.77-34.21 71.68-74.33 71.68-12.47 0-24.21-3.11-34.55-8.56-23.71-12.47-39.94-37.32-39.94-65.91 0-41.07 33.42-74.49 74.48-74.49 7.67 0 15.02 1.27 21.97 3.44V190.8c-7.2-.99-14.51-1.59-21.97-1.59C73.16 189.21 0 262.36 0 352.3c0 55.17 27.56 104 69.63 133.52 26.48 18.61 58.71 29.56 93.46 29.56 89.93 0 163.08-73.16 163.08-163.08V172.23c34.75 24.94 77.33 39.64 123.28 39.64v-88.61c-24.75 0-47.8-7.35-67.14-19.96z"
                />
              </svg>
            </a>


          </div>
        </div>
      </div>
    </footer>
  )
}

