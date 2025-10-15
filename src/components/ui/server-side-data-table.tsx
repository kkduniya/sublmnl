"use client"

import type React from "react"
import { useState } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react"

interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface ServerSideDataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  keyExtractor: (item: T) => string | number
  pagination: Pagination
  onPageChange: (page: number) => void
  onSearch: (term: string) => void
  onSort: (field: string) => void
  sortConfig: { field: string; order: "asc" | "desc" }
  isLoading?: boolean
  searchable?: boolean
  className?: string
}

export function ServerSideDataTable<T>({
  data,
  columns,
  keyExtractor,
  pagination,
  onPageChange,
  onSearch,
  onSort,
  sortConfig,
  isLoading = false,
  searchable = true,
  className = "",
}: ServerSideDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("")

  // Helper function to get nested object values (e.g., "user.name")
  const getNestedValue = (obj: any, path: string) => {
    return path.split(".").reduce((prev, curr) => {
      return prev ? prev[curr] : null
    }, obj)
  }

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearch(value)
  }

  // Handle sorting
  const handleSort = (key: string) => {
    onSort(key)
  }

  // Pagination controls
  const goToPage = (page: number) => {
    if (page < 1) page = 1
    if (page > pagination.totalPages) page = pagination.totalPages
    onPageChange(page)
  }

  const startIndex = (pagination.page - 1) * pagination.limit
  const endIndex = Math.min(startIndex + pagination.limit, pagination.total)

  return (
    <div className={`space-y-4 ${className}`}>
      {searchable && (
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="input-field pl-10"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`text-left py-3 px-4 ${column.sortable ? "cursor-pointer hover:bg-gray-800" : ""}`}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && sortConfig.field === column.key && (
                      <span className="ml-1">{sortConfig.order === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-6 text-center text-gray-400">
                  <div className="flex justify-center">
                    <svg
                      className="animate-spin h-6 w-6 text-primary"
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
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-6 text-center text-gray-400">
                  No results found
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={keyExtractor(item)} className="border-b border-gray-700">
                  {columns.map((column) => (
                    <td key={`${keyExtractor(item)}-${column.key}`} className="py-3 px-4">
                      {column.render ? column.render(item) : getNestedValue(item, column.key) || "-"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between flex-col md:flex-row gap-2">
          <div className="text-sm text-gray-400">
            Showing {startIndex + 1}-{endIndex} of {pagination.total} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => goToPage(1)}
              disabled={!pagination.hasPrevPage || isLoading}
              className="p-2 rounded-md bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => goToPage(pagination.page - 1)}
              disabled={!pagination.hasPrevPage || isLoading}
              className="p-2 rounded-md bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => goToPage(pagination.page + 1)}
              disabled={!pagination.hasNextPage || isLoading}
              className="p-2 rounded-md bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => goToPage(pagination.totalPages)}
              disabled={!pagination.hasNextPage || isLoading}
              className="p-2 rounded-md bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
