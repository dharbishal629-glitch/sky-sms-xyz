import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { LifeBuoy, Send, ChevronDown, ChevronUp, MessageSquare, Clock, CheckCircle2, XCircle, AlertCircle, Loader2, Plus, Tag, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Ticket {
  id: string;
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

async function fetchTickets(): Promise<Ticket[]> {
  const res = await fetch(`${BASE}/api/support/tickets`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to load tickets");
  const data = await res.json() as { tickets: Ticket[] };
  return data.tickets;
}

async function createTicket(body: { subject: string; category: string; priority: string; message: string }): Promise<Ticket> {
  const res = await fetch(`${BASE}/api/support/tickets`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json() as { ticket?: Ticket; error?: string };
  if (!res.ok) throw new Error(data.error ?? "Failed to submit ticket");
  return data.ticket!;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Clock; pulse: boolean }> = {
  open:        { label: "Open",        color: "text-sky-300 bg-sky-400/10 border-sky-400/20",       icon: Clock,         pulse: true },
  in_progress: { label: "In Progress", color: "text-amber-300 bg-amber-400/10 border-amber-400/20", icon: AlertCircle,   pulse: true },
  resolved:    { label: "Resolved",    color: "text-green-300 bg-green-400/10 border-green-400/20", icon: CheckCircle2,  pulse: false },
  closed:      { label: "Closed",      color: "text-slate-400 bg-slate-400/10 border-slate-400/20", icon: XCircle,       pulse: false },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  low:    { label: "Low",    color: "text-slate-400", dot: "bg-slate-400" },
  medium: { label: "Medium", color: "text-amber-300", dot: "bg-amber-400" },
  high:   { label: "High",   color: "text-red-300",   dot: "bg-red-400"   },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.open;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${cfg.color}`}>
      {cfg.pulse
        ? <span className="h-1.5 w-1.5 rounded-full status-pulse bg-current" />
        : <Icon className="h-3 w-3" />}
      {cfg.label}
    </span>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.medium;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${cfg.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function TicketCard({ ticket }: { ticket: Ticket }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card rounded-2xl overflow-hidden transition-all duration-200 hover:border-white/[0.12]">
      <button
        className="w-full text-left px-5 py-4 flex items-start gap-4"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="mt-0.5 h-8 w-8 shrink-0 rounded-lg bg-sky-400/10 border border-sky-400/15 flex items-center justify-center">
          <MessageSquare className="h-3.5 w-3.5 text-sky-400" />
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-semibold text-white truncate">{ticket.subject}</span>
            <span className="text-[10px] font-medium text-slate-500 bg-white/[0.04] border border-white/[0.07] px-2 py-0.5 rounded-full">
              {ticket.category}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-3 flex-wrap">
            <StatusBadge status={ticket.status} />
            <PriorityDot priority={ticket.priority} />
            <span className="text-[11px] text-slate-500">{format(new Date(ticket.createdAt), "MMM d, yyyy")}</span>
          </div>
        </div>
        <div className={`mt-1 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </div>
      </button>

      <div className={`faq-body ${open ? "faq-body-open" : ""}`}>
        <div className="faq-inner">
          <div className="px-5 pb-5 space-y-4 border-t border-white/[0.05] pt-4">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Your message</p>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{ticket.message}</p>
            </div>
            {ticket.adminReply && (
              <div className="rounded-xl bg-sky-400/[0.06] border border-sky-400/[0.15] p-4">
                <p className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Zap className="h-3 w-3" /> SKY SMS Support
                </p>
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{ticket.adminReply}</p>
              </div>
            )}
            {!ticket.adminReply && (ticket.status === "open" || ticket.status === "in_progress") && (
              <p className="text-[12px] text-slate-500 italic">
                We typically respond within 24 hours. Thank you for your patience.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const CATEGORIES = ["Billing", "Technical", "Account", "Other"];
const PRIORITIES = [
  { value: "low",    label: "Low — general question" },
  { value: "medium", label: "Medium — something isn't working" },
  { value: "high",   label: "High — urgent issue" },
];

export default function Support() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Billing");
  const [priority, setPriority] = useState("medium");
  const [message, setMessage] = useState("");

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["support-tickets"],
    queryFn: fetchTickets,
  });

  const mutation = useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["support-tickets"] });
      setSubject("");
      setCategory("Billing");
      setPriority("medium");
      setMessage("");
      setShowForm(false);
      toast({ title: "Ticket submitted", description: "We'll get back to you within 24 hours." });
    },
    onError: (err: Error) => {
      toast({ title: "Could not submit", description: err.message, variant: "destructive" });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    mutation.mutate({ subject, category, priority, message });
  }

  return (
    <div className="space-y-7 max-w-2xl mx-auto">

      {/* Header */}
      <div className="page-enter page-enter-d1 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-sky-400 mb-1.5">Help Center</p>
          <h1 className="text-2xl font-black tracking-tight text-white">Support</h1>
          <p className="mt-1 text-sm text-slate-400">We're here to help. Send us a message and we'll respond within 24 hours.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="btn-reflect shrink-0 flex items-center gap-2 h-10 px-5 rounded-full bg-sky-400 text-[13px] font-semibold text-[#080c18] hover:bg-sky-300 transition-colors duration-150"
        >
          {showForm ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "New ticket"}
        </button>
      </div>

      {/* New ticket form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="page-enter page-enter-d2 glass-card rounded-2xl p-6 space-y-5"
        >
          <div className="flex items-center gap-3 mb-1">
            <div className="h-9 w-9 rounded-xl bg-sky-400/10 border border-sky-400/15 flex items-center justify-center">
              <LifeBuoy className="h-4 w-4 text-sky-400" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-white">Open a support ticket</h2>
              <p className="text-[11px] text-slate-500">Fill in the details below and we'll get back to you.</p>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Balance not updated after payment"
              maxLength={200}
              required
              className="field-input w-full h-11 rounded-xl px-4 text-sm text-white placeholder:text-slate-600"
            />
          </div>

          {/* Category + Priority row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Tag className="h-3 w-3" /> Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="field-input w-full h-11 rounded-xl px-3 text-sm text-white cursor-pointer appearance-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[#0e1628]">{c}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="field-input w-full h-11 rounded-xl px-3 text-sm text-white cursor-pointer appearance-none"
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value} className="bg-[#0e1628]">{p.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue in detail. Include any order IDs or rental numbers if relevant."
              rows={5}
              maxLength={2000}
              required
              className="field-input w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 resize-none leading-relaxed"
            />
            <p className="text-[10px] text-slate-600 text-right">{message.length}/2000</p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={mutation.isPending || !subject.trim() || !message.trim()}
            className="btn-reflect w-full h-12 rounded-xl bg-sky-400 text-[14px] font-bold text-[#080c18] hover:bg-sky-300 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {mutation.isPending
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
              : <><Send className="h-4 w-4" /> Submit ticket</>}
          </button>
        </form>
      )}

      {/* Quick info cards */}
      {!showForm && tickets.length === 0 && !isLoading && (
        <div className="page-enter page-enter-d2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Clock,        title: "Response time",  desc: "We reply within 24 hours on business days." },
            { icon: MessageSquare, title: "Live chat",      desc: "For urgent issues, use the ticket system and mark priority as High." },
            { icon: CheckCircle2,  title: "Refund policy",  desc: "Rental credits are refunded automatically if no SMS is received." },
          ].map((item) => (
            <div key={item.title} className="glass-card rounded-2xl p-5">
              <item.icon className="h-5 w-5 text-sky-400 mb-3" />
              <p className="text-[13px] font-semibold text-white mb-1">{item.title}</p>
              <p className="text-[12px] text-slate-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* Ticket list */}
      <div className="page-enter page-enter-d3 space-y-3">
        {isLoading && (
          <div className="flex flex-col gap-3">
            {[1, 2].map((i) => (
              <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-lg bg-white/[0.04]" />
                  <div className="flex-1 space-y-2.5">
                    <div className="h-3.5 bg-white/[0.04] rounded w-1/2" />
                    <div className="h-2.5 bg-white/[0.03] rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && tickets.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
              <MessageSquare className="h-3.5 w-3.5" /> Your tickets ({tickets.length})
            </h2>
            {tickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}

        {!isLoading && tickets.length === 0 && !showForm && (
          <div className="glass-card rounded-2xl py-14 flex flex-col items-center gap-4 text-center">
            <div className="h-14 w-14 rounded-2xl bg-sky-400/[0.08] border border-sky-400/[0.12] flex items-center justify-center">
              <LifeBuoy className="h-6 w-6 text-sky-400/60" />
            </div>
            <div>
              <p className="text-[15px] font-semibold text-white mb-1">No support tickets yet</p>
              <p className="text-sm text-slate-500">Open a ticket above and our team will get back to you.</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn-reflect mt-1 flex items-center gap-2 h-10 px-6 rounded-full bg-sky-400 text-[13px] font-semibold text-[#080c18] hover:bg-sky-300 transition-colors duration-150"
            >
              <Plus className="h-4 w-4" /> Open first ticket
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
