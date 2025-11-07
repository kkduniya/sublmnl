"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Sidebar from "@/components/dashboard/Sidebar"
import Navbar from "@/components/Navbar"

export default function DashboardLayout({ children }) {
  const { user, loading, status, requireAuth } = useAuth()
  const router = useRouter()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // Close mobile sidebar when switching to desktop
      if (!mobile) {
        setIsMobileSidebarOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const isAuthenticated = requireAuth()

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/auth")
    }
  }, [isAuthenticated, loading, router])

  if (loading || status === "loading" || !isAuthenticated || (isAuthenticated && !user)) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="flex items-center space-x-3 text-white">
          <svg
            className="h-6 w-6 animate-spin text-primary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <span className="text-sm text-gray-300">Loading ...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={() => setIsMobileSidebarOpen(false)} 
      />
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar inside main content area - fixed at top */}
        {
          isMobile ? (
            <div className="flex-shrink-0 bg-gray-950 border-b border-gray-800 p-4 md:hidden">
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-2 rounded-md hover:bg-gray-800 text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex-shrink-0">
              <Navbar from="dashboard" />
            </div>
          )
        }
        
        {/* Scrollable content area */}
        <div className="flex-1 overflow-auto p-6 md:p-10">{children}</div>
      </main>
    </div>
  )
}

