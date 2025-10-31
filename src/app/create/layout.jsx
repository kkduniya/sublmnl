"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import Sidebar from "@/components/dashboard/Sidebar"
import Navbar from "@/components/Navbar"

export default function CreateLayout({ children }) {
  const { data: session, status } = useSession()
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) {
        setIsMobileSidebarOpen(false)
      }
    }
    
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Use session status to avoid flash - render nothing during initial load
  // NextAuth's useSession is optimized to minimize loading time
  const isLoggedIn = status === "authenticated"
  
  // If user is logged in, show dashboard-style layout
  if (isLoggedIn) {
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
          <div className="flex-1 overflow-auto p-6 md:p-10">
            {/* Wrap children to adjust padding/margins */}
            <div className="min-h-screen">
              <div className="w-full max-w-7xl mx-auto">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // If not logged in or still loading, show regular layout (will have Navbar/Footer from layout-wrapper)
  return children
}

