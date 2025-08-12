"use client"

import { useAuth } from "@/context/AuthContext"
import Sidebar from "@/components/dashboard/Sidebar"

export default function DashboardLayout({ children }) {
  const { user, requireAuth } = useAuth()

  // Ensure user is authenticated
  if (!user) {
    requireAuth()
    return null
  }

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-10">{children}</div>
      </main>
    </div>
  )
}

