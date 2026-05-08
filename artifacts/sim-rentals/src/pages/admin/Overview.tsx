import { useState, useEffect } from "react";
import { useGetAdminOverview } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Phone, CreditCard, Activity, CheckCircle2, AlertCircle, Link2, Save, MessageCircle, Gift, ToggleLeft, ToggleRight, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCommunityLinks } from "@/hooks/useCommunityLinks";
import { useToast } from "@/hooks/use-toast";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

function ReferralSettingsCard() {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(true);
  const [bonusAmount, setBonusAmount] = useState("0.50");
  const [minDepositAmount, setMinDepositAmount] = useState("0.00");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/referral-settings`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        setEnabled(d.enabled);
        setBonusAmount(Number(d.bonusAmount).toFixed(2));
        setMinDepositAmount(Number(d.minDepositAmount ?? 0).toFixed(2));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    const amt = parseFloat(bonusAmount);
    const minDep = parseFloat(minDepositAmount);
    if (isNaN(amt) || amt < 0 || amt > 100) {
      toast({ title: "Invalid bonus amount", variant: "destructive" }); return;
    }
    if (isNaN(minDep) || minDep < 0) {
      toast({ title: "Invalid minimum deposit amount", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/referral-settings`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, bonusAmount: amt, minDepositAmount: minDep }),
      });
      if (!res.ok) throw new Error();
      const depositNote = minDep > 0 ? `, min deposit $${minDep.toFixed(2)}` : ", no deposit required";
      toast({ title: "Referral settings saved", description: `Program ${enabled ? "enabled" : "disabled"}, bonus $${amt.toFixed(2)} per referral${depositNote}.` });
    } catch {
      toast({ title: "Failed to save settings", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <div className="px-6 py-5 border-b border-white/[0.06]">
        <div className="font-bold text-white text-[15px] flex items-center gap-2">
          <Gift className="h-4 w-4 text-amber-400" />
          Referral Program
        </div>
        <div className="text-[12px] text-slate-500 mt-0.5">Control the referral system, bonus amounts, and deposit requirements.</div>
      </div>
      <div className="p-5 space-y-5">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 rounded-xl bg-white/[0.04]" />
            <Skeleton className="h-12 rounded-xl bg-white/[0.04]" />
            <Skeleton className="h-12 rounded-xl bg-white/[0.04]" />
          </div>
        ) : (
          <>
            {/* Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <div>
                <div className="text-[13px] font-semibold text-white">Referral Program</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{enabled ? "Users can share codes and earn bonuses" : "Referral codes are disabled for all users"}</div>
              </div>
              <button
                onClick={() => setEnabled(e => !e)}
                className="ml-4 shrink-0 transition-colors"
              >
                {enabled
                  ? <ToggleRight className="h-8 w-8 text-amber-400" />
                  : <ToggleLeft className="h-8 w-8 text-slate-600" />}
              </button>
            </div>

            {/* Bonus amount */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[12px] font-semibold text-slate-400">
                <div className="h-5 w-5 rounded-md bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
                  <DollarSign className="h-3 w-3 text-amber-400" />
                </div>
                Bonus per referral (USD)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[14px] pl-1">$</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={bonusAmount}
                  onChange={e => setBonusAmount(e.target.value)}
                  className="flex-1 h-10 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-[13px] text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/35 transition-all"
                />
                <span className="text-slate-600 text-[12px]">credited to both users</span>
              </div>
            </div>

            {/* Minimum deposit requirement */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[12px] font-semibold text-slate-400">
                <div className="h-5 w-5 rounded-md bg-sky-500/15 border border-sky-500/20 flex items-center justify-center">
                  <DollarSign className="h-3 w-3 text-sky-400" />
                </div>
                Minimum deposit to unlock reward (USD)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[14px] pl-1">$</span>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  step="0.01"
                  value={minDepositAmount}
                  onChange={e => setMinDepositAmount(e.target.value)}
                  className="flex-1 h-10 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-[13px] text-white placeholder:text-slate-600 focus:outline-none focus:border-sky-500/35 transition-all"
                />
                <span className="text-slate-600 text-[12px]">0 = instant reward</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed pl-1">
                Set to 0 to credit both users immediately when the code is applied. Set a value to hold the reward until the invited user makes a deposit of at least that amount.
              </p>
            </div>

            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 h-10 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[13px] font-semibold text-slate-900 hover:from-amber-400 hover:to-amber-500 transition-all shadow-[0_4px_16px_rgba(212,168,67,0.2)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving…" : "Save Settings"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

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
        <h1 className="text-xl font-semibold text-white">Admin Overview</h1>
        <p className="text-slate-500 mt-1.5 text-[14px]">Platform metrics and configuration.</p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 page-enter page-enter-d2">
        {stats.map((stat) => {
          const c = colorMap[stat.color];
          return (
            <div key={stat.label} className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6" data-testid={stat.testId}>
              <div className="flex items-start justify-between mb-4">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-tight">{stat.label}</span>
                <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${c.icon}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-[2rem] font-bold text-white leading-none mb-1.5">{stat.value}</div>
              <p className={`text-[12px] font-semibold ${c.badge}`}>{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Referral settings */}
      <div className="page-enter page-enter-d3">
        <ReferralSettingsCard />
      </div>

      {/* Provider status + Community links */}
      <div className="grid gap-5 md:grid-cols-2 page-enter page-enter-d3">

        {/* Provider status */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
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
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
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
