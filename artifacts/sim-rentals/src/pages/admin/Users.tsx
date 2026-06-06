import { useListAdminUsers } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search, Copy, Check, Shield, User, Ban, CheckCircle2, X, AlertTriangle,
  DollarSign, Phone, Calendar, Star, ExternalLink, ChevronRight, Mail
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { format } from "date-fns";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  credits: number;
  rentals: number;
  role: string;
  status: string;
  createdAt?: string;
  suspensionReason?: string;
};

function SuspendModal({
  user,
  onClose,
  onConfirm,
}: {
  user: { id: string; name: string; email: string; status: string };
  onClose: () => void;
  onConfirm: (status: string, reason: string) => Promise<void>;
}) {
  const isSuspended = user.status !== "active";
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onConfirm(isSuspended ? "active" : "suspended", reason);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0d1117] shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modal-enter 0.2s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <div className={`h-px ${isSuspended ? "bg-emerald-500/40" : "bg-red-500/40"}`} />
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${isSuspended ? "bg-emerald-500/10 border-emerald-500/20" : "bg-red-500/10 border-red-500/20"}`}>
                {isSuspended ? <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" /> : <Ban className="h-4.5 w-4.5 text-red-400" />}
              </div>
              <div>
                <div className="font-bold text-white text-[14.5px]">{isSuspended ? "Reactivate Account" : "Suspend Account"}</div>
                <div className="text-[12px] text-slate-500 mt-0.5">{user.name} · {user.email}</div>
              </div>
            </div>
            <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-white hover:bg-white/[0.06] transition-all">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="text-[13px] text-slate-400 mb-4 leading-relaxed">
            {isSuspended
              ? `This will allow ${user.name} to log in and use the platform again.`
              : `Suspending ${user.name} will immediately block their access. They will see your reason when trying to log in.`
            }
          </p>

          {!isSuspended && (
            <div className="mb-4">
              <label className="block text-[11.5px] font-semibold text-slate-500 mb-2">Reason <span className="text-slate-700">(optional)</span></label>
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Suspicious activity, policy violation…"
                className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 text-[13px] text-white placeholder:text-slate-600 outline-none focus:border-red-500/30 transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
          )}

          <div className="flex gap-2.5">
            <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-white/[0.08] text-[13px] font-semibold text-slate-500 hover:text-white hover:bg-white/[0.04] transition-all">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`flex-1 h-10 rounded-xl text-[13px] font-bold text-white transition-all disabled:opacity-50 ${
                isSuspended ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600/80 hover:bg-red-600"
              }`}
            >
              {loading ? "…" : isSuspended ? "Reactivate" : "Suspend User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserProfileModal({
  user,
  onClose,
  onSuspend,
  onCreditUpdate,
  onRoleChange,
}: {
  user: AdminUser;
  onClose: () => void;
  onSuspend: () => void;
  onCreditUpdate: (amount: number) => Promise<void>;
  onRoleChange: (role: "admin" | "user") => Promise<void>;
}) {
  const [creditInput, setCreditInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [roleLoading, setRoleLoading] = useState(false);
  const { toast } = useToast();

  const handleCredit = async () => {
    const amount = Number(creditInput);
    if (!Number.isFinite(amount) || amount === 0) {
      toast({ title: "Enter a credit amount", variant: "destructive" });
      return;
    }
    setSaving(true);
    try { await onCreditUpdate(amount); setCreditInput(""); }
    finally { setSaving(false); }
  };

  const handleRole = async () => {
    setRoleLoading(true);
    try { await onRoleChange(user.role === "admin" ? "user" : "admin"); }
    finally { setRoleLoading(false); }
  };

  const isSuspended = user.status !== "active";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#0d1117] shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modal-enter 0.2s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <div className="h-px bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <User className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <div className="font-bold text-white text-[14px]">{user.name}</div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                  isSuspended ? "text-red-300 border-red-500/20 bg-red-500/10" : "text-emerald-300 border-emerald-500/20 bg-emerald-500/10"
                }`}>{user.status}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${
                  user.role === "admin" ? "text-sky-300 border-sky-500/20 bg-sky-500/10" : "text-slate-400 border-white/10 bg-white/[0.04]"
                }`}>{user.role}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-white hover:bg-white/[0.06] transition-all">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: DollarSign, label: "Balance", value: `$${user.credits.toFixed(2)}`, color: "amber" },
              { icon: Phone, label: "Rentals", value: String(user.rentals), color: "sky" },
              { icon: Calendar, label: "Joined", value: user.createdAt ? format(new Date(user.createdAt), "MMM d") : "—", color: "violet" },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                <Icon className={`h-3.5 w-3.5 mx-auto mb-1.5 ${color === "amber" ? "text-amber-400" : color === "sky" ? "text-sky-400" : "text-violet-400"}`} />
                <div className="text-[13px] font-bold text-white">{value}</div>
                <div className="text-[10px] text-slate-600 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {/* Info rows */}
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.04]">
            <div className="flex items-center gap-3 px-3.5 py-2.5">
              <Mail className="h-3.5 w-3.5 text-slate-600 shrink-0" />
              <span className="text-[12.5px] text-slate-400 truncate">{user.email}</span>
            </div>
            <div className="flex items-start gap-3 px-3.5 py-2.5">
              <User className="h-3.5 w-3.5 text-slate-600 shrink-0 mt-0.5" />
              <span className="text-[11px] text-slate-500 font-mono break-all select-all">{user.id}</span>
            </div>
            {isSuspended && user.suspensionReason && (
              <div className="flex items-start gap-3 px-3.5 py-2.5">
                <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                <span className="text-[12px] text-red-300">{user.suspensionReason}</span>
              </div>
            )}
          </div>

          {/* Credit adjustment */}
          <div className="space-y-1.5">
            <label className="text-[11.5px] font-semibold text-slate-500">Adjust Credits</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                placeholder="+10 or -5"
                value={creditInput}
                onChange={(e) => setCreditInput(e.target.value)}
                className="flex-1 h-9 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-[13px] text-white text-right placeholder:text-slate-600 outline-none focus:border-amber-500/30 transition-all"
                onKeyDown={(e) => e.key === "Enter" && handleCredit()}
              />
              <button
                onClick={handleCredit}
                disabled={saving}
                className="h-9 px-4 rounded-xl bg-amber-500 text-[12.5px] font-bold text-slate-900 hover:bg-amber-400 transition-all disabled:opacity-50"
              >
                {saving ? "…" : "Apply"}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-0.5">
            <button
              onClick={handleRole}
              disabled={roleLoading}
              className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-xl border border-sky-500/20 bg-sky-500/[0.06] text-[12.5px] font-semibold text-sky-400 hover:bg-sky-500/[0.1] transition-all disabled:opacity-50"
            >
              {user.role === "admin" ? <User className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
              {roleLoading ? "…" : user.role === "admin" ? "Demote" : "Make Admin"}
            </button>
            <button
              onClick={onSuspend}
              className={`flex-1 h-9 flex items-center justify-center gap-1.5 rounded-xl text-[12.5px] font-semibold transition-all ${
                isSuspended
                  ? "border border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400 hover:bg-emerald-500/[0.1]"
                  : "border border-red-500/20 bg-red-500/[0.06] text-red-400 hover:bg-red-500/[0.1]"
              }`}
            >
              {isSuspended ? <><CheckCircle2 className="h-3.5 w-3.5" /> Restore</> : <><Ban className="h-3.5 w-3.5" /> Suspend</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const { data, isLoading, error, refetch } = useListAdminUsers();
  const [search, setSearch] = useState("");
  const [creditDrafts, setCreditDrafts] = useState<Record<string, string>>({});
  const [savingUser, setSavingUser] = useState<string | null>(null);
  const [savingRole, setSavingRole] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [suspendModal, setSuspendModal] = useState<AdminUser | null>(null);
  const [profileModal, setProfileModal] = useState<AdminUser | null>(null);
  const { toast } = useToast();

  const copyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "User ID copied", duration: 2000 });
  };

  const addCredits = async (userId: string, amount?: number) => {
    const amt = amount ?? Number(creditDrafts[userId]);
    if (!Number.isFinite(amt) || amt === 0) {
      toast({ title: "Enter a credit amount", description: "Use positive to add, negative to remove.", variant: "destructive" });
      return;
    }
    setSavingUser(userId);
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/credits`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amt }),
      });
      const result = await res.json().catch(() => null);
      if (!res.ok) throw new Error(result?.error || `HTTP ${res.status}`);
      setCreditDrafts((c) => ({ ...c, [userId]: "" }));
      await refetch();
      toast({ title: "Credits updated", description: `${amt > 0 ? "Added" : "Removed"} ${Math.abs(amt)} credits.` });
    } catch (err) {
      toast({ title: "Failed to update credits", description: err instanceof Error ? err.message : "Try again.", variant: "destructive" });
    } finally {
      setSavingUser(null);
    }
  };

  const changeRole = async (userId: string, newRole: "admin" | "user") => {
    setSavingRole(userId);
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const result = await res.json().catch(() => null);
      if (!res.ok) throw new Error(result?.error || `HTTP ${res.status}`);
      await refetch();
      toast({ title: "Role updated", description: `Role changed to ${newRole}.` });
    } catch (err) {
      toast({ title: "Failed to update role", description: err instanceof Error ? err.message : "Try again.", variant: "destructive" });
    } finally {
      setSavingRole(null);
    }
  };

  const changeStatus = async (userId: string, status: string, reason: string) => {
    const res = await fetch(`${API_URL}/api/admin/users/${userId}/status`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reason }),
    });
    const result = await res.json().catch(() => null);
    if (!res.ok) throw new Error(result?.error || `HTTP ${res.status}`);
    await refetch();
    toast({
      title: status === "active" ? "Account reactivated" : "Account suspended",
      description: status === "active"
        ? "User can now log in and use the platform."
        : `User has been suspended${reason ? `: ${reason}` : ""}.`,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-36 bg-white/[0.04]" />
        <Skeleton className="h-4 w-60 bg-white/[0.03]" />
        <div className="space-y-2">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-16 rounded-xl bg-white/[0.04]" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-[15px] font-semibold text-white">Failed to load users</h2>
      </div>
    );
  }

  const filtered = (data.users as AdminUser[]).filter((u) =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Profile Modal */}
      {profileModal && (
        <UserProfileModal
          user={profileModal}
          onClose={() => setProfileModal(null)}
          onSuspend={() => {
            setSuspendModal(profileModal);
            setProfileModal(null);
          }}
          onCreditUpdate={async (amount) => {
            await addCredits(profileModal.id, amount);
            const updated = (data.users as AdminUser[]).find(u => u.id === profileModal.id);
            if (updated) setProfileModal({ ...updated, credits: updated.credits + amount });
          }}
          onRoleChange={async (role) => {
            await changeRole(profileModal.id, role);
            setProfileModal(null);
          }}
        />
      )}

      {/* Suspend Modal */}
      {suspendModal && (
        <SuspendModal
          user={suspendModal}
          onClose={() => setSuspendModal(null)}
          onConfirm={async (status, reason) => {
            await changeStatus(suspendModal.id, status, reason);
            setSuspendModal(null);
          }}
        />
      )}

      <div className="space-y-5">
        <div>
          <h1 className="text-[17px] font-bold text-white">Users</h1>
          <p className="text-slate-500 mt-0.5 text-[13px]">Manage platform users, credits, roles, and account status.</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
          <input
            type="search"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-9 pr-4 text-[13px] text-white placeholder:text-slate-600 outline-none focus:border-amber-500/30 transition-all"
          />
        </div>

        {/* User list */}
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-[13px] text-slate-600">No users found.</div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {filtered.map((user) => {
                const isSuspended = user.status !== "active";
                return (
                  <div
                    key={user.id}
                    data-testid={`admin-row-user-${user.id}`}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Avatar/initials */}
                    <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/15 flex items-center justify-center text-amber-400 font-bold text-[13px] shrink-0 uppercase">
                      {user.name.charAt(0)}
                    </div>

                    {/* Info — clickable to open profile */}
                    <button
                      type="button"
                      onClick={() => setProfileModal(user)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-[13.5px] truncate">{user.name}</span>
                        {user.role === "admin" && (
                          <span className="inline-flex items-center text-[9.5px] font-bold px-1.5 py-0 rounded-full border text-sky-300 border-sky-500/20 bg-sky-500/10">Admin</span>
                        )}
                        {isSuspended && (
                          <span className="inline-flex items-center text-[9.5px] font-bold px-1.5 py-0 rounded-full border text-red-300 border-red-500/20 bg-red-500/10">Suspended</span>
                        )}
                      </div>
                      <div className="text-[11.5px] text-slate-600 truncate mt-0.5">{user.email}</div>
                    </button>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-[13px] font-bold font-mono text-amber-400">${user.credits.toFixed(2)}</div>
                        <div className="text-[10.5px] text-slate-600">credits</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[13px] font-bold text-white">{user.rentals}</div>
                        <div className="text-[10.5px] text-slate-600">rentals</div>
                      </div>
                    </div>

                    {/* Quick actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Copy ID */}
                      <button
                        type="button"
                        onClick={(e) => copyId(user.id, e)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] transition-all"
                        title="Copy user ID"
                      >
                        {copiedId === user.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>

                      {/* Inline credit */}
                      <div className="hidden md:flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="+10"
                          value={creditDrafts[user.id] ?? ""}
                          onChange={(e) => setCreditDrafts((c) => ({ ...c, [user.id]: e.target.value }))}
                          className="h-7 w-16 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2 text-[12px] text-white text-right placeholder:text-slate-700 outline-none focus:border-amber-500/30 transition-all"
                          onKeyDown={(e) => e.key === "Enter" && addCredits(user.id)}
                        />
                        <button
                          onClick={() => addCredits(user.id)}
                          disabled={savingUser === user.id}
                          className="h-7 px-2.5 rounded-lg bg-amber-500/15 border border-amber-500/20 text-[11.5px] font-bold text-amber-400 hover:bg-amber-500/25 transition-all disabled:opacity-50"
                        >
                          {savingUser === user.id ? "…" : "Apply"}
                        </button>
                      </div>

                      {/* Suspend toggle */}
                      <button
                        type="button"
                        onClick={() => setSuspendModal(user)}
                        className={`h-7 px-2.5 rounded-lg text-[11.5px] font-semibold transition-all ${
                          isSuspended
                            ? "border border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-400 hover:bg-emerald-500/10"
                            : "border border-red-500/20 bg-red-500/[0.05] text-red-400 hover:bg-red-500/10"
                        }`}
                      >
                        {isSuspended ? "Restore" : "Suspend"}
                      </button>

                      {/* View profile */}
                      <button
                        type="button"
                        onClick={() => setProfileModal(user)}
                        className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/[0.05] transition-all"
                        title="View profile"
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
