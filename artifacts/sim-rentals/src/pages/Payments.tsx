import { useState } from "react";
import { useListPayments, useCreatePaymentCheckout, getListPaymentsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CreditCard, ArrowUpRight, Check, AlertCircle, Clock, Loader2, Pencil } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const PACKAGES = [
  { amount: 5, popular: false },
  { amount: 10, popular: true, bonus: "10% extra" },
  { amount: 25, popular: false, bonus: "20% extra" },
  { amount: 50, popular: false, bonus: "30% extra" },
];

export default function Payments() {
  const { data, isLoading, error } = useListPayments();
  const createCheckout = useCreatePaymentCheckout();
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [customLoading, setCustomLoading] = useState(false);

  const handleCheckout = (amount: number) => {
    setSelectedPackage(amount);
    createCheckout.mutate({ data: { amount, currency: "USD" } }, {
      onSuccess: (response) => {
        window.open(response.checkoutUrl, "_blank");
        toast({
          title: "Redirecting to checkout",
          description: `Opening payment page for $${amount.toFixed(2)}.`,
        });
        setSelectedPackage(null);
      },
      onError: (err: any) => {
        toast({
          title: "Checkout failed",
          description: err.message || "Failed to create checkout session.",
          variant: "destructive"
        });
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
        toast({
          title: "Redirecting to checkout",
          description: `Opening payment page for $${amount.toFixed(2)}.`,
        });
        setCustomLoading(false);
        setCustomAmount("");
      },
      onError: (err: any) => {
        toast({
          title: "Checkout failed",
          description: err.message || "Failed to create checkout session.",
          variant: "destructive"
        });
        setCustomLoading(false);
      }
    });
  };

  const customAmountNum = parseFloat(customAmount) || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <Reveal variant="up">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Payments</h1>
          <p className="text-muted-foreground mt-1">Add funds to your account to rent numbers.</p>
        </div>
      </Reveal>

      <Reveal variant="up" delay={60}>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Top-Up Packages</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PACKAGES.map((pkg) => (
              <Card
                key={pkg.amount}
                className={`glass-card relative overflow-hidden transition-all duration-200 hover:scale-[1.02] ${pkg.popular ? 'blue-glow' : ''}`}
                data-testid={`card-package-${pkg.amount}`}
              >
                {pkg.popular && (
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-primary"></div>
                )}
                {pkg.popular && (
                  <Badge className="absolute top-3 right-3 bg-sky-400/10 text-sky-200 hover:bg-sky-400/20 font-semibold border-0 text-xs">
                    Popular
                  </Badge>
                )}
                <CardHeader className="pb-3">
                  <CardTitle className="text-3xl font-black text-primary">${pkg.amount}.00</CardTitle>
                  <CardDescription>USD — added to your balance</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  {pkg.bonus ? (
                    <p className="text-sm font-medium text-emerald-300 flex items-center gap-1">
                      <Check className="h-3 w-3" /> {pkg.bonus} value
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Standard rate</p>
                  )}
                </CardContent>
                <CardFooter>
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

      <Reveal variant="up" delay={120}>
        <div className="glass-card rounded-2xl p-6 max-w-sm">
          <div className="flex items-center gap-2 mb-1">
            <Pencil className="h-4 w-4 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Custom Amount</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5">Enter any dollar amount — even less than $1.</p>
          <div className="space-y-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">$</span>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.50"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="pl-7"
                data-testid="input-custom-amount"
              />
            </div>
            {customAmountNum > 0 && (
              <p className="text-sm text-primary font-semibold">= ${customAmountNum.toFixed(2)} added to your balance</p>
            )}
            <Button
              className="w-full rounded-full"
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

      <Reveal variant="up" delay={80}>
        <div className="space-y-4 pt-6 border-t border-white/[0.06]">
          <h2 className="text-xl font-semibold text-white">Payment History</h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : error || !data ? (
            <div className="text-center py-8 bg-white/[0.03] rounded-2xl border border-dashed border-white/10 text-muted-foreground">
              Failed to load payment history.
            </div>
          ) : data.payments.length === 0 ? (
            <div className="text-center py-12 bg-white/[0.03] rounded-2xl border border-dashed border-white/10">
              <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-medium text-white mb-1">No payments yet</h3>
              <p className="text-sm text-muted-foreground">When you add funds, they will appear here.</p>
            </div>
          ) : (
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="divide-y divide-white/[0.06]">
                {data.payments.map((payment) => (
                  <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-white/[0.03] transition-colors" data-testid={`row-payment-${payment.id}`}>
                    <div className="flex items-center gap-4 mb-2 sm:mb-0">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                        payment.status === 'paid' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-300/20' :
                        payment.status === 'pending' ? 'bg-amber-400/10 text-amber-400 border border-amber-300/20' :
                        'bg-red-400/10 text-red-400 border border-red-300/20'
                      }`}>
                        {payment.status === 'paid' ? <ArrowUpRight className="h-5 w-5" /> :
                         payment.status === 'pending' ? <Clock className="h-5 w-5" /> :
                         <AlertCircle className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="font-semibold text-white flex items-center gap-2">
                          ${payment.amount.toFixed(2)} added
                          <Badge variant="outline" className={
                            payment.status === 'paid' ? 'text-emerald-200 border-emerald-300/20 bg-emerald-400/10' :
                            payment.status === 'pending' ? 'text-amber-200 border-amber-300/20 bg-amber-400/10' :
                            'text-red-200 border-red-300/20 bg-red-400/10'
                          }>
                            {payment.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(payment.createdAt), "MMM d, yyyy 'at' h:mm a")} &bull; {payment.provider}
                        </div>
                      </div>
                    </div>
                    <div className="text-right sm:text-right pl-14 sm:pl-0 font-bold text-lg text-primary">
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
