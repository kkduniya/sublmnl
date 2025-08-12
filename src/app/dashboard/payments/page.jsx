
import { PaymentsTable } from "@/components/stripe/admin/PaymentsTable"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">Manage and view all payment transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Payments</CardTitle>
          <CardDescription>View and manage all payment transactions across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentsTable isAdmin={false} />
        </CardContent>
      </Card>
    </div>
  )
}
