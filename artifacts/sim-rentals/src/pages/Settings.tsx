import { useGetMe } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User, LogOut, HelpCircle, FileText, RefreshCw, Shield,
  ExternalLink, ChevronRight, DollarSign, Zap, Globe, Clock, MessageSquare, Lock,
  Key, Plus, Trash2, Copy, Check, Eye, EyeOff, AlertTriangle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Reveal } from "@/components/Reveal";
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

const tips = [
  { icon: Globe,         title: "Select service first",   desc: "Always pick the service before choosing a country. The country list updates based on real-time availability." },
  { icon: Zap,           title: "20-minute window",        desc: "Once you rent a number, you have 20 minutes to receive an SMS. If nothing arrives, you get a full automatic refund." },
  { icon: RefreshCw,     title: "Cancel to get refunded", desc: "If you change your mind or the number isn't working, cancel the rental and your balance is instantly restored." },
  { icon: MessageSquare, title: "Copy codes instantly",   desc: "Verification codes appear on your rental card. Tap once to copy to clipboard." },
  { icon: DollarSign,    title: "Add any amount",         desc: "Top up with any dollar amount — even less than $1. Go to Payments and use the custom amount field." },
  { icon: Lock,          title: "Private by design",      desc: "All payments go through OxaPay crypto processing. No card details stored, fully private." },
];

interface ApiKey { id: string; name: string; prefix: string; lastUsedAt: string | null; createdAt: string; }

function ApiKeysSection() {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [revealedKey, setRevealedKey] = useState<{ id: string; key: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/keys`, { credentials: "include" });
      const data = await res.json();
      setKeys(data.keys ?? []);
    } catch {
      toast({ title: "Failed to load API keys", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const createKey = async () => {
    const name = newName.trim();
    if (!name) return;
    setCreating(true);
    try {
      const res = await fetch(`${API_URL}/api/keys`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setRevealedKey({ id: data.id, key: data.key });
      setNewName("");
      setShowForm(false);
      await fetchKeys();
      toast({ title: "API key created", description: "Copy and store it safely — it won't be shown again." });
    } catch (err) {
      toast({ title: "Failed to create key", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  };

  const revokeKey = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}/api/keys/${id}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      setKeys((prev) => prev.filter((k) => k.id !== id));
      if (revealedKey?.id === id) setRevealedKey(null);
      toast({ title: "API key revoked" });
    } catch {
      toast({ title: "Failed to revoke key", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const copyKey = async (key: string) => {
    await navigator.clipboard.writeText(key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <Key className="h-4 w-4 text-violet-400" />
          <div className="font-semibold text-white text-[15px]">API Keys</div>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg bg-violet-500/10 border border-violet-400/20 text-[12px] font-semibold text-violet-300 hover:bg-violet-500/16 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> New Key
          </button>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Revealed key banner */}
        {revealedKey && (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-300 font-semibold text-[13px]">
              <Eye className="h-4 w-4" />
              Your new API key — copy it now, it won't be shown again
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-[11.5px] font-mono text-emerald-200 bg-black/30 border border-emerald-400/15 rounded-lg px-3 py-2.5 overflow-x-auto whitespace-nowrap" style={{ WebkitOverflowScrolling: "touch" }}>
                {revealedKey.key}
              </code>
              <button
                onClick={() => copyKey(revealedKey.key)}
                className="h-9 w-9 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-400/18 transition-colors shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <button onClick={() => setRevealedKey(null)} className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
              I've saved it, dismiss
            </button>
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 space-y-3">
            <div className="text-[13px] font-semibold text-white">Name your key</div>
            <input
              type="text"
              placeholder="e.g. Production Bot, Testing Script"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createKey()}
              maxLength={64}
              className="w-full h-10 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-[13px] text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/40 focus:bg-violet-400/[0.03] transition-all"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={createKey}
                disabled={creating || !newName.trim()}
                className="flex items-center gap-2 h-9 px-4 rounded-xl bg-violet-500 text-[13px] font-semibold text-white hover:bg-violet-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? "Generating…" : "Generate Key"}
              </button>
              <button
                onClick={() => { setShowForm(false); setNewName(""); }}
                className="h-9 px-4 rounded-xl border border-white/[0.08] text-[13px] font-semibold text-slate-400 hover:text-white hover:border-white/[0.14] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Key list */}
        {loading ? (
          <div className="space-y-2">
            {[1,2].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl bg-white/[0.03]" />)}
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-10">
            <div className="h-12 w-12 rounded-2xl bg-violet-400/8 border border-violet-400/12 flex items-center justify-center mx-auto mb-3">
              <Key className="h-6 w-6 text-violet-400/50" />
            </div>
            <p className="text-[13px] text-slate-500 font-medium">No API keys yet</p>
            <p className="text-[12px] text-slate-600 mt-1">Generate a key to start using the API.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {keys.map((k) => (
              <div key={k.id} className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.05] bg-white/[0.015]">
                <div className="h-8 w-8 rounded-lg bg-violet-400/8 border border-violet-400/12 flex items-center justify-center shrink-0">
                  <Key className="h-3.5 w-3.5 text-violet-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-white truncate">{k.name}</div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <code className="text-[11px] text-slate-500 font-mono">{k.prefix}…</code>
                    {k.lastUsedAt ? (
                      <span className="text-[11px] text-slate-600">Used {format(new Date(k.lastUsedAt), "MMM d, yyyy")}</span>
                    ) : (
                      <span className="text-[11px] text-slate-700">Never used</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => revokeKey(k.id)}
                  disabled={deletingId === k.id}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-rose-400 hover:bg-rose-400/8 transition-all shrink-0 disabled:opacity-50"
                  title="Revoke key"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-start gap-2.5 rounded-xl border border-amber-400/12 bg-amber-400/4 p-3.5">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11.5px] text-slate-500 leading-relaxed">
            API keys have full account access. Store them securely and never expose them in client-side code or public repositories.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const { data: user, isLoading: userLoading } = useGetMe();
  const { logout } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-7">

      <Reveal variant="up">
        <div>
          <h1 className="text-[2rem] font-black tracking-tight text-white">Settings</h1>
          <p className="text-slate-500 mt-1.5 text-[14px]">Manage your account and learn how to get the most out of SKY SMS.</p>
        </div>
      </Reveal>

      {/* Profile */}
      <Reveal variant="up" delay={40}>
        <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-5 border-b border-white/[0.05]">
            <User className="h-4 w-4 text-sky-400" />
            <div className="font-semibold text-white text-[15px]">Profile</div>
          </div>
          <div className="p-6">
            {userLoading ? (
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full bg-white/[0.04]" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40 bg-white/[0.04]" />
                  <Skeleton className="h-4 w-32 bg-white/[0.03]" />
                </div>
              </div>
            ) : user ? (
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                <Avatar className="h-20 w-20 border-2 border-white/[0.09]">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="text-xl bg-sky-400/10 text-sky-300 font-black">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-xl font-black text-white">{user.name}</h3>
                    {user.role === "admin" && (
                      <Badge variant="outline" className="border-rose-400/20 bg-rose-400/8 text-rose-300 text-[11px] font-bold">Admin</Badge>
                    )}
                  </div>
                  <p className="text-slate-500 text-[13px]">{user.email}</p>
                  <div className="flex items-center gap-4 pt-1">
                    <div className="flex items-center gap-1.5 text-[13px]">
                      <DollarSign className="h-3.5 w-3.5 text-sky-400" />
                      <span className="text-white font-bold">${user.credits.toFixed(2)}</span>
                      <span className="text-slate-500">balance</span>
                    </div>
                    <Link href="/payments">
                      <span className="text-[12px] text-sky-400 font-semibold hover:text-sky-300 transition-colors cursor-pointer flex items-center gap-1">
                        Add funds <ChevronRight className="h-3 w-3" />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Reveal>

      {/* API Keys */}
      <Reveal variant="up" delay={60}>
        <ApiKeysSection />
      </Reveal>

      {/* Tips */}
      <Reveal variant="up" delay={80}>
        <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-5 border-b border-white/[0.05]">
            <HelpCircle className="h-4 w-4 text-sky-400" />
            <div className="font-semibold text-white text-[15px]">How to Use SKY SMS</div>
          </div>
          <div className="p-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tips.map((tip, i) => (
                <div key={i} className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/[0.08] transition-colors">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="h-8 w-8 rounded-lg bg-sky-400/8 border border-sky-400/12 flex items-center justify-center shrink-0">
                      <tip.icon className="h-4 w-4 text-sky-400" />
                    </div>
                    <span className="font-semibold text-white text-[13px]">{tip.title}</span>
                  </div>
                  <p className="text-[12px] text-slate-500 leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Support & Legal */}
      <Reveal variant="up" delay={100}>
        <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-5 border-b border-white/[0.05]">
            <Shield className="h-4 w-4 text-sky-400" />
            <div className="font-semibold text-white text-[15px]">Support & Legal</div>
          </div>
          <div className="p-5 space-y-2">
            {[
              { href: "/terms",         icon: FileText,  label: "Terms of Service", desc: "Read the rules for using SKY SMS" },
              { href: "/refund-policy", icon: RefreshCw, label: "Refund Policy",    desc: "Learn when refunds are issued" },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.05] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/[0.08] transition-colors cursor-pointer group">
                  <div className="h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-[13px]">{item.label}</div>
                    <div className="text-[12px] text-slate-500 mt-0.5">{item.desc}</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-700 group-hover:text-slate-400 transition-colors shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Sign Out */}
      <Reveal variant="up" delay={120}>
        <div className="rounded-2xl border border-rose-400/10 bg-gradient-to-br from-white/[0.02] to-transparent overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-5 border-b border-white/[0.05]">
            <LogOut className="h-4 w-4 text-rose-400" />
            <div className="font-semibold text-white text-[15px]">Sign Out</div>
          </div>
          <div className="p-5">
            <p className="text-[13px] text-slate-500 mb-4">Sign out of your SKY SMS account on this device.</p>
            <button
              onClick={logout}
              className="flex items-center gap-2 h-10 px-5 rounded-xl border border-rose-400/20 text-rose-300 text-[13px] font-semibold hover:bg-rose-400/8 hover:border-rose-400/30 transition-colors"
              data-testid="button-settings-signout"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </Reveal>

    </div>
  );
}
