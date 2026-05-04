import { useState } from "react";
import { useGetAdminOverview } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Phone, CreditCard, Activity, CheckCircle2, AlertCircle, Link2, Save, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCommunityLinks } from "@/hooks/useCommunityLinks";
import { useToast } from "@/hooks/use-toast";

function maskProviderName(name: string): string {
  return name === "Hero SMS" ? "SKY SMS" : name;
}

export default function AdminOverview() {
  const { data, isLoading, error } = useGetAdminOverview();
  const { discord, telegram, setDiscord, setTelegram } = useCommunityLinks();
  const { toast } = useToast();
  const [discordDraft, setDiscordDraft] = useState(discord);
  const [telegramDraft, setTelegramDraft] = useState(telegram);
  const [saving, setSaving] = useState(false);

  const saveLinks = () => {
    setSaving(true);
    setDiscord(discordDraft.trim());
    setTelegram(telegramDraft.trim());
    setTimeout(() => {
      setSaving(false);
      toast({ title: "Community links saved", description: "Invite links updated and visible to all users." });
    }, 400);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-52 mb-2 bg-white/[0.05]" />
          <Skeleton className="h-4 w-64 bg-white/[0.04]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-36 w-full rounded-2xl bg-white/[0.04]" />)}
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <Skeleton className="h-52 w-full rounded-2xl bg-white/[0.04]" />
          <Skeleton className="h-52 w-full rounded-2xl bg-white/[0.04]" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16">
        <div className="h-14 w-14 rounded-2xl bg-rose-400/10 border border-rose-400/20 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="h-7 w-7 text-rose-400" />
        </div>
        <h2 className="text-xl font-bold text-white">Failed to load overview</h2>
        <p className="text-slate-500 mt-1.5 text-sm">Please refresh the page.</p>
      </div>
    );
  }

  const stats = [
    { label: "Total Revenue",     value: `$${data.revenue.toFixed(2)}`, sub: "Lifetime payments",       icon: CreditCard, color: "sky",     testId: "admin-stat-revenue" },
    { label: "Total Users",       value: String(data.totalUsers),       sub: "Registered accounts",      icon: Users,      color: "indigo",  testId: "admin-stat-users" },
    { label: "Active Rentals",    value: String(data.activeRentals),    sub: "Currently processing",     icon: Phone,      color: "emerald", testId: "admin-stat-rentals" },
    { label: "Pending Payments",  value: String(data.pendingPayments),  sub: "Awaiting confirmation",    icon: Activity,   color: "amber",   testId: "admin-stat-pending" },
  ];

  const colorMap: Record<string, { from: string; icon: string; badge: string }> = {
    sky:     { from: "from-sky-400/[0.07]",     icon: "bg-sky-400/10 border-sky-400/20 text-sky-400",     badge: "text-sky-300" },
    indigo:  { from: "from-indigo-400/[0.07]",  icon: "bg-indigo-400/10 border-indigo-400/20 text-indigo-400",  badge: "text-indigo-300" },
    emerald: { from: "from-emerald-400/[0.07]", icon: "bg-emerald-400/10 border-emerald-400/20 text-emerald-400", badge: "text-emerald-300" },
    amber:   { from: "from-amber-400/[0.07]",   icon: "bg-amber-400/10 border-amber-400/20 text-amber-400",   badge: "text-amber-300" },
  };

  return (
    <div className="space-y-7 page-enter">

      {/* Header */}
      <div className="page-enter page-enter-d1">
        <h1 className="text-[2rem] font-black tracking-tight text-white">Admin Overview</h1>
        <p className="text-slate-500 mt-1.5 text-[14px]">Platform metrics and configuration.</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 page-enter page-enter-d2">
        {stats.map((stat) => {
          const c = colorMap[stat.color];
          return (
            <div key={stat.label} className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-transparent relative overflow-hidden p-6" data-testid={stat.testId}>
              <div className={`absolute inset-0 bg-gradient-to-br ${c.from} to-transparent pointer-events-none`} />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-tight">{stat.label}</span>
                  <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${c.icon}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-[2.5rem] font-black text-white leading-none tracking-tight mb-1.5">{stat.value}</div>
                <p className={`text-[12px] font-semibold ${c.badge}`}>{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Provider status + Community links */}
      <div className="grid gap-5 md:grid-cols-2 page-enter page-enter-d3">

        {/* Provider status */}
        <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.06]">
            <div className="font-bold text-white text-[15px]">Provider Status</div>
            <div className="text-[12px] text-slate-500 mt-0.5">Upstream SMS provider health and balance.</div>
          </div>
          <div className="p-5 space-y-3">
            {data.providerStatuses.map(provider => (
              <div key={provider.name} className="flex items-start justify-between gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]" data-testid={`admin-provider-${provider.name}`}>
                <div className="flex items-start gap-3">
                  {provider.mode === "live" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-semibold text-[13px] text-white">{maskProviderName(provider.name)}</div>
                    <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">{provider.message}</p>
                  </div>
                </div>
                <Badge variant="outline" className={`text-[11px] shrink-0 font-semibold ${provider.mode === "live" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200" : "border-amber-400/20 bg-amber-400/10 text-amber-200"}`}>
                  {provider.mode}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Community links */}
        <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.06]">
            <div className="font-bold text-white text-[15px] flex items-center gap-2">
              <Link2 className="h-4 w-4 text-sky-400" />
              Community Links
            </div>
            <div className="text-[12px] text-slate-500 mt-0.5">These invite links appear as buttons in the user sidebar.</div>
          </div>
          <div className="p-5 space-y-4">
            {/* Discord */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[12px] font-semibold text-slate-400">
                <div className="h-5 w-5 rounded-md bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                  <MessageCircle className="h-3 w-3 text-indigo-400" />
                </div>
                Discord Invite Link
              </label>
              <input
                type="url"
                placeholder="https://discord.gg/your-invite"
                value={discordDraft}
                onChange={e => setDiscordDraft(e.target.value)}
                className="w-full h-10 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-[13px] text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/40 focus:bg-sky-400/[0.03] transition-all"
              />
            </div>
            {/* Telegram */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[12px] font-semibold text-slate-400">
                <div className="h-5 w-5 rounded-md bg-sky-500/15 border border-sky-500/20 flex items-center justify-center">
                  <MessageCircle className="h-3 w-3 text-sky-400" />
                </div>
                Telegram Invite Link
              </label>
              <input
                type="url"
                placeholder="https://t.me/your-channel"
                value={telegramDraft}
                onChange={e => setTelegramDraft(e.target.value)}
                className="w-full h-10 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-[13px] text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/40 focus:bg-sky-400/[0.03] transition-all"
              />
            </div>
            <button
              onClick={saveLinks}
              disabled={saving}
              className="flex items-center gap-2 h-10 px-5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-[13px] font-semibold text-white hover:from-sky-400 hover:to-sky-500 transition-all shadow-[0_4px_16px_rgba(14,165,233,0.25)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving…" : "Save Links"}
            </button>
            {(discord || telegram) && (
              <div className="flex flex-wrap gap-2 pt-1">
                {discord && (
                  <a href={discord} target="_blank" rel="noopener noreferrer" className="text-[11px] text-indigo-300 border border-indigo-400/20 bg-indigo-400/8 rounded-full px-3 py-1 hover:bg-indigo-400/15 transition-colors font-medium">
                    Discord active
                  </a>
                )}
                {telegram && (
                  <a href={telegram} target="_blank" rel="noopener noreferrer" className="text-[11px] text-sky-300 border border-sky-400/20 bg-sky-400/8 rounded-full px-3 py-1 hover:bg-sky-400/15 transition-colors font-medium">
                    Telegram active
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
