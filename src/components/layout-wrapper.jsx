"use client"

import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export function LayoutWrapper({ children }) {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  // Check if the current path is a dashboard path
  const isDashboardPath = pathname.startsWith("/dashboard")
  
  // Check if on create page and user is authenticated
  const isCreatePageWithAuth = pathname.startsWith("/create") && status === "authenticated"

  // If it's a dashboard path or authenticated create page, don't render Navbar and Footer
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

