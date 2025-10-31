"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import Sidebar from "@/components/dashboard/Sidebar"
import Navbar from "@/components/Navbar"

export default function DashboardLayout({ children }) {
  const { user, requireAuth } = useAuth()
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

  // Ensure user is authenticated
  if (!user) {
    requireAuth()
    return null
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

