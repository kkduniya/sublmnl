"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, CreditCard, Users, TrendingUp } from "lucide-react"

export function PaymentStatsData() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPayments: 0,
    uniqueCustomers: 0,
    successRate: 0,
    loading: true,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/payments?admin=true")
      const data = await response.json()

      if (response.ok) {
        const payments = data.payments
        const successfulPayments = payments.filter((p) => p.status === "succeeded")
        const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0)
        const uniqueCustomers = new Set(payments.map((p) => p.userId.toString())).size
        const successRate = payments.length > 0 ? (successfulPayments.length / payments.length) * 100 : 0

        setStats({
          totalRevenue: totalRevenue / 100, // Convert from cents
          totalPayments: payments.length,
          uniqueCustomers,
          successRate: Math.round(successRate),
          loading: false,
        })
      }
    } catch (error) {
      console.error("Error fetching payment stats:", error)
      setStats((prev) => ({ ...prev, loading: false }))
    }
  }

  if (stats.loading) {
    return <div>Loading stats...</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${stats.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground">From all successful payments</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPayments.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">All payment attempts</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.uniqueCustomers.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Users who made payments</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.successRate}%</div>
          <p className="text-xs text-muted-foreground">Payment success rate</p>
        </CardContent>
      </Card>
    </div>
  )
}
