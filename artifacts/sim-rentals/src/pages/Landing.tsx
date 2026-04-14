import { Link } from "wouter";
import { Shield, Zap, Globe, Lock, ChevronRight, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Landing() {
  return (
    <div className="min-h-screen premium-shell overflow-hidden text-white">
      <header className="sticky top-5 z-50 mx-auto flex max-w-5xl justify-center px-4">
        <div className="glass-card flex h-16 w-full items-center justify-between rounded-full px-5">
          <div className="flex items-center gap-2 font-black">
            <Shield className="h-5 w-5 text-sky-300" />
            <span>SMS Rentals</span>
          </div>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-400 md:flex">
            <a className="rounded-full border border-sky-400/30 bg-sky-400/10 px-5 py-2 text-sky-100" href="#home">Home</a>
            <a className="hover:text-white" href="#services">Services</a>
            <a className="hover:text-white" href="#features">Features</a>
            <a className="hover:text-white" href="#faq">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <a href={`${basePath}/sign-in`} className="hidden text-sm font-bold text-slate-300 transition hover:text-white sm:inline" data-testid="link-landing-login">
              Login
            </a>
            <a href={`${basePath}/sign-up`}>
              <Button className="rounded-full bg-sky-400 text-slate-950 hover:bg-sky-300" data-testid="button-landing-signup">Get Started</Button>
            </a>
          </div>
        </div>
      </header>

      <main>
        <section id="home" className="relative mx-auto max-w-7xl px-4 pb-28 pt-32 text-center sm:px-6 lg:px-8">
          <div className="pointer-events-none absolute inset-0 -z-10 opacity-60 [background-image:radial-gradient(circle_at_center,rgba(56,189,248,.25)_1px,transparent_1px)] [background-size:90px_90px]" />
          <div className="mx-auto mb-7 flex w-fit items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-sky-200">
            <Sparkles className="h-4 w-4" />
            Real SMS verification marketplace
          </div>
          <h1 className="mx-auto mb-6 max-w-5xl text-6xl font-black tracking-tight text-white sm:text-7xl lg:text-8xl">
            Rent SMS numbers <span className="bg-gradient-to-r from-sky-200 via-white to-cyan-300 bg-clip-text text-transparent">instantly</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg font-medium leading-8 text-slate-400">
            Buy credits, rent clean temporary numbers, and receive verification codes in a premium dashboard built for fast account verification.
          </p>
          <div className="mx-auto mb-10 flex h-16 max-w-xl items-center rounded-2xl border border-sky-400/20 bg-slate-950/70 px-5 text-left shadow-2xl shadow-sky-950/30">
            <Search className="mr-4 h-5 w-5 text-slate-500" />
            <span className="text-slate-500">Search services like WhatsApp, Telegram, Google...</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href={`${basePath}/sign-up`}>
              <Button size="lg" className="group h-14 w-full rounded-full bg-sky-400 px-9 text-base font-black text-slate-950 shadow-[0_0_45px_rgba(56,189,248,0.35)] hover:bg-sky-300 sm:w-auto" data-testid="button-hero-cta">
                Rent a Number Now
                <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </a>
            <a href="#features" className="rounded-full border border-sky-400/30 px-8 py-4 text-sm font-black text-white transition hover:bg-sky-400/10">
              View Features
            </a>
          </div>
        </section>

        <div className="border-y border-sky-400/15 bg-black/40 py-7">
          <div className="marquee-track flex w-[200%] gap-10 whitespace-nowrap text-5xl font-black uppercase tracking-tight text-white/75 md:text-7xl">
            {Array.from({ length: 8 }).map((_, index) => (
              <span key={index}>SMS RENTALS</span>
            ))}
          </div>
        </div>

        <section id="features" className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <div className="mx-auto mb-6 w-fit rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-sky-200">Why choose us</div>
              <h2 className="mb-4 text-4xl font-black tracking-tight text-white md:text-5xl">Premium Features</h2>
              <p className="mx-auto max-w-2xl text-lg text-slate-400">Everything needed to rent numbers, receive codes, and manage credit purchases without fake history or clutter.</p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              <div className="glass-card rounded-3xl p-8" data-testid="card-feature-speed">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-black text-white">Instant Delivery</h3>
                <p className="leading-relaxed text-slate-400">Numbers are allocated instantly. Receive SMS codes as soon as the provider receives them.</p>
              </div>

              <div className="glass-card rounded-3xl p-8" data-testid="card-feature-global">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-black text-white">Global Coverage</h3>
                <p className="leading-relaxed text-slate-400">Browse countries and services with live availability before spending credits.</p>
              </div>

              <div className="glass-card rounded-3xl p-8" data-testid="card-feature-privacy">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-black text-white">Private Dashboard</h3>
                <p className="leading-relaxed text-slate-400">New accounts start clean. Only real rentals and payments appear in history.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 sm:px-6 md:flex-row lg:px-8">
          <div className="flex items-center gap-2 font-black">
            <Shield className="h-5 w-5 text-sky-300" />
            <span>SMS Rentals</span>
          </div>
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} SMS Rentals. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
