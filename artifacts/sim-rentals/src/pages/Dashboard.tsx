import { useGetDashboard } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Phone, History, DollarSign, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/Reveal";

function maskProviderName(name: string): string {
  return name === "Hero SMS" ? "SKY SMS" : name;
}

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
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
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

  const statusStyles: Record<string, string> = {
    active: "text-cyan-200 border-cyan-300/20 bg-cyan-400/10",
    completed: "text-emerald-200 border-emerald-300/20 bg-emerald-400/10",
    sms_received: "text-emerald-200 border-emerald-300/20 bg-emerald-400/10",
    cancelled: "text-slate-400 border-white/10 bg-white/[0.04]",
    expired: "text-slate-400 border-white/10 bg-white/[0.04]",
  };

  return (
    <div className="space-y-8">
      <Reveal variant="up">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Overview</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {data.account.name}.</p>
        </div>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-3">
        <Reveal variant="up" delay={0}>
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden h-full" data-testid="card-stat-credits">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/[0.07] to-transparent pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-muted-foreground">Account Balance</span>
              <div className="h-9 w-9 rounded-xl bg-cyan-400/10 border border-cyan-300/20 flex items-center justify-center shrink-0">
                <DollarSign className="h-4 w-4 text-cyan-400" />
              </div>
            </div>
            <div className="text-4xl font-black text-primary mb-2" data-testid="text-stat-credits-value">
              ${data.account.credits.toFixed(2)}
            </div>
            <Link href="/payments">
              <span className="text-xs font-semibold text-cyan-400/70 hover:text-cyan-300 transition-colors cursor-pointer" data-testid="link-buy-credits">
                Add funds →
              </span>
            </Link>
          </div>
        </Reveal>

        <Reveal variant="up" delay={80}>
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden h-full" data-testid="card-stat-active">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/[0.06] to-transparent pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-muted-foreground">Active Rentals</span>
              <div className="h-9 w-9 rounded-xl bg-indigo-400/10 border border-indigo-300/20 flex items-center justify-center shrink-0">
                <Phone className="h-4 w-4 text-indigo-400" />
              </div>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-4xl font-black text-white" data-testid="text-stat-active-value">{data.activeRentals}</div>
              {data.activeRentals > 0 && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400"></span>
                </span>
              )}
            </div>
            <Link href="/rent">
              <span className="text-xs font-semibold text-indigo-400/70 hover:text-indigo-300 transition-colors cursor-pointer" data-testid="link-new-rental">
                Rent a new number →
              </span>
            </Link>
          </div>
        </Reveal>

        <Reveal variant="up" delay={160}>
          <div className="glass-card rounded-2xl p-6 relative overflow-hidden h-full" data-testid="card-stat-completed">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/[0.05] to-transparent pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-muted-foreground">Completed Rentals</span>
              <div className="h-9 w-9 rounded-xl bg-emerald-400/10 border border-emerald-300/20 flex items-center justify-center shrink-0">
                <History className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <div className="text-4xl font-black text-white mb-2" data-testid="text-stat-completed-value">{data.completedRentals}</div>
            <Link href="/rentals">
              <span className="text-xs font-semibold text-emerald-400/70 hover:text-emerald-300 transition-colors cursor-pointer" data-testid="link-view-history">
                View history →
              </span>
            </Link>
          </div>
        </Reveal>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal variant="up" delay={100}>
          <div className="glass-card rounded-2xl overflow-hidden h-full">
            <div className="px-6 py-5 border-b border-white/[0.06]">
              <div className="font-bold text-white">Recent Rentals</div>
              <div className="text-sm text-muted-foreground mt-0.5">Your latest active and completed rentals.</div>
            </div>
            <div className="p-6">
              {data.recentRentals.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                  <Zap className="h-8 w-8 mx-auto mb-3 opacity-20" />
                  No rentals yet. Once you rent a number, it will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.recentRentals.map(rental => {
                    const statusClass = statusStyles[rental.status] ?? statusStyles.cancelled;
                    return (
                      <div key={rental.id} className="flex items-center justify-between p-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.05] transition-colors" data-testid={`row-recent-rental-${rental.id}`}>
                        <div className="min-w-0">
                          <div className="font-semibold text-white text-sm truncate">{rental.serviceName}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 truncate">
                            {rental.phoneNumber ? `+${rental.phoneNumber}` : "Pending…"} &bull; {rental.countryName}
                          </div>
                        </div>
                        <div className="text-right ml-3 shrink-0">
                          <Badge variant="outline" className={`text-xs mb-1 ${statusClass}`} data-testid={`badge-rental-status-${rental.id}`}>
                            {rental.status}
                          </Badge>
                          <div className="text-xs text-muted-foreground">{format(new Date(rental.createdAt), "MMM d")}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Reveal>

        <Reveal variant="up" delay={180}>
          <div className="glass-card rounded-2xl overflow-hidden h-full">
            <div className="px-6 py-5 border-b border-white/[0.06]">
              <div className="font-bold text-white">System Status</div>
              <div className="text-sm text-muted-foreground mt-0.5">Current provider network availability.</div>
            </div>
            <div className="p-6 space-y-3">
              {data.providerStatuses.map(provider => (
                <div key={provider.name} className="flex items-start gap-3 p-4 rounded-2xl border border-white/[0.06] bg-white/[0.03]" data-testid={`row-provider-status-${provider.name}`}>
                  {provider.mode === 'live' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white flex items-center gap-2 flex-wrap">
                      {maskProviderName(provider.name)}
                      <Badge variant="outline" className={provider.mode === 'live' ? 'text-emerald-200 border-emerald-300/20 bg-emerald-400/10 text-xs' : 'text-amber-200 border-amber-300/20 bg-amber-400/10 text-xs'}>
                        {provider.mode}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{provider.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
