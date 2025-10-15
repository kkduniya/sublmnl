
import { SubscriptionsTable } from "@/components/stripe/admin/SubscriptionsTable"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminSubscriptionsPage() {
  return (
    <div className="space-y-6 sm:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground">Manage and view all user subscriptions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
          <CardDescription>View and manage all active and inactive subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionsTable isAdmin={true} />
        </CardContent>
      </Card>
    </div>
  )
}
