import { useGetAdminOverview } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Phone, CreditCard, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/Reveal";

function maskProviderName(name: string): string {
  return name === "Hero SMS" ? "SKY SMS" : name;
}

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
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-destructive">Failed to load admin overview</h2>
        <p className="text-muted-foreground mt-2">Please refresh the page.</p>
      </div>
    );
  }

  const stats = [
    {
      label: "Total Revenue",
      value: `$${data.revenue.toFixed(2)}`,
      sub: "Lifetime payments",
      icon: CreditCard,
      color: "cyan",
      testId: "admin-stat-revenue",
    },
    {
      label: "Total Users",
      value: String(data.totalUsers),
      sub: "Registered accounts",
      icon: Users,
      color: "indigo",
      testId: "admin-stat-users",
    },
    {
      label: "Active Rentals",
      value: String(data.activeRentals),
      sub: "Currently processing",
      icon: Phone,
      color: "emerald",
      testId: "admin-stat-rentals",
    },
    {
      label: "Pending Payments",
      value: String(data.pendingPayments),
      sub: "Awaiting confirmation",
      icon: Activity,
      color: "amber",
      testId: "admin-stat-pending",
    },
  ];

  const colorMap: Record<string, { bg: string; border: string; icon: string; text: string }> = {
    cyan: { bg: "bg-cyan-400/10", border: "border-cyan-300/20", icon: "text-cyan-400", text: "text-primary" },
    indigo: { bg: "bg-indigo-400/10", border: "border-indigo-300/20", icon: "text-indigo-400", text: "text-white" },
    emerald: { bg: "bg-emerald-400/10", border: "border-emerald-300/20", icon: "text-emerald-400", text: "text-white" },
    amber: { bg: "bg-amber-400/10", border: "border-amber-300/20", icon: "text-amber-400", text: "text-white" },
  };

  return (
    <div className="space-y-8">
      <Reveal variant="up">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform overview and metrics.</p>
        </div>
      </Reveal>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const c = colorMap[stat.color];
          return (
            <Reveal key={stat.label} variant="up" delay={i * 70}>
              <div className="glass-card rounded-2xl p-6 relative overflow-hidden h-full" data-testid={stat.testId}>
                <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-400/[0.06] to-transparent pointer-events-none`} />
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-muted-foreground">{stat.label}</span>
                  <div className={`h-9 w-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center shrink-0`}>
                    <stat.icon className={`h-4 w-4 ${c.icon}`} />
                  </div>
                </div>
                <div className={`text-4xl font-black mb-1 ${c.text}`}>{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
              </div>
            </Reveal>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Reveal variant="up" delay={80}>
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-white/[0.06]">
              <div className="font-bold text-white">Provider Status</div>
              <div className="text-sm text-muted-foreground mt-0.5">Upstream SMS provider health and balance.</div>
            </div>
            <div className="p-6 space-y-3">
              {data.providerStatuses.map(provider => (
                <div key={provider.name} className="flex items-start justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.03]" data-testid={`admin-provider-${provider.name}`}>
                  <div className="flex items-start gap-3">
                    {provider.mode === 'live' ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-semibold text-sm text-white">{maskProviderName(provider.name)}</div>
                      <p className="text-xs text-muted-foreground mt-1">{provider.message}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={provider.mode === 'live' ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200' : 'border-amber-300/20 bg-amber-400/10 text-amber-200'}>
                    {provider.mode}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
