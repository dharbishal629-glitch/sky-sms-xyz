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

  const openSidebar = () => {
    setClosing(false);
    setMobileOpen(true);
  };

  const closeSidebar = () => {
    setClosing(true);
    setTimeout(() => {
      setMobileOpen(false);
      setClosing(false);
    }, 220);
  };

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/rent", label: "Rent Number", icon: Phone },
    { href: "/rentals", label: "My Rentals", icon: History },
    { href: "/payments", label: "Payments", icon: CreditCard },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const adminItems = [
    { href: "/admin", label: "Overview", icon: Shield },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/services", label: "Services", icon: SlidersHorizontal },
    { href: "/admin/transactions", label: "Transactions", icon: Activity },
  ];

  const SidebarContent = ({ onNav }: { onNav?: () => void }) => (
    <div className="flex flex-col h-full">
      <div className="px-5 pt-6 pb-4">
        <Link href="/dashboard">
          <span className="flex items-center gap-2.5 cursor-pointer" onClick={onNav}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,220,255,0.3)]">
              <Phone className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <div className="text-base font-black tracking-tight gradient-text leading-none">SKY SMS</div>
              <div className="text-[10px] text-slate-600 font-medium tracking-wider uppercase">Premium Panel</div>
            </div>
          </span>
        </Link>
      </div>

      {!isLoading && user && (
        <div className="mx-4 mb-4 rounded-2xl bg-gradient-to-br from-cyan-400/[0.12] to-sky-600/[0.08] border border-cyan-400/20 p-4 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-cyan-400/10 blur-xl" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-cyan-300/70 font-semibold uppercase tracking-wider">Your Balance</span>
              <DollarSign className="h-3.5 w-3.5 text-cyan-400/60" />
            </div>
            <div className="text-3xl font-black text-white" data-testid="text-user-credits">
              ${user.credits.toFixed(2)}
            </div>
            <Link href="/payments">
              <span className="mt-2 flex items-center gap-1 text-xs text-cyan-400 font-bold hover:text-cyan-300 transition-colors cursor-pointer" data-testid="link-buy-credits" onClick={onNav}>
                Add funds <ChevronRight className="h-3 w-3" />
              </span>
            </Link>
          </div>
        </div>
      )}
      {isLoading && (
        <div className="mx-4 mb-4 rounded-2xl border border-white/[0.06] p-4 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-28" />
        </div>
      )}

      <div className="px-4 mb-4">
        <Link href="/rent">
          <span
            onClick={onNav}
            className="shine-hover flex items-center justify-center gap-2 h-10 w-full rounded-full bg-cyan-400 text-sm font-black text-black hover:bg-cyan-300 transition-all duration-200 shadow-[0_0_24px_rgba(0,220,255,0.3)] hover:shadow-[0_0_32px_rgba(0,220,255,0.45)] cursor-pointer"
          >
            <Zap className="h-4 w-4" />
            Rent a Number
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="mb-2 px-2 text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em]">Navigation</div>
        <div className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const active = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <span
                  data-testid={`link-nav-${item.label.toLowerCase().replace(" ", "-")}`}
                  onClick={onNav}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer group ${
                    active
                      ? "bg-cyan-400/12 text-white border border-cyan-300/20 shadow-[0_0_16px_rgba(0,220,255,0.08)]"
                      : "text-slate-500 hover:bg-white/[0.05] hover:text-slate-200"
                  }`}
                >
                  <item.icon className={`h-4 w-4 shrink-0 transition-colors ${active ? "text-cyan-400" : "group-hover:text-slate-300"}`} />
                  <span className="flex-1">{item.label}</span>
                  {active && <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />}
                </span>
              </Link>
            );
          })}
        </div>

        {isAdmin && (
          <div className="mt-5">
            <div className="mb-2 px-2 text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em]">Admin</div>
            <div className="flex flex-col gap-0.5">
              {adminItems.map((item) => {
                const active = location === item.href || location.startsWith(item.href + "/");
                return (
                  <Link key={item.href} href={item.href}>
                    <span
                      data-testid={`link-nav-admin-${item.label.toLowerCase().replace(" ", "-")}`}
                      onClick={onNav}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                        active
                          ? "bg-cyan-400/12 text-white border border-cyan-300/20"
                          : "text-slate-500 hover:bg-white/[0.05] hover:text-slate-200"
                      }`}
                    >
                      <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-cyan-400" : ""}`} />
                      {item.label}
                      {item.href === "/admin" && (
                        <Badge className="ml-auto bg-red-400/15 text-red-300 border-red-300/20 text-[10px] px-1.5 py-0 h-4">
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

      <div className="p-3 border-t border-white/[0.06] mt-auto">
        {isLoading ? (
          <div className="flex items-center gap-3 px-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="space-y-1.5 flex-1"><Skeleton className="h-3 w-24" /><Skeleton className="h-2.5 w-16" /></div>
          </div>
        ) : user ? (
          <div className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-white/[0.04] transition-colors">
            <Avatar className="h-9 w-9 border border-cyan-400/20 shrink-0">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="text-xs bg-cyan-400/10 text-cyan-300">{user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate" data-testid="text-username">{user.name}</div>
              <div className="text-[11px] text-slate-600 truncate">{user.email}</div>
            </div>
            <button
              onClick={logout}
              className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg text-slate-700 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
              data-testid="button-signout"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className="app-shell min-h-screen flex">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-cyan-400/[0.04] blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-sky-600/[0.04] blur-[100px]" />
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-72 flex-col fixed inset-y-0 left-0 z-30 border-r border-white/[0.06] bg-[#060609]/95 backdrop-blur-2xl">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-220 ${closing ? "opacity-0" : "opacity-100"}`}
            onClick={closeSidebar}
          />
          <aside
            className={`relative z-50 w-72 flex flex-col h-full bg-[#060609] border-r border-white/[0.06] ${closing ? "sidebar-slide-out" : "sidebar-slide-in"}`}
          >
            <button
              onClick={closeSidebar}
              className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all duration-200 z-10"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent onNav={closeSidebar} />
          </aside>
        </div>
      )}

      {/* Content area */}
      <div className="relative z-10 flex-1 flex flex-col md:pl-72">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 h-14 border-b border-white/[0.06] bg-[#060609]/95 backdrop-blur-2xl">
          <Link href="/dashboard">
            <span className="font-black text-base gradient-text cursor-pointer">SKY SMS</span>
          </Link>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm font-bold text-white">${user.credits.toFixed(2)}</span>
            )}
            <button
              onClick={openSidebar}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/[0.06] border border-white/[0.08] text-white hover:bg-white/[0.1] transition-all duration-200"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 xl:p-8 w-full max-w-screen-xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
