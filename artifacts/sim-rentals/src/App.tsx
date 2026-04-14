import { useEffect, useRef, useState } from "react";
import { AuthenticateWithRedirectCallback, ClerkProvider, Show, useClerk, useSignIn, useSignUp, useUser } from "@clerk/react";
import { Switch, Route, useLocation, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import { AppRoutes } from "./Routes";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env file");
}

function AuthPage({ mode }: { mode: "sign-in" | "sign-up" }) {
  const isSignIn = mode === "sign-in";
  const { isSignedIn } = useUser();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { signUp, isLoaded: signUpLoaded } = useSignUp();
  const [, setLocation] = useLocation();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      setLocation("/dashboard", { replace: true });
    }
  }, [isSignedIn, setLocation]);

  const handleGoogle = async () => {
    if (isSignedIn) {
      setLocation("/dashboard", { replace: true });
      return;
    }

    setAuthError(null);
    const redirectUrl = new URL(`${basePath}/sso-callback`, window.location.origin).toString();
    const redirectUrlComplete = new URL(`${basePath}/dashboard`, window.location.origin).toString();

    try {
      if (isSignIn) {
        if (!signInLoaded || !signIn) return;
        await signIn.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl,
          redirectUrlComplete,
        });
      } else {
        if (!signUpLoaded || !signUp) return;
        await signUp.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl,
          redirectUrlComplete,
        });
      }
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Google sign-in could not be started.");
    }
  };

  return (
    <div className="min-h-screen premium-shell flex items-center justify-center px-4">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />
      <div className="glass-card blue-glow w-full max-w-md rounded-3xl p-8 text-center">
        <a href={`${basePath}/`} className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold">
          <span className="text-sky-300">✦</span>
          SMS Rentals
        </a>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-sky-300">{isSignIn ? "Welcome back" : "Create account"}</p>
        <h1 className="text-4xl font-black tracking-tight text-white">{isSignIn ? "Access your dashboard" : "Start renting numbers"}</h1>
        <p className="mt-4 text-sm leading-6 text-slate-400">
          Continue with Google to manage credits, rent live SMS numbers, and track verification messages from one secure account.
        </p>
        <div className="mt-8">
          <button
            className="h-12 w-full rounded-full bg-sky-400 px-6 text-sm font-bold text-slate-950 shadow-[0_0_35px_rgba(56,189,248,0.35)] transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleGoogle}
            disabled={isSignIn ? !signInLoaded : !signUpLoaded}
          >
            Continue with Google
          </button>
          {authError && (
            <p className="mt-4 rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
              {authError}
            </p>
          )}
        </div>
        <div className="mt-6 text-sm text-slate-400">
          {isSignIn ? "Need an account?" : "Already have an account?"}{" "}
          <a className="font-semibold text-sky-300 hover:text-sky-200" href={`${basePath}/${isSignIn ? "sign-up" : "sign-in"}`}>
            {isSignIn ? "Sign up" : "Log in"}
          </a>
        </div>
      </div>
    </div>
  );
}

function SsoCallbackPage() {
  return (
    <div className="min-h-screen premium-shell flex items-center justify-center px-4 text-center">
      <div className="glass-card blue-glow rounded-3xl p-8">
        <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-2 border-sky-300 border-t-transparent" />
        <h1 className="text-2xl font-black text-white">Finishing sign in</h1>
        <p className="mt-2 text-sm text-slate-400">Please wait while Google redirects you back.</p>
        <AuthenticateWithRedirectCallback />
      </div>
    </div>
  );
}

function SignInPage() {
  return <AuthPage mode="sign-in" />;
}

function SignUpPage() {
  return <AuthPage mode="sign-up" />;
}

function HomeRedirect() {
  return (
    <>
      <Show when="signed-in">
        <Redirect to="/dashboard" />
      </Show>
      <Show when="signed-out">
        <Landing />
      </Show>
    </>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

const queryClient = new QueryClient();

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <Switch>
          <Route path="/" component={HomeRedirect} />
          <Route path="/sign-in/*?" component={SignInPage} />
          <Route path="/sign-up/*?" component={SignUpPage} />
          <Route path="/sso-callback/*?" component={SsoCallbackPage} />
          
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
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <TooltipProvider>
      <WouterRouter base={basePath}>
        <ClerkProviderWithRoutes />
      </WouterRouter>
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
