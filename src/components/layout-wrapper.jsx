"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export function LayoutWrapper({ children }) {
  const pathname = usePathname()

  // Check if the current path is a dashboard path
  const isDashboardPath = pathname.startsWith("/dashboard")

  // If it's a dashboard path, don't render Navbar and Footer
  if (isDashboardPath) {
    return children
  }

  // For all other paths, render Navbar and Footer
  return (
    <>
      <Navbar />
        <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}

