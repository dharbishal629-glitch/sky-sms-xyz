import { useListAdminTransactions } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ArrowDownRight, ArrowUpRight, X, Receipt, ExternalLink } from "lucide-react";
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

const statusCls = (status: string) =>
  status === "completed" || status === "paid"
    ? "text-emerald-300 border-emerald-500/20 bg-emerald-500/10"
    : status === "pending"
    ? "text-amber-300 border-amber-500/20 bg-amber-500/10"
    : "text-red-300 border-red-500/20 bg-red-500/10";

function TxModal({ tx, onClose }: { tx: Tx; onClose: () => void }) {
  const isDeposit = tx.type === "deposit";
  const isCredit = tx.type === "credit_purchase" || tx.type === "deposit";

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Transaction ID", value: <span className="font-mono text-[11.5px] break-all text-slate-300 select-all">{tx.id}</span> },
    { label: "Type", value: <span className="capitalize text-white font-semibold">{tx.type.replace(/_/g, " ")}</span> },
    { label: "Status", value: <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold ${statusCls(tx.status)}`}>{tx.status}</span> },
    { label: "Amount", value: <span className={`font-mono font-bold text-[16px] ${isDeposit ? "text-emerald-400" : "text-white"}`}>{isDeposit ? "+" : "-"}${tx.amount.toFixed(2)}</span> },
    { label: "User", value: <span className="text-slate-300 break-all text-[12.5px]">{tx.userEmail}</span> },
    ...(tx.userId ? [{ label: "User ID", value: <span className="font-mono text-[11px] text-slate-500 break-all select-all">{tx.userId}</span> }] : []),
    { label: "Date", value: <span className="text-slate-300 text-[12.5px]">{format(new Date(tx.createdAt), "MMM d, yyyy · HH:mm:ss")}</span> },
    ...(tx.description ? [{ label: "Note", value: <span className="text-slate-400 text-[12.5px]">{tx.description}</span> }] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#0d1117] shadow-[0_24px_60px_rgba(0,0,0,0.8)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: "modal-enter 0.2s cubic-bezier(0.16,1,0.3,1) both" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${isDeposit ? "bg-emerald-400/10 text-emerald-400" : "bg-sky-400/10 text-sky-400"}`}>
              {isDeposit ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            </div>
            <div>
              <div className="font-bold text-white text-[14px] capitalize">{tx.type.replace(/_/g, " ")}</div>
              <div className="text-[11px] text-slate-600 font-mono">{tx.id.slice(0, 14)}…</div>
            </div>
          </div>
          <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-0.5">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5 border-b border-white/[0.04] last:border-0">
              <span className="text-[12px] text-slate-600 font-medium shrink-0 w-24">{label}</span>
              <div className="text-right text-[12.5px] min-w-0">{value}</div>
            </div>
          ))}
        </div>

        {/* OxaPay link for credit purchases */}
        {isCredit && (
          <div className="px-5 pb-4 space-y-2">
            <a
              href="https://merchants.oxapay.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 h-10 w-full rounded-xl border border-amber-500/20 bg-amber-500/[0.07] text-[13px] font-semibold text-amber-300 hover:bg-amber-500/[0.12] hover:text-amber-200 transition-all"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View in OxaPay Dashboard
            </a>
            <button
              onClick={onClose}
              className="flex items-center justify-center h-9 w-full rounded-xl border border-white/[0.07] text-[12.5px] font-semibold text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-all"
            >
              Close
            </button>
          </div>
        )}

        {!isCredit && (
          <div className="px-5 pb-4">
            <button
              onClick={onClose}
              className="flex items-center justify-center h-9 w-full rounded-xl border border-white/[0.07] text-[12.5px] font-semibold text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-all"
            >
              Close
            </button>
          </div>
        )}
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
        <Skeleton className="h-6 w-36 bg-white/[0.04]" />
        <Skeleton className="h-4 w-48 bg-white/[0.03]" />
        <div className="space-y-2">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-16 rounded-xl bg-white/[0.04]" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <div className="h-10 w-10 rounded-2xl bg-rose-400/10 border border-rose-400/20 flex items-center justify-center mx-auto mb-3">
          <Receipt className="h-5 w-5 text-rose-400" />
        </div>
        <h2 className="text-[15px] font-semibold text-white">Failed to load transactions</h2>
      </div>
    );
  }

  const filtered = (data.transactions as Tx[]).filter((tx) =>
    !search || tx.userEmail.toLowerCase().includes(search.toLowerCase()) || tx.id.includes(search) || tx.type.includes(search)
  );

  return (
    <div className="space-y-5">
      {selected && <TxModal tx={selected} onClose={() => setSelected(null)} />}

      <div>
        <h1 className="text-[17px] font-bold text-white">Transactions</h1>
        <p className="text-slate-500 mt-0.5 text-[13px]">Platform-wide payment and credit activity.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-600" />
        <input
          type="search"
          placeholder="Search by email, ID, or type…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] pl-9 pr-4 text-[13px] text-white placeholder:text-slate-600 outline-none focus:border-amber-500/30 transition-all"
        />
      </div>

      {/* Transaction list */}
      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-slate-600">No transactions found.</div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filtered.map((tx) => (
              <button
                key={tx.id}
                type="button"
                onClick={() => setSelected(tx)}
                data-testid={`admin-row-tx-${tx.id}`}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-white/[0.03] transition-colors"
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                  tx.type === "deposit" || tx.type === "credit_purchase" ? "bg-emerald-400/10 text-emerald-400" : "bg-sky-400/10 text-sky-400"
                }`}>
                  {tx.type === "deposit" || tx.type === "credit_purchase" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-[13px] capitalize">{tx.type.replace(/_/g, " ")}</span>
                    <span className={`inline-flex items-center rounded-full border px-1.5 py-0 text-[10px] font-bold ${statusCls(tx.status)}`}>{tx.status}</span>
                  </div>
                  <div className="text-[11.5px] text-slate-600 truncate mt-0.5">{tx.userEmail}</div>
                  <div className="text-[11px] text-slate-700 mt-0.5">{format(new Date(tx.createdAt), "MMM d, yyyy · HH:mm")}</div>
                </div>
                <div className={`font-mono font-bold text-[14px] shrink-0 ${
                  tx.type === "deposit" || tx.type === "credit_purchase" ? "text-emerald-400" : "text-white"
                }`}>
                  {tx.type === "deposit" || tx.type === "credit_purchase" ? "+" : "-"}${tx.amount.toFixed(2)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
