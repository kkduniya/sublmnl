"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MoreHorizontal } from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useAuth } from "@/context/AuthContext"

export function SubscriptionsTable({ isAdmin = false }) {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { user } = useAuth()

  // State for dialogs
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false)
  const [postCancelOpen, setPostCancelOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState(null)

  useEffect(() => {
    fetchSubscriptions()
  }, [isAdmin, user?.id])

  const fetchSubscriptions = async () => {
    try {
      const params = new URLSearchParams()
      if (isAdmin) params.append("admin", "true")

      const response = await fetch(`/api/admin/subscriptions?${params}`)
      const data = await response.json()

      if (response.ok) {
        setSubscriptions(data.subscriptions)
      } else {
        console.error("Failed to fetch subscriptions:", data.error)
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!selectedSubscription) return

    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId: selectedSubscription.stripeSubscriptionId }),
      })

      if (response.ok) {
        await fetchSubscriptions()
        setConfirmCancelOpen(false)
        setPostCancelOpen(true)
      } else {
        console.error("Failed to cancel subscription")
      }
    } catch (error) {
      console.error("Error canceling subscription:", error)
    }
  }

  const handleReactivateSubscription = async (subscriptionId) => {
    try {
      const response = await fetch("/api/stripe/reactivate-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId }),
      })

      if (response.ok) {
        fetchSubscriptions()
        setPostCancelOpen(false)
      } else {
        console.error("Failed to reactivate subscription")
      }
    } catch (error) {
      console.error("Error reactivating subscription:", error)
    }
  }

  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const matchesSearch =
      subscription.stripeSubscriptionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscription.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || subscription.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status) => {
    const variants = {
      active: "default",
      canceled: "destructive",
      past_due: "destructive",
      unpaid: "destructive",
      incomplete: "secondary",
      incomplete_expired: "destructive",
      trialing: "outline",
    }

    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>
  }

  // Add a new function for cancelAtPeriodEnd badge
  const getCancelStatusBadge = (cancelAtPeriodEnd) => {
    return cancelAtPeriodEnd ? (
      <Badge variant="destructive">Cancels at period end</Badge>
    ) : (
      <Badge variant="outline">Renews automatically</Badge>
    )
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading subscriptions...</div>
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search subscriptions..."
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
            <SelectItem value="past_due">Past Due</SelectItem>
            <SelectItem value="trialing">Trialing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subscription ID</TableHead>
              {isAdmin && <TableHead>User</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead>Cancellation Status</TableHead>
              <TableHead>Current Period</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-muted-foreground">
                  No subscriptions found
                </TableCell>
              </TableRow>
            ) : (
              filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription._id}>
                  <TableCell className="font-mono text-sm">{subscription.stripeSubscriptionId.slice(-12)}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div>
                        <div className="font-medium">{subscription.user?.firstName || "Unknown"}</div>
                        <div className="text-sm text-muted-foreground">{subscription.user?.email}</div>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                  <TableCell>{getCancelStatusBadge(subscription.cancelAtPeriodEnd)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{format(new Date(subscription.currentPeriodStart), "MMM dd, yyyy")}</div>
                      <div className="text-muted-foreground">
                        to {format(new Date(subscription.currentPeriodEnd), "MMM dd, yyyy")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatDistanceToNow(new Date(subscription.createdAt), { addSuffix: true })}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!subscription.cancelAtPeriodEnd && (
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedSubscription(subscription)
                              setConfirmCancelOpen(true)
                            }}
                            disabled={subscription.userId !== user?.id}
                            className={`${subscription.userId !== user?.id ? "cursor-not-allowed" : "cursor-pointer"}`}
                          >
                            Cancel Subscription Renewal
                          </DropdownMenuItem>
                        )}
                        {subscription.cancelAtPeriodEnd && (
                          <DropdownMenuItem
                            disabled={subscription.userId !== user?.id}
                            className={`${subscription.userId !== user?.id ? "cursor-not-allowed" : "cursor-pointer"}`}
                            onClick={() => handleReactivateSubscription(subscription.stripeSubscriptionId)}
                          >
                            Reactivate Subscription Renewal
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirm Cancel Dialog */}
      <Dialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to cancel?</DialogTitle>
            <DialogDescription>
              By canceling, you’ll lose access to Sublmnl’s affirmations after your current billing cycle.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setConfirmCancelOpen(false)}>Keep My Subscription</Button>
            <Button variant="secondary" onClick={handleCancelSubscription}>
              Yes, Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post-Cancel Message Dialog */}
      <Dialog open={postCancelOpen} onOpenChange={setPostCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>We’re sorry to see you go!</DialogTitle>
            <DialogDescription>
              Your subscription has been canceled. You’ll continue to have access to Sublmnl until{" "}
              {selectedSubscription && format(new Date(selectedSubscription.currentPeriodEnd), "MMM dd, yyyy")}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => handleReactivateSubscription(selectedSubscription.stripeSubscriptionId)}>
              Changed your mind? Reactivate Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
