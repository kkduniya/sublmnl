import { formatDistanceToNow, format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function ActiveSubscriptions({ subscriptions }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Subscriptions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {!subscriptions || subscriptions.length === 0 ? (
            <p className="text-center text-muted-foreground">No active subscriptions found</p>
          ) : (
            subscriptions.map((subscription) => (
              <div key={subscription._id} className="flex items-center">
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {subscription.user?.name || subscription.userId?.name || 
                     subscription.user?.email || subscription.userId?.email || "Unknown User"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Started {formatDistanceToNow(new Date(subscription.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="ml-auto text-sm text-right">
                  <p>Renews on</p>
                  <p className="font-medium">{format(new Date(subscription.currentPeriodEnd), "MMM d, yyyy")}</p>
                </div>
                <div className="ml-4">
                  <Badge 
                    variant={
                      subscription.status === "active" ? "default" : 
                      subscription.status === "canceled" ? "destructive" : 
                      subscription.status === "past_due" ? "warning" : 
                      "outline"
                    }
                  >
                    {subscription.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}