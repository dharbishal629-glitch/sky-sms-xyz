import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { LifeBuoy, MessageSquare, Clock, CheckCircle2, XCircle, AlertCircle, Loader2, ChevronDown, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminTicket {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  subject: string;
  category: string;
  priority: string;
  message: string;
  status: string;
  adminReply: string | null;
  createdAt: string;
  updatedAt: string;
}

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function fetchAdminTickets(): Promise<AdminTicket[]> {
  const res = await fetch(`${BASE}/api/admin/support`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load tickets");
  const data = await res.json() as { tickets: AdminTicket[] };
  return data.tickets;
}

async function updateTicket({ id, status, adminReply }: { id: string; status?: string; adminReply?: string }) {
  const res = await fetch(`${BASE}/api/admin/support/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, adminReply }),
  });
  const data = await res.json() as { ticket?: AdminTicket; error?: string };
  if (!res.ok) throw new Error(data.error ?? "Update failed");
  return data.ticket!;
}

const STATUS_OPTIONS = [
  { value: "open",        label: "Open",        color: "text-sky-300" },
  { value: "in_progress", label: "In Progress", color: "text-amber-300" },
  { value: "resolved",    label: "Resolved",    color: "text-green-300" },
  { value: "closed",      label: "Closed",      color: "text-slate-400" },
];

const PRIORITY_DOT: Record<string, string> = {
  low: "bg-slate-400", medium: "bg-amber-400", high: "bg-red-400",
};

function AdminTicketCard({ ticket }: { ticket: AdminTicket }) {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reply, setReply] = useState(ticket.adminReply ?? "");
  const [status, setStatus] = useState(ticket.status);

  const mutation = useMutation({
    mutationFn: updateTicket,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-support-tickets"] });
      toast({ title: "Ticket updated" });
    },
    onError: (err: Error) => {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    },
  });

  const statusCfg = {
    open:        { color: "text-sky-300 bg-sky-400/10 border-sky-400/20",       icon: Clock },
    in_progress: { color: "text-amber-300 bg-amber-400/10 border-amber-400/20", icon: AlertCircle },
    resolved:    { color: "text-green-300 bg-green-400/10 border-green-400/20", icon: CheckCircle2 },
    closed:      { color: "text-slate-400 bg-slate-400/10 border-slate-400/20", icon: XCircle },
  }[ticket.status] ?? { color: "text-slate-400 bg-slate-400/10 border-slate-400/20", icon: Clock };

  const StatusIcon = statusCfg.icon;

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        className="w-full text-left px-5 py-4 flex items-start gap-4"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="mt-0.5 h-8 w-8 shrink-0 rounded-lg bg-sky-400/10 border border-sky-400/15 flex items-center justify-center">
          <MessageSquare className="h-3.5 w-3.5 text-sky-400" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-semibold text-white">{ticket.subject}</span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.07] text-slate-400">{ticket.category}</span>
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusCfg.color}`}>
              <StatusIcon className="h-2.5 w-2.5" />{ticket.status.replace("_", " ")}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-3 flex-wrap text-[11px] text-slate-500">
            <span className="font-medium text-slate-400">{ticket.userName}</span>
            <span>{ticket.userEmail}</span>
            <span className={`flex items-center gap-1`}>
              <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[ticket.priority] ?? "bg-slate-400"}`} />
              {ticket.priority}
            </span>
            <span>{format(new Date(ticket.createdAt), "MMM d, yyyy 'at' HH:mm")}</span>
          </div>
        </div>
        <ChevronDown className={`mt-1 h-4 w-4 text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <div className={`faq-body ${open ? "faq-body-open" : ""}`}>
        <div className="faq-inner">
          <div className="px-5 pb-5 border-t border-white/[0.05] pt-4 space-y-4">
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4">
              <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Message from user</p>
              <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{ticket.message}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Update status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 rounded-xl px-3 text-sm text-white bg-white/[0.03] border border-white/[0.09] appearance-none cursor-pointer"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value} className="bg-[#0e1628]">{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Reply to user</label>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply here…"
                rows={4}
                maxLength={3000}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 resize-none leading-relaxed bg-white/[0.03] border border-white/[0.09] focus:outline-none focus:border-sky-400/40 focus:bg-sky-400/[0.03] transition-all"
              />
            </div>

            <button
              onClick={() => mutation.mutate({ id: ticket.id, status, adminReply: reply })}
              disabled={mutation.isPending}
              className="btn-reflect flex items-center gap-2 h-10 px-5 rounded-xl bg-sky-400 text-[13px] font-semibold text-[#080c18] hover:bg-sky-300 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</>
                : <><Send className="h-3.5 w-3.5" /> Save &amp; reply</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const STATUS_FILTER = ["all", "open", "in_progress", "resolved", "closed"] as const;

export default function AdminSupport() {
  const [filter, setFilter] = useState<string>("all");
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["admin-support-tickets"],
    queryFn: fetchAdminTickets,
  });

  const filtered = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);
  const openCount = tickets.filter((t) => t.status === "open").length;

  return (
    <div className="space-y-7">
      <div className="page-enter page-enter-d1 flex items-start gap-4 justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-sky-400 mb-1.5">Admin</p>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
            Support Tickets
            {openCount > 0 && (
              <span className="text-sm font-bold px-2.5 py-0.5 rounded-full bg-red-400/10 border border-red-400/20 text-red-300">
                {openCount} open
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm text-slate-400">{tickets.length} total tickets</p>
        </div>
      </div>

      <div className="page-enter page-enter-d2 flex gap-2 flex-wrap">
        {STATUS_FILTER.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`h-8 px-4 rounded-full text-[12px] font-semibold transition-all duration-150 ${
              filter === s
                ? "bg-sky-400 text-[#080c18]"
                : "bg-white/[0.04] border border-white/[0.07] text-slate-400 hover:text-white hover:bg-white/[0.07]"
            }`}
          >
            {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            {s !== "all" && (
              <span className="ml-1.5 text-[10px] opacity-70">
                ({tickets.filter((t) => t.status === s).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="page-enter page-enter-d3 space-y-3">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-lg bg-white/[0.04]" />
                  <div className="flex-1 space-y-2.5">
                    <div className="h-3.5 bg-white/[0.04] rounded w-1/2" />
                    <div className="h-2.5 bg-white/[0.03] rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {!isLoading && filtered.length === 0 && (
          <div className="glass-card rounded-2xl py-14 flex flex-col items-center gap-3 text-center">
            <div className="h-12 w-12 rounded-xl bg-sky-400/[0.06] border border-sky-400/[0.1] flex items-center justify-center">
              <LifeBuoy className="h-5 w-5 text-sky-400/50" />
            </div>
            <p className="text-[14px] font-semibold text-white">No tickets found</p>
            <p className="text-sm text-slate-500">
              {filter === "all" ? "No support tickets have been submitted yet." : `No ${filter.replace("_"," ")} tickets.`}
            </p>
          </div>
        )}
        {!isLoading && filtered.map((ticket) => (
          <AdminTicketCard key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </div>
  );
}
