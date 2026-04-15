import { useListAdminUsers } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

export default function AdminUsers() {
  const { data, isLoading, error, refetch } = useListAdminUsers();
  const [search, setSearch] = useState("");
  const [creditDrafts, setCreditDrafts] = useState<Record<string, string>>({});
  const [savingUser, setSavingUser] = useState<string | null>(null);
  const { toast } = useToast();

  const addCredits = async (userId: string) => {
    const amount = Number(creditDrafts[userId]);
    if (!Number.isFinite(amount) || amount === 0) {
      toast({ title: "Enter a credit amount", description: "Use a positive amount to add credits or a negative amount to remove.", variant: "destructive" });
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
      setCreditDrafts((current) => ({ ...current, [userId]: "" }));
      await refetch();
      toast({ title: "Credits updated", description: `${amount > 0 ? "Added" : "Removed"} ${Math.abs(amount)} credits.` });
    } catch (err) {
      toast({ title: "Failed to update credits", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setSavingUser(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Users</h1>
          <p className="text-muted-foreground mt-1">Manage platform users and view their balances.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="glass-card overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/[0.02]">
                  <TableHead className="text-muted-foreground">User</TableHead>
                  <TableHead className="text-muted-foreground">Role</TableHead>
                  <TableHead className="text-right text-muted-foreground">Credits</TableHead>
                  <TableHead className="text-right text-muted-foreground">Rentals</TableHead>
                  <TableHead className="text-right text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">Credits Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((user) => (
                    <TableRow key={user.id} className="border-white/10 hover:bg-white/[0.03]" data-testid={`admin-row-user-${user.id}`}>
                      <TableCell>
                        <div className="font-medium text-white">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div className="text-xs text-slate-600 font-mono mt-0.5">{user.id.slice(0, 16)}…</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={user.role === 'admin' ? 'border-sky-300/20 bg-sky-400/10 text-sky-200' : 'border-white/10 bg-white/[0.05] text-slate-400'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium text-white">
                        {user.credits.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-white">
                        {user.rentals}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={user.status === 'active' ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200' : 'border-red-300/20 bg-red-400/10 text-red-200'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="+10"
                            value={creditDrafts[user.id] ?? ""}
                            onChange={(event) => setCreditDrafts((current) => ({ ...current, [user.id]: event.target.value }))}
                            className="w-24 text-right"
                          />
                          <Button
                            size="sm"
                            onClick={() => addCredits(user.id)}
                            disabled={savingUser === user.id}
                          >
                            {savingUser === user.id ? "Saving..." : "Apply"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
