import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Phone, History, CreditCard, Settings, Shield, Users,
  Activity, SlidersHorizontal, LogOut, Menu, DollarSign, Zap, ChevronRight, X
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: user, isLoading } = useGetMe();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const isAdmin = user?.role === "admin";

  const openSidebar = () => { setClosing(false); setMobileOpen(true); };
  const closeSidebar = () => {
    setClosing(true);
    setTimeout(() => { setMobileOpen(false); setClosing(false); }, 220);
  };

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navItems = [
    { href: "/dashboard", label: "Dashboard",  icon: LayoutDashboard },
    { href: "/rent",      label: "Rent Number", icon: Phone },
    { href: "/rentals",   label: "My Rentals",  icon: History },
    { href: "/payments",  label: "Payments",    icon: CreditCard },
    { href: "/settings",  label: "Settings",    icon: Settings },
  ];

  const adminItems = [
    { href: "/admin",              label: "Overview",     icon: Shield },
    { href: "/admin/users",        label: "Users",        icon: Users },
    { href: "/admin/services",     label: "Services",     icon: SlidersHorizontal },
    { href: "/admin/transactions", label: "Transactions", icon: Activity },
  ];

  const SidebarContent = ({ onNav }: { onNav?: () => void }) => (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="px-5 pt-5 pb-4">
        <Link href="/dashboard">
          <span className="flex items-center gap-2.5 cursor-pointer" onClick={onNav}>
            <div className="h-8 w-8 rounded-lg bg-sky-400/10 border border-sky-400/20 flex items-center justify-center shrink-0">
              <Phone className="h-3.5 w-3.5 text-sky-400" />
            </div>
            <div>
              <div className="text-[14px] font-bold text-white tracking-tight leading-none">SKY SMS</div>
              <div className="text-[10px] text-slate-500 font-medium mt-0.5">Premium Panel</div>
            </div>
          </span>
        </Link>
      </div>

      {/* Balance */}
      {!isLoading && user && (
        <div className="mx-4 mb-4 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Balance</span>
            <DollarSign className="h-3 w-3 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight" data-testid="text-user-credits">
            ${user.credits.toFixed(2)}
          </div>
          <Link href="/payments">
            <span className="mt-2 flex items-center gap-1 text-[11px] text-sky-400 font-semibold hover:text-sky-300 transition-colors cursor-pointer" data-testid="link-buy-credits" onClick={onNav}>
              Add funds <ChevronRight className="h-3 w-3" />
            </span>
          </Link>
        </div>
      )}
      {isLoading && (
        <div className="mx-4 mb-4 rounded-xl border border-white/[0.06] p-4 space-y-2">
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="h-7 w-24" />
        </div>
      )}

      {/* CTA */}
      <div className="px-4 mb-5">
        <Link href="/rent">
          <span
            onClick={onNav}
            className="flex items-center justify-center gap-2 h-9 w-full rounded-full bg-sky-400 text-[13px] font-semibold text-[#080c18] hover:bg-sky-300 transition-all duration-200 cursor-pointer"
          >
            <Zap className="h-3.5 w-3.5" />
            Rent a number
          </span>
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="mb-1.5 px-2 text-[10px] font-semibold text-slate-600 uppercase tracking-[0.18em]">Menu</div>
        <div className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const active = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <span
                  data-testid={`link-nav-${item.label.toLowerCase().replace(" ", "-")}`}
                  onClick={onNav}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer group ${
                    active
                      ? "bg-white/[0.07] text-white"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                  }`}
                >
                  <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-sky-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                  <span className="flex-1">{item.label}</span>
                  {active && <div className="h-1.5 w-1.5 rounded-full bg-sky-400 shrink-0" />}
                </span>
              </Link>
            );
          })}
        </div>

        {isAdmin && (
          <div className="mt-5">
            <div className="mb-1.5 px-2 text-[10px] font-semibold text-slate-600 uppercase tracking-[0.18em]">Admin</div>
            <div className="flex flex-col gap-0.5">
              {adminItems.map((item) => {
                const active = location === item.href || location.startsWith(item.href + "/");
                return (
                  <Link key={item.href} href={item.href}>
                    <span
                      data-testid={`link-nav-admin-${item.label.toLowerCase().replace(" ", "-")}`}
                      onClick={onNav}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 cursor-pointer ${
                        active
                          ? "bg-white/[0.07] text-white"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200"
                      }`}
                    >
                      <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-sky-400" : "text-slate-500"}`} />
                      {item.label}
                      {item.href === "/admin" && (
                        <Badge className="ml-auto bg-red-400/10 text-red-300 border-red-300/15 text-[10px] px-1.5 py-0 h-4">
                          Admin
                        </Badge>
                      )}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* User */}
      <div className="p-3 border-t border-white/[0.05] mt-auto">
        {isLoading ? (
          <div className="flex items-center gap-3 px-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1.5 flex-1"><Skeleton className="h-3 w-20" /><Skeleton className="h-2.5 w-14" /></div>
          </div>
        ) : user ? (
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
            <Avatar className="h-8 w-8 border border-white/[0.08] shrink-0">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="text-[11px] bg-sky-400/10 text-sky-300">{user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-white truncate" data-testid="text-username">{user.name}</div>
              <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
            </div>
            <button
              onClick={logout}
              className="h-7 w-7 shrink-0 flex items-center justify-center rounded-md text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-all duration-150"
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

  return (
    <div className="app-shell min-h-screen flex">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-sky-400/[0.04] blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-500/[0.04] blur-[80px]" />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-30 border-r border-white/[0.06] bg-[#080c18]/98 backdrop-blur-xl">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-220 ${closing ? "opacity-0" : "opacity-100"}`}
            onClick={closeSidebar}
          />
          <aside className={`relative z-50 w-64 flex flex-col h-full bg-[#080c18] border-r border-white/[0.06] ${closing ? "sidebar-slide-out" : "sidebar-slide-in"}`}>
            <button
              onClick={closeSidebar}
              className="absolute top-4 right-4 h-7 w-7 flex items-center justify-center rounded-md text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all duration-150 z-10"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent onNav={closeSidebar} />
          </aside>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col md:pl-64">

        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 h-13 border-b border-white/[0.05] bg-[#080c18]/95 backdrop-blur-xl">
          <Link href="/dashboard">
            <span className="text-[14px] font-bold text-white cursor-pointer">SKY SMS</span>
          </Link>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-[13px] font-semibold text-white">${user.credits.toFixed(2)}</span>
            )}
            <button
              onClick={openSidebar}
              className="h-8 w-8 flex items-center justify-center rounded-lg bg-white/[0.05] border border-white/[0.07] text-white hover:bg-white/[0.09] transition-all duration-150"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 md:p-7 xl:p-8 w-full max-w-screen-xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
