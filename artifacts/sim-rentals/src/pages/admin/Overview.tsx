import { useGetAdminOverview } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Phone, CreditCard, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminOverview() {
  const { data, isLoading, error } = useGetAdminOverview();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-destructive">Failed to load admin overview</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform overview and metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card data-testid="admin-stat-revenue">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">${data.revenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime payments</p>
          </CardContent>
        </Card>
        
        <Card data-testid="admin-stat-users">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered accounts</p>
          </CardContent>
        </Card>
        
        <Card data-testid="admin-stat-rentals">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Rentals</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.activeRentals}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently processing</p>
          </CardContent>
        </Card>

        <Card data-testid="admin-stat-pending">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.pendingPayments}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting confirmation</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Provider Status</CardTitle>
            <CardDescription>Upstream SMS provider health and balance.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.providerStatuses.map(provider => (
                <div key={provider.name} className="flex items-start justify-between p-4 border rounded-lg bg-gray-50/50" data-testid={`admin-provider-${provider.name}`}>
                  <div className="flex items-start gap-3">
                    {provider.mode === 'live' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-medium text-sm">{provider.name}</div>
                      <p className="text-xs text-muted-foreground mt-1">{provider.message}</p>
                    </div>
                  </div>
                  <Badge variant={provider.mode === 'live' ? 'outline' : 'secondary'} className={provider.mode === 'live' ? 'text-green-600 border-green-200 bg-green-50' : 'text-amber-600 border-amber-200 bg-amber-50'}>
                    {provider.mode}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
