
import { SubscriptionsTable } from "@/components/stripe/admin/SubscriptionsTable"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function UserSubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Subscription</h1>
        <p className="text-muted-foreground">Manage your subscription and billing details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscription Details</CardTitle>
          <CardDescription>View and manage your current subscription</CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionsTable isAdmin={false} />
        </CardContent>
      </Card>
    </div>
  )
}
