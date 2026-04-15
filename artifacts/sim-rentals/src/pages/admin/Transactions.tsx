import { useListAdminTransactions } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useState } from "react";

export default function AdminTransactions() {
  const { data, isLoading, error } = useListAdminTransactions();
  const [search, setSearch] = useState("");

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
        <h2 className="text-xl font-semibold text-destructive">Failed to load transactions</h2>
      </div>
    );
  }

  const filtered = data.transactions.filter(tx =>
    !search || tx.userEmail.toLowerCase().includes(search.toLowerCase()) || tx.id.includes(search)
  );

  const statusClass = (status: string) =>
    status === 'completed' || status === 'paid'
      ? 'border-emerald-300/20 bg-emerald-400/10 text-emerald-200'
      : status === 'pending'
      ? 'border-amber-300/20 bg-amber-400/10 text-amber-200'
      : 'border-red-300/20 bg-red-400/10 text-red-200';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Transactions</h1>
          <p className="text-muted-foreground mt-1 text-sm">Platform-wide payment and credit activity.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search transactions..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-10 text-sm">No transactions found.</p>
        ) : filtered.map((tx) => (
          <Card key={tx.id} className="glass-card" data-testid={`admin-row-tx-${tx.id}`}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'deposit' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-sky-400/10 text-sky-400'}`}>
                    {tx.type === 'deposit' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-white capitalize text-sm">{tx.type.replace('_', ' ')}</div>
                    <div className="text-[11px] text-slate-600 font-mono">{tx.id.slice(0, 16)}…</div>
                  </div>
                </div>
                <Badge variant="outline" className={statusClass(tx.status)}>{tx.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground truncate max-w-[160px]">{tx.userEmail}</div>
                <div className={`font-mono font-bold ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-white'}`}>
                  {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{format(new Date(tx.createdAt), "MMM d, yyyy HH:mm")}</div>
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
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">User</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-right text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-right text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No transactions found.</TableCell>
                  </TableRow>
                ) : filtered.map((tx) => (
                  <TableRow key={tx.id} className="border-white/10 hover:bg-white/[0.03]" data-testid={`admin-row-tx-${tx.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.type === 'deposit' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-sky-400/10 text-sky-400'}`}>
                          {tx.type === 'deposit' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        </div>
                        <span className="font-medium text-white capitalize">{tx.type.replace('_', ' ')}</span>
                      </div>
                      <div className="text-xs text-slate-600 font-mono mt-1">{tx.id.slice(0, 12)}…</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{tx.userEmail}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(new Date(tx.createdAt), "MMM d, yyyy HH:mm")}</TableCell>
                    <TableCell className="text-right font-mono font-medium text-white">
                      {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className={statusClass(tx.status)}>{tx.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
