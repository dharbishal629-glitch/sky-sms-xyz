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
  DollarSign, Zap, Shield, RefreshCw, ChevronRight, Bitcoin, Coins, CheckCircle2, XCircle
} from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { Link } from "wouter";

const PACKAGES = [
  { amount: 5, popular: false },
  { amount: 10, popular: true, bonus: "10% extra" },
  { amount: 25, popular: false, bonus: "20% extra" },
  { amount: 50, popular: false, bonus: "30% extra" },
];

const howItWorks = [
  { step: "1", icon: Coins, title: "Choose Amount", desc: "Pick a preset package or enter any custom amount, even less than $1." },
  { step: "2", icon: Bitcoin, title: "Pay via Crypto", desc: "Pay securely with BTC, ETH, USDT, or 30+ other coins via OxaPay." },
  { step: "3", icon: Zap, title: "Instant Balance", desc: "Your account balance updates automatically once payment is confirmed." },
  { step: "4", icon: RefreshCw, title: "Auto Refunds", desc: "Rentals with no SMS received are refunded automatically to your balance." },
];

const paymentFaqs = [
  { q: "Which cryptocurrencies are accepted?", a: "We accept BTC, ETH, USDT (TRC20 & ERC20), LTC, TRX, DOGE, and 30+ other coins via OxaPay." },
  { q: "How fast does my balance update?", a: "Balance updates automatically after your crypto transaction is confirmed on-chain. Confirmation times vary by coin — usually 1–10 minutes." },
  { q: "Can I add less than $1?", a: "Yes! Enter any amount in the custom field — even $0.10 or $0.50. There's no minimum top-up amount." },
  { q: "Are payments refundable?", a: "No. Crypto payments are irreversible by nature. Once processed and credited, funds cannot be refunded. However, unused balance stays in your account forever." },
  { q: "Is my payment private?", a: "Yes. Crypto payments via OxaPay are private and borderless — no card info, no bank details, no chargebacks." },
];

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

export default function Payments() {
  const { data: userData } = useGetMe();
  const { data, isLoading, error } = useListPayments();
  const createCheckout = useCreatePaymentCheckout();
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [customLoading, setCustomLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [historyTab, setHistoryTab] = useState<"all" | "completed" | "processing" | "failed">("all");
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

  const handleCheckout = (amount: number) => {
    setSelectedPackage(amount);
    createCheckout.mutate({ data: { amount, currency: "USD" } }, {
      onSuccess: (response) => {
        window.open(response.checkoutUrl, "_blank");
        toast({ title: "Redirecting to checkout", description: `Opening payment for $${amount.toFixed(2)}.` });
        setSelectedPackage(null);
      },
      onError: (err: any) => {
        toast({ title: "Checkout failed", description: err.message || "Please try again.", variant: "destructive" });
        setSelectedPackage(null);
      }
    });
  };

  const handleCustomCheckout = () => {
    const amount = parseFloat(customAmount);
    if (!amount || amount <= 0) return;
    setCustomLoading(true);
    createCheckout.mutate({ data: { amount, currency: "USD" } }, {
      onSuccess: (response) => {
        window.open(response.checkoutUrl, "_blank");
        toast({ title: "Redirecting to checkout", description: `Opening payment for $${amount.toFixed(2)}.` });
        setCustomLoading(false);
        setCustomAmount("");
      },
      onError: (err: any) => {
        toast({ title: "Checkout failed", description: err.message || "Please try again.", variant: "destructive" });
        setCustomLoading(false);
      }
    });
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
                  {pkg.bonus ? (
                    <p className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                      <Check className="h-3.5 w-3.5" /> {pkg.bonus} value
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Standard rate</p>
                  )}
                </CardContent>
                <CardFooter className="pb-5">
                  <Button
                    className="w-full rounded-full"
                    variant={pkg.popular ? "default" : "outline"}
                    onClick={() => handleCheckout(pkg.amount)}
                    disabled={createCheckout.isPending && selectedPackage === pkg.amount}
                    data-testid={`button-buy-${pkg.amount}`}
                  >
                    {createCheckout.isPending && selectedPackage === pkg.amount ? (
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
              disabled={!customAmount || customAmountNum <= 0 || customLoading}
              onClick={handleCustomCheckout}
              data-testid="button-buy-custom"
            >
              {customLoading ? (
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
        <div className="space-y-5">
          <h2 className="text-xl font-black text-white">How It Works</h2>
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
        <div className="space-y-4">
          <h2 className="text-xl font-black text-white">Payment FAQ</h2>
          <div className="space-y-2">
            {paymentFaqs.map((faq, i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="font-bold text-white text-sm">{faq.q}</span>
                  <ChevronRight className={`h-4 w-4 shrink-0 text-cyan-400 transition-transform duration-200 ${openFaq === i ? "rotate-90" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            See also:{" "}
            <Link href="/refund-policy">
              <span className="text-cyan-400 hover:text-cyan-300 cursor-pointer underline underline-offset-2">Refund Policy</span>
            </Link>
          </div>
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
                    onClick={() => setHistoryTab(tab.key)}
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
          ) : (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="divide-y divide-white/[0.06]">
                {filteredPayments.map((payment) => (
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
                    <div className={`pl-14 sm:pl-0 font-black text-xl ${payment.status === 'paid' ? 'text-white' : 'text-slate-500'}`}>
                      +${payment.amount.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}
