import { useState } from "react";
import { useListPayments, useCreatePaymentCheckout, getListPaymentsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CreditCard, ArrowUpRight, Check, AlertCircle, Clock, Loader2 } from "lucide-react";

const PACKAGES = [
  { amount: 5, credits: 5, popular: false },
  { amount: 10, credits: 11, popular: true, bonus: "10%" },
  { amount: 25, credits: 30, popular: false, bonus: "20%" },
  { amount: 50, credits: 65, popular: false, bonus: "30%" },
];

export default function Payments() {
  const { data, isLoading, error } = useListPayments();
  const createCheckout = useCreatePaymentCheckout();
  const { toast } = useToast();
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);

  const handleCheckout = (amount: number) => {
    setSelectedPackage(amount);
    createCheckout.mutate({ data: { amount, currency: "USD" } }, {
      onSuccess: (response) => {
        // In a real app, we'd redirect to response.checkoutUrl
        // For this demo, we'll just show a toast or open in new tab if we had a real URL
        window.open(response.checkoutUrl, "_blank");
        toast({
          title: "Redirecting to checkout",
          description: `Opening payment page for $${amount} package.`,
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

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payments & Credits</h1>
        <p className="text-muted-foreground mt-1">Add credits to your account to rent numbers.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Credit Packages</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PACKAGES.map((pkg) => (
            <Card 
              key={pkg.amount} 
              className={`relative overflow-hidden transition-all duration-200 hover:shadow-md ${pkg.popular ? 'border-primary shadow-sm ring-1 ring-primary/20' : ''}`}
              data-testid={`card-package-${pkg.amount}`}
            >
              {pkg.popular && (
                <div className="absolute top-0 inset-x-0 h-1 bg-primary"></div>
              )}
              {pkg.popular && (
                <Badge className="absolute top-3 right-3 bg-primary/10 text-primary hover:bg-primary/20 font-semibold border-0">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">${pkg.amount}</CardTitle>
                <CardDescription>USD</CardDescription>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-primary">{pkg.credits}</span>
                  <span className="text-muted-foreground font-medium">credits</span>
                </div>
                {pkg.bonus && (
                  <p className="text-sm font-medium text-green-600 mt-2 flex items-center gap-1">
                    <Check className="h-3 w-3" /> {pkg.bonus} extra credits
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={pkg.popular ? "default" : "outline"}
                  onClick={() => handleCheckout(pkg.amount)}
                  disabled={createCheckout.isPending && selectedPackage === pkg.amount}
                  data-testid={`button-buy-${pkg.amount}`}
                >
                  {createCheckout.isPending && selectedPackage === pkg.amount ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing</>
                  ) : (
                    "Buy Package"
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t">
        <h2 className="text-xl font-semibold">Payment History</h2>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : error || !data ? (
          <div className="text-center py-8 bg-gray-50/50 rounded-xl border border-dashed text-muted-foreground">
            Failed to load payment history.
          </div>
        ) : data.payments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50/50 rounded-xl border border-dashed">
            <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="font-medium text-gray-900 mb-1">No payments yet</h3>
            <p className="text-sm text-muted-foreground">When you purchase credits, they will appear here.</p>
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="divide-y">
              {data.payments.map((payment) => (
                <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50 transition-colors" data-testid={`row-payment-${payment.id}`}>
                  <div className="flex items-center gap-4 mb-2 sm:mb-0">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                      payment.status === 'paid' ? 'bg-green-100 text-green-600' :
                      payment.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {payment.status === 'paid' ? <ArrowUpRight className="h-5 w-5" /> : 
                       payment.status === 'pending' ? <Clock className="h-5 w-5" /> : 
                       <AlertCircle className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {payment.credits} Credits
                        <Badge variant="outline" className={
                          payment.status === 'paid' ? 'text-green-700 bg-green-50 border-green-200' :
                          payment.status === 'pending' ? 'text-amber-700 bg-amber-50 border-amber-200' :
                          'text-red-700 bg-red-50 border-red-200'
                        }>
                          {payment.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(payment.createdAt), "MMM d, yyyy 'at' h:mm a")} &bull; {payment.provider}
                      </div>
                    </div>
                  </div>
                  <div className="text-right sm:text-right pl-14 sm:pl-0 font-semibold text-lg">
                    ${payment.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
