import { Shield, Zap, Globe, Lock, ChevronRight, Sparkles, MessageSquare, RefreshCw, Clock, Phone, ChevronDown, ArrowRight, Code2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import { useState, useEffect } from "react";

const serviceIcons: Record<string, string> = {
  Telegram:     "https://www.google.com/s2/favicons?domain=telegram.org&sz=64",
  WhatsApp:     "https://www.google.com/s2/favicons?domain=whatsapp.com&sz=64",
  Google:       "https://www.google.com/s2/favicons?domain=google.com&sz=64",
  Instagram:    "https://www.google.com/s2/favicons?domain=instagram.com&sz=64",
  Facebook:     "https://www.google.com/s2/favicons?domain=facebook.com&sz=64",
  "X / Twitter":"https://www.google.com/s2/favicons?domain=x.com&sz=64",
  Discord:      "https://www.google.com/s2/favicons?domain=discord.com&sz=64",
  Amazon:       "https://www.google.com/s2/favicons?domain=amazon.com&sz=64",
};

const services = [
  { name: "Telegram",     desc: "Instant account verification" },
  { name: "WhatsApp",     desc: "Business & personal accounts" },
  { name: "Google",       desc: "Gmail & workspace accounts" },
  { name: "Instagram",    desc: "Creator & business profiles" },
  { name: "Facebook",     desc: "Personal & page verification" },
  { name: "X / Twitter",  desc: "Account registration & recovery" },
  { name: "Discord",      desc: "Community account setup" },
  { name: "Amazon",       desc: "Seller & buyer verification" },
];

const features = [
  { icon: Zap,           title: "Instant Delivery",   desc: "Numbers allocated in seconds. SMS codes appear the moment they arrive — no queues, no delays." },
  { icon: Globe,         title: "Global Coverage",     desc: "8+ countries with live availability counts. See real stock before you spend a single cent." },
  { icon: Lock,          title: "Crypto Payments",     desc: "Top up with BTC, ETH, USDT, and 30+ coins via OxaPay. Private, borderless, zero chargebacks." },
  { icon: MessageSquare, title: "Live SMS Inbox",      desc: "Verification codes appear instantly on your rental card. One tap to copy." },
  { icon: RefreshCw,     title: "Auto Refunds",        desc: "Cancel before the 20-minute window ends and get your balance back immediately." },
  { icon: Code2,         title: "Developer API",       desc: "Full REST API with API key authentication. Automate number rentals, poll messages, and more." },
];

const faqs = [
  { q: "How does SMS number rental work?",    a: "Add funds, pick a country and service, and get a temporary phone number instantly. Incoming SMS codes appear on your dashboard in real time. Numbers stay active for 20 minutes." },
  { q: "Which countries are supported?",      a: "We support numbers from the US, UK, Germany, France, Netherlands, Canada, Brazil, India, and more — with live availability shown before you purchase." },
  { q: "What payment methods are accepted?",  a: "We accept crypto payments via OxaPay — BTC, ETH, USDT (TRC20 & ERC20), LTC, TRX, DOGE, and 30+ other coins. Purchases are private and borderless." },
  { q: "What if I don't receive an SMS?",     a: "Cancel an active rental before the 20-minute window closes for an instant full refund. If the window expires with no SMS, your balance is also refunded automatically." },
  { q: "Are the numbers reused?",             a: "Numbers are recycled between sessions, but each rental starts completely fresh — you only see messages that arrive during your active window. No shared history." },
  { q: "Do you have a developer API?",        a: "Yes. SKY SMS provides a full REST API with API key authentication. You can list services, create rentals, poll for SMS messages, and cancel rentals programmatically. See the API Docs section after signing in." },
];

const stats = [
  { value: "8+",     label: "Countries" },
  { value: "50+",    label: "Services" },
  { value: "20 min", label: "Window" },
  { value: "100%",   label: "Refund rate" },
];

const pricingPlans = [
  {
    name: "Pay as you go",
    desc: "No subscription, no minimums.",
    price: "$0.10",
    unit: "per SMS",
    features: ["Live number allocation", "20-min activation window", "Auto refund if no SMS", "Crypto payments only"],
    cta: "Start renting",
    highlight: false,
  },
  {
    name: "API Access",
    desc: "Automate your workflow.",
    price: "Free",
    unit: "with any account",
    features: ["Full REST API", "API key management", "Webhook-ready polling", "All endpoints included"],
    cta: "Get API key",
    highlight: true,
  },
];

export default function Landing({ onLogin }: { onLogin?: () => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setShowStickyBar(y > 500);
      setScrolled(y > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen premium-shell text-white" style={{ overflowX: "hidden" }}>

      {/* Layered ambient background */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="absolute top-[-20%] left-[-15%] w-[750px] h-[750px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(14,165,233,0.1) 0%, rgba(99,102,241,0.06) 40%, transparent 70%)", filter: "blur(100px)" }} />
        <div className="absolute bottom-[-15%] right-[-12%] w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.09) 0%, rgba(14,165,233,0.04) 40%, transparent 70%)", filter: "blur(90px)" }} />
        <div className="absolute top-[40%] left-[35%] w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(99,102,241,0.05) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      {/* ── Nav ── */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-white/[0.07] bg-[#050914]/90 backdrop-blur-2xl shadow-[0_1px_0_rgba(255,255,255,0.04)]" : "bg-transparent"}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-sky-500/20 to-sky-600/10 border border-sky-500/25 flex items-center justify-center shadow-[0_0_16px_rgba(14,165,233,0.15)]">
              <Phone className="h-4 w-4 text-sky-400" />
            </div>
            <span className="font-bold text-white tracking-tight text-[16px]">SKY SMS</span>
          </div>

          <nav className="hidden items-center gap-8 text-[13px] font-medium text-slate-400 md:flex">
            <a className="hover:text-white transition-colors duration-150" href="#services">Services</a>
            <a className="hover:text-white transition-colors duration-150" href="#features">Features</a>
            <a className="hover:text-white transition-colors duration-150" href="#pricing">Pricing</a>
            <a className="hover:text-white transition-colors duration-150" href="#faq">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogin}
              className="hidden text-[13px] font-medium text-slate-400 hover:text-white transition-colors sm:inline"
              data-testid="link-landing-login"
            >
              Sign in
            </button>
            <button
              onClick={onLogin}
              className="btn-reflect h-9 px-5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-[13px] font-semibold text-white shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_28px_rgba(14,165,233,0.45)] hover:from-sky-400 hover:to-sky-500 transition-all duration-200 active:scale-95"
              data-testid="button-landing-signup"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10">

        {/* ── Hero ── */}
        <section id="home" className="relative mx-auto max-w-5xl px-6 pb-28 pt-20 text-center">

          <Reveal variant="up" delay={0}>
            <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-sky-500/25 bg-sky-500/[0.08] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.1)]">
              <Sparkles className="h-3 w-3" />
              Real SMS verification numbers
            </div>
          </Reveal>

          <Reveal variant="up" delay={80}>
            <h1 className="mx-auto mb-6 max-w-4xl text-[clamp(2.8rem,7.5vw,6rem)] font-black leading-[1.06] tracking-[-0.04em] text-white">
              Rent SMS numbers{" "}
              <span className="gradient-text">instantly</span>
            </h1>
          </Reveal>

          <Reveal variant="up" delay={160}>
            <p className="mx-auto mb-11 max-w-[520px] text-[16px] font-normal leading-relaxed text-slate-400">
              Add funds, rent a real phone number, and receive verification codes in seconds — from a clean, professional dashboard built for speed.
            </p>
          </Reveal>

          <Reveal variant="up" delay={230}>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={onLogin}
                className="btn-reflect group h-12 w-full sm:w-auto px-9 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-[15px] font-semibold text-white shadow-[0_0_50px_rgba(14,165,233,0.35)] hover:shadow-[0_0_70px_rgba(14,165,233,0.5)] hover:from-sky-400 hover:to-sky-500 transition-all duration-250 flex items-center justify-center gap-2 active:scale-95"
                data-testid="button-hero-cta"
              >
                Rent a number now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <a
                href="#features"
                className="h-12 inline-flex items-center justify-center rounded-xl border border-white/10 px-9 text-[15px] font-medium text-white/70 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all duration-200"
              >
                Learn more
              </a>
            </div>
          </Reveal>

          {/* Stats row */}
          <Reveal variant="up" delay={300}>
            <div className="mx-auto mt-18 max-w-xl">
              <div className="grid grid-cols-2 sm:grid-cols-4 rounded-2xl border border-white/[0.07] overflow-hidden bg-white/[0.02] shadow-[0_0_40px_rgba(0,0,0,0.4)]"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.015) 100%)" }}>
                {stats.map((stat, i) => (
                  <div key={stat.label} className={`px-4 py-5 text-center ${i < stats.length - 1 ? "border-r border-white/[0.05]" : ""}`}>
                    <div className="text-2xl font-black text-white tracking-tight">{stat.value}</div>
                    <div className="mt-1 text-[11px] font-medium text-slate-500 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Floating code snippet preview */}
          <Reveal variant="up" delay={380}>
            <div className="mx-auto mt-14 max-w-lg">
              <div className="rounded-2xl border border-white/[0.07] bg-[#0a0f1e] shadow-[0_8px_40px_rgba(0,0,0,0.6)] overflow-hidden text-left">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                  <span className="ml-2 text-[11px] text-slate-600 font-mono">POST /api/rentals</span>
                </div>
                <div className="p-4 font-mono text-[12px] leading-relaxed">
                  <div className="text-slate-500">{"// Rent a number with one API call"}</div>
                  <div className="mt-2 text-slate-300">
                    <span className="text-sky-400">fetch</span>
                    <span className="text-white">{"('/api/rentals', {"}</span>
                  </div>
                  <div className="text-white pl-4">{"method: "}
                    <span className="text-emerald-400">{'\"POST\"'}</span>,
                  </div>
                  <div className="text-white pl-4">{"body: JSON.stringify({ serviceCode: "}
                    <span className="text-emerald-400">{'\"telegram\"'}</span>
                    {", countryCode: "}
                    <span className="text-emerald-400">{'\"us\"'}</span>
                    {" })"}
                  </div>
                  <div className="text-white">{"});"}</div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── Services marquee ── */}
        <section id="services" className="py-20 overflow-hidden">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal variant="up">
              <div className="mb-12 text-center">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-400">Platform coverage</p>
                <h2 className="text-[clamp(1.9rem,4.5vw,3.2rem)] font-black tracking-tight text-white">Works with every major service</h2>
                <p className="mt-3 text-[15px] text-slate-400 max-w-md mx-auto">Get verification codes from 50+ platforms with real-time availability.</p>
              </div>
            </Reveal>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((svc, i) => (
                <Reveal key={svc.name} variant="up" delay={i * 45}>
                  <button
                    onClick={onLogin}
                    className="w-full group relative flex cursor-pointer items-center gap-4 rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-5 text-left transition-all duration-250 hover:-translate-y-1 hover:border-sky-500/20 hover:shadow-[0_8px_30px_rgba(14,165,233,0.1)] active:scale-[0.98]"
                  >
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center overflow-hidden group-hover:bg-white/[0.09] group-hover:border-sky-500/20 transition-all duration-200">
                      <img
                        src={serviceIcons[svc.name]}
                        alt={svc.name}
                        className="h-7 w-7 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold text-white">{svc.name}</div>
                      <div className="text-[12px] text-slate-500 mt-0.5 truncate">{svc.desc}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-sky-400 transition-colors shrink-0" />
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal variant="up">
              <div className="mb-14 text-center">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-400">Features</p>
                <h2 className="text-[clamp(1.9rem,4.5vw,3.2rem)] font-black tracking-tight text-white">Everything you need</h2>
                <p className="mt-3 text-[15px] text-slate-400">Built for speed, privacy, and developer automation.</p>
              </div>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feat, i) => (
                <Reveal key={feat.title} variant="up" delay={i * 60}>
                  <div className="group relative rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 hover:-translate-y-1 hover:border-sky-500/15 hover:shadow-[0_8px_30px_rgba(14,165,233,0.08)] transition-all duration-250 h-full">
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/15 text-sky-400 group-hover:bg-sky-500/15 transition-colors">
                      <feat.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 text-[15px] font-bold text-white">{feat.title}</h3>
                    <p className="text-[13px] leading-relaxed text-slate-500">{feat.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="py-20">
          <div className="mx-auto max-w-4xl px-6">
            <Reveal variant="up">
              <div className="mb-14 text-center">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-400">Pricing</p>
                <h2 className="text-[clamp(1.9rem,4.5vw,3.2rem)] font-black tracking-tight text-white">Simple, transparent pricing</h2>
                <p className="mt-3 text-[15px] text-slate-400">No subscriptions. No lock-in. Pay only for what you use.</p>
              </div>
            </Reveal>

            <div className="grid gap-5 md:grid-cols-2">
              {pricingPlans.map((plan, i) => (
                <Reveal key={plan.name} variant="up" delay={i * 80}>
                  <div className={`relative rounded-2xl p-7 h-full transition-all duration-250 ${
                    plan.highlight
                      ? "border border-sky-500/30 bg-gradient-to-br from-sky-500/10 to-violet-500/5 shadow-[0_0_0_1px_rgba(14,165,233,0.2),0_8px_40px_rgba(14,165,233,0.12)]"
                      : "border border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-white/[0.01]"
                  }`}>
                    {plan.highlight && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-1 text-[11px] font-bold text-white shadow-[0_0_16px_rgba(14,165,233,0.4)]">
                          <Sparkles className="h-3 w-3" /> Included free
                        </span>
                      </div>
                    )}
                    <div className="mb-4">
                      <div className="text-[14px] font-bold text-white mb-0.5">{plan.name}</div>
                      <div className="text-[12px] text-slate-500">{plan.desc}</div>
                    </div>
                    <div className="mb-6">
                      <span className="text-4xl font-black text-white">{plan.price}</span>
                      <span className="text-slate-500 text-[13px] ml-2">{plan.unit}</span>
                    </div>
                    <ul className="space-y-2.5 mb-7">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2.5 text-[13px] text-slate-300">
                          <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={onLogin}
                      className={`w-full h-11 rounded-xl text-[14px] font-semibold transition-all duration-200 active:scale-95 ${
                        plan.highlight
                          ? "btn-reflect bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-[0_0_24px_rgba(14,165,233,0.3)] hover:shadow-[0_0_36px_rgba(14,165,233,0.45)] hover:from-sky-400 hover:to-sky-500"
                          : "border border-white/[0.1] text-white hover:bg-white/[0.05] hover:border-white/20"
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-20">
          <div className="mx-auto max-w-2xl px-6">
            <Reveal variant="up">
              <div className="mb-14 text-center">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-400">FAQ</p>
                <h2 className="text-[clamp(1.9rem,4.5vw,3.2rem)] font-black tracking-tight text-white">Common questions</h2>
              </div>
            </Reveal>

            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <Reveal key={i} variant="up" delay={i * 45}>
                  <div className={`rounded-2xl overflow-hidden border transition-all duration-250 ${
                    openFaq === i
                      ? "border-sky-500/20 bg-gradient-to-br from-sky-500/[0.06] to-transparent shadow-[0_0_20px_rgba(14,165,233,0.06)]"
                      : "border-white/[0.07] bg-gradient-to-br from-white/[0.03] to-transparent hover:border-white/[0.1]"
                  }`}>
                    <button
                      className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span className="text-[14px] font-semibold text-white">{faq.q}</span>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-sky-400 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${openFaq === i ? "rotate-180" : ""}`} />
                    </button>
                    <div className={`faq-body ${openFaq === i ? "faq-body-open" : ""}`}>
                      <div className="faq-inner px-6 pb-5 text-[13.5px] text-slate-400 leading-relaxed border-t border-white/[0.05] pt-4">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 px-6">
          <Reveal variant="scale">
            <div className="mx-auto max-w-2xl relative rounded-3xl overflow-hidden">
              {/* Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-sky-600/20 via-indigo-600/10 to-violet-600/15" />
              <div className="absolute inset-0 border border-sky-500/20 rounded-3xl" />
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-sky-500/15 blur-3xl" />

              <div className="relative z-10 p-10 text-center">
                <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/15 border border-sky-500/25 shadow-[0_0_24px_rgba(14,165,233,0.2)]">
                  <Phone className="h-7 w-7 text-sky-400" />
                </div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-400">Get started free</p>
                <h2 className="text-[clamp(1.7rem,4vw,2.6rem)] font-black tracking-tight text-white mb-3">
                  Rent your first number today
                </h2>
                <p className="text-[15px] text-slate-400 mb-9 leading-relaxed max-w-md mx-auto">
                  Fast, private, and globally available. No subscription required — just pay as you go.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={onLogin}
                    className="btn-reflect group h-12 px-9 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 text-[15px] font-semibold text-white shadow-[0_0_40px_rgba(14,165,233,0.35)] hover:shadow-[0_0_56px_rgba(14,165,233,0.5)] hover:from-sky-400 hover:to-sky-500 transition-all duration-250 flex items-center gap-2 active:scale-95"
                  >
                    Create free account
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                  <a
                    href="#features"
                    className="h-12 inline-flex items-center gap-2 rounded-xl border border-white/10 px-7 text-[14px] font-medium text-white/70 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all duration-200"
                  >
                    <Code2 className="h-4 w-4" />
                    View API docs
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      {/* Sticky mobile CTA */}
      <div className={`fixed bottom-0 inset-x-0 z-50 sm:hidden transition-all duration-350 ${showStickyBar ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}>
        <div className="bg-[#050914]/95 backdrop-blur-2xl border-t border-white/[0.08] shadow-[0_-8px_30px_rgba(0,0,0,0.5)] px-5 py-3.5 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold text-white leading-tight">Ready to verify?</div>
            <div className="text-[11px] text-slate-500">Numbers from $0.10</div>
          </div>
          <button
            onClick={onLogin}
            className="btn-reflect shrink-0 h-10 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 px-6 text-[13px] font-bold text-white shadow-[0_0_16px_rgba(14,165,233,0.3)] hover:shadow-[0_0_24px_rgba(14,165,233,0.45)] hover:from-sky-400 hover:to-sky-500 transition-all"
          >
            Get started
          </button>
        </div>
      </div>

      <footer className="relative z-10 border-t border-white/[0.05] py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 px-6 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-sky-500/15 border border-sky-500/20 flex items-center justify-center">
              <Phone className="h-3.5 w-3.5 text-sky-400" />
            </div>
            <span className="text-[14px] font-bold text-white">SKY SMS</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-6 text-[12px] text-slate-500">
            <a href="#services"      className="hover:text-white transition-colors">Services</a>
            <a href="#features"      className="hover:text-white transition-colors">Features</a>
            <a href="#pricing"       className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq"           className="hover:text-white transition-colors">FAQ</a>
            <a href="/terms"         className="hover:text-white transition-colors">Terms</a>
            <a href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</a>
          </nav>
          <p className="text-[11px] text-slate-700">© {new Date().getFullYear()} SKY SMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
