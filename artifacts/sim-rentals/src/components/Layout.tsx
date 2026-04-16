import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetMe } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Phone,
  History,
  CreditCard,
  Settings,
  Shield,
  Users,
  Activity,
  SlidersHorizontal,
  LogOut,
  Menu,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: user, isLoading } = useGetMe();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === "admin";

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

  const NavLinks = () => (
    <div className="flex flex-col gap-0.5 w-full">
      {navItems.map((item) => {
        const active = location === item.href || location.startsWith(item.href + "/");
        return (
          <Link key={item.href} href={item.href}>
            <span
              data-testid={`link-nav-${item.label.toLowerCase().replace(" ", "-")}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                active
                  ? "bg-cyan-400/12 text-cyan-200 border border-cyan-300/20 shadow-[0_0_12px_rgba(0,220,255,0.08)]"
                  : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon className={`h-4 w-4 ${active ? "text-cyan-400" : ""}`} />
              {item.label}
            </span>
          </Link>
        );
      })}

      {isAdmin && (
        <>
          <div className="mt-5 mb-2 px-3 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
            Admin
          </div>
          {adminItems.map((item) => {
            const active = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <span
                  data-testid={`link-nav-admin-${item.label.toLowerCase().replace(" ", "-")}`}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                    active
                      ? "bg-cyan-400/12 text-cyan-200 border border-cyan-300/20 shadow-[0_0_12px_rgba(0,220,255,0.08)]"
                      : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className={`h-4 w-4 ${active ? "text-cyan-400" : ""}`} />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen premium-shell flex">
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 border-r border-white/[0.06] bg-black/80 backdrop-blur-2xl z-10">
        <div className="p-5 border-b border-white/[0.06]">
          <Link href="/dashboard">
            <span className="flex items-center gap-2 text-lg font-black cursor-pointer tracking-tight">
              <span className="gradient-text">✦ SKY SMS</span>
            </span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <NavLinks />
        </div>

        <div className="p-4 border-t border-white/[0.06]">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ) : user ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <Avatar className="h-9 w-9 border border-cyan-400/15">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="text-xs bg-cyan-400/10 text-cyan-300">{user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col truncate">
                  <span className="text-sm font-bold text-white truncate" data-testid="text-username">{user.name}</span>
                  <span className="text-xs text-slate-500 truncate flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    <span data-testid="text-user-credits">${user.credits.toFixed(2)}</span>
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="h-8 w-8 text-slate-600 hover:text-red-400 hover:bg-red-400/10 shrink-0"
                data-testid="button-signout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </aside>

      <div className="flex-1 flex flex-col md:pl-64 min-h-screen">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-white/[0.06] bg-black/85 backdrop-blur-2xl sticky top-0 z-20">
          <Link href="/dashboard">
            <span className="text-lg font-black cursor-pointer tracking-tight gradient-text">✦ SKY SMS</span>
          </Link>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 flex flex-col bg-black border-white/[0.06]">
              <div className="p-5 border-b border-white/[0.06]">
                <span className="text-lg font-black tracking-tight gradient-text">✦ SKY SMS</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <NavLinks />
              </div>
              <div className="p-4 border-t border-white/[0.06]">
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ) : user ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback>{user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col truncate">
                        <span className="text-sm font-semibold text-white truncate">{user.name}</span>
                        <span className="text-xs text-muted-foreground truncate">${user.credits.toFixed(2)}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={logout}
                      className="text-slate-400 hover:text-red-300 shrink-0"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null}
              </div>
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
