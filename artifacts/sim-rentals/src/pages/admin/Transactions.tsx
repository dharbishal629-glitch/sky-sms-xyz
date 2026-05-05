import { useListAdminTransactions } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowDownRight, ArrowUpRight, X, Receipt } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useState } from "react";

type Tx = {
  id: string;
  type: string;
  userEmail: string;
  userId?: string;
  amount: number;
  status: string;
  createdAt: string;
  description?: string;
};

function TxDetailModal({ tx, onClose }: { tx: Tx; onClose: () => void }) {
  const statusClass = (status: string) =>
    status === "completed" || status === "paid"
      ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-200"
      : status === "pending"
      ? "border-amber-300/20 bg-amber-400/10 text-amber-200"
      : "border-red-300/20 bg-red-400/10 text-red-200";

  const isDeposit = tx.type === "deposit";

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Transaction ID", value: <span className="font-mono text-[12px] break-all text-slate-300">{tx.id}</span> },
    { label: "Type", value: <span className="capitalize text-white font-medium">{tx.type.replace("_", " ")}</span> },
    { label: "Status", value: <Badge variant="outline" className={statusClass(tx.status)}>{tx.status}</Badge> },
    { label: "Amount", value: <span className={`font-mono font-bold text-lg ${isDeposit ? "text-emerald-400" : "text-white"}`}>{isDeposit ? "+" : "-"}${tx.amount.toFixed(2)}</span> },
    { label: "User", value: <span className="text-slate-300 break-all">{tx.userEmail}</span> },
    ...(tx.userId ? [{ label: "User ID", value: <span className="font-mono text-[12px] text-slate-400 break-all">{tx.userId}</span> }] : []),
    { label: "Date", value: <span className="text-slate-300">{format(new Date(tx.createdAt), "MMM d, yyyy · HH:mm:ss")}</span> },
    ...(tx.description ? [{ label: "Description", value: <span className="text-slate-300">{tx.description}</span> }] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/[0.09] bg-[#0d1520] shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-full flex items-center justify-center ${isDeposit ? "bg-emerald-400/10 text-emerald-400" : "bg-sky-400/10 text-sky-400"}`}>
              {isDeposit ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            </div>
            <div>
              <div className="font-bold text-white text-[15px] capitalize">{tx.type.replace("_", " ")}</div>
              <div className="text-[11px] text-slate-500 font-mono">{tx.id.slice(0, 16)}…</div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-white hover:bg-white/[0.07] h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-6 py-4 space-y-3">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2 border-b border-white/[0.04] last:border-0">
              <span className="text-[12px] text-slate-500 font-medium shrink-0 w-28">{label}</span>
              <div className="text-right text-[13px]">{value}</div>
            </div>
          ))}
        </div>

        <div className="px-6 pb-5">
          <Button variant="secondary" className="w-full rounded-xl" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminTransactions() {
  const { data, isLoading, error } = useListAdminTransactions();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Tx | null>(null);

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
        <div className="h-12 w-12 rounded-2xl bg-rose-400/10 border border-rose-400/20 flex items-center justify-center mx-auto mb-4">
          <Receipt className="h-6 w-6 text-rose-400" />
        </div>
        <h2 className="text-xl font-semibold text-white">Failed to load transactions</h2>
      </div>
    );
  }

  const filtered = data.transactions.filter((tx: Tx) =>
    !search || tx.userEmail.toLowerCase().includes(search.toLowerCase()) || tx.id.includes(search)
  );

  const statusClass = (status: string) =>
    status === "completed" || status === "paid"
      ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-200"
      : status === "pending"
      ? "border-amber-300/20 bg-amber-400/10 text-amber-200"
      : "border-red-300/20 bg-red-400/10 text-red-200";

  return (
    <div className="space-y-6">
      {selected && <TxDetailModal tx={selected} onClose={() => setSelected(null)} />}

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
        ) : filtered.map((tx: Tx) => (
          <Card key={tx.id} className="glass-card cursor-pointer hover:border-white/[0.14] transition-colors" data-testid={`admin-row-tx-${tx.id}`} onClick={() => setSelected(tx)}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${tx.type === "deposit" ? "bg-emerald-400/10 text-emerald-400" : "bg-sky-400/10 text-sky-400"}`}>
                    {tx.type === "deposit" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-white capitalize text-sm">{tx.type.replace("_", " ")}</div>
                    <div className="text-[11px] text-slate-600 font-mono">{tx.id.slice(0, 16)}…</div>
                  </div>
                </div>
                <Badge variant="outline" className={statusClass(tx.status)}>{tx.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground truncate max-w-[160px]">{tx.userEmail}</div>
                <div className={`font-mono font-bold ${tx.type === "deposit" ? "text-emerald-400" : "text-white"}`}>
                  {tx.type === "deposit" ? "+" : "-"}${tx.amount.toFixed(2)}
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
                ) : filtered.map((tx: Tx) => (
                  <TableRow
                    key={tx.id}
                    className="border-white/10 hover:bg-white/[0.04] cursor-pointer transition-colors"
                    data-testid={`admin-row-tx-${tx.id}`}
                    onClick={() => setSelected(tx)}
                    title="Click to view details"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.type === "deposit" ? "bg-emerald-400/10 text-emerald-400" : "bg-sky-400/10 text-sky-400"}`}>
                          {tx.type === "deposit" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        </div>
                        <span className="font-medium text-white capitalize">{tx.type.replace("_", " ")}</span>
                      </div>
                      <div className="text-xs text-slate-600 font-mono mt-1">{tx.id.slice(0, 12)}…</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{tx.userEmail}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{format(new Date(tx.createdAt), "MMM d, yyyy HH:mm")}</TableCell>
                    <TableCell className="text-right font-mono font-medium text-white">
                      {tx.type === "deposit" ? "+" : "-"}${tx.amount.toFixed(2)}
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
