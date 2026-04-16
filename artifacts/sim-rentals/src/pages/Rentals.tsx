import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useListRentals, useRefreshRental, useCancelRental, getGetDashboardQueryKey, getListRentalsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format, differenceInSeconds } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, X, MessageSquare, Clock, Copy, Check, Loader2, Phone, History, Zap, CheckCircle2, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Reveal } from "@/components/Reveal";

function maskSender(sender: string): string {
  if (!sender) return sender;
  const lower = sender.toLowerCase();
  if (lower.includes("hero sms") || lower.includes("herosms")) return "SKY SMS";
  return sender;
}

function RentalCard({ rental }: { rental: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const refreshMutation = useRefreshRental();
  const cancelMutation = useCancelRental();
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const isActive = rental.status === 'active';
  const hasMessages = rental.messages && rental.messages.length > 0;
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!isActive) return;
    const calculateTimeLeft = () => {
      const expiresAt = new Date(rental.expiresAt);
      const diff = Math.max(0, differenceInSeconds(expiresAt, new Date()));
      setTimeLeft(diff);
      if (diff === 0) {
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: getListRentalsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        }, 1500);
      }
    };
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [isActive, rental.expiresAt, queryClient]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string, isCode = false) => {
    navigator.clipboard.writeText(text);
    if (isCode) {
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    toast({ title: "Copied to clipboard", duration: 2000 });
  };

  return (
    <Card className={`glass-card overflow-hidden transition-all duration-300 ${isActive ? 'blue-glow border-cyan-400/15' : 'opacity-80 hover:opacity-100'}`} data-testid={`card-rental-${rental.id}`}>
      <div className={`h-1.5 w-full ${isActive ? 'bg-gradient-to-r from-cyan-400 via-sky-400 to-cyan-400' : rental.status === 'completed' || rental.status === 'sms_received' ? 'bg-emerald-400' : 'bg-slate-700'}`} />

      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-lg flex-wrap">
              {rental.serviceName}
              <Badge variant={isActive ? 'default' : (rental.status === 'completed' || rental.status === 'sms_received') ? 'secondary' : 'outline'}>
                {rental.status === 'sms_received' ? '✓ SMS received' : rental.status}
              </Badge>
            </CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              {rental.countryName} &bull; {format(new Date(rental.createdAt), "MMM d, yyyy · HH:mm")}
            </div>
          </div>
          <div className="text-right ml-3 shrink-0">
            <div className="font-black text-lg text-white" data-testid={`text-rental-price-${rental.id}`}>${rental.price.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">charged</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-4 space-y-4">
        {/* Phone Number — premium display */}
        <div className={`relative rounded-2xl p-5 border overflow-hidden ${
          isActive
            ? 'bg-gradient-to-br from-sky-950/60 via-[#0a1628]/60 to-indigo-950/60 border-sky-400/25'
            : 'bg-white/[0.03] border-white/10'
        }`}>
          {isActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-sky-400/[0.04] via-transparent to-indigo-400/[0.04] pointer-events-none" />
          )}
          <div className="relative">
            <div className="flex items-center gap-1.5 mb-2">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-[0.18em] font-semibold">Your Number</span>
            </div>

            {rental.phoneNumber ? (
              <div className="flex items-center justify-between gap-3">
                <div
                  className={`font-mono font-black tracking-widest select-all ${
                    isActive ? 'text-white text-2xl sm:text-3xl' : 'text-slate-300 text-xl sm:text-2xl'
                  }`}
                  data-testid={`text-rental-number-${rental.id}`}
                  style={{ letterSpacing: '0.08em' }}
                >
                  +{rental.phoneNumber}
                </div>
                <button
                  onClick={() => copyToClipboard(`+${rental.phoneNumber}`)}
                  data-testid={`button-copy-number-${rental.id}`}
                  className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 ${
                    copied
                      ? 'bg-emerald-400/20 text-emerald-300 border border-emerald-300/30'
                      : 'bg-white/[0.08] text-white border border-white/[0.12] hover:bg-white/[0.14] hover:border-sky-400/30'
                  }`}
                >
                  {copied ? (
                    <><Check className="h-3.5 w-3.5" /> Copied</>
                  ) : (
                    <><Copy className="h-3.5 w-3.5" /> Copy</>
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                Allocating your number...
              </div>
            )}
          </div>
        </div>

        {/* Timer */}
        {isActive && (
          <div className={`rounded-2xl border px-4 py-3 flex items-center justify-between ${timeLeft < 120 ? 'border-red-300/30 bg-red-400/10' : timeLeft < 300 ? 'border-amber-300/30 bg-amber-400/10' : 'border-sky-300/20 bg-sky-400/10'}`}>
            <div className="flex items-center gap-2">
              <Clock className={`h-4 w-4 ${timeLeft < 120 ? 'text-red-400' : timeLeft < 300 ? 'text-amber-400' : 'text-sky-400'}`} />
              <span className={`text-sm font-semibold ${timeLeft < 120 ? 'text-red-200' : timeLeft < 300 ? 'text-amber-200' : 'text-sky-200'}`}>
                {timeLeft === 0 ? "Expired — refreshing..." : "Time remaining"}
              </span>
            </div>
            <span className={`font-mono text-2xl font-black tabular-nums ${timeLeft < 120 ? 'text-red-300' : timeLeft < 300 ? 'text-amber-300' : 'text-sky-300'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <MessageSquare className="h-4 w-4" /> Messages
            {hasMessages && (
              <Badge variant="outline" className="text-emerald-300 border-emerald-300/20 bg-emerald-400/10 text-xs ml-auto">
                {rental.messages.length} received
              </Badge>
            )}
          </div>

          {hasMessages ? (
            <div className="space-y-3">
              {rental.messages.map((msg: any) => (
                <div key={msg.id} className="bg-sky-400/[0.08] border border-sky-300/20 rounded-2xl p-4" data-testid={`row-message-${msg.id}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">{maskSender(msg.sender)}</span>
                    <span className="text-xs text-sky-300/60 font-mono">{format(new Date(msg.receivedAt), "HH:mm:ss")}</span>
                  </div>
                  <div className="text-sm text-white leading-relaxed">{msg.message}</div>
                  {msg.code && (
                    <div className="mt-3 pt-3 border-t border-sky-200/20 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-xs text-sky-300/70 font-semibold uppercase tracking-wider mb-1">Verification Code</div>
                        <span className="font-mono font-black text-2xl text-cyan-300 tracking-[0.3em]">{msg.code}</span>
                      </div>
                      <Button
                        size="sm"
                        className="rounded-full bg-cyan-400/15 text-cyan-200 border border-cyan-300/20 hover:bg-cyan-400/25 h-9 px-4"
                        onClick={() => copyToClipboard(msg.code, true)}
                      >
                        {copiedCode === msg.code ? <><Check className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> Copied</> : <><Copy className="h-3.5 w-3.5 mr-1.5" /> Copy</>}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white/[0.02] rounded-2xl border border-dashed border-white/10 text-sm text-muted-foreground">
              {isActive ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-cyan-400 opacity-75 top-0 right-0" />
                    <MessageSquare className="h-6 w-6 opacity-40" />
                  </div>
                  Waiting for incoming SMS...
                </div>
              ) : "No messages received."}
            </div>
          )}
        </div>
      </CardContent>

      {isActive && (
        <CardFooter className="bg-white/[0.02] px-5 py-3 border-t border-white/[0.06] flex flex-col min-[360px]:flex-row justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => cancelMutation.mutate({ id: rental.id }, {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: getListRentalsQueryKey() });
                queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
                toast({ title: "Cancelled", description: "Rental cancelled. Refund applied if eligible." });
              }
            })}
            disabled={cancelMutation.isPending}
            className="text-muted-foreground hover:text-red-300 hover:bg-red-400/10 rounded-full w-full min-[360px]:w-auto"
            data-testid={`button-cancel-rental-${rental.id}`}
          >
            {cancelMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="h-4 w-4 mr-2" />}
            Cancel & Refund
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => refreshMutation.mutate({ id: rental.id }, {
              onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: getListRentalsQueryKey() });
                toast({ title: "Refreshed", description: "Checked for new messages." });
              }
            })}
            disabled={refreshMutation.isPending}
            className="rounded-full w-full min-[360px]:w-auto"
            data-testid={`button-refresh-rental-${rental.id}`}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            Refresh SMS
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default function Rentals() {
  const { data, isLoading, error } = useListRentals({ query: { refetchInterval: 15000 } });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div><Skeleton className="h-8 w-48 mb-2" /><Skeleton className="h-4 w-64" /></div>
        <div className="grid gap-4">
          {[1, 2].map(i => <Skeleton key={i} className="h-72 w-full rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-16 max-w-4xl mx-auto">
        <div className="glass-card rounded-2xl p-10 inline-block">
          <h2 className="text-xl font-bold mb-2 text-white">Could not load rentals</h2>
          <p className="text-muted-foreground text-sm">Please refresh the page and try again.</p>
        </div>
      </div>
    );
  }

  const activeRentals = data.rentals.filter((r: any) => r.status === 'active');
  const pastRentals = data.rentals.filter((r: any) => r.status !== 'active');
  const smsReceived = data.rentals.filter((r: any) => r.status === 'sms_received' || r.messages?.length > 0).length;

  return (
    <div className="max-w-4xl mx-auto space-y-10">

      {/* Header */}
      <Reveal variant="up">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">My Rentals</h1>
          <p className="text-muted-foreground mt-1">Manage active numbers and view your rental history.</p>
        </div>
      </Reveal>

      {/* Stats */}
      {data.rentals.length > 0 && (
        <Reveal variant="up" delay={40}>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: TrendingUp, label: "Total Rentals", value: data.rentals.length, color: "cyan" },
              { icon: Zap, label: "Active Now", value: activeRentals.length, color: "indigo" },
              { icon: CheckCircle2, label: "SMS Received", value: smsReceived, color: "emerald" },
            ].map((stat, i) => (
              <div key={i} className={`glass-card rounded-2xl p-4 text-center border ${stat.color === 'cyan' ? 'border-cyan-400/10' : stat.color === 'indigo' ? 'border-indigo-400/10' : 'border-emerald-400/10'}`}>
                <div className={`text-2xl font-black ${stat.color === 'cyan' ? 'text-white' : stat.color === 'indigo' ? 'text-white' : 'text-white'}`}>{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1 font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      )}

      {/* Active Rentals */}
      <div className="space-y-4">
        <Reveal variant="up" delay={60}>
          <h2 className="text-lg font-bold flex items-center gap-2 text-white">
            <span className="relative flex h-3 w-3">
              {activeRentals.length > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />}
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400" />
            </span>
            Active Now
            <span className="text-muted-foreground font-normal text-sm">({activeRentals.length})</span>
          </h2>
        </Reveal>

        {activeRentals.length === 0 ? (
          <Reveal variant="up" delay={80}>
            <div className="glass-card rounded-2xl border-dashed">
              <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                <div className="h-16 w-16 rounded-2xl bg-cyan-400/10 border border-cyan-300/20 flex items-center justify-center mb-5">
                  <Phone className="h-8 w-8 text-cyan-400/60" />
                </div>
                <h3 className="font-black text-white text-lg mb-2">No active rentals</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-xs">
                  Rent a temporary number to receive SMS verification codes instantly.
                </p>
                <Button asChild className="rounded-full">
                  <Link href="/rent">Rent a Number Now</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {activeRentals.map((rental: any, i: number) => (
              <Reveal key={rental.id} variant="up" delay={i * 60}>
                <RentalCard rental={rental} />
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {/* How it Works guide (when no past rentals either) */}
      {data.rentals.length === 0 && (
        <Reveal variant="up" delay={120}>
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">How to Rent a Number</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { step: "1", icon: Zap, title: "Choose Service & Country", desc: "Go to Rent a Number, pick your service (e.g. WhatsApp) and a country with available stock." },
                { step: "2", icon: Phone, title: "Receive Your Number", desc: "A temporary number is allocated instantly. You have 20 minutes to receive an SMS code." },
                { step: "3", icon: CheckCircle2, title: "Copy the Code", desc: "Your verification code appears in real-time on the rental card. Tap once to copy it." },
              ].map((item) => (
                <div key={item.step} className="glass-card rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-full bg-cyan-400/15 border border-cyan-300/20 flex items-center justify-center shrink-0 font-black text-cyan-400 text-sm">
                      {item.step}
                    </div>
                    <div className="h-7 w-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                      <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="font-bold text-white text-sm mb-1">{item.title}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* Past Rentals */}
      {pastRentals.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-white/[0.06]">
          <Reveal variant="up">
            <h2 className="text-lg font-bold flex items-center gap-2 text-muted-foreground">
              <History className="h-5 w-5" />
              Past Rentals
              <span className="text-muted-foreground font-normal text-sm">({pastRentals.length})</span>
            </h2>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2">
            {pastRentals.map((rental: any, i: number) => (
              <Reveal key={rental.id} variant="up" delay={i * 40}>
                <RentalCard rental={rental} />
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
