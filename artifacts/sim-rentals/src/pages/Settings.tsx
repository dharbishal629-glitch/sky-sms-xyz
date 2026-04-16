import { useGetMe } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User, LogOut, HelpCircle, FileText, RefreshCw, Shield,
  ExternalLink, ChevronRight, DollarSign, Zap, Globe, Clock, MessageSquare, Lock
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { Reveal } from "@/components/Reveal";

const tips = [
  {
    icon: Globe,
    title: "Select service first",
    desc: "Always pick the service before choosing a country. The country list updates based on real-time availability."
  },
  {
    icon: Zap,
    title: "Act fast — 20-minute window",
    desc: "Once you rent a number, you have 20 minutes to receive an SMS. If no message arrives, you get a full automatic refund."
  },
  {
    icon: RefreshCw,
    title: "Cancel to get refunded",
    desc: "If you change your mind or the number isn't working, cancel the rental and your balance is instantly restored."
  },
  {
    icon: MessageSquare,
    title: "Copy codes instantly",
    desc: "Verification codes appear large on your rental card. Tap once to copy to clipboard."
  },
  {
    icon: DollarSign,
    title: "Add any amount",
    desc: "Top up with any dollar amount — even less than $1. Go to Payments and use the custom amount field."
  },
  {
    icon: Lock,
    title: "Private by design",
    desc: "All payments go through OxaPay crypto processing. No card details stored, fully private."
  },
];

export default function Settings() {
  const { data: user, isLoading: userLoading } = useGetMe();
  const { logout } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Reveal variant="up">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account and learn how to get the most out of SKY SMS.</p>
        </div>
      </Reveal>

      {/* Profile */}
      <Reveal variant="up" delay={40}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <User className="h-5 w-5 text-cyan-400" /> Profile
            </CardTitle>
            <CardDescription>Your account information.</CardDescription>
          </CardHeader>
          <CardContent>
            {userLoading ? (
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ) : user ? (
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <Avatar className="h-20 w-20 border-2 border-cyan-300/20">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="text-xl bg-cyan-400/10 text-cyan-200">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-black text-white">{user.name}</h3>
                    {user.role === 'admin' && (
                      <Badge variant="outline" className="border-cyan-300/20 bg-cyan-400/10 text-cyan-200">Admin</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-sm">{user.email}</p>
                  <div className="flex items-center gap-4 pt-1">
                    <div className="flex items-center gap-1.5 text-sm">
                      <DollarSign className="h-4 w-4 text-cyan-400" />
                      <span className="text-white font-bold">${user.credits.toFixed(2)}</span>
                      <span className="text-muted-foreground">balance</span>
                    </div>
                    <Link href="/payments">
                      <span className="text-xs text-cyan-400 font-semibold hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1">
                        Add funds <ChevronRight className="h-3 w-3" />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </Reveal>

      {/* How to Use Tips */}
      <Reveal variant="up" delay={80}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <HelpCircle className="h-5 w-5 text-cyan-400" /> How to Use SKY SMS
            </CardTitle>
            <CardDescription>Tips and tricks to get the best experience.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tips.map((tip, i) => (
                <div key={i} className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.03] space-y-2 hover:border-cyan-400/15 hover:bg-white/[0.05] transition-all duration-200">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-cyan-400/10 border border-cyan-300/20 flex items-center justify-center shrink-0">
                      <tip.icon className="h-4 w-4 text-cyan-400" />
                    </div>
                    <span className="font-bold text-white text-sm">{tip.title}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Reveal>

      {/* Support & Legal */}
      <Reveal variant="up" delay={120}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="h-5 w-5 text-cyan-400" /> Support & Legal
            </CardTitle>
            <CardDescription>Resources and policies for your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                { href: "/terms",         icon: FileText,   label: "Terms of Service", desc: "Read the rules for using SKY SMS" },
                { href: "/refund-policy", icon: RefreshCw,  label: "Refund Policy",    desc: "Learn when refunds are issued" },
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/10 transition-all duration-200 cursor-pointer group">
                    <div className="h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-sm">{item.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </Reveal>

      {/* Sign Out */}
      <Reveal variant="up" delay={160}>
        <Card className="glass-card border-red-400/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <LogOut className="h-5 w-5 text-red-400" /> Sign Out
            </CardTitle>
            <CardDescription>Sign out of your SKY SMS account on this device.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="border-red-400/25 text-red-300 hover:bg-red-400/10 hover:border-red-400/40 rounded-full"
              onClick={logout}
              data-testid="button-settings-signout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
