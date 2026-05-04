import { useGetMe } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User, LogOut, HelpCircle, FileText, RefreshCw, Shield,
  ExternalLink, ChevronRight, DollarSign, Zap, Globe, Clock, MessageSquare, Lock
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Reveal } from "@/components/Reveal";

const tips = [
  { icon: Globe,        title: "Select service first",     desc: "Always pick the service before choosing a country. The country list updates based on real-time availability." },
  { icon: Zap,          title: "20-minute window",          desc: "Once you rent a number, you have 20 minutes to receive an SMS. If nothing arrives, you get a full automatic refund." },
  { icon: RefreshCw,    title: "Cancel to get refunded",   desc: "If you change your mind or the number isn't working, cancel the rental and your balance is instantly restored." },
  { icon: MessageSquare,title: "Copy codes instantly",     desc: "Verification codes appear on your rental card. Tap once to copy to clipboard." },
  { icon: DollarSign,   title: "Add any amount",           desc: "Top up with any dollar amount — even less than $1. Go to Payments and use the custom amount field." },
  { icon: Lock,         title: "Private by design",        desc: "All payments go through OxaPay crypto processing. No card details stored, fully private." },
];

export default function Settings() {
  const { data: user, isLoading: userLoading } = useGetMe();
  const { logout } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-7">

      <Reveal variant="up">
        <div>
          <h1 className="text-[2rem] font-black tracking-tight text-white">Settings</h1>
          <p className="text-slate-500 mt-1.5 text-[14px]">Manage your account and learn how to get the most out of SKY SMS.</p>
        </div>
      </Reveal>

      {/* Profile */}
      <Reveal variant="up" delay={40}>
        <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-5 border-b border-white/[0.05]">
            <User className="h-4 w-4 text-sky-400" />
            <div className="font-semibold text-white text-[15px]">Profile</div>
          </div>
          <div className="p-6">
            {userLoading ? (
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full bg-white/[0.04]" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40 bg-white/[0.04]" />
                  <Skeleton className="h-4 w-32 bg-white/[0.03]" />
                </div>
              </div>
            ) : user ? (
              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                <Avatar className="h-18 w-18 border-2 border-white/[0.09]">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="text-xl bg-sky-400/10 text-sky-300 font-black">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-xl font-black text-white">{user.name}</h3>
                    {user.role === "admin" && (
                      <Badge variant="outline" className="border-rose-400/20 bg-rose-400/8 text-rose-300 text-[11px] font-bold">Admin</Badge>
                    )}
                  </div>
                  <p className="text-slate-500 text-[13px]">{user.email}</p>
                  <div className="flex items-center gap-4 pt-1">
                    <div className="flex items-center gap-1.5 text-[13px]">
                      <DollarSign className="h-3.5 w-3.5 text-sky-400" />
                      <span className="text-white font-bold">${user.credits.toFixed(2)}</span>
                      <span className="text-slate-500">balance</span>
                    </div>
                    <Link href="/payments">
                      <span className="text-[12px] text-sky-400 font-semibold hover:text-sky-300 transition-colors cursor-pointer flex items-center gap-1">
                        Add funds <ChevronRight className="h-3 w-3" />
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </Reveal>

      {/* Tips */}
      <Reveal variant="up" delay={80}>
        <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-5 border-b border-white/[0.05]">
            <HelpCircle className="h-4 w-4 text-sky-400" />
            <div className="font-semibold text-white text-[15px]">How to Use SKY SMS</div>
          </div>
          <div className="p-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tips.map((tip, i) => (
                <div key={i} className="p-4 rounded-xl border border-white/[0.05] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-200">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="h-8 w-8 rounded-lg bg-sky-400/8 border border-sky-400/12 flex items-center justify-center shrink-0">
                      <tip.icon className="h-4 w-4 text-sky-400" />
                    </div>
                    <span className="font-semibold text-white text-[13px]">{tip.title}</span>
                  </div>
                  <p className="text-[12px] text-slate-500 leading-relaxed">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Support & Legal */}
      <Reveal variant="up" delay={120}>
        <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-5 border-b border-white/[0.05]">
            <Shield className="h-4 w-4 text-sky-400" />
            <div className="font-semibold text-white text-[15px]">Support & Legal</div>
          </div>
          <div className="p-5 space-y-2">
            {[
              { href: "/terms",         icon: FileText,  label: "Terms of Service", desc: "Read the rules for using SKY SMS" },
              { href: "/refund-policy", icon: RefreshCw, label: "Refund Policy",    desc: "Learn when refunds are issued" },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <div className="flex items-center gap-3 p-4 rounded-xl border border-white/[0.05] bg-white/[0.015] hover:bg-white/[0.03] hover:border-white/[0.08] transition-all duration-200 cursor-pointer group">
                  <div className="h-9 w-9 rounded-xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-[13px]">{item.label}</div>
                    <div className="text-[12px] text-slate-500 mt-0.5">{item.desc}</div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-slate-700 group-hover:text-slate-400 transition-colors shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Sign Out */}
      <Reveal variant="up" delay={160}>
        <div className="rounded-2xl border border-rose-400/10 bg-gradient-to-br from-white/[0.02] to-transparent overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-5 border-b border-white/[0.05]">
            <LogOut className="h-4 w-4 text-rose-400" />
            <div className="font-semibold text-white text-[15px]">Sign Out</div>
          </div>
          <div className="p-5">
            <p className="text-[13px] text-slate-500 mb-4">Sign out of your SKY SMS account on this device.</p>
            <button
              onClick={logout}
              className="flex items-center gap-2 h-10 px-5 rounded-xl border border-rose-400/20 text-rose-300 text-[13px] font-semibold hover:bg-rose-400/8 hover:border-rose-400/30 transition-all duration-150"
              data-testid="button-settings-signout"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </Reveal>

    </div>
  );
}
