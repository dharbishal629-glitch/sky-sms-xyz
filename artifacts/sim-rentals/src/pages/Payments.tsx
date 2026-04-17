import { useState, useRef, useLayoutEffect } from "react";
import { useListPayments, useCreatePaymentCheckout, useGetMe } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import {
  CreditCard, ArrowUpRight, Check, AlertCircle, Clock, Loader2, Pencil,
  DollarSign, Zap, Shield, RefreshCw, ChevronRight, Bitcoin, Coins, CheckCircle2, XCircle,
  ChevronDown, Printer, X, Receipt, Tag,
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Link } from "wouter";

const PACKAGES = [
  { amount: 5, popular: false },
  { amount: 10, popular: true },
  { amount: 25, popular: false },
  { amount: 50, popular: false },
];

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

const howItWorks = [
  { step: "1", icon: Coins, title: "Choose Amount", desc: "Pick a preset package or enter any custom amount, even less than $1." },
  { step: "2", icon: Bitcoin, title: "Pay via Crypto", desc: "Pay securely with BTC, ETH, USDT, or 30+ other coins via OxaPay." },
  { step: "3", icon: Zap, title: "Instant Balance", desc: "Your account balance updates automatically once payment is confirmed." },
  { step: "4", icon: RefreshCw, title: "Auto Refunds", desc: "Rentals with no SMS received are refunded automatically to your balance." },
];


const HISTORY_PAGE_SIZE = 8;

function ReceiptModal({ payment, onClose }: { payment: any; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#0d1526] border border-white/[0.1] rounded-3xl p-8 w-full max-w-sm shadow-2xl"
        onClick={e => e.stopPropagation()}
        id="receipt-print-area"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-cyan-400" />
            <span className="font-black text-white text-lg">Receipt</span>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-full bg-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-center py-4">
            <div className="inline-flex h-14 w-14 rounded-2xl bg-emerald-400/10 border border-emerald-300/20 items-center justify-center mb-3">
              <CheckCircle2 className="h-7 w-7 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white">+${payment.amount.toFixed(2)}</div>
            <div className="text-sm text-emerald-400 font-semibold mt-1">Payment Completed</div>
          </div>

          <div className="space-y-2.5 border-t border-white/[0.06] pt-4">
            {[
              { label: "Transaction ID", value: payment.id.slice(0, 16) + "…" },
              { label: "Provider", value: payment.provider },
              { label: "Currency", value: payment.currency || "USD" },
              { label: "Date", value: format(new Date(payment.createdAt), "MMM d, yyyy 'at' h:mm a") },
              { label: "Status", value: "Completed" },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between text-sm">
                <span className="text-slate-500">{row.label}</span>
                <span className="text-white font-semibold text-right max-w-[160px] truncate">{row.value}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex-1 h-10 rounded-full bg-white/[0.06] border border-white/[0.1] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-white/[0.1] transition-colors"
            >
              <Printer className="h-4 w-4" /> Print
            </button>
            <button
              onClick={onClose}
              className="flex-1 h-10 rounded-full bg-cyan-400 text-[#080c18] text-sm font-bold hover:bg-cyan-300 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  if (status === "paid") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-400/10 text-emerald-300 border border-emerald-400/20">
        <CheckCircle2 className="h-3 w-3" />
        Completed
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-400/10 text-sky-300 border border-sky-400/20">
        <Clock className="h-3 w-3" />
        Processing
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-400/10 text-red-300 border border-red-400/20">
      <XCircle className="h-3 w-3" />
      Failed
    </span>
  );
}

type CouponInfo = { code: string; type: "fixed" | "percentage"; value: number };

function CheckoutModal({
  amount,
  onClose,
  onConfirm,
}: {
  amount: number;
  onClose: () => void;
  onConfirm: (couponCode: string | null) => void;
}) {
  const { toast } = useToast();
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<CouponInfo | null>(null);
  const [validating, setValidating] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const bonus = coupon
    ? coupon.type === "percentage"
      ? Number((amount * (coupon.value / 100)).toFixed(2))
      : coupon.value
    : 0;
  const totalCredits = Number((amount + bonus).toFixed(2));

  async function applyCode() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setValidating(true);
    setCouponError(null);
    setCoupon(null);
    try {
      const res = await fetch(`${API_URL}/api/coupons/validate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invalid coupon");
      setCoupon(data as CouponInfo);
    } catch (err: any) {
      setCouponError(err.message);
    } finally {
      setValidating(false);
    }
  }

  function removeCode() {
    setCoupon(null);
    setCouponInput("");
    setCouponError(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#0d1526] border border-white/[0.1] rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="font-black text-white text-lg">Confirm Payment</span>
          <button onClick={onClose} className="h-7 w-7 rounded-full bg-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Amount summary */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">You pay</span>
            <span className="font-black text-white text-xl">${amount.toFixed(2)}</span>
          </div>
          {bonus > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-emerald-400 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> Coupon bonus
              </span>
              <span className="font-bold text-emerald-400">+${bonus.toFixed(2)}</span>
            </div>
          )}
          <div className={`flex justify-between items-center pt-2 border-t border-white/[0.06] ${bonus > 0 ? "text-emerald-300" : "text-white"}`}>
            <span className="text-sm font-semibold">Credits added</span>
            <span className="font-black text-xl">${totalCredits.toFixed(2)}</span>
          </div>
        </div>

        {/* Coupon section */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Tag className="h-3.5 w-3.5" /> Coupon Code <span className="text-slate-600">(optional)</span>
          </div>

          {coupon ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-400/[0.08] border border-emerald-400/25">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-mono font-black text-emerald-300 tracking-widest">{coupon.code}</span>
                <span className="text-xs text-emerald-400 ml-2">
                  {coupon.type === "percentage" ? `${coupon.value}% off` : `+$${coupon.value.toFixed(2)} free`}
                </span>
              </div>
              <button onClick={removeCode} className="text-slate-500 hover:text-red-400 transition-colors shrink-0">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Enter code"
                value={couponInput}
                onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(null); }}
                onKeyDown={(e) => e.key === "Enter" && applyCode()}
                className="font-mono tracking-widest uppercase flex-1 h-10"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={applyCode}
                disabled={!couponInput.trim() || validating}
                className="h-10 px-4 rounded-xl shrink-0"
              >
                {validating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
              </Button>
            </div>
          )}

          {couponError && (
            <div className="flex items-center gap-1.5 text-xs text-red-400">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {couponError}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-full">Cancel</Button>
          <Button onClick={() => onConfirm(coupon?.code ?? null)} className="flex-1 rounded-full">
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Payments() {
  const { data: userData } = useGetMe();
  const { data, isLoading, error } = useListPayments();
  const createCheckout = useCreatePaymentCheckout();
  const { toast } = useToast();
  const [customAmount, setCustomAmount] = useState<string>("");
  const [historyTab, setHistoryTab] = useState<"all" | "completed" | "processing" | "failed">("all");
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [receiptPayment, setReceiptPayment] = useState<any>(null);

  // Checkout modal
  const [checkoutAmount, setCheckoutAmount] = useState<number | null>(null);
  const [checkoutPending, setCheckoutPending] = useState(false);

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tabTrackRef = useRef<HTMLDivElement>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });

  const TAB_KEYS = ["all", "completed", "processing", "failed"] as const;

  useLayoutEffect(() => {
    const tabIndex = TAB_KEYS.indexOf(historyTab);
    const btn = tabRefs.current[tabIndex];
    const track = tabTrackRef.current;
    if (btn && track) {
      const trackRect = track.getBoundingClientRect();
      const btnRect = btn.getBoundingClientRect();
      setPillStyle({
        left: btnRect.left - trackRect.left,
        width: btnRect.width,
      });
    }
  }, [historyTab]);

  const openCheckoutModal = (amount: number) => setCheckoutAmount(amount);

  const handleConfirmedCheckout = (amount: number, couponCode: string | null) => {
    setCheckoutAmount(null);
    setCheckoutPending(true);
    createCheckout.mutate(
      { data: { amount, currency: "USD", couponCode } as any },
      {
        onSuccess: (response) => {
          window.open(response.checkoutUrl, "_blank");
          toast({ title: "Redirecting to checkout", description: `Opening payment for $${amount.toFixed(2)}.` });
          setCustomAmount("");
          setCheckoutPending(false);
        },
        onError: (err: any) => {
          toast({ title: "Checkout failed", description: err.message || "Please try again.", variant: "destructive" });
          setCheckoutPending(false);
        },
      },
    );
  };

  const handleCustomCheckout = () => {
    const amount = parseFloat(customAmount);
    if (!amount || amount <= 0) return;
    openCheckoutModal(amount);
  };

  const customAmountNum = parseFloat(customAmount) || 0;

  const allPayments = data?.payments ?? [];
  const filteredPayments = historyTab === "all" ? allPayments :
    historyTab === "completed" ? allPayments.filter(p => p.status === "paid") :
    historyTab === "processing" ? allPayments.filter(p => p.status === "pending") :
    allPayments.filter(p => p.status !== "paid" && p.status !== "pending");

  const completedCount = allPayments.filter(p => p.status === "paid").length;
  const processingCount = allPayments.filter(p => p.status === "pending").length;
  const failedCount = allPayments.filter(p => p.status !== "paid" && p.status !== "pending").length;

  const tabs: { key: typeof historyTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: allPayments.length },
    { key: "completed", label: "Completed", count: completedCount },
    { key: "processing", label: "Processing", count: processingCount },
    { key: "failed", label: "Failed", count: failedCount },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {checkoutAmount !== null && (
        <CheckoutModal
          amount={checkoutAmount}
          onClose={() => setCheckoutAmount(null)}
          onConfirm={(couponCode) => handleConfirmedCheckout(checkoutAmount, couponCode)}
        />
      )}

      <Reveal variant="up">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">Payments</h1>
            <p className="text-muted-foreground mt-1">Add funds to your account to rent numbers.</p>
          </div>
          {userData && (
            <div className="glass-card rounded-2xl px-5 py-4 flex items-center gap-3 shrink-0">
              <div className="h-10 w-10 rounded-xl bg-cyan-400/10 border border-cyan-300/20 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Current Balance</div>
                <div className="text-2xl font-black text-white">${userData.credits.toFixed(2)}</div>
              </div>
            </div>
          )}
        </div>
      </Reveal>

      <Reveal variant="up" delay={40}>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-white">Top-Up Packages</h2>
            <span className="text-xs text-muted-foreground bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 rounded-full">Bigger = more value</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PACKAGES.map((pkg) => (
              <Card
                key={pkg.amount}
                className={`glass-card relative overflow-hidden transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 ${pkg.popular ? 'blue-glow border-cyan-400/20' : ''}`}
                data-testid={`card-package-${pkg.amount}`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                )}
                {pkg.popular && (
                  <span className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-400/10 text-cyan-200 border border-cyan-300/20">
                    Most Popular
                  </span>
                )}
                <CardHeader className="pb-2 pt-5">
                  <div className="text-3xl font-black text-white">${pkg.amount}</div>
                  <CardDescription className="text-xs">USD via crypto</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" /> Coupon codes accepted
                  </p>
                </CardContent>
                <CardFooter className="pb-5">
                  <Button
                    className="w-full rounded-full"
                    variant={pkg.popular ? "default" : "outline"}
                    onClick={() => openCheckoutModal(pkg.amount)}
                    disabled={checkoutPending}
                    data-testid={`button-buy-${pkg.amount}`}
                  >
                    {checkoutPending ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing</>
                    ) : (
                      `Add $${pkg.amount}.00`
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal variant="up" delay={80}>
        <div className="glass-card rounded-2xl p-6 max-w-md">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-9 w-9 rounded-xl bg-cyan-400/10 border border-cyan-300/20 flex items-center justify-center">
              <Pencil className="h-4 w-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Custom Amount</h2>
              <p className="text-xs text-muted-foreground">Any amount — even less than $1</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm pointer-events-none">$</span>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.50"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="pl-7 h-11"
                data-testid="input-custom-amount"
              />
            </div>
            {customAmountNum > 0 && (
              <div className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                <Check className="h-4 w-4" /> ${customAmountNum.toFixed(2)} will be added to your balance
              </div>
            )}
            <Button
              className="w-full rounded-full h-11"
              disabled={!customAmount || customAmountNum <= 0 || checkoutPending}
              onClick={handleCustomCheckout}
              data-testid="button-buy-custom"
            >
              {checkoutPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing</>
              ) : customAmountNum > 0 ? (
                `Add $${customAmountNum.toFixed(2)}`
              ) : (
                "Add Funds"
              )}
            </Button>
          </div>
        </div>
      </Reveal>

      <Reveal variant="up" delay={100}>
        <div className="space-y-4">
          <button
            onClick={() => setShowHowItWorks(v => !v)}
            className="w-full flex items-center justify-between group"
          >
            <h2 className="text-xl font-black text-white">How It Works</h2>
            <span className="flex items-center gap-1.5 text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
              {showHowItWorks ? "Hide" : "Show"}
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showHowItWorks ? "rotate-180" : ""}`} />
            </span>
          </button>
          {showHowItWorks && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {howItWorks.map((step, i) => (
                <div key={i} className="glass-card rounded-2xl p-5 relative overflow-hidden group hover:scale-[1.01] transition-all duration-200">
                  <div className="absolute top-3 right-3 text-5xl font-black text-white/[0.03] select-none">{step.step}</div>
                  <div className="mb-4 h-10 w-10 rounded-xl bg-cyan-400/10 border border-cyan-300/20 flex items-center justify-center">
                    <step.icon className="h-5 w-5 text-cyan-400" />
                  </div>
                  <h3 className="font-bold text-white text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Reveal>

      <Reveal variant="up" delay={120}>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Shield, title: "Secure Checkout", desc: "All payments processed by OxaPay — fully encrypted." },
            { icon: Bitcoin, title: "Crypto Only", desc: "BTC, ETH, USDT & 30+ coins accepted." },
            { icon: RefreshCw, title: "Auto Refunds", desc: "Unused rental fees returned instantly." },
          ].map((item, i) => (
            <div key={i} className="glass-card rounded-2xl p-4 flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">{item.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal variant="up" delay={140}>
        <div className="glass-card rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-cyan-400/10 border border-cyan-300/20 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 text-cyan-400" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-white text-sm mb-1">Questions about payments?</div>
            <div className="text-xs text-slate-400 leading-relaxed">
              Crypto payments are private and irreversible. Unused balance stays in your account forever. For full details on refunds, disputes, and policies, see our Refund Policy.
            </div>
          </div>
          <Link href="/refund-policy">
            <span className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.1] text-xs font-semibold text-cyan-400 hover:bg-white/[0.09] transition-colors cursor-pointer whitespace-nowrap">
              Refund Policy <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </Link>
        </div>
      </Reveal>

      {/* Payment History */}
      <Reveal variant="up" delay={80}>
        <div className="space-y-5 pt-4 border-t border-white/[0.06]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xl font-black text-white">Payment History</h2>
            {allPayments.length > 0 && (
              <div
                ref={tabTrackRef}
                className="relative flex items-center p-1 bg-white/[0.04] rounded-xl border border-white/[0.06] overflow-hidden"
              >
                <div
                  className="absolute top-1 bottom-1 rounded-lg bg-white/[0.10] border border-white/[0.10]"
                  style={{
                    left: pillStyle.left,
                    width: pillStyle.width,
                    transition: "left 0.28s cubic-bezier(0.4,0,0.2,1), width 0.28s cubic-bezier(0.4,0,0.2,1)",
                  }}
                />
                {tabs.map((tab, i) => (
                  <button
                    key={tab.key}
                    ref={el => { tabRefs.current[i] = el; }}
                    onClick={() => { setHistoryTab(tab.key); setHistoryPage(1); }}
                    className={`relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors duration-200 ${
                      historyTab === tab.key ? "text-white" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {tab.label}
                    {tab.count > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black transition-colors duration-200 ${
                        historyTab === tab.key ? "bg-cyan-400/20 text-cyan-300" : "bg-white/[0.06] text-slate-600"
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}
            </div>
          ) : error || !data ? (
            <div className="text-center py-10 bg-white/[0.03] rounded-2xl border border-dashed border-white/10 text-muted-foreground">
              Unable to load payment history. Please refresh the page.
            </div>
          ) : allPayments.length === 0 ? (
            <div className="text-center py-14 bg-white/[0.03] rounded-2xl border border-dashed border-white/10">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-30" />
              <h3 className="font-bold text-white mb-1">No payments yet</h3>
              <p className="text-sm text-muted-foreground">When you add funds, your payment history will appear here.</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-10 bg-white/[0.03] rounded-2xl border border-dashed border-white/10">
              <p className="text-sm text-muted-foreground">No {historyTab} payments.</p>
            </div>
          ) : (() => {
            const visiblePayments = filteredPayments.slice(0, historyPage * HISTORY_PAGE_SIZE);
            const hasMore = filteredPayments.length > visiblePayments.length;
            return (
              <>
                <div className="glass-card rounded-2xl overflow-hidden">
                  <div className="divide-y divide-white/[0.06]">
                    {visiblePayments.map((payment) => (
                      <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-white/[0.02] transition-colors" data-testid={`row-payment-${payment.id}`}>
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                            payment.status === 'paid' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-300/20' :
                            payment.status === 'pending' ? 'bg-sky-400/10 text-sky-400 border border-sky-300/20' :
                            'bg-red-400/10 text-red-400 border border-red-300/20'
                          }`}>
                            {payment.status === 'paid' ? <ArrowUpRight className="h-5 w-5" /> :
                             payment.status === 'pending' ? <Clock className="h-5 w-5" /> :
                             <AlertCircle className="h-5 w-5" />}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-2 flex-wrap">
                              Funds added
                              <StatusPill status={payment.status} />
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {format(new Date(payment.createdAt), "MMM d, yyyy 'at' h:mm a")} &bull; {payment.provider}
                            </div>
                            {payment.status === "pending" && (
                              <div className="text-[11px] text-sky-400/70 mt-0.5">
                                Waiting for blockchain confirmation. Page will update automatically.
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 pl-14 sm:pl-0">
                          <div className={`font-black text-xl ${payment.status === 'paid' ? 'text-white' : 'text-slate-500'}`}>
                            +${payment.amount.toFixed(2)}
                          </div>
                          {payment.status === 'paid' && (
                            <button
                              onClick={() => setReceiptPayment(payment)}
                              className="h-7 w-7 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-slate-500 hover:text-cyan-400 hover:bg-cyan-400/10 hover:border-cyan-400/20 transition-all duration-200"
                              title="View receipt"
                            >
                              <Receipt className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {hasMore && (
                  <div className="text-center pt-2">
                    <button
                      onClick={() => setHistoryPage(p => p + 1)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
                    >
                      Load more
                      <span className="text-xs text-slate-600">({filteredPayments.length - visiblePayments.length} more)</span>
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </Reveal>

      {receiptPayment && (
        <ReceiptModal payment={receiptPayment} onClose={() => setReceiptPayment(null)} />
      )}
    </div>
  );
}
