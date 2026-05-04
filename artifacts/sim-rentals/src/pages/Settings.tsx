import { useGetMe } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User, LogOut, HelpCircle, FileText, RefreshCw, Shield,
  ExternalLink, DollarSign, Zap, Globe, Clock, MessageSquare, Lock,
  Key, Plus, Trash2, Copy, Check, AlertTriangle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { Reveal } from "@/components/Reveal";
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

const tips = [
  { icon: Globe,         title: "Select service first",   desc: "Always pick the service before choosing a country — the country list updates based on live availability." },
  { icon: Zap,           title: "20-minute window",       desc: "Once you rent a number, you have 20 minutes to receive an SMS. If nothing arrives, you get a full refund automatically." },
  { icon: RefreshCw,     title: "Cancel for a refund",   desc: "If you change your mind, cancel the rental and your balance is instantly restored." },
  { icon: MessageSquare, title: "Copy codes instantly",  desc: "Verification codes appear on your rental card. Tap once to copy to clipboard." },
  { icon: DollarSign,    title: "Top up any amount",     desc: "Add any dollar amount — even less than $1. Go to Payments and use the custom amount field." },
  { icon: Lock,          title: "Private by design",     desc: "All payments go through OxaPay crypto processing. No card details stored." },
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
      toast({ title: "API key created", description: "Store it safely — it won't be shown again." });
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
      toast({ title: "Key revoked" });
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

  const atLimit = keys.length >= 3;

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <Key className="h-4 w-4 text-slate-400" />
          <span className="font-semibold text-white text-[14px]">API Keys</span>
          <span className="text-[11px] text-slate-600 font-medium">{keys.length}/3</span>
        </div>
        {!showForm && !atLimit && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 h-8 px-3.5 rounded-lg border border-white/[0.09] bg-white/[0.04] text-[12px] font-semibold text-white hover:bg-white/[0.07] transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> New Key
          </button>
        )}
        {atLimit && !showForm && (
          <span className="text-[11.5px] text-slate-600">Revoke a key to add another</span>
        )}
      </div>

      <div className="p-5 space-y-3">
        {/* Revealed key banner */}
        {revealedKey && (
          <div className="rounded-xl border border-white/[0.09] bg-white/[0.03] p-4 space-y-3">
            <div className="text-[12.5px] font-semibold text-white">Your new API key — copy it now</div>
            <div className="text-[11.5px] text-slate-500">It won't be shown again after you dismiss this.</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-[11px] font-mono text-slate-300 bg-black/30 border border-white/[0.07] rounded-lg px-3 py-2.5 overflow-x-auto whitespace-nowrap" style={{ WebkitOverflowScrolling: "touch" }}>
                {revealedKey.key}
              </code>
              <button
                onClick={() => copyKey(revealedKey.key)}
                className="h-9 w-9 rounded-lg border border-white/[0.08] bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors shrink-0"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <button onClick={() => setRevealedKey(null)} className="text-[11px] text-slate-600 hover:text-slate-300 transition-colors">
              I've saved it — dismiss
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
              className="w-full h-10 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-[13px] text-white placeholder:text-slate-600 focus:outline-none focus:border-white/[0.18] transition-all"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={createKey}
                disabled={creating || !newName.trim()}
                className="h-9 px-5 rounded-xl bg-white text-[13px] font-semibold text-[#050914] hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {creating ? "Generating…" : "Generate"}
              </button>
              <button
                onClick={() => { setShowForm(false); setNewName(""); }}
                className="h-9 px-4 rounded-xl border border-white/[0.08] text-[13px] font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Key list */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl bg-white/[0.03]" />)}
          </div>
        ) : keys.length === 0 ? (
          <div className="text-center py-8">
            <Key className="h-8 w-8 text-slate-700 mx-auto mb-2.5" />
            <p className="text-[13px] text-slate-500">No API keys yet</p>
            <p className="text-[12px] text-slate-700 mt-1">Generate a key to start using the API.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {keys.map((k) => (
              <div key={k.id} className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/[0.05] bg-white/[0.015]">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-white">{k.name}</div>
                  <div className="flex items-center gap-2.5 mt-0.5 flex-wrap">
                    <code className="text-[11px] text-slate-600 font-mono">{k.prefix}…</code>
                    <span className="text-[11px] text-slate-700">
                      {k.lastUsedAt ? `Used ${format(new Date(k.lastUsedAt), "MMM d, yyyy")}` : "Never used"}
                    </span>
                    <span className="text-[11px] text-slate-700">
                      Created {format(new Date(k.createdAt), "MMM d")}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => revokeKey(k.id)}
                  disabled={deletingId === k.id}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-700 hover:text-slate-300 hover:bg-white/[0.06] transition-all shrink-0 disabled:opacity-40"
                  title="Revoke key"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.05] bg-white/[0.015] p-3.5">
          <AlertTriangle className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-[11.5px] text-slate-600 leading-relaxed">
            API keys grant full account access. Never expose them in client-side code or public repositories.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function Settings() {
  const { data: user, isLoading: userLoading } = useGetMe();
  const { logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      <Reveal variant="up">
        <h1 className="text-[1.75rem] font-black tracking-tight text-white">Settings</h1>
      </Reveal>

      {/* Profile */}
      <Reveal variant="up" delay={40}>
        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-white/[0.05]">
            <User className="h-4 w-4 text-slate-400" />
            <span className="font-semibold text-white text-[14px]">Profile</span>
          </div>
          <div className="p-5">
            {userLoading ? (
              <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-full bg-white/[0.04]" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-40 bg-white/[0.04]" />
                  <Skeleton className="h-4 w-32 bg-white/[0.03]" />
                </div>
              </div>
            ) : user ? (
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border border-white/[0.09] shrink-0">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="text-lg bg-white/[0.06] text-white font-bold">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[15px] font-bold text-white truncate">{user.name}</span>
                    {user.role === "admin" && (
                      <span className="text-[10px] font-bold text-slate-400 border border-white/[0.1] rounded-full px-2 py-0.5">ADMIN</span>
                    )}
                  </div>
                  <p className="text-[12.5px] text-slate-500 mt-0.5 truncate">{user.email}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[13px] font-bold text-white">${user.credits.toFixed(2)}</span>
                    <span className="text-[12px] text-slate-600">balance</span>
                    <Link href="/payments">
                      <span className="text-[12px] text-slate-400 hover:text-white transition-colors cursor-pointer font-medium">Add funds →</span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </Reveal>

      {/* API Keys */}
      <Reveal variant="up" delay={60}>
        <ApiKeysSection />
      </Reveal>

      {/* Tips */}
      <Reveal variant="up" delay={80}>
        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-white/[0.05]">
            <HelpCircle className="h-4 w-4 text-slate-400" />
            <span className="font-semibold text-white text-[14px]">Tips</span>
          </div>
          <div className="p-5">
            <div className="grid gap-2.5 sm:grid-cols-2">
              {tips.map((tip, i) => (
                <div key={i} className="p-3.5 rounded-xl border border-white/[0.05] bg-white/[0.01]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <tip.icon className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                    <span className="font-semibold text-white text-[12.5px]">{tip.title}</span>
                  </div>
                  <p className="text-[12px] text-slate-600 leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </Reveal>

      {/* Legal */}
      <Reveal variant="up" delay={100}>
        <section className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-white/[0.05]">
            <Shield className="h-4 w-4 text-slate-400" />
            <span className="font-semibold text-white text-[14px]">Legal</span>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {[
              { href: "/terms",         icon: FileText,  label: "Terms of Service" },
              { href: "/refund-policy", icon: RefreshCw, label: "Refund Policy" },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.03] transition-colors cursor-pointer group">
                  <item.icon className="h-4 w-4 text-slate-600" />
                  <span className="flex-1 text-[13px] font-medium text-slate-300 group-hover:text-white transition-colors">{item.label}</span>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-700 group-hover:text-slate-500 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Sign Out */}
      <Reveal variant="up" delay={120}>
        <div className="pb-2">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-[13px] font-medium text-slate-600 hover:text-white transition-colors"
            data-testid="button-settings-signout"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </Reveal>

    </div>
  );
}
