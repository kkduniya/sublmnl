"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ServerSideDataTable } from "@/components/ui/server-side-data-table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function UserManagementPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortConfig, setSortConfig] = useState({ field: "createdAt", order: "desc" })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const [adminCount, setAdminCount] = useState(0)

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        sortField: sortConfig.field,
        sortOrder: sortConfig.order,
      })

      const response = await fetch(`/api/admin/users?${params}`)
      const data = await response.json()

      if (data.success) {
        setUsers(data.data)
        setPagination(data.pagination)
        setAdminCount(data?.totalAdminCount)
      } else {
        setError(data.message || "Failed to fetch users")
      }
    } catch (error) {
      setError("An error occurred while fetching users")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [pagination.page, pagination.limit, searchTerm, sortConfig.field, sortConfig.order])

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== "admin") {
      router.push("/dashboard/audios")
    }
  }, [user, router])

  useEffect(() => {
    if (user && user.role === "admin") {
      // Debounce search
      const timeoutId = setTimeout(() => {
        fetchUsers()
      }, 300)

      return () => clearTimeout(timeoutId)
    }
  }, [fetchUsers, user])

  const handleToggleAdmin = async (userId, isCurrentlyAdmin) => {
    try {
      const response = await fetch(`/api/admin/users?id=${userId}`, {
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

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page on search
  }

  const handleSort = (field) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc"
    }))
    setPagination(prev => ({ ...prev, page: 1 })) // Reset to first page on sort
  }

  const handleDeleteClick = (user) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      setIsDeleting(true)
      setError("")

      const response = await fetch(`/api/admin/users?id=${userToDelete._id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        setDeleteDialogOpen(false)
        setUserToDelete(null)
        // Refresh the users list
        fetchUsers()
      } else {
        setError(data.message || "Failed to delete user")
      }
    } catch (error) {
      setError("An error occurred while deleting user")
      console.error(error)
    } finally {
      setIsDeleting(false)
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
      key: "subscription",
      header: "Subscription",
      render: (user) => <span className="capitalize">{user.subscription === "premium" ? "Sublmnl Membership" : "No active subscription" }</span>,
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
            className={`px-3 py-1 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
              user.role === "admin"
                ? "bg-red-600/20 text-red-400 hover:bg-red-600/30"
                : "bg-primary/20 text-primary hover:bg-primary/30"
            }`}
            disabled={adminCount <= 1 && user.role === "admin"}
            title={adminCount <= 1 && user.role === "admin" ? "You must have at least one admin" : ""}
          >
            {user.role === "admin" ? "Remove Admin" : "Make Admin"}
          </button>
          {
            user.role !== "admin" && 
            <button
              onClick={() => handleDeleteClick(user)}
              className={`px-3 py-1 rounded-md text-sm ${
                "bg-red-600/20 text-red-400 hover:bg-red-600/30"
              }`}
            >
              Delete User
            </button>
          }
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
          <ServerSideDataTable
            data={users}
            columns={columns}
            keyExtractor={(user) => user._id}
            pagination={pagination}
            onPageChange={handlePageChange}
            onSearch={handleSearch}
            onSort={handleSort}
            sortConfig={sortConfig}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-200">
              Are you sure you want to delete <span className="font-semibold text-white">
                {userToDelete ? `${userToDelete.firstName || ""} ${userToDelete.lastName || ""}`.trim() || userToDelete.email : ""}
              </span>? 
               This will:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Cancel all active subscriptions (at period end)</li>
                <li>Delete all audios created by this user</li>
                <li>Permanently delete the user account</li>
              </ul>
              <span className="font-semibold text-red-400 mt-2 block">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

