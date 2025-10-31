"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

export function PaymentsTable({ isAdmin = false, userId }) {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  })

  useEffect(() => {
    setPage(1) // Reset to page 1 when filters change
  }, [searchTerm, statusFilter, typeFilter, isAdmin, userId])

  useEffect(() => {
    fetchPayments()
  }, [page, searchTerm, statusFilter, typeFilter, isAdmin, userId])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (isAdmin) params.append("admin", "true")
      if (userId) params.append("userId", userId)
      params.append("page", page.toString())
      params.append("limit", "10")
      if (searchTerm) params.append("search", searchTerm)
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (typeFilter !== "all") params.append("type", typeFilter)

      const response = await fetch(`/api/admin/payments?${params}`)
      const data = await response.json()

      if (response.ok) {
        setPayments(data.payments)
        setPagination(data.pagination || pagination)
      } else {
        console.error("Failed to fetch payments:", data.error)
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const variants = {
      succeeded: "default",
      pending: "secondary",
      failed: "destructive",
    }

    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  const getTypeBadge = (type) => {
    return <Badge variant={type === "subscription" ? "outline" : "secondary"}>{type}</Badge>
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading payments...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="succeeded">Succeeded</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="one-time">One-time</SelectItem>
            <SelectItem value="subscription">Subscription</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment ID</TableHead>
              {isAdmin && <TableHead>User</TableHead>}
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total Audios</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-muted-foreground">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell className="font-mono text-sm">{payment.stripePaymentId?.slice(-12)}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.user?.firstName || "Unknown"}</div>
                        <div className="text-sm text-muted-foreground">{payment.user?.email}</div>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: payment.currency.toUpperCase(),
                    }).format(payment.amount)}
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="capitalize whitespace-nowrap">{getTypeBadge(payment?.metadata?.purchaseType ? "multiple audio purchase" : "single audio purchase")}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatDistanceToNow(new Date(payment.createdAt), { addSuffix: true })}</TableCell>
                  <TableCell className="whitespace-nowrap">{payment?.metadata?.totalAudios ? `${payment?.metadata?.totalAudios} audio tracks` : "1 audio track"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="">
          <div className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} results
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={(e) => {
                    e.preventDefault()
                    if (pagination.hasPrevPage) setPage((p) => Math.max(1, p - 1))
                  }}
                  className={!pagination.hasPrevPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1
                } else if (pagination.page <= 3) {
                  pageNum = i + 1
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i
                } else {
                  pageNum = pagination.page - 2 + i
                }
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      onClick={(e) => {
                        e.preventDefault()
                        setPage(pageNum)
                      }}
                      isActive={pagination.page === pageNum}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                )
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={(e) => {
                    e.preventDefault()
                    if (pagination.hasNextPage) setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }}
                  className={!pagination.hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}
