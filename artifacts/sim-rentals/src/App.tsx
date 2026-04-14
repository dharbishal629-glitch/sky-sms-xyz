import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import { AppRoutes } from "./Routes";
import { useAuth } from "@/hooks/useAuth";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const queryClient = new QueryClient();

function HomeRedirect() {
  const { isLoading, isAuthenticated, login } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen premium-shell flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-300 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  return <Landing onLogin={login} />;
}

function AuthPage() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen premium-shell flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-300 border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) {
    setLocation("/dashboard", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen premium-shell flex items-center justify-center px-4">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />
      <div className="glass-card blue-glow w-full max-w-md rounded-3xl p-8 text-center">
        <a href={`${basePath}/`} className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold">
          <span className="text-sky-300">✦</span>
          SMS Rentals
        </a>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-sky-300">Welcome back</p>
        <h1 className="text-4xl font-black tracking-tight text-white">Access your dashboard</h1>
        <p className="mt-4 text-sm leading-6 text-slate-400">
          Sign in to manage credits, rent live SMS numbers, and track verification messages from one secure account.
        </p>
        <div className="mt-8">
          <button
            className="h-12 w-full rounded-full bg-sky-400 px-6 text-sm font-bold text-slate-950 shadow-[0_0_35px_rgba(56,189,248,0.35)] transition hover:bg-sky-300"
            onClick={login}
          >
            Sign In
          </button>
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

      <Route path="/dashboard" component={AppRoutes} />
      <Route path="/rent" component={AppRoutes} />
      <Route path="/rentals" component={AppRoutes} />
      <Route path="/payments" component={AppRoutes} />
      <Route path="/settings" component={AppRoutes} />
      <Route path="/admin" component={AppRoutes} />
      <Route path="/admin/users" component={AppRoutes} />
      <Route path="/admin/transactions" component={AppRoutes} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={basePath}>
        <QueryClientProvider client={queryClient}>
          <AppWithRoutes />
        </QueryClientProvider>
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
