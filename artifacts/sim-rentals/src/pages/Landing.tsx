import { Shield, Zap, Globe, Lock, ChevronRight, Search, Sparkles, MessageSquare, RefreshCw, CreditCard, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const services = [
  { name: "Telegram", icon: "✈️", desc: "Instant account verification" },
  { name: "WhatsApp", icon: "💬", desc: "Business & personal accounts" },
  { name: "Google", icon: "🔍", desc: "Gmail & workspace accounts" },
  { name: "Instagram", icon: "📸", desc: "Creator & business profiles" },
  { name: "Facebook", icon: "👤", desc: "Personal & page verification" },
  { name: "X / Twitter", icon: "🐦", desc: "Account registration & recovery" },
  { name: "Discord", icon: "🎮", desc: "Community account setup" },
  { name: "Amazon", icon: "📦", desc: "Seller & buyer verification" },
];

const faqs = [
  {
    q: "How does SMS number rental work?",
    a: "Buy credits, select a country and service, and get a temporary phone number instantly. Any incoming SMS is displayed in your dashboard in real time. Numbers stay active for 20 minutes.",
  },
  {
    q: "Which countries are supported?",
    a: "We support numbers from the US, UK, Germany, France, Netherlands, Canada, Brazil, India, and many more. New countries are added regularly based on provider availability.",
  },
  {
    q: "What payment methods are accepted?",
    a: "We accept cryptocurrency payments via OxaPay, which supports BTC, ETH, USDT, and many other coins. This keeps your purchase private and borderless.",
  },
  {
    q: "What if I don't receive an SMS?",
    a: "You can cancel an active rental before the 20-minute window expires and receive a full refund of the credits spent. Credits are returned instantly.",
  },
  {
    q: "Are the numbers reused?",
    a: "Numbers are recycled between users but each rental session starts clean — you only see messages received during your active window. No shared history.",
  },
];

export default function Landing({ onLogin }: { onLogin?: () => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

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
            <button onClick={onLogin} className="hidden text-sm font-bold text-slate-300 transition hover:text-white sm:inline" data-testid="link-landing-login">
              Login
            </button>
            <Button onClick={onLogin} className="rounded-full bg-sky-400 text-slate-950 hover:bg-sky-300" data-testid="button-landing-signup">Get Started</Button>
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
            <Button onClick={onLogin} size="lg" className="group h-14 w-full rounded-full bg-sky-400 px-9 text-base font-black text-slate-950 shadow-[0_0_45px_rgba(56,189,248,0.35)] hover:bg-sky-300 sm:w-auto" data-testid="button-hero-cta">
              Rent a Number Now
              <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <a href="#features" className="rounded-full border border-sky-400/30 px-8 py-4 text-sm font-black text-white transition hover:bg-sky-400/10">
              View Features
            </a>
          </div>
        </section>

        <div className="border-y border-sky-400/15 bg-black/40 py-7 overflow-hidden">
          <div className="marquee-track flex w-[200%] gap-10 whitespace-nowrap text-5xl font-black uppercase tracking-tight text-white/75 md:text-7xl">
            {Array.from({ length: 8 }).map((_, index) => (
              <span key={index}>SMS RENTALS &nbsp;✦&nbsp; </span>
            ))}
          </div>
        </div>

        <section id="services" className="py-24 bg-black/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <div className="mx-auto mb-6 w-fit rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-sky-200">Supported Services</div>
              <h2 className="mb-4 text-4xl font-black tracking-tight text-white md:text-5xl">Every major platform</h2>
              <p className="mx-auto max-w-2xl text-lg text-slate-400">Rent numbers for all the services you need — new providers added weekly.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((service) => (
                <div key={service.name} className="glass-card rounded-2xl p-6 flex items-center gap-4 hover:border-sky-400/30 transition-all duration-200 cursor-default">
                  <div className="text-3xl shrink-0">{service.icon}</div>
                  <div>
                    <div className="font-bold text-white">{service.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{service.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Button onClick={onLogin} size="lg" className="rounded-full bg-sky-400/10 border border-sky-400/30 text-sky-200 hover:bg-sky-400/20 px-8">
                View all supported services →
              </Button>
            </div>
          </div>
        </section>

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
                <p className="leading-relaxed text-slate-400">Numbers are allocated instantly. Receive SMS codes as soon as the provider receives them — no waiting in queues.</p>
              </div>

              <div className="glass-card rounded-3xl p-8" data-testid="card-feature-global">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-black text-white">Global Coverage</h3>
                <p className="leading-relaxed text-slate-400">Browse countries and services with live availability before spending credits. Always see real stock before you pay.</p>
              </div>

              <div className="glass-card rounded-3xl p-8" data-testid="card-feature-privacy">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-black text-white">Private Dashboard</h3>
                <p className="leading-relaxed text-slate-400">New accounts start clean. Only real rentals and payments appear in history — never mock data or filler.</p>
              </div>

              <div className="glass-card rounded-3xl p-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-black text-white">Live SMS Inbox</h3>
                <p className="leading-relaxed text-slate-400">All incoming verification messages appear instantly in your rental card. One-click copy for codes.</p>
              </div>

              <div className="glass-card rounded-3xl p-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300">
                  <RefreshCw className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-black text-white">Cancel & Refund</h3>
                <p className="leading-relaxed text-slate-400">Cancel any active rental within the 20-minute window and get your credits back immediately — no questions asked.</p>
              </div>

              <div className="glass-card rounded-3xl p-8">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300">
                  <CreditCard className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-black text-white">Crypto Payments</h3>
                <p className="leading-relaxed text-slate-400">Pay with BTC, ETH, USDT and more via OxaPay. Fast, borderless, and completely private credit top-ups.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="py-24 bg-black/20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <div className="mx-auto mb-6 w-fit rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-sky-200">Got questions?</div>
              <h2 className="mb-4 text-4xl font-black tracking-tight text-white md:text-5xl">FAQ</h2>
              <p className="text-lg text-slate-400">Everything you need to know about renting numbers.</p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="glass-card rounded-2xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between gap-4 p-6 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-bold text-white">{faq.q}</span>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-sky-300 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-6 text-slate-400 leading-relaxed border-t border-white/10 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <div className="glass-card blue-glow rounded-3xl p-12">
              <h2 className="text-4xl font-black tracking-tight text-white mb-4">Ready to get started?</h2>
              <p className="text-slate-400 mb-8">Join thousands of users renting SMS numbers for fast, private account verification.</p>
              <Button onClick={onLogin} size="lg" className="group h-14 rounded-full bg-sky-400 px-10 text-base font-black text-slate-950 shadow-[0_0_45px_rgba(56,189,248,0.35)] hover:bg-sky-300">
                Create Free Account
                <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
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
          <nav className="flex gap-6 text-sm text-slate-500">
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} SMS Rentals. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
