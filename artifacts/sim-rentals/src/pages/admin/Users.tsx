import { useListAdminUsers } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, Copy, Check, Shield, User, Ban, CheckCircle2, X, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm modal-overlay-enter" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-[#080c18] shadow-[0_24px_80px_rgba(0,0,0,0.7)] p-7 modal-content-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top line accent */}
        <div className={`absolute inset-x-0 top-0 h-px rounded-t-3xl ${isSuspended ? "bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" : "bg-gradient-to-r from-transparent via-red-500/50 to-transparent"}`} />

        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl border flex items-center justify-center ${isSuspended ? "bg-emerald-500/10 border-emerald-500/25" : "bg-red-500/10 border-red-500/25"}`}>
              {isSuspended ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <Ban className="h-5 w-5 text-red-400" />}
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-white">{isSuspended ? "Reactivate Account" : "Suspend Account"}</h3>
              <p className="text-[12px] text-slate-500 mt-0.5">{user.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-600 hover:text-white hover:bg-white/[0.06] transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-[13.5px] text-slate-400 mb-5 leading-relaxed">
          {isSuspended
            ? `This will allow ${user.name} to log in and use the platform again.`
            : `Suspending ${user.name} will immediately block their access. They will see your reason when trying to log in.`
          }
        </p>

        {!isSuspended && (
          <div className="mb-5">
            <label className="block text-[12px] font-semibold text-slate-400 mb-2">
              Suspension reason
              <span className="text-slate-600 font-normal ml-1">(optional but recommended)</span>
            </label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Suspicious activity, policy violation…"
              className="bg-white/[0.03] border-white/[0.08] focus:border-red-500/40 focus:ring-red-500/10"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-white/[0.08] text-slate-400 hover:text-white hover:bg-white/[0.04]"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 font-bold ${
              isSuspended
                ? "bg-emerald-600 hover:bg-emerald-500 text-white border-0"
                : "bg-red-600/80 hover:bg-red-600 text-white border-0"
            }`}
          >
            {loading ? "..." : isSuspended ? "Reactivate" : "Suspend User"}
          </Button>
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
  const [suspendModal, setSuspendModal] = useState<{ id: string; name: string; email: string; status: string } | null>(null);
  const { toast } = useToast();

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: "User ID copied", duration: 2000 });
  };

  const addCredits = async (userId: string) => {
    const amount = Number(creditDrafts[userId]);
    if (!Number.isFinite(amount) || amount === 0) {
      toast({ title: "Enter a credit amount", description: "Use positive to add, negative to remove.", variant: "destructive" });
      return;
    }
    setSavingUser(userId);
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/credits`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || `HTTP ${response.status}`);
      setCreditDrafts((c) => ({ ...c, [userId]: "" }));
      await refetch();
      toast({ title: "Credits updated", description: `${amount > 0 ? "Added" : "Removed"} ${Math.abs(amount)} credits.` });
    } catch (err) {
      toast({ title: "Failed to update credits", description: err instanceof Error ? err.message : "Try again.", variant: "destructive" });
    } finally {
      setSavingUser(null);
    }
  };

  const changeRole = async (userId: string, newRole: "admin" | "user") => {
    setSavingRole(userId);
    try {
      const response = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || `HTTP ${response.status}`);
      await refetch();
      toast({ title: "Role updated", description: `User role changed to ${newRole}.` });
    } catch (err) {
      toast({ title: "Failed to update role", description: err instanceof Error ? err.message : "Try again.", variant: "destructive" });
    } finally {
      setSavingRole(null);
    }
  };

  const changeStatus = async (userId: string, status: string, reason: string) => {
    const response = await fetch(`${API_URL}/api/admin/users/${userId}/status`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, reason }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) throw new Error(result?.error || `HTTP ${response.status}`);
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
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-destructive">Failed to load users</h2>
      </div>
    );
  }

  const filtered = data.users.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {suspendModal && (
        <SuspendModal
          user={suspendModal}
          onClose={() => setSuspendModal(null)}
          onConfirm={async (status, reason) => {
            await changeStatus(suspendModal.id, status, reason);
          }}
        />
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
          <div>
            <h1 className="text-xl font-semibold text-white">Users</h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage platform users, credits, roles, and account status.</p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search users..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Mobile card list */}
        <div className="space-y-3 md:hidden">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-10 text-sm">No users found.</p>
          ) : filtered.map((user) => (
            <Card key={user.id} className="glass-card" data-testid={`admin-row-user-${user.id}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold text-white">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                  <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                    <Badge variant="outline" className={`text-xs ${user.status === 'active' ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200' : 'border-red-300/20 bg-red-400/10 text-red-200'}`}>
                      {user.status}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${user.role === 'admin' ? 'border-sky-300/20 bg-sky-400/10 text-sky-200' : 'border-white/10 bg-white/[0.05] text-slate-400'}`}>
                      {user.role}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-400 font-mono bg-white/[0.05] border border-white/10 rounded-lg px-2 py-1 truncate max-w-[200px]">{user.id}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-slate-500 hover:text-white" onClick={() => copyId(user.id)}>
                    {copiedId === user.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2">
                    <div className="text-xs text-muted-foreground mb-0.5">Credits</div>
                    <div className="font-mono font-bold text-white">{user.credits.toFixed(2)}</div>
                  </div>
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2">
                    <div className="text-xs text-muted-foreground mb-0.5">Rentals</div>
                    <div className="font-bold text-white">{user.rentals}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="+10"
                    value={creditDrafts[user.id] ?? ""}
                    onChange={(e) => setCreditDrafts((c) => ({ ...c, [user.id]: e.target.value }))}
                    className="flex-1 text-right"
                  />
                  <Button size="sm" onClick={() => addCredits(user.id)} disabled={savingUser === user.id} className="shrink-0">
                    {savingUser === user.id ? "..." : "Apply"}
                  </Button>
                  <Button size="sm" variant="outline" className="shrink-0" disabled={savingRole === user.id} onClick={() => changeRole(user.id, user.role === "admin" ? "user" : "admin")}>
                    {savingRole === user.id ? "..." : user.role === "admin" ? <User className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={`shrink-0 ${user.status === 'active' ? 'border-red-500/20 text-red-400 hover:bg-red-500/10' : 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'}`}
                    onClick={() => setSuspendModal({ id: user.id, name: user.name, email: user.email, status: user.status })}
                  >
                    {user.status === 'active' ? <Ban className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Desktop table */}
        <Card className="glass-card overflow-hidden hidden md:block">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/[0.02]">
                    <TableHead className="text-muted-foreground">User</TableHead>
                    <TableHead className="text-muted-foreground">User ID</TableHead>
                    <TableHead className="text-muted-foreground">Role</TableHead>
                    <TableHead className="text-right text-muted-foreground">Credits</TableHead>
                    <TableHead className="text-right text-muted-foreground">Rentals</TableHead>
                    <TableHead className="text-right text-muted-foreground">Add Credits</TableHead>
                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">No users found.</TableCell>
                    </TableRow>
                  ) : filtered.map((user) => (
                    <TableRow key={user.id} className="border-white/10 hover:bg-white/[0.03]" data-testid={`admin-row-user-${user.id}`}>
                      <TableCell>
                        <div className="font-medium text-white">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <Badge variant="outline" className={`mt-1 text-xs ${user.status === 'active' ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200' : 'border-red-300/20 bg-red-400/10 text-red-200'}`}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-400 font-mono bg-white/[0.05] border border-white/10 rounded px-1.5 py-0.5 max-w-[120px] truncate" title={user.id}>{user.id}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0 text-slate-500 hover:text-white" onClick={() => copyId(user.id)}>
                            {copiedId === user.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={user.role === 'admin' ? 'border-sky-300/20 bg-sky-400/10 text-sky-200' : 'border-white/10 bg-white/[0.05] text-slate-400'}>{user.role}</Badge>
                          <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" disabled={savingRole === user.id} onClick={() => changeRole(user.id, user.role === "admin" ? "user" : "admin")}>
                            {savingRole === user.id ? "..." : user.role === "admin" ? <User className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium text-white">{user.credits.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-white">{user.rentals}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Input type="number" step="0.01" placeholder="+10" value={creditDrafts[user.id] ?? ""} onChange={(e) => setCreditDrafts((c) => ({ ...c, [user.id]: e.target.value }))} className="w-24 text-right" />
                          <Button size="sm" onClick={() => addCredits(user.id)} disabled={savingUser === user.id}>{savingUser === user.id ? "..." : "Apply"}</Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSuspendModal({ id: user.id, name: user.name, email: user.email, status: user.status })}
                          className={`text-xs ${
                            user.status === 'active'
                              ? 'border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40'
                              : 'border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                        >
                          {user.status === 'active' ? (
                            <><Ban className="h-3 w-3 mr-1" />Suspend</>
                          ) : (
                            <><CheckCircle2 className="h-3 w-3 mr-1" />Restore</>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
