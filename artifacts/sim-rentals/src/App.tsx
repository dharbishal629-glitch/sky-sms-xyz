import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Terms from "@/pages/Terms";
import RefundPolicy from "@/pages/RefundPolicy";
import { AppRoutes } from "./Routes";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Phone } from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const queryClient = new QueryClient();

function LoadingSpinner() {
  return (
    <div className="min-h-screen premium-shell flex items-center justify-center">
      <div className="flex flex-col items-center gap-5">
        <div className="h-12 w-12 rounded-2xl bg-sky-500/15 border border-sky-500/25 flex items-center justify-center shadow-[0_0_24px_rgba(14,165,233,0.2)]">
          <Phone className="h-6 w-6 text-sky-400" />
        </div>
        <div className="h-0.5 w-32 rounded-full bg-white/[0.06] overflow-hidden">
          <div className="h-full bg-gradient-to-r from-sky-500 to-violet-500 rounded-full animate-[shimmer_1.2s_ease-in-out_infinite]" style={{ width: "60%", animation: "loading-bar 1.4s ease-in-out infinite" }} />
        </div>
      </div>
    </div>
  );
}

function HomeRedirect() {
  const { isLoading, isAuthenticated, login } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (isAuthenticated) return <Redirect to="/dashboard" />;
  return <Landing onLogin={login} />;
}

function AuthPage() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  if (isAuthenticated) {
    setLocation("/dashboard", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen premium-shell flex items-center justify-center px-5">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(14,165,233,0.1) 0%, transparent 70%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.08) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <div className="relative z-10 w-full max-w-md modal-content-enter">
        {/* Top line accent */}
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent rounded-t-3xl" />

        <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-white/[0.01] shadow-[0_0_0_1px_rgba(14,165,233,0.1),0_8px_60px_rgba(0,0,0,0.6),0_0_80px_rgba(14,165,233,0.06)] p-9 text-center backdrop-blur-xl">

          <a href={`${basePath}/`} className="mx-auto mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-5 py-2.5 hover:bg-white/[0.07] transition-colors">
            <div className="h-6 w-6 rounded-lg bg-sky-500/15 border border-sky-500/25 flex items-center justify-center">
              <Phone className="h-3 w-3 text-sky-400" />
            </div>
            <span className="text-[14px] font-bold text-white">SKY SMS</span>
          </a>

          <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.25em] text-sky-400">Welcome back</p>
          <h1 className="text-[2rem] font-black tracking-tight text-white leading-tight">Access your dashboard</h1>
          <p className="mt-4 text-[14px] leading-relaxed text-slate-400 max-w-xs mx-auto">
            Sign in to manage your balance, rent live SMS numbers, and track verification messages.
          </p>

          <div className="mt-8 space-y-3">
            <button
              className="group h-13 w-full rounded-xl bg-white px-6 text-[14px] font-bold text-slate-900 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all hover:bg-slate-50 hover:shadow-[0_6px_28px_rgba(0,0,0,0.4)] flex items-center justify-center gap-3 active:scale-[0.98]"
              onClick={login}
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <p className="text-[11px] text-slate-600 text-center leading-relaxed">
              By continuing, you agree to our{" "}
              <a href={`${basePath}/terms`} className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors">Terms</a>{" "}
              and{" "}
              <a href={`${basePath}/refund-policy`} className="text-sky-400 hover:text-sky-300 underline underline-offset-2 transition-colors">Refund Policy</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppWithRoutes() {
  return (
    <Switch>
      <Route path="/" component={HomeRedirect} />
      <Route path="/sign-in/*?" component={AuthPage} />
      <Route path="/sign-up/*?" component={AuthPage} />
      <Route path="/terms" component={Terms} />
      <Route path="/refund-policy" component={RefundPolicy} />

      <Route path="/dashboard" component={AppRoutes} />
      <Route path="/rent" component={AppRoutes} />
      <Route path="/rentals" component={AppRoutes} />
      <Route path="/payments" component={AppRoutes} />
      <Route path="/settings" component={AppRoutes} />
      <Route path="/support" component={AppRoutes} />
      <Route path="/api-docs" component={AppRoutes} />
      <Route path="/admin" component={AppRoutes} />
      <Route path="/admin/users" component={AppRoutes} />
      <Route path="/admin/services" component={AppRoutes} />
      <Route path="/admin/transactions" component={AppRoutes} />
      <Route path="/admin/support" component={AppRoutes} />
      <Route path="/admin/coupons" component={AppRoutes} />

      <Route component={NotFound} />
    </Switch>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "auto" }); }, [location]);
  return null;
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={basePath}>
        <QueryClientProvider client={queryClient}>
          <ScrollToTop />
          <AppWithRoutes />
        </QueryClientProvider>
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
