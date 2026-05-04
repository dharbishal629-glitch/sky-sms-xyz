import { useGetDashboard, useGetMe } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Phone, History, DollarSign, AlertCircle, CheckCircle2, Zap,
  MessageSquare, ChevronRight, Plus, TrendingUp,
  Clock, Wifi, Globe, ShieldCheck
} from "lucide-react";
import { format, differenceInSeconds } from "date-fns";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

// High-quality icon source — 128px social icons from Google's favicon V2 API
function svcIcon(domain: string) {
  return `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`;
}

const serviceIcons: Record<string, string> = {
  Telegram:      svcIcon("telegram.org"),
  WhatsApp:      svcIcon("web.whatsapp.com"),
  Google:        svcIcon("google.com"),
  Instagram:     svcIcon("instagram.com"),
  Facebook:      svcIcon("facebook.com"),
  "X / Twitter": svcIcon("x.com"),
  Discord:       svcIcon("discord.com"),
  Amazon:        svcIcon("amazon.com"),
  TikTok:        svcIcon("tiktok.com"),
  Microsoft:     svcIcon("microsoft.com"),
  Snapchat:      svcIcon("snapchat.com"),
  LinkedIn:      svcIcon("linkedin.com"),
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
    <span className={`font-mono font-bold tabular-nums text-sm ${urgent ? "text-rose-400" : "text-sky-400"}`}>
      {m}:{s.toString().padStart(2, "0")}
    </span>
  );
}

const popularServices = [
  { name: "Telegram",     tag: "Most popular", domain: "telegram.org" },
  { name: "WhatsApp",     tag: "Business",     domain: "web.whatsapp.com" },
  { name: "Google",       tag: "Gmail",        domain: "google.com" },
  { name: "Instagram",    tag: "Social",       domain: "instagram.com" },
  { name: "Facebook",     tag: "Social",       domain: "facebook.com" },
  { name: "Discord",      tag: "Gaming",       domain: "discord.com" },
  { name: "TikTok",       tag: "Viral",        domain: "tiktok.com" },
  { name: "Amazon",       tag: "Shopping",     domain: "amazon.com" },
];

const howItWorks = [
  { icon: Clock,      title: "20-min window",   desc: "Each rental gives you 20 minutes to receive an SMS before it expires." },
  { icon: ShieldCheck, title: "Auto refund",    desc: "If no SMS arrives before expiry, the cost is instantly returned to your balance." },
  { icon: Globe,      title: "Global coverage", desc: "Numbers available across the globe — pick whichever country the platform accepts." },
  { icon: Wifi,       title: "Live updates",    desc: "Messages appear in real-time on your rental card. No refresh needed." },
];

const statusStyles: Record<string, { label: string; cls: string }> = {
  active:       { label: "Active",    cls: "text-sky-200 border-sky-400/20 bg-sky-400/10" },
  completed:    { label: "Completed", cls: "text-emerald-200 border-emerald-400/20 bg-emerald-400/10" },
  sms_received: { label: "SMS",       cls: "text-emerald-200 border-emerald-400/20 bg-emerald-400/10" },
  cancelled:    { label: "Cancelled", cls: "text-slate-400 border-white/10 bg-white/[0.04]" },
  expired:      { label: "Expired",   cls: "text-slate-400 border-white/10 bg-white/[0.04]" },
};

function StatCard({
  href, color, icon: Icon, label, value, sub, pulse,
}: {
  href?: string; color: "blue" | "indigo" | "emerald" | "violet";
  icon: React.ElementType; label: string; value: React.ReactNode;
  sub: React.ReactNode; pulse?: boolean;
}) {
  const colorMap = {
    blue:    { from: "from-sky-500/8",     icon: "bg-sky-500/10 border-sky-400/20 text-sky-400",      dot: "bg-sky-400",     sub: "text-sky-400" },
    indigo:  { from: "from-indigo-500/8",  icon: "bg-indigo-500/10 border-indigo-400/20 text-indigo-400", dot: "bg-indigo-400",  sub: "text-indigo-400" },
    emerald: { from: "from-emerald-500/7", icon: "bg-emerald-500/10 border-emerald-400/20 text-emerald-400", dot: "bg-emerald-400", sub: "text-emerald-400" },
    violet:  { from: "from-violet-500/7",  icon: "bg-violet-500/10 border-violet-400/20 text-violet-400", dot: "bg-violet-400",  sub: "text-violet-400" },
  };
  const c = colorMap[color];

  const inner = (
    <div className="relative rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-transparent overflow-hidden p-6 h-full group hover:-translate-y-0.5 transition-all duration-200">
      <div className={`absolute inset-0 bg-gradient-to-br ${c.from} to-transparent pointer-events-none`} />
      <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-30 blur-2xl pointer-events-none" style={{ background: `var(--tw-gradient-from, transparent)` }} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{label}</span>
          <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${c.icon}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <div className="text-[2.4rem] font-black text-white leading-none tracking-tight">{value}</div>
          {pulse && (
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${c.dot} opacity-60`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${c.dot}`} />
            </span>
          )}
        </div>
        <div className={`flex items-center gap-1 text-[12px] font-semibold ${c.sub}`}>
          {sub} {href && <ChevronRight className="h-3 w-3" />}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}><div data-testid={`card-stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>{inner}</div></Link>;
  }
  return <div data-testid={`card-stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>{inner}</div>;
}

export default function Dashboard() {
  const { data, isLoading, error } = useGetDashboard();
  const { data: user } = useGetMe();

  if (isLoading) {
    return (
      <div className="space-y-7">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64 bg-white/[0.04]" />
          <Skeleton className="h-4 w-72 bg-white/[0.03]" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-36 rounded-2xl bg-white/[0.04]" />)}
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          <Skeleton className="h-80 rounded-2xl lg:col-span-2 bg-white/[0.04]" />
          <Skeleton className="h-80 rounded-2xl bg-white/[0.04]" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-16 w-16 rounded-2xl bg-rose-400/10 border border-rose-300/20 flex items-center justify-center mb-5">
          <AlertCircle className="h-8 w-8 text-rose-400" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">Dashboard unavailable</h2>
        <p className="text-slate-500 text-sm">Please refresh the page and try again.</p>
      </div>
    );
  }

  const smsCount = data.recentRentals.filter((r: any) =>
    r.status === "sms_received" || (r.messages && r.messages.length > 0)
  ).length;

  const firstName = data.account?.name ? data.account.name.split(" ")[0] : "";

  return (
    <div className="space-y-7 page-enter">

      {/* Header — no emoji */}
      <div className="page-enter page-enter-d1">
        <h1 className="text-[2rem] font-black tracking-tight text-white">
          {firstName ? `Welcome back, ${firstName}` : "Dashboard"}
        </h1>
        <p className="text-slate-500 mt-1.5 text-[14px]">Here's what's happening with your account.</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 page-enter page-enter-d2">
        <StatCard href="/payments" color="blue"    icon={DollarSign}   label="Balance"        value={`$${data.account.credits.toFixed(2)}`} sub="Add funds" />
        <StatCard href="/rentals"  color="indigo"  icon={Phone}        label="Active rentals" value={data.activeRentals}    sub={data.activeRentals > 0 ? "View live numbers" : "View rentals"} pulse={data.activeRentals > 0} />
        <StatCard href="/rentals"  color="emerald" icon={CheckCircle2} label="Completed"      value={data.completedRentals} sub="View history" />
        <StatCard                  color="violet"  icon={MessageSquare} label="SMS received"  value={smsCount}              sub="Codes captured" />
      </div>

      {/* Main content grid */}
      <div className="grid gap-5 lg:grid-cols-3 page-enter page-enter-d3">

        {/* Recent Rentals */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05]">
            <div>
              <div className="font-bold text-white text-[15px]">Recent Rentals</div>
              <div className="text-[12px] text-slate-500 mt-0.5">Your latest activity</div>
            </div>
            <Link href="/rentals">
              <span className="text-[12px] text-sky-400 font-semibold hover:text-sky-300 transition-colors cursor-pointer flex items-center gap-1">
                View all <ChevronRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>

          {data.recentRentals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="h-14 w-14 rounded-2xl bg-sky-400/8 border border-sky-400/15 flex items-center justify-center mb-4">
                <Phone className="h-7 w-7 text-sky-400/50" />
              </div>
              <h3 className="font-bold text-white mb-2 text-[15px]">No rentals yet</h3>
              <p className="text-[13px] text-slate-500 mb-6 max-w-xs">Rent your first number to get started with SMS verification.</p>
              <Link href="/rent">
                <span className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-3 text-[13px] font-semibold text-white hover:bg-sky-400 transition-colors cursor-pointer shadow-[0_2px_12px_rgba(14,165,233,0.22)]">
                  <Zap className="h-3.5 w-3.5" /> Rent Now
                </span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {data.recentRentals.slice(0, 8).map((rental: any) => {
                const st = statusStyles[rental.status] ?? statusStyles.cancelled;
                const icon = serviceIcons[rental.serviceName];
                return (
                  <div key={rental.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.015] transition-colors" data-testid={`row-recent-rental-${rental.id}`}>
                    <div className="h-10 w-10 rounded-xl bg-white/[0.05] border border-white/[0.07] flex items-center justify-center shrink-0 overflow-hidden">
                      {icon ? (
                        <img
                          src={icon}
                          alt={rental.serviceName}
                          className="h-6 w-6 object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <Phone className="h-4 w-4 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-[14px] truncate">{rental.serviceName}</div>
                      <div className="text-[12px] text-slate-500 truncate mt-0.5">
                        {rental.phoneNumber ? `+${rental.phoneNumber}` : "Allocating…"} · {rental.countryName}
                      </div>
                    </div>
                    <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                      <Badge variant="outline" className={`text-[11px] px-2.5 py-0.5 h-5 font-semibold ${st.cls}`} data-testid={`badge-rental-status-${rental.id}`}>
                        {st.label}
                      </Badge>
                      <div className="text-[11px] text-slate-600">
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

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Live Numbers */}
          <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
              <div className="font-semibold text-white text-[14px] flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  {data.activeRentals > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-50" />}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${data.activeRentals > 0 ? "bg-sky-400" : "bg-slate-700"}`} />
                </span>
                Live Numbers
              </div>
              <Badge variant="outline" className="text-[11px] text-sky-200 border-sky-400/20 bg-sky-400/8 font-semibold">{data.activeRentals} active</Badge>
            </div>

            {data.recentRentals.filter((r: any) => r.status === "active").length === 0 ? (
              <div className="py-10 px-5 text-center">
                <Phone className="h-8 w-8 text-slate-700 mx-auto mb-3" />
                <p className="text-[12px] text-slate-600 font-medium mb-3">No active numbers</p>
                <Link href="/rent">
                  <span className="text-[12px] text-sky-400 font-semibold hover:text-sky-300 cursor-pointer transition-colors">
                    Rent one
                  </span>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {data.recentRentals.filter((r: any) => r.status === "active").map((r: any) => (
                  <div key={r.id} className="px-5 py-4">
                    <div className="text-[14px] font-bold text-white truncate">{r.serviceName}</div>
                    <div className="text-[13px] text-sky-300 font-mono mt-0.5">+{r.phoneNumber || "…"}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[11px] text-slate-600">{r.countryName}</span>
                      {r.expiresAt && <ActiveTimer expiresAt={r.expiresAt} />}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.03] to-transparent p-5">
            <div className="font-semibold text-white text-[14px] mb-4">Quick Actions</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/rent",     icon: Zap,        label: "Rent Now",  cls: "text-sky-400 bg-sky-500/8 border-sky-500/15 hover:bg-sky-500/14 hover:border-sky-500/25" },
                { href: "/payments", icon: Plus,       label: "Add Funds", cls: "text-emerald-400 bg-emerald-500/8 border-emerald-500/15 hover:bg-emerald-500/14 hover:border-emerald-500/25" },
                { href: "/rentals",  icon: History,    label: "Rentals",   cls: "text-indigo-400 bg-indigo-500/8 border-indigo-500/15 hover:bg-indigo-500/14 hover:border-indigo-500/25" },
                { href: "/settings", icon: TrendingUp, label: "Settings",  cls: "text-violet-400 bg-violet-500/8 border-violet-500/15 hover:bg-violet-500/14 hover:border-violet-500/25" },
              ].map((action) => (
                <Link key={action.href} href={action.href}>
                  <div className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 cursor-pointer group ${action.cls}`}>
                    <action.icon className="h-5 w-5" />
                    <span className="text-[11px] font-semibold text-white/75 group-hover:text-white transition-colors">{action.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Popular Services */}
      <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden page-enter page-enter-d4">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05]">
          <div>
            <div className="font-bold text-white text-[15px]">Popular Services</div>
            <div className="text-[12px] text-slate-500 mt-0.5">Most rented platforms on SKY SMS</div>
          </div>
          <Link href="/rent">
            <span className="text-[12px] text-sky-400 font-semibold hover:text-sky-300 transition-colors cursor-pointer flex items-center gap-1">
              Browse all <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8">
          {popularServices.map((svc, i) => (
            <Link key={svc.name} href="/rent">
              <div className={`flex flex-col items-center gap-2.5 p-4 hover:bg-white/[0.025] transition-colors cursor-pointer group border-white/[0.04] ${i % 8 !== 7 ? "border-r" : ""}`}>
                <div className="h-10 w-10 rounded-xl bg-white/[0.05] border border-white/[0.07] flex items-center justify-center overflow-hidden group-hover:border-sky-500/15 group-hover:bg-white/[0.08] transition-all">
                  <img
                    src={svcIcon(svc.domain)}
                    alt={svc.name}
                    className="h-6 w-6 object-contain rounded"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <div className="text-center">
                  <div className="text-[11px] font-semibold text-white/80 truncate max-w-full">{svc.name}</div>
                  <div className="text-[10px] text-slate-600 mt-0.5 hidden sm:block">{svc.tag}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden page-enter page-enter-d5">
        <div className="px-6 py-5 border-b border-white/[0.05]">
          <div className="font-bold text-white text-[15px]">How It Works</div>
          <div className="text-[12px] text-slate-500 mt-0.5">Get the most out of SKY SMS</div>
        </div>
        <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          {howItWorks.map((tip, i) => (
            <div key={i} className="flex items-start gap-3.5 p-4 rounded-xl border border-white/[0.05] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-200">
              <div className="h-8 w-8 rounded-xl bg-sky-500/8 border border-sky-400/12 flex items-center justify-center shrink-0 mt-0.5">
                <tip.icon className="h-4 w-4 text-sky-400" />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-white">{tip.title}</div>
                <div className="text-[12px] text-slate-500 mt-1 leading-relaxed">{tip.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
