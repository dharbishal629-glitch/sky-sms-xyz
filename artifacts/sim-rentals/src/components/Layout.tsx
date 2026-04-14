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
  LogOut,
  Menu
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
    { href: "/admin/transactions", label: "Transactions", icon: Activity },
  ];

  const NavLinks = () => (
    <div className="flex flex-col gap-1 w-full">
      {navItems.map((item) => {
        const active = location === item.href || location.startsWith(item.href + "/");
        return (
          <Link key={item.href} href={item.href}>
            <span
              data-testid={`link-nav-${item.label.toLowerCase().replace(" ", "-")}`}
              className={`flex items-center gap-3 px-3 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                active
                  ? "bg-sky-400/15 text-sky-200 border border-sky-300/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </span>
          </Link>
        );
      })}

      {isAdmin && (
        <>
          <div className="mt-4 mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Admin
          </div>
          {adminItems.map((item) => {
            const active = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <span
                  data-testid={`link-nav-admin-${item.label.toLowerCase().replace(" ", "-")}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                    active
                      ? "bg-sky-400/15 text-sky-200 border border-sky-300/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
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
      <aside className="hidden md:flex w-72 flex-col fixed inset-y-0 border-r border-white/10 bg-slate-950/70 backdrop-blur-xl z-10">
        <div className="p-6 border-b border-white/10">
          <Link href="/dashboard">
            <span className="text-xl font-black text-white cursor-pointer tracking-tight"><span className="text-sky-300">✦</span> SMS Rentals</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <NavLinks />
        </div>

        <div className="p-4 border-t border-white/10">
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
                <Avatar className="h-10 w-10 border border-sky-300/20">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>{user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col truncate">
                  <span className="text-sm font-semibold text-white truncate" data-testid="text-username">{user.name}</span>
                  <span className="text-xs text-muted-foreground truncate flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    <span data-testid="text-user-credits">{user.credits} cr</span>
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="text-slate-400 hover:text-red-300 shrink-0"
                data-testid="button-signout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </aside>

      <div className="flex-1 flex flex-col md:pl-72 min-h-screen">
        <header className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-slate-950/85 backdrop-blur-xl sticky top-0 z-20">
          <Link href="/dashboard">
            <span className="text-xl font-black text-white cursor-pointer tracking-tight"><span className="text-sky-300">✦</span> SMS Rentals</span>
          </Link>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 flex flex-col bg-slate-950 border-white/10">
              <div className="p-6 border-b border-white/10">
                <span className="text-xl font-black text-white tracking-tight"><span className="text-sky-300">✦</span> SMS Rentals</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <NavLinks />
              </div>
              <div className="p-4 border-t border-white/10 bg-white/[0.03]">
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
                        <span className="text-xs text-muted-foreground truncate">{user.credits} cr</span>
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
