
"use client"

import { useState } from "react"
import { SubscriptionsTable } from "@/components/stripe/admin/SubscriptionsTable"
import { ActiveSubscriptionCard } from "@/components/stripe/account/ActiveSubscriptionCard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

export default function UserSubscriptionsPage() {
  const [showAllSubscriptions, setShowAllSubscriptions] = useState(false)
  const [isManagementScreenActive, setIsManagementScreenActive] = useState(false)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing details</p>
      </div>

      {/* Active Subscription Card */}
      <div className="space-y-4">
        <ActiveSubscriptionCard onManagementStateChange={setIsManagementScreenActive} />
        
        {/* View All Button - Only show when management screen is not active */}
        {!isManagementScreenActive && (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              onClick={() => setShowAllSubscriptions(!showAllSubscriptions)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            >
              {showAllSubscriptions ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Hide All Subscriptions
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  View All Subscriptions
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* All Subscriptions Table - Only show when management screen is not active */}
      {!isManagementScreenActive && showAllSubscriptions && (
        <Card>
          <CardHeader>
            <CardTitle>All Subscriptions</CardTitle>
            <CardDescription>View and manage all your subscription history</CardDescription>
          </CardHeader>
          <CardContent>
            <SubscriptionsTable isAdmin={false} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
