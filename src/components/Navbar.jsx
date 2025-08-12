"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useTheme } from "@/context/ThemeContext"
import Image from "next/image"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const pathname = usePathname()
  const { user, logout } = useAuth()
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
  const primaryColor = getThemeColor(0, "#4169E1") // Primary
  const secondaryColor = getThemeColor(1, "#87CEEB") // Secondary
  const accentColor = getThemeColor(2, "#1E90FF") // Accent (dodger blue)
  const mutedColor = getThemeColor(3, "#6495ED") // Muted (cornflower blue)

  // Dynamic gradient styles
  const primaryGradient = `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`

  const isActive = (path) => pathname === path

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    setIsMenuOpen(false)
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Create CSS variables for theme colors
  const cssVars = {
    "--primary-color": "primaryColor",
    "--secondary-color": secondaryColor,
  }

  return (
    <nav
      className={`${pathname=="/" ? "fixed" : "relative"} w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-[#000]/70 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
      style={cssVars}
    >
      <div className="container mx-auto px-6 py-5 mb-0">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 justify-between">
            <div
              className="rounded-full"
            >
              <Image
                  src={"/images/logowhite.png"}
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
           
              <>
                <Link
                  href="/create"
                  className={`hover:text-opacity-80 transition-colors`}
                  style={{
                    color: isActive("/create") ? "#1afbff" : "rgb(209, 213, 219)",
                    "&:hover": { color: primaryColor },
                  }}
                >
                  Create Audio
                </Link>
                {/* {user && (
                  <Link
                    href="/dashboard"
                    className={`hover:text-opacity-80 transition-colors ${isActive("/dashboard") ? "text-opacity-1" : "text-opacity-1"}`}
                    style={{
                    color: isActive("/dashboard") ? "#1afbff" : "rgb(209, 213, 219)",
                    "&:hover": { color: primaryColor },
                  }}
                  >
                    Dashboard
                  </Link> 
                )} */}
              </>
           

            {/* <Link
              href="/pricing"
              className="text-gray-300 hover:text-opacity-80 font-medium transition-colors"
              style={{
                color: isActive("/pricing") ? accentColor : "rgb(209, 213, 219)",
                "&:hover": { color: primaryColor },
              }}
            >
              Pricing
            </Link> */}
            <Link
              href="/faq"
              className="text-gray-300 hover:text-opacity-80 font-medium transition-colors"
              style={{
                color: isActive("/faq") ? "#1afbff" : "rgb(209, 213, 219)",
                "&:hover": { color: primaryColor },
              }}
            >
              FAQ
            </Link>
            <Link
              href="/contact"
              className={`hover:text-opacity-80 transition-colors ${isActive("/contact") ? "text-opacity-100" : "text-opacity-90"}`}
              style={{
                color: isActive("/contact") ? "#1afbff" : "rgb(209, 213, 219)",
                "&:hover": { color: primaryColor },
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              Contact Us
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-white hover:text-opacity-80 transition-colors"
                  style={{ "&:hover": { color: primaryColor } }}
                >
                  <span>{user.firstName}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth"
                className=" px-4 py-2 rounded-md transition-colors bg-gradient-to-r from-[#e4ffa8]/70 to-[#b1d239]/70 hover:font-bold"
                // style={{
                //   backgroundColor: primaryColor,
                //   "&:hover": { backgroundColor: `${primaryColor}DD` },
                // }}
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Navigation Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 focus:outline-none"
              aria-label="Toggle menu"
            >
              {!isOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 bg-gray-800 rounded-xl shadow-lg p-4 animate-fade-in border border-gray-700">
            <div className="flex flex-col space-y-4">
              <Link
                href="/pricing"
                className="text-gray-300 hover:text-opacity-80 font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                style={{ "&:hover": { color: primaryColor } }}
                onClick={() => setIsOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/faq"
                className="text-gray-300 hover:text-opacity-80 font-medium px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                style={{ "&:hover": { color: primaryColor } }}
                onClick={() => setIsOpen(false)}
              >
                FAQ
              </Link>
              <Link
                href="/contact"
                className={`hover:text-opacity-80 transition-colors px-4 py-2 rounded-lg hover:bg-gray-700 ${isActive("/contact") ? "text-opacity-100" : "text-opacity-90"}`}
                style={{ color: isActive("/contact") ? primaryColor : "rgb(209, 213, 219)" }}
                onClick={() => {
                  setIsMenuOpen(false)
                  setIsOpen(false)
                }}
              >
                Contact Us
              </Link>

              {user && (
                <>
                  <Link
                    href="/create"
                    className={`hover:text-opacity-80 transition-colors px-4 py-2 rounded-lg hover:bg-gray-700 ${isActive("/create") ? "text-opacity-100" : "text-opacity-90"}`}
                    style={{ color: isActive("/create") ? primaryColor : "rgb(209, 213, 219)" }}
                    onClick={() => {
                      setIsMenuOpen(false)
                      setIsOpen(false)
                    }}
                  >
                    Create Audio
                  </Link>
                  <Link
                    href="/dashboard"
                    className={`hover:text-opacity-80 transition-colors px-4 py-2 rounded-lg hover:bg-gray-700 ${isActive("/dashboard") ? "text-opacity-100" : "text-opacity-90"}`}
                    style={{ color: isActive("/dashboard") ? primaryColor : "rgb(209, 213, 219)" }}
                    onClick={() => {
                      setIsMenuOpen(false)
                      setIsOpen(false)
                    }}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className={`hover:text-opacity-80 transition-colors px-4 py-2 rounded-lg hover:bg-gray-700 ${isActive("/profile") ? "text-opacity-100" : "text-opacity-90"}`}
                    style={{ color: isActive("/profile") ? primaryColor : "rgb(209, 213, 219)" }}
                    onClick={() => {
                      setIsMenuOpen(false)
                      setIsOpen(false)
                    }}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-left text-gray-300 hover:text-opacity-80 px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                    style={{ "&:hover": { color: primaryColor } }}
                  >
                    Sign Out
                  </button>
                </>
              )}

              {!user && (
                <Link
                  href="/auth"
                  className="text-white px-4 py-2 rounded-md text-center transition-colors bg-[#b1d239]/80 hover:bg-[#b1d239]/60"
                  // style={{
                  //   backgroundColor: primaryColor,
                  //   "&:hover": { backgroundColor: `${primaryColor}DD` },
                  // }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

