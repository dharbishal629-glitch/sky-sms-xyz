import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { useCommunityLinks } from "@/hooks/useCommunityLinks";
import {
  LayoutDashboard, Phone, History, CreditCard, Settings, Shield, Users,
  Activity, SlidersHorizontal, LogOut, Menu, DollarSign, Zap, ChevronRight,
  X, LifeBuoy, Tag, Code2, ExternalLink
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { href: "/dashboard", label: "Dashboard",   icon: LayoutDashboard },
  { href: "/rent",      label: "Rent Number", icon: Phone },
  { href: "/rentals",   label: "My Rentals",  icon: History },
  { href: "/payments",  label: "Payments",    icon: CreditCard },
  { href: "/api-docs",  label: "API",         icon: Code2 },
  { href: "/settings",  label: "Settings",    icon: Settings },
  { href: "/support",   label: "Support",     icon: LifeBuoy },
];

const adminItems = [
  { href: "/admin",              label: "Overview",     icon: Shield },
  { href: "/admin/users",        label: "Users",        icon: Users },
  { href: "/admin/services",     label: "Services",     icon: SlidersHorizontal },
  { href: "/admin/transactions", label: "Transactions", icon: Activity },
  { href: "/admin/coupons",      label: "Coupons",      icon: Tag },
  { href: "/admin/support",      label: "Support",      icon: LifeBuoy },
];

function NavItem({
  href, label, icon: Icon, active, onClick, badge,
}: {
  href: string; label: string; icon: React.ElementType;
  active: boolean; onClick?: () => void; badge?: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <span
        onClick={onClick}
        className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-200 cursor-pointer select-none ${
          active
            ? "bg-gradient-to-r from-sky-500/12 to-transparent text-white border border-sky-500/18 shadow-[0_1px_8px_rgba(0,0,0,0.2)]"
            : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 border border-transparent"
        }`}
      >
        <Icon className={`h-[17px] w-[17px] shrink-0 transition-colors ${active ? "text-sky-400" : "text-slate-500 group-hover:text-slate-300"}`} />
        <span className="flex-1 leading-none">{label}</span>
        {badge}
        {active && <div className="h-1.5 w-1.5 rounded-full bg-sky-400/80 shrink-0" />}
      </span>
    </Link>
  );
}

function SidebarContent({ onNav }: { onNav?: () => void }) {
  const [location] = useLocation();
  const { data: user, isLoading } = useGetMe();
  const { logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const { discord, telegram } = useCommunityLinks();
  const hasCommunity = discord || telegram;

  return (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <Link href="/dashboard">
          <span className="flex items-center gap-3 cursor-pointer group" onClick={onNav}>
            <div className="h-9 w-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0 transition-all duration-200 group-hover:bg-sky-500/15">
              <Phone className="h-4 w-4 text-sky-400" />
            </div>
            <div>
              <div className="text-[15px] font-bold text-white tracking-tight leading-none">SKY SMS</div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5 uppercase tracking-wider">Premium Panel</div>
            </div>
          </span>
        </Link>
      </div>

      <div className="h-px mx-4 mb-4" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.07), transparent)" }} />

      {/* Balance card */}
      {!isLoading && user && (
        <div className="mx-4 mb-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Balance</span>
            <DollarSign className="h-3.5 w-3.5 text-sky-400/70" />
          </div>
          <div className="text-[26px] font-black text-white tracking-tight leading-none" data-testid="text-user-credits">
            ${user.credits.toFixed(2)}
          </div>
          <Link href="/payments">
            <span className="mt-2.5 flex items-center gap-1 text-[11px] text-sky-400 font-semibold hover:text-sky-300 transition-colors cursor-pointer" data-testid="link-buy-credits" onClick={onNav}>
              Add funds <ChevronRight className="h-3 w-3" />
            </span>
          </Link>
        </div>
      )}
      {isLoading && (
        <div className="mx-4 mb-4 rounded-2xl border border-white/[0.05] p-4 space-y-2.5">
          <Skeleton className="h-2.5 w-14 bg-white/[0.04]" />
          <Skeleton className="h-7 w-24 bg-white/[0.04]" />
          <Skeleton className="h-2.5 w-16 bg-white/[0.03]" />
        </div>
      )}

      {/* Rent CTA */}
      <div className="px-4 mb-5">
        <Link href="/rent">
          <span
            onClick={onNav}
            className="flex items-center justify-center gap-2 h-10 w-full rounded-xl bg-sky-500 text-[13px] font-semibold text-white hover:bg-sky-400 transition-colors cursor-pointer shadow-[0_2px_12px_rgba(14,165,233,0.22)] active:scale-[0.98]"
          >
            <Zap className="h-3.5 w-3.5" />
            Rent a number
          </span>
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5 min-h-0">
        <div className="mb-2 px-2 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Navigation</div>
        {navItems.map((item) => {
          const active = location === item.href || location.startsWith(item.href + "/");
          return <NavItem key={item.href} {...item} active={active} onClick={onNav} />;
        })}

        {isAdmin && (
          <div className="mt-5 pt-4 border-t border-white/[0.05]">
            <div className="mb-2 px-2 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Admin</div>
            {adminItems.map((item) => {
              const active = location === item.href || location.startsWith(item.href + "/");
              return (
                <NavItem
                  key={item.href}
                  {...item}
                  active={active}
                  onClick={onNav}
                  badge={item.href === "/admin" ? (
                    <Badge className="ml-auto bg-rose-500/10 text-rose-300 border-rose-400/15 text-[9px] px-1.5 py-0 h-4 font-bold">
                      Admin
                    </Badge>
                  ) : undefined}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Community links */}
      {hasCommunity && (
        <div className="px-4 py-3 border-t border-white/[0.05]">
          <div className="mb-2 px-1 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">Community</div>
          <div className="flex gap-2">
            {discord && (
              <a
                href={discord}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onNav}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border border-indigo-400/20 bg-indigo-400/8 text-[12px] font-semibold text-indigo-300 hover:bg-indigo-400/14 hover:text-indigo-200 transition-all duration-150"
              >
                <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.022.01.043.025.06a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Discord
              </a>
            )}
            {telegram && (
              <a
                href={telegram}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onNav}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border border-sky-400/20 bg-sky-400/8 text-[12px] font-semibold text-sky-300 hover:bg-sky-400/14 hover:text-sky-200 transition-all duration-150"
              >
                <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Telegram
              </a>
            )}
          </div>
        </div>
      )}

      {/* User profile */}
      <div className="p-3 border-t border-white/[0.05]">
        {isLoading ? (
          <div className="flex items-center gap-3 px-2 py-1">
            <Skeleton className="h-9 w-9 rounded-full bg-white/[0.04]" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3 w-20 bg-white/[0.04]" />
              <Skeleton className="h-2.5 w-14 bg-white/[0.03]" />
            </div>
          </div>
        ) : user ? (
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.03] transition-colors group">
            <Avatar className="h-9 w-9 border border-white/[0.08] shrink-0">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="text-[12px] font-bold bg-sky-500/10 text-sky-300">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-white truncate" data-testid="text-username">{user.name}</div>
              <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
            </div>
            <button
              onClick={logout}
              className="h-7 w-7 shrink-0 flex items-center justify-center rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-400/8 transition-all duration-150"
              data-testid="button-signout"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const { data: user } = useGetMe();

  const openSidebar = () => { setClosing(false); setMobileOpen(true); };
  const closeSidebar = () => {
    setClosing(true);
    setTimeout(() => { setMobileOpen(false); setClosing(false); }, 260);
  };

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <div className="app-shell min-h-screen flex">

      {/* Desktop sidebar — solid bg for max scroll performance */}
      <aside className="hidden md:flex w-[256px] flex-col fixed inset-y-0 left-0 z-30 border-r border-white/[0.05] bg-[#060b18]">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${closing ? "overlay-fade-out" : "overlay-fade-in"}`}
            onClick={closeSidebar}
          />
          <aside className={`relative z-50 w-[270px] flex flex-col h-full bg-[#060b18] border-r border-white/[0.06] shadow-2xl ${closing ? "sidebar-slide-out" : "sidebar-slide-in"}`}>
            <button
              onClick={closeSidebar}
              className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all duration-150 z-10"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent onNav={closeSidebar} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col md:pl-[256px]">

        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 h-14 border-b border-white/[0.05] bg-[#060b18]">
          <Link href="/dashboard">
            <span className="flex items-center gap-2 cursor-pointer">
              <div className="h-7 w-7 rounded-lg bg-sky-500/12 border border-sky-500/20 flex items-center justify-center">
                <Phone className="h-3.5 w-3.5 text-sky-400" />
              </div>
              <span className="text-[14px] font-bold text-white">SKY SMS</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1">
                <DollarSign className="h-3 w-3 text-sky-400" />
                <span className="text-[13px] font-bold text-white">{user.credits.toFixed(2)}</span>
              </div>
            )}
            <button
              onClick={openSidebar}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.07] text-white hover:bg-white/[0.08] transition-all duration-150 active:scale-95"
            >
              <Menu className="h-[18px] w-[18px]" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-7 xl:p-9 w-full max-w-screen-xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
