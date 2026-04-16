import { useGetDashboard, useGetMe } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Phone, History, DollarSign, AlertCircle, CheckCircle2, Zap,
  TrendingUp, MessageSquare, ChevronRight, Plus, ArrowUpRight,
  Clock, Star, Wifi, Globe, ShieldCheck, ExternalLink
} from "lucide-react";
import { format, differenceInSeconds } from "date-fns";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

const serviceIcons: Record<string, string> = {
  Telegram: "https://www.google.com/s2/favicons?domain=telegram.org&sz=64",
  WhatsApp: "https://www.google.com/s2/favicons?domain=whatsapp.com&sz=64",
  Google: "https://www.google.com/s2/favicons?domain=google.com&sz=64",
  Instagram: "https://www.google.com/s2/favicons?domain=instagram.com&sz=64",
  Facebook: "https://www.google.com/s2/favicons?domain=facebook.com&sz=64",
  "X / Twitter": "https://www.google.com/s2/favicons?domain=x.com&sz=64",
  Discord: "https://www.google.com/s2/favicons?domain=discord.com&sz=64",
  Amazon: "https://www.google.com/s2/favicons?domain=amazon.com&sz=64",
  TikTok: "https://www.google.com/s2/favicons?domain=tiktok.com&sz=64",
  Microsoft: "https://www.google.com/s2/favicons?domain=microsoft.com&sz=64",
};


function ActiveTimer({ expiresAt }: { expiresAt: string }) {
  const [timeLeft, setTimeLeft] = useState(0);
  useEffect(() => {
    const tick = () => setTimeLeft(Math.max(0, differenceInSeconds(new Date(expiresAt), new Date())));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  const urgent = timeLeft < 120;
  return (
    <span className={`font-mono font-bold tabular-nums ${urgent ? "text-red-400" : "text-cyan-400"}`}>
      {m}:{s.toString().padStart(2, "0")}
    </span>
  );
}

const popularServices = [
  { name: "Telegram", tag: "Most popular" },
  { name: "WhatsApp", tag: "Business" },
  { name: "Google", tag: "Gmail" },
  { name: "Instagram", tag: "Social" },
  { name: "Facebook", tag: "Social" },
  { name: "Discord", tag: "Gaming" },
  { name: "TikTok", tag: "Viral" },
  { name: "Amazon", tag: "Shopping" },
];

const tips = [
  { icon: Clock, title: "20-min window", desc: "Act fast — each rental gives you 20 minutes to receive an SMS before it expires." },
  { icon: ShieldCheck, title: "Auto refund", desc: "If no SMS arrives before the window closes, the cost is instantly returned to your balance." },
  { icon: Globe, title: "180+ countries", desc: "Numbers available across the globe — pick whichever country the platform accepts." },
  { icon: Wifi, title: "Live updates", desc: "Messages appear in real-time on your rental card. No need to refresh." },
];

export default function Dashboard() {
  const { data, isLoading, error } = useGetDashboard();
  const { data: user } = useGetMe();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="space-y-2"><Skeleton className="h-9 w-56" /><Skeleton className="h-4 w-72" /></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-2xl bg-red-400/10 border border-red-300/20 flex items-center justify-center mb-5">
          <AlertCircle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Dashboard unavailable</h2>
        <p className="text-muted-foreground text-sm">Please refresh the page and try again.</p>
      </div>
    );
  }

  const totalSpent = data.recentRentals.reduce((s: number, r: any) => s + (r.price || 0), 0);
  const smsCount = data.recentRentals.filter((r: any) => r.status === "sms_received" || (r.messages && r.messages.length > 0)).length;

  const statusStyles: Record<string, string> = {
    active: "text-cyan-200 border-cyan-300/20 bg-cyan-400/10",
    completed: "text-emerald-200 border-emerald-300/20 bg-emerald-400/10",
    sms_received: "text-emerald-200 border-emerald-300/20 bg-emerald-400/10",
    cancelled: "text-slate-400 border-white/10 bg-white/[0.04]",
    expired: "text-slate-400 border-white/10 bg-white/[0.04]",
  };

  return (
    <div className="space-y-8">

      {/* ─── Header ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">
          Welcome back{data.account?.name ? `, ${data.account.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">Here's what's happening with your account today.</p>
      </div>

      {/* ─── Stats grid ──────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Balance */}
        <Link href="/payments">
          <div className="glass-card rounded-2xl p-5 relative overflow-hidden cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 group shine-hover" data-testid="card-stat-credits">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/[0.09] to-transparent pointer-events-none" />
            <div className="absolute -right-3 -top-3 h-20 w-20 rounded-full bg-cyan-400/[0.08] blur-xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Balance</span>
                <div className="h-8 w-8 rounded-xl bg-cyan-400/10 border border-cyan-300/20 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-cyan-400" />
                </div>
              </div>
              <div className="text-4xl font-black text-white mb-1" data-testid="text-stat-credits-value">
                ${data.account.credits.toFixed(2)}
              </div>
              <div className="flex items-center gap-1 text-xs text-cyan-400 font-semibold group-hover:gap-2 transition-all">
                Add funds <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </Link>

        {/* Active rentals */}
        <Link href="/rentals">
          <div className="glass-card rounded-2xl p-5 relative overflow-hidden cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 group shine-hover" data-testid="card-stat-active">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/[0.07] to-transparent pointer-events-none" />
            <div className="absolute -right-3 -top-3 h-20 w-20 rounded-full bg-indigo-400/[0.08] blur-xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active</span>
                <div className="h-8 w-8 rounded-xl bg-indigo-400/10 border border-indigo-300/20 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-indigo-400" />
                </div>
              </div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-4xl font-black text-white" data-testid="text-stat-active-value">{data.activeRentals}</span>
                {data.activeRentals > 0 && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-400" />
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-indigo-400 font-semibold">
                {data.activeRentals > 0 ? "View live numbers" : "View rentals"} <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </Link>

        {/* Completed */}
        <Link href="/rentals">
          <div className="glass-card rounded-2xl p-5 relative overflow-hidden cursor-pointer hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200 group shine-hover" data-testid="card-stat-completed">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/[0.06] to-transparent pointer-events-none" />
            <div className="absolute -right-3 -top-3 h-20 w-20 rounded-full bg-emerald-400/[0.07] blur-xl" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed</span>
                <div className="h-8 w-8 rounded-xl bg-emerald-400/10 border border-emerald-300/20 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
              </div>
              <div className="text-4xl font-black text-white mb-1" data-testid="text-stat-completed-value">{data.completedRentals}</div>
              <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                View history <ChevronRight className="h-3 w-3" />
              </div>
            </div>
          </div>
        </Link>

        {/* SMS received */}
        <div className="glass-card rounded-2xl p-5 relative overflow-hidden hover:scale-[1.02] hover:-translate-y-0.5 transition-all duration-200">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-400/[0.06] to-transparent pointer-events-none" />
          <div className="absolute -right-3 -top-3 h-20 w-20 rounded-full bg-violet-400/[0.07] blur-xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">SMS Received</span>
              <div className="h-8 w-8 rounded-xl bg-violet-400/10 border border-violet-300/20 flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-violet-400" />
              </div>
            </div>
            <div className="text-4xl font-black text-white mb-1">{smsCount}</div>
            <div className="text-xs text-slate-600 font-semibold">codes captured</div>
          </div>
        </div>
      </div>

      {/* ─── Main grid: recent + active ──────────────────────── */}
      <div className="grid gap-5 lg:grid-cols-3">

        {/* Recent Rentals */}
        <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
            <div>
              <div className="font-black text-white">Recent Rentals</div>
              <div className="text-xs text-muted-foreground mt-0.5">Your latest activity</div>
            </div>
            <Link href="/rentals">
              <span className="text-xs text-cyan-400 font-bold hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1">
                View all <ChevronRight className="h-3 w-3" />
              </span>
            </Link>
          </div>

          {data.recentRentals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="h-14 w-14 rounded-2xl bg-cyan-400/10 border border-cyan-300/20 flex items-center justify-center mb-4">
                <Phone className="h-7 w-7 text-cyan-400/50" />
              </div>
              <h3 className="font-bold text-white mb-2">No rentals yet</h3>
              <p className="text-sm text-muted-foreground mb-5 max-w-xs">Rent your first number to get started with SMS verification.</p>
              <Link href="/rent">
                <span className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-black text-black hover:bg-cyan-300 transition-colors cursor-pointer">
                  <Zap className="h-4 w-4" /> Rent Now
                </span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {data.recentRentals.slice(0, 8).map((rental: any) => {
                const statusClass = statusStyles[rental.status] ?? statusStyles.cancelled;
                const icon = serviceIcons[rental.serviceName];
                return (
                  <div key={rental.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/[0.02] transition-colors" data-testid={`row-recent-rental-${rental.id}`}>
                    <div className="h-9 w-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0 overflow-hidden">
                      {icon ? (
                        <img src={icon} alt={rental.serviceName} className="h-5 w-5 object-contain rounded-sm" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      ) : (
                        <Phone className="h-4 w-4 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-sm truncate">{rental.serviceName}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {rental.phoneNumber ? `+${rental.phoneNumber}` : "Allocating…"} &bull; {rental.countryName}
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                      <Badge variant="outline" className={`text-[11px] px-2 py-0 h-5 ${statusClass}`} data-testid={`badge-rental-status-${rental.id}`}>
                        {rental.status === "sms_received" ? "✓ SMS" : rental.status}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {rental.status === "active" && rental.expiresAt
                          ? <ActiveTimer expiresAt={rental.expiresAt} />
                          : format(new Date(rental.createdAt), "MMM d, HH:mm")
                        }
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: active now + quick actions */}
        <div className="flex flex-col gap-5">

          {/* Active Numbers */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.06]">
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  {data.activeRentals > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${data.activeRentals > 0 ? "bg-cyan-400" : "bg-slate-600"}`} />
                </span>
                Live Numbers
              </div>
              <Badge variant="outline" className="text-xs text-cyan-200 border-cyan-300/20 bg-cyan-400/10">{data.activeRentals} active</Badge>
            </div>
            {data.recentRentals.filter((r: any) => r.status === "active").length === 0 ? (
              <div className="py-8 px-4 text-center">
                <Phone className="h-8 w-8 text-slate-700 mx-auto mb-3" />
                <p className="text-xs text-slate-600 font-semibold mb-3">No active numbers</p>
                <Link href="/rent">
                  <span className="text-xs text-cyan-400 font-bold hover:text-cyan-300 cursor-pointer transition-colors">
                    Rent one →
                  </span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {data.recentRentals.filter((r: any) => r.status === "active").map((r: any) => (
                  <div key={r.id} className="px-4 py-3">
                    <div className="text-sm font-bold text-white truncate">{r.serviceName}</div>
                    <div className="text-xs text-cyan-300 font-mono mt-0.5">+{r.phoneNumber || "…"}</div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[11px] text-slate-600">{r.countryName}</span>
                      {r.expiresAt && <ActiveTimer expiresAt={r.expiresAt} />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="glass-card rounded-2xl p-4">
            <div className="font-bold text-white text-sm mb-3">Quick Actions</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/rent", icon: Zap, label: "Rent Now", color: "cyan" },
                { href: "/payments", icon: Plus, label: "Add Funds", color: "emerald" },
                { href: "/rentals", icon: History, label: "Rentals", color: "indigo" },
                { href: "/settings", icon: TrendingUp, label: "Settings", color: "violet" },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.08] hover:border-cyan-400/20 transition-all cursor-pointer group">
                    <action.icon className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors">{action.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Popular services ─────────────────────────────────── */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            <div className="font-black text-white">Popular Services</div>
            <div className="text-xs text-muted-foreground mt-0.5">Most rented platforms on SKY SMS</div>
          </div>
          <Link href="/rent">
            <span className="text-xs text-cyan-400 font-bold hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1">
              Browse all <ChevronRight className="h-3 w-3" />
            </span>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 divide-x divide-y divide-white/[0.05]">
          {popularServices.map((svc) => (
            <Link key={svc.name} href="/rent">
              <div className="flex flex-col items-center gap-2 p-4 hover:bg-white/[0.03] transition-colors cursor-pointer group">
                <div className="h-10 w-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center overflow-hidden group-hover:border-cyan-400/20 group-hover:bg-white/[0.09] transition-all">
                  <img
                    src={serviceIcons[svc.name]}
                    alt={svc.name}
                    className="h-6 w-6 object-contain rounded"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-white truncate max-w-full">{svc.name}</div>
                  <div className="text-[10px] text-slate-600 mt-0.5">{svc.tag}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── Tips full-width ─────────────────────────────── */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <div className="font-black text-white">How It Works</div>
          <div className="text-xs text-muted-foreground mt-0.5">Get the most out of SKY SMS</div>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-cyan-400/10 transition-all duration-200">
              <div className="h-7 w-7 rounded-lg bg-cyan-400/10 border border-cyan-300/20 flex items-center justify-center shrink-0 mt-0.5">
                <tip.icon className="h-3.5 w-3.5 text-cyan-400" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">{tip.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tip.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
