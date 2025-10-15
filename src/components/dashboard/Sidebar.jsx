"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import Image from "next/image";

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const fullPath = `${pathname}${searchParams.toString() ? "?" + searchParams.toString() : ""}`;

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Handle mobile sidebar close on navigation
  const handleMobileNavigation = (href) => {
    if (isMobile && isOpen) {
      onClose?.()
    }
    // Let the Link handle the navigation
  }

  // Check if user is admin - adjust based on your user structure
  const isAdmin = user?.role === "admin"

  const handleLogout = async () => {
    logout()
    router.push("/")
  }

  // Get user's full name or fallback to email
  const getUserDisplayName = () => {
    if (!user) return "User"

    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    } else if (user.firstName) {
      return user.firstName
    } else if (user.lastName) {
      return user.lastName
    } else {
      return user.email || "User"
    }
  }

  // Get user's initials for the avatar
  const getUserInitials = () => {
    if (!user) return "U"

    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0).toUpperCase()}${user.lastName.charAt(0).toUpperCase()}`
    } else if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase()
    } else if (user.lastName) {
      return user.lastName.charAt(0).toUpperCase()
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase()
    } else {
      return "U"
    }
  }

  const menuItems = [
    {
      title: "Dashboard",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
      href: "/dashboard",
      forAll: true,
    },
    {
      title: "My Audios",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
        </svg>
      ),
      href: "/dashboard/audios",
      forAll: true,
    },
    {
      title: "Favorites",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            clipRule="evenodd"
          />
        </svg>
      ),
      href: "/dashboard/audios?tab=favorites",
      forAll: true,
    },
    {
      title: "Create New",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
      ),
      href: "/create",
      forAll: true,
    },
    {
      title: "Music Library",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
      ),
      href: "/dashboard/music",
      forAdmin: true,
    },
    {
      title: "Frequency",
      icon: (
         <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M3 12h2v4H3v-4zm4-6h2v16H7V6zm4 4h2v12h-2V10zm4-6h2v18h-2V4zm4 8h2v10h-2V12zm4-2h2v12h-2V10z" />
          </svg>
      ),
      href: "/dashboard/frequency",
      forAdmin: true,
    },
    {
      title: "Content Management",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      ),
      href: "/dashboard/content",
      forAdmin: true,
    },
    {
      title: "User Management",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      ),
      href: "/dashboard/users",
      forAdmin: true,
    },
    {
      title: "Settings",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
            clipRule="evenodd"
          />
        </svg>
      ),
      href: "/dashboard/settings",
      forAll: true,
    },
    {
      title: "Themes",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77c-.28 0-.5.22-.5.5c0 .12.05.23.13.33c.41.47.64 1.06.64 1.67A2.5 2.5 0 0 1 12 22m0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5a.54.54 0 0 0-.14-.35c-.41-.46-.63-1.05-.63-1.65a2.5 2.5 0 0 1 2.5-2.5H16c2.21 0 4-1.79 4-4c0-3.86-3.59-7-8-7" /><circle cx="6.5" cy="11.5" r="1.5" fill="currentColor" /><circle cx="9.5" cy="7.5" r="1.5" fill="currentColor" /><circle cx="14.5" cy="7.5" r="1.5" fill="currentColor" /><circle cx="17.5" cy="11.5" r="1.5" fill="currentColor" /></svg>
      ),
      href: "/dashboard/themes",
      forAdmin: true,
    },
    {
      title: "All Payments",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-badge-dollar-sign-icon lucide-badge-dollar-sign"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg>
      ),
      href: isAdmin ? "/dashboard/admin/payments" : "/dashboard/payments",
      forAll: true,
    },
    {
      title: isAdmin ? "All Subscriptions" : "My Subscriptions",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-check-icon lucide-calendar-check"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="m9 16 2 2 4-4" /></svg>
      ),
      href: isAdmin ? "/dashboard/admin/subscriptions" : "/dashboard/subscriptions",
      forAll: true,
    },

    {
      title: "All Payments",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-badge-dollar-sign-icon lucide-badge-dollar-sign"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg>
      ),
      href: "/dashboard/payments",
      forAdmin: false,
    },
    {
      title: "All Subscriptions",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-check-icon lucide-calendar-check"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /><path d="m9 16 2 2 4-4" /></svg>
      ),
      href: "/dashboard/subscriptions",
      forAdmin: false,
    },

    {
      title: "Logout",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
            clipRule="evenodd"
          />
        </svg>
      ),
      action: handleLogout,
      forAll: true,
    },
  ]

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => item.forAll || (item.forAdmin && isAdmin))
  
  // Don't render sidebar on mobile if it's not open
  if (isMobile && !isOpen) {
    return null
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        h-screen bg-gray-900 text-white transition-all duration-300 overflow-auto z-[100]
        ${isMobile 
          ? 'fixed top-0 left-0 z-50 w-64 transform transition-transform duration-300 translate-x-0' 
          : `relative ${isCollapsed ? "w-20" : "w-64"}`
        }
      `}
        style={{
          scrollbarWidth: "none"
        }}>
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {(!isCollapsed || isMobile) && <div className="text-xl font-bold text-primary">
          <Image
            src={"/images/logowhiteNew.png"}
            alt="Logo"
            width={120}
            height={20}
            className="h-full cursor-pointer"
            style={{
              height: "auto",
            }}
            onClick={() => router.push("/")}
          />
        </div>}
        
        <div className="flex items-center space-x-2">
          {/* Mobile close button */}
          {isMobile && (
            <button 
              onClick={onClose} 
              className="p-2 rounded-md hover:bg-gray-800 md:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
          
          {/* Desktop collapse button */}
          {!isMobile && (
            <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-md hover:bg-gray-800">
              {isCollapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="py-4">
        {isAdmin && (!isCollapsed || isMobile) && (
          <div className="px-4 py-2 mb-4 bg-primary/20 text-sm rounded-md mx-4">Admin Dashboard</div>
        )}

        <ul className="space-y-2">
          {filteredMenuItems.map((item, index) => (
            <li key={index}>
              {item.href ? (
                <Link
                  href={item.href}
                  onClick={() => handleMobileNavigation(item.href)}
                  className={`flex items-center px-4 py-3  transition-colors ${(isCollapsed && !isMobile) ? "justify-center" : "space-x-3"
                    } ${fullPath === item.href ? "bg-white/20" : "hover:bg-gray-800"} `}
                >
                  <span className="text-gray-300">{item.icon}</span>
                  {(!isCollapsed || isMobile) && <span>{item.title}</span>}
                </Link>
              ) : (
                <button
                  onClick={() => {
                    if (isMobile && isOpen) {
                      onClose?.()
                    }
                    item.action()
                  }}
                  className={`flex items-center px-4 py-3 hover:bg-gray-800 transition-colors w-full ${(isCollapsed && !isMobile) ? "justify-center" : "space-x-3"
                    }`}
                >
                  <span className="text-gray-300">{item.icon}</span>
                  {(!isCollapsed || isMobile) && <span>{item.title}</span>}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full border-t border-gray-800 p-4 bg-[#1d4f59] mb-20">
        <div className={`flex ${(isCollapsed && !isMobile) ? "justify-center" : "items-center space-x-3"}`}>
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            {getUserInitials()}
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="overflow-hidden">
              <div className="font-medium truncate">{getUserDisplayName()}</div>
              <div className="text-sm text-gray-400">
                {user?.subscription ? <span className="capitalize">{user?.subscription}</span> : "Free"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  )
}

