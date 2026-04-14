import { useGetDashboard } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, History, CreditCard, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const { data, isLoading, error } = useGetDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Failed to load dashboard</h2>
        <p className="text-muted-foreground">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back, {data.account.name}. Your account starts clean and only shows real activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card" data-testid="card-stat-credits">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Credits</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary" data-testid="text-stat-credits-value">
              {data.account.credits.toFixed(2)}
            </div>
            <Link href="/payments">
              <Button variant="link" className="px-0 h-auto text-xs mt-2 text-muted-foreground hover:text-primary" data-testid="link-buy-credits">
                Buy more credits &rarr;
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="glass-card" data-testid="card-stat-active">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Rentals</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-stat-active-value">{data.activeRentals}</div>
            <Link href="/rent">
              <Button variant="link" className="px-0 h-auto text-xs mt-2 text-muted-foreground hover:text-primary" data-testid="link-new-rental">
                Rent a new number &rarr;
              </Button>
            </Link>
          </CardContent>
        </Card>
        
        <Card className="glass-card" data-testid="card-stat-completed">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Rentals</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-stat-completed-value">{data.completedRentals}</div>
            <Link href="/rentals">
              <Button variant="link" className="px-0 h-auto text-xs mt-2 text-muted-foreground hover:text-primary" data-testid="link-view-history">
                View history &rarr;
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="col-span-1 glass-card">
          <CardHeader>
            <CardTitle>Recent Rentals</CardTitle>
            <CardDescription>Your latest active and completed rentals.</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentRentals.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm border border-dashed border-white/10 rounded-2xl bg-white/[0.03]">
                No rentals yet. Once you rent a number, it will appear here.
              </div>
            ) : (
              <div className="space-y-4">
                {data.recentRentals.map(rental => (
                  <div key={rental.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0" data-testid={`row-recent-rental-${rental.id}`}>
                    <div>
                      <div className="font-medium">{rental.serviceName}</div>
                      <div className="text-xs text-muted-foreground">{rental.phoneNumber || "Pending number..."} &bull; {rental.countryName}</div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={rental.status === 'active' ? 'default' : rental.status === 'completed' ? 'secondary' : 'outline'}
                        className="mb-1"
                        data-testid={`badge-rental-status-${rental.id}`}
                      >
                        {rental.status}
                      </Badge>
                      <div className="text-xs text-muted-foreground">{format(new Date(rental.createdAt), "MMM d")}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1 glass-card">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current provider network availability.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.providerStatuses.map(provider => (
                <div key={provider.name} className="flex items-start gap-3 p-3 rounded-2xl border border-white/10 bg-white/[0.03]" data-testid={`row-provider-status-${provider.name}`}>
                  {provider.mode === 'live' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-medium text-sm flex items-center gap-2">
                      {provider.name}
                      <Badge variant={provider.mode === 'live' ? 'outline' : 'secondary'} className={provider.mode === 'live' ? 'text-emerald-200 border-emerald-300/20 bg-emerald-400/10' : 'text-amber-200 border-amber-300/20 bg-amber-400/10'}>
                        {provider.mode}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{provider.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
