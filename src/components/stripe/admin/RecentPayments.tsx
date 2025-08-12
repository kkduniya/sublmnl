import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Payment {
  _id: string
  userId: {
    _id: string
    name: string
    email: string
  }
  amount: number
  currency: string
  status: "succeeded" | "pending" | "failed"
  type: "one-time" | "subscription"
  createdAt: string
}

interface RecentPaymentsProps {
  payments: Payment[]
}

export function RecentPayments({ payments }: RecentPaymentsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {payments.length === 0 ? (
            <p className="text-center text-muted-foreground">No payments found</p>
          ) : (
            payments.map((payment) => (
              <div key={payment._id} className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{payment.userId.name || payment.userId.email}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(payment.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="ml-auto font-medium">
                  ${payment.amount.toFixed(2)} {payment.currency.toUpperCase()}
                </div>
                <div className="ml-4">
                  <Badge variant={payment.status === "succeeded" ? "default" : "destructive"}>{payment.status}</Badge>
                </div>
                <div className="ml-2">
                  <Badge variant="outline">{payment.type === "subscription" ? "Sub" : "One-time"}</Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
