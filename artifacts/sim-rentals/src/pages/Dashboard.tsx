import { useGetDashboard, useGetMe } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Phone, DollarSign, AlertCircle, CheckCircle2, Zap,
  MessageSquare, ChevronRight, Plus, History, Clock, ArrowRight
} from "lucide-react";
import { format, differenceInSeconds } from "date-fns";
import { Link } from "wouter";
import { useState, useEffect } from "react";

function svcIcon(domain: string) {
  return `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`;
}

const serviceIcons: Record<string, string> = {
  Telegram: svcIcon("telegram.org"),
  WhatsApp: svcIcon("web.whatsapp.com"),
  Google: svcIcon("google.com"),
  Instagram: svcIcon("instagram.com"),
  Facebook: svcIcon("facebook.com"),
  "X / Twitter": svcIcon("x.com"),
  Discord: svcIcon("discord.com"),
  Amazon: svcIcon("amazon.com"),
  TikTok: svcIcon("tiktok.com"),
  Microsoft: svcIcon("microsoft.com"),
  Snapchat: svcIcon("snapchat.com"),
  LinkedIn: svcIcon("linkedin.com"),
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
    <span className={`font-mono text-[11px] font-bold tabular-nums ${urgent ? "text-rose-400" : "text-amber-400"}`}>
      {m}:{s.toString().padStart(2, "0")}
    </span>
  );
}

const statusStyles: Record<string, { label: string; cls: string }> = {
  active:       { label: "Active",    cls: "text-emerald-300 border-emerald-500/20 bg-emerald-500/10" },
  completed:    { label: "Done",      cls: "text-slate-400 border-white/10 bg-white/[0.04]" },
  sms_received: { label: "SMS ✓",     cls: "text-emerald-300 border-emerald-500/20 bg-emerald-500/10" },
  cancelled:    { label: "Cancelled", cls: "text-slate-500 border-white/[0.06] bg-white/[0.02]" },
  expired:      { label: "Expired",   cls: "text-slate-500 border-white/[0.06] bg-white/[0.02]" },
};

export default function Dashboard() {
  const { data, isLoading, error } = useGetDashboard();
  const { data: user } = useGetMe();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-40 bg-white/[0.04]" />
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-2xl bg-white/[0.04]" />)}
        </div>
        <Skeleton className="h-64 rounded-2xl bg-white/[0.04]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-12 w-12 rounded-2xl bg-rose-400/10 border border-rose-300/20 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-rose-400" />
        </div>
        <h2 className="text-[15px] font-semibold text-white mb-1">Dashboard unavailable</h2>
        <p className="text-slate-500 text-[13px]">Please refresh the page.</p>
      </div>
    );
  }

  const smsCount = data.recentRentals.filter((r: any) =>
    r.status === "sms_received" || (r.messages && r.messages.length > 0)
  ).length;

  const firstName = data.account?.name ? data.account.name.split(" ")[0] : "";

  const stats = [
    {
      href: "/payments",
      icon: DollarSign,
      label: "Balance",
      value: `$${data.account.credits.toFixed(2)}`,
      sub: "Add funds",
      color: "amber",
    },
    {
      href: "/rentals",
      icon: Phone,
      label: "Active",
      value: String(data.activeRentals),
      sub: data.activeRentals > 0 ? "Live now" : "None active",
      color: "sky",
      pulse: data.activeRentals > 0,
    },
    {
      href: "/rentals",
      icon: CheckCircle2,
      label: "Completed",
      value: String(data.completedRentals),
      sub: "Total done",
      color: "emerald",
    },
    {
      icon: MessageSquare,
      label: "SMS",
      value: String(smsCount),
      sub: "Codes captured",
      color: "violet",
    },
  ] as const;

  const colorMap = {
    amber:   { icon: "bg-amber-500/12 border-amber-400/20 text-amber-400",   val: "text-white" },
    sky:     { icon: "bg-amber-500/12 border-amber-400/20 text-amber-400",    val: "text-white" },
    emerald: { icon: "bg-emerald-500/10 border-emerald-400/20 text-emerald-400", val: "text-white" },
    violet:  { icon: "bg-violet-500/10 border-violet-400/20 text-violet-400", val: "text-white" },
  };

  return (
    <div className="space-y-4">

      {/* Header */}
      <div>
        <h1 className="text-[17px] font-bold text-white">
          {firstName ? `Welcome back, ${firstName}` : "Dashboard"}
        </h1>
        <p className="text-slate-500 mt-0.5 text-[13px]">Here's what's happening with your account.</p>
      </div>

      {/* Stat cards — 2×2 compact grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => {
          const c = colorMap[stat.color];
          const inner = (
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 h-full hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[10.5px] font-bold text-slate-600 uppercase tracking-wider leading-none">{stat.label}</span>
                <div className={`h-7 w-7 rounded-lg border flex items-center justify-center shrink-0 ${c.icon}`}>
                  <stat.icon className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="flex items-end gap-2">
                <div className={`text-[22px] font-bold leading-none ${c.val}`}>{stat.value}</div>
                {"pulse" in stat && stat.pulse && (
                  <span className="h-2 w-2 rounded-full bg-emerald-400 mb-1 animate-pulse shrink-0" />
                )}
              </div>
              <div className="text-[11.5px] text-slate-600 mt-1.5 flex items-center gap-0.5">
                {stat.sub}
                {"href" in stat && stat.href && <ChevronRight className="h-3 w-3" />}
              </div>
            </div>
          );
          if ("href" in stat && stat.href) {
            return <Link key={stat.label} href={stat.href}>{inner}</Link>;
          }
          return <div key={stat.label}>{inner}</div>;
        })}
      </div>

      {/* Recent Rentals */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/[0.05]">
          <div className="font-semibold text-white text-[14px]">Recent Rentals</div>
          <Link href="/rentals">
            <span className="text-[12px] text-amber-400 font-semibold hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-0.5">
              View all <ChevronRight className="h-3 w-3" />
            </span>
          </Link>
        </div>

        {data.recentRentals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="h-10 w-10 rounded-xl bg-amber-400/[0.07] border border-amber-400/15 flex items-center justify-center mb-3">
              <Phone className="h-5 w-5 text-amber-400/50" />
            </div>
            <h3 className="font-semibold text-white mb-1 text-[14px]">No rentals yet</h3>
            <p className="text-[12.5px] text-slate-500 mb-4 max-w-[220px]">Rent your first number to get started.</p>
            <Link href="/rent">
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2.5 text-[12.5px] font-bold text-slate-900 hover:bg-amber-400 transition-colors cursor-pointer">
                <Zap className="h-3.5 w-3.5" /> Rent Now
              </span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {data.recentRentals.slice(0, 6).map((rental: any) => {
              const st = statusStyles[rental.status] ?? statusStyles.cancelled;
              const icon = serviceIcons[rental.serviceName];
              return (
                <div key={rental.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.015] transition-colors">
                  <div className="h-8 w-8 rounded-lg bg-white/[0.05] border border-white/[0.07] flex items-center justify-center shrink-0 overflow-hidden">
                    {icon ? (
                      <img src={icon} alt={rental.serviceName} className="h-5 w-5 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <Phone className="h-3.5 w-3.5 text-slate-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-[13.5px] truncate">{rental.serviceName}</div>
                    <div className="text-[11.5px] text-slate-600 truncate mt-0.5">
                      {rental.phoneNumber ? `+${rental.phoneNumber}` : "Allocating…"} · {rental.countryName}
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex flex-col items-end gap-1">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10.5px] font-semibold ${st.cls}`}>
                      {st.label}
                    </span>
                    <div className="text-[10.5px] text-slate-600">
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

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/rent">
          <div className="rounded-2xl border border-amber-500/15 bg-amber-500/[0.05] p-4 hover:bg-amber-500/[0.08] hover:border-amber-500/25 transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
              <Zap className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-white">Rent Now</div>
              <div className="text-[11px] text-amber-400/60">Get a number</div>
            </div>
          </div>
        </Link>
        <Link href="/payments">
          <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-4 hover:bg-emerald-500/[0.07] hover:border-emerald-500/25 transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Plus className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-white">Add Funds</div>
              <div className="text-[11px] text-emerald-400/60">Top up balance</div>
            </div>
          </div>
        </Link>
        <Link href="/rentals">
          <div className="rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.04] p-4 hover:bg-indigo-500/[0.07] hover:border-indigo-500/25 transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center shrink-0">
              <History className="h-4 w-4 text-indigo-400" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-white">My Rentals</div>
              <div className="text-[11px] text-indigo-400/60">View history</div>
            </div>
          </div>
        </Link>
        <Link href="/support">
          <div className="rounded-2xl border border-slate-500/15 bg-white/[0.02] p-4 hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center shrink-0">
              <Clock className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-white">Support</div>
              <div className="text-[11px] text-slate-600">Get help</div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
