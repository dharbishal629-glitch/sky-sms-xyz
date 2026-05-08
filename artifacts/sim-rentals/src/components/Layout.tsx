import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { useCommunityLinks } from "@/hooks/useCommunityLinks";
import {
  LayoutDashboard, Phone, History, CreditCard, Settings, Shield, Users,
  Activity, SlidersHorizontal, LogOut, Menu, DollarSign, Zap, ChevronRight,
  X, LifeBuoy, Tag, Bell, Check, Info, AlertCircle
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

const navItems = [
  { href: "/dashboard", label: "Dashboard",   icon: LayoutDashboard },
  { href: "/rent",      label: "Rent Number", icon: Phone },
  { href: "/rentals",   label: "My Rentals",  icon: History },
  { href: "/payments",  label: "Payments",    icon: CreditCard },
  { href: "/referral",  label: "Referral",    icon: Tag },
  { href: "/support",   label: "Support",     icon: LifeBuoy },
  { href: "/settings",  label: "Settings",    icon: Settings },
];

const adminItems = [
  { href: "/admin",                    label: "Overview",       icon: Shield },
  { href: "/admin/services",           label: "Services",       icon: SlidersHorizontal },
  { href: "/admin/transactions",       label: "Transactions",   icon: Activity },
  { href: "/admin/users",              label: "Users",          icon: Users },
  { href: "/admin/coupons",            label: "Coupons",        icon: Tag },
  { href: "/admin/notifications",      label: "Notifications",  icon: Bell },
  { href: "/admin/support",            label: "Support",        icon: LifeBuoy },
];

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE}/api/notifications`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json() as { notifications: Notification[] };
        setNotifications(data.notifications ?? []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const markRead = async (id: number) => {
    try {
      await fetch(`${BASE}/api/notifications/${id}/read`, { method: "POST", credentials: "include" });
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    } catch {
      // silent
    }
  };

  const markAllRead = async () => {
    try {
      await fetch(`${BASE}/api/notifications/read-all`, { method: "POST", credentials: "include" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      // silent
    }
  };

  const typeIcon = (type: string) => {
    if (type === "success") return <Check className="h-3.5 w-3.5 text-emerald-400" />;
    if (type === "warning") return <AlertCircle className="h-3.5 w-3.5 text-amber-400" />;
    return <Info className="h-3.5 w-3.5 text-amber-400" />;
  };

  const timeAgo = (dateStr: string) => {
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative h-8 w-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-amber-400 hover:bg-amber-500/8 transition-all duration-150"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-amber-500 text-[9px] font-bold text-slate-900 flex items-center justify-center leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-80 rounded-2xl border border-amber-900/20 bg-[#080c18] shadow-[0_8px_40px_rgba(0,0,0,0.7),0_0_0_1px_rgba(212,168,67,0.06)] z-50 overflow-hidden"
          style={{ animation: "dropdown-in 0.2s cubic-bezier(0.16,1,0.3,1) both" }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
            <span className="text-[12px] font-bold text-white">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-[10px] text-amber-400 hover:text-amber-300 font-semibold transition-colors">
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="px-4 py-6 space-y-3">
                {[0,1,2].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-7 w-7 rounded-lg bg-white/[0.04] shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-2.5 w-28 bg-white/[0.04]" />
                      <Skeleton className="h-2 w-40 bg-white/[0.03]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="h-7 w-7 text-slate-700 mx-auto mb-2" />
                <p className="text-[12px] text-slate-600">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`w-full text-left px-4 py-3 flex gap-3 hover:bg-white/[0.03] transition-colors ${!n.read ? "bg-amber-500/[0.03]" : ""}`}
                >
                  <div className={`h-7 w-7 shrink-0 rounded-lg flex items-center justify-center mt-0.5 ${!n.read ? "bg-amber-500/12 border border-amber-500/20" : "bg-white/[0.04] border border-white/[0.06]"}`}>
                    {typeIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold text-white truncate">{n.title}</span>
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{n.message}</p>
                    <span className="text-[10px] text-slate-700 mt-1 block">{timeAgo(n.createdAt)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

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
        className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer select-none ${
          active
            ? "bg-gradient-to-r from-amber-500/10 to-transparent text-white border border-amber-500/15 shadow-[0_1px_8px_rgba(0,0,0,0.2)]"
            : "text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 border border-transparent"
        }`}
      >
        <Icon className={`h-[16px] w-[16px] shrink-0 transition-colors ${active ? "text-amber-400" : "text-slate-600 group-hover:text-slate-400"}`} />
        <span className="flex-1 leading-none">{label}</span>
        {badge}
        {active && <div className="h-1.5 w-1.5 rounded-full bg-amber-400/80 shrink-0" />}
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

      {/* Logo — no bell here on mobile (bell is in mobile header) */}
      <div className={`px-4 pt-5 pb-4 flex items-center justify-between ${onNav ? "pr-14" : ""}`}>
        <Link href="/dashboard">
          <span className="flex items-center gap-2.5 cursor-pointer group" onClick={onNav}>
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 transition-all duration-200 group-hover:bg-amber-500/15">
              <Phone className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <div className="text-[15px] font-bold text-white tracking-tight leading-none">SKY SMS</div>
            </div>
          </span>
        </Link>
        {!onNav && <NotificationBell />}
      </div>

      <div className="h-px mx-4 mb-4 divider" />

      {/* Balance card */}
      {!isLoading && user && (
        <div className="mx-4 mb-4 rounded-2xl border border-amber-900/15 bg-amber-500/[0.03] p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Balance</span>
            <DollarSign className="h-3.5 w-3.5 text-amber-500/50" />
          </div>
          <div className="font-display text-[26px] font-bold text-white tracking-tight leading-none" data-testid="text-user-credits">
            ${user.credits.toFixed(2)}
          </div>
          <Link href="/payments">
            <span className="mt-2.5 flex items-center gap-1 text-[11px] text-amber-400 font-semibold hover:text-amber-300 transition-colors cursor-pointer" data-testid="link-buy-credits" onClick={onNav}>
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
      <div className="px-4 mb-4">
        <Link href="/rent">
          <span
            onClick={onNav}
            className="flex items-center justify-center gap-2 h-9 w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[13px] font-semibold text-slate-900 hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer shadow-[0_2px_12px_rgba(212,168,67,0.25)] active:scale-[0.98]"
          >
            <Zap className="h-3.5 w-3.5" />
            Rent a number
          </span>
        </Link>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5 min-h-0">
        <div className="mb-2 px-2 text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em]">Navigation</div>
        {navItems.map((item) => {
          const active = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href + "/"));
          return <NavItem key={item.href} {...item} active={active} onClick={onNav} />;
        })}

        {isAdmin && (
          <div className="mt-4 pt-4 border-t border-amber-900/10">
            <div className="mb-2 px-2 text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em]">Admin</div>
            {adminItems.map((item) => {
              const active = location === item.href || (item.href !== "/admin" && location.startsWith(item.href + "/"));
              return (
                <NavItem
                  key={item.href}
                  {...item}
                  active={active}
                  onClick={onNav}
                  badge={item.href === "/admin" ? (
                    <Badge className="ml-auto bg-amber-500/10 text-amber-400 border-amber-500/15 text-[9px] px-1.5 py-0 h-4 font-bold">
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
        <div className="px-4 py-3 border-t border-white/[0.04]">
          <div className="mb-2 px-1 text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em]">Community</div>
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
                className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border border-amber-400/15 bg-amber-400/6 text-[12px] font-semibold text-amber-400 hover:bg-amber-400/12 hover:text-amber-300 transition-all duration-150"
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
      <div className="p-3 border-t border-white/[0.04]">
        {isLoading ? (
          <div className="flex items-center gap-3 px-2 py-1">
            <Skeleton className="h-8 w-8 rounded-full bg-white/[0.04]" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-3 w-20 bg-white/[0.04]" />
              <Skeleton className="h-2.5 w-14 bg-white/[0.03]" />
            </div>
          </div>
        ) : user ? (
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/[0.03] transition-colors group">
            <Avatar className="h-8 w-8 border border-amber-500/15 shrink-0">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback className="text-[11px] font-bold bg-amber-500/10 text-amber-300">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-semibold text-white truncate" data-testid="text-username">{user.name}</div>
              <div className="text-[10.5px] text-slate-600 truncate">{user.email}</div>
            </div>
            <button
              onClick={logout}
              className="h-7 w-7 shrink-0 flex items-center justify-center rounded-lg text-slate-700 hover:text-rose-400 hover:bg-rose-400/8 transition-all duration-150"
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

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[250px] flex-col fixed inset-y-0 left-0 z-30 border-r border-amber-900/10 bg-[#060a16]">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${closing ? "overlay-fade-out" : "overlay-fade-in"}`}
            onClick={closeSidebar}
          />
          <aside className={`relative z-50 w-[265px] flex flex-col h-full bg-[#060a16] border-r border-amber-900/10 shadow-2xl ${closing ? "sidebar-slide-out" : "sidebar-slide-in"}`}>
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
      <div className="relative z-10 flex-1 flex flex-col md:pl-[250px]">

        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 h-14 border-b border-amber-900/10 bg-[#060a16]">
          <Link href="/dashboard">
            <span className="flex items-center gap-2 cursor-pointer">
              <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Phone className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <span className="text-[14px] font-bold text-white">SKY SMS</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-1.5 rounded-full border border-amber-900/15 bg-amber-500/[0.04] px-3 py-1">
                <span className="text-[12px] text-amber-500/70">$</span>
                <span className="text-[13px] font-semibold text-white">{user.credits.toFixed(2)}</span>
              </div>
            )}
            <NotificationBell />
            <button
              onClick={openSidebar}
              className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/[0.03] border border-white/[0.07] text-white hover:bg-white/[0.06] transition-all duration-150 active:scale-95"
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
