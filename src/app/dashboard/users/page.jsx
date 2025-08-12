"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DataTable } from "@/components/ui/data-table"

export default function UserManagementPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== "admin") {
      router.push("/dashboard")
    }

    fetchUsers()
  }, [user, router])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/admin/users")
      const data = await response.json()

      if (data.success) {
        setUsers(data.users)
      } else {
        setError(data.message || "Failed to fetch users")
      }
    } catch (error) {
      setError("An error occurred while fetching users")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleAdmin = async (userId, isCurrentlyAdmin) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: isCurrentlyAdmin ? "user" : "admin",
        }),
      })

      const data = await response.json()

      if (data.success) {
        fetchUsers()
      } else {
        setError(data.message || "Failed to update user role")
      }
    } catch (error) {
      setError("An error occurred while updating user role")
      console.error(error)
    }
  }

  // Define columns for the DataTable
  const columns = [
    {
      key: "firstName",
      header: "Name",
      render: (user) => `${user.firstName || ""} ${user.lastName || ""}`.trim() || "-",
      sortable: true,
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
    },
    {
      key: "role",
      header: "Role",
      render: (user) => <span className="capitalize">{user.role}</span>,
      sortable: true,
    },
    {
      key: "subscription.plan",
      header: "Subscription",
      render: (user) => <span className="capitalize">{user.subscription?.plan || "Free"}</span>,
      sortable: true,
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (user) => new Date(user.createdAt).toLocaleDateString(),
      sortable: true,
    },
    {
      key: "actions",
      header: "Actions",
      render: (user) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleToggleAdmin(user._id, user.role === "admin")}
            className={`px-3 py-1 rounded-md text-sm ${
              user.role === "admin"
                ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                : "bg-primary/20 text-primary hover:bg-primary/30"
            }`}
          >
            {user.role === "admin" ? "Remove Admin" : "Make Admin"}
          </button>
          <Link
            href={`/dashboard/users/${user._id}`}
            className="px-3 py-1 bg-gray-700/50 hover:bg-gray-700 rounded-md text-sm"
          >
            View Details
          </Link>
        </div>
      ),
    },
  ]

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">User Management</h1>
      </div>

      {error && <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4 text-red-200">{error}</div>}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <svg
            className="animate-spin h-8 w-8 text-primary"
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
        </div>
      ) : (
        <div className="glass-card p-6">
          <DataTable
            data={users}
            columns={columns}
            keyExtractor={(user) => user._id}
            searchKeys={["firstName", "lastName", "email", "role"]}
            pageSize={10}
          />
        </div>
      )}
    </div>
  )
}

