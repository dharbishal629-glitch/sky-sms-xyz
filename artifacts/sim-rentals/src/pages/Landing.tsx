import { Shield, Zap, Globe, Lock, ChevronRight, MessageSquare, RefreshCw, Clock, Phone, ChevronDown, ArrowRight, Code2, Check, Star, Users } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { useState, useEffect } from "react";

function svcIcon(domain: string) {
  return `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`;
}

const services = [
  { name: "Telegram",  desc: "Instant account verification", domain: "telegram.org" },
  { name: "WhatsApp",  desc: "Business & personal accounts", domain: "web.whatsapp.com" },
  { name: "Google",    desc: "Gmail & Workspace accounts",   domain: "google.com" },
  { name: "Instagram", desc: "Creator & business profiles",  domain: "instagram.com" },
  { name: "Facebook",  desc: "Personal & page verification", domain: "facebook.com" },
  { name: "Discord",   desc: "Community account setup",      domain: "discord.com" },
  { name: "Amazon",    desc: "Seller & buyer accounts",      domain: "amazon.com" },
  { name: "PayPal",    desc: "Account & wallet verification",domain: "paypal.com" },
];

const features = [
  { icon: Zap,           title: "Instant Delivery",    desc: "Numbers allocated in seconds. SMS codes appear the moment they arrive — no queues, no delays." },
  { icon: Globe,         title: "Global Coverage",      desc: "Multiple countries with live availability counts. See real stock before you spend a single cent." },
  { icon: Lock,          title: "Crypto Payments",      desc: "Top up with BTC, ETH, USDT, and 30+ coins via OxaPay. Private, borderless, zero chargebacks." },
  { icon: MessageSquare, title: "Live SMS Inbox",       desc: "Verification codes appear instantly on your rental card. One tap to copy." },
  { icon: RefreshCw,     title: "Automatic Refunds",    desc: "Cancel before the 20-minute window ends and get your balance back immediately." },
  { icon: Code2,         title: "Developer API",        desc: "Full REST API with API key authentication. Automate number rentals, poll messages, and more." },
];

const steps = [
  { num: "01", title: "Add Funds",         desc: "Top up your account with any amount using crypto via OxaPay. No minimums, no subscriptions." },
  { num: "02", title: "Choose a Number",   desc: "Select your service and country. We show live availability so you never waste a purchase." },
  { num: "03", title: "Receive Your Code", desc: "Your SMS arrives within seconds. Copy the code and you're verified. It's that simple." },
];

const faqs = [
  { q: "How does SMS number rental work?",    a: "Add funds, pick a country and service, and get a temporary phone number instantly. Incoming SMS codes appear on your dashboard in real time. Numbers stay active for 20 minutes." },
  { q: "Which services are supported?",       a: "We support 50+ platforms including Telegram, WhatsApp, Google, Instagram, Facebook, Discord, Amazon, PayPal, and many more — with live availability before you purchase." },
  { q: "What payment methods are accepted?",  a: "We accept crypto payments via OxaPay — BTC, ETH, USDT (TRC20 & ERC20), LTC, TRX, DOGE, and 30+ other coins. All payments are private and borderless." },
  { q: "What if I don't receive an SMS?",     a: "Cancel an active rental before the 20-minute window closes for an instant full refund. If the window expires with no SMS, your balance is also refunded automatically." },
  { q: "Are the numbers recycled?",           a: "Numbers are recycled between sessions, but each rental starts completely fresh — you only see messages that arrive during your active window. No shared history." },
  { q: "Is there a developer API?",           a: "Yes. SKY SMS provides a full REST API with API key authentication. List services, create rentals, poll for SMS, and cancel — all programmatically." },
];

const stats = [
  { value: "50+",    label: "Platforms" },
  { value: "10+",    label: "Countries" },
  { value: "20 min", label: "Window" },
  { value: "100%",   label: "Refund rate" },
];

const trustBadges = [
  { icon: Shield, text: "Secure & Private" },
  { icon: Clock,  text: "20-min Guarantee" },
  { icon: Users,  text: "Thousands of Users" },
  { icon: Star,   text: "Crypto Payments" },
];

export default function Landing({ onLogin }: { onLogin?: () => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen premium-shell text-white" style={{ overflowX: "hidden" }}>

      {/* Layered ambient background — warm gold tones */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="absolute top-[-18%] left-[-12%] w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(212,168,67,0.08) 0%, rgba(212,100,40,0.04) 40%, transparent 70%)", filter: "blur(100px)" }} />
        <div className="absolute bottom-[-15%] right-[-10%] w-[550px] h-[550px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(180,100,60,0.07) 0%, rgba(212,168,67,0.03) 40%, transparent 70%)", filter: "blur(90px)" }} />
        <div className="absolute top-[45%] left-[40%] w-[350px] h-[350px] rounded-full"
          style={{ background: "radial-gradient(ellipse at center, rgba(212,168,67,0.04) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      {/* ── Navigation ── */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-amber-900/20 bg-[#050914]/92 backdrop-blur-2xl shadow-[0_1px_0_rgba(212,168,67,0.06)]" : "bg-transparent"}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/25 flex items-center justify-center shadow-[0_0_16px_rgba(212,168,67,0.12)]">
              <Phone className="h-4 w-4 text-amber-400" />
            </div>
            <span className="font-bold text-white tracking-tight text-[16px]">SKY SMS</span>
          </div>

          <nav className="hidden items-center gap-8 text-[13px] font-medium text-slate-400 md:flex">
            <a className="hover:text-amber-300 transition-colors duration-150" href="#services">Services</a>
            <a className="hover:text-amber-300 transition-colors duration-150" href="#features">Features</a>
            <a className="hover:text-amber-300 transition-colors duration-150" href="#how-it-works">How It Works</a>
            <a className="hover:text-amber-300 transition-colors duration-150" href="#faq">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onLogin}
              className="hidden text-[13px] font-medium text-slate-400 hover:text-amber-300 transition-colors sm:inline"
              data-testid="link-landing-login"
            >
              Sign in
            </button>
            <button
              onClick={onLogin}
              className="h-9 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[13px] font-semibold text-slate-900 hover:from-amber-400 hover:to-amber-500 transition-all duration-200 active:scale-95 shadow-[0_2px_12px_rgba(212,168,67,0.3)]"
              data-testid="button-landing-signup"
            >
              Get started
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10">

        {/* ── Hero ── */}
        <section id="home" className="relative mx-auto max-w-5xl px-6 pb-24 pt-20 text-center">

          <Reveal variant="up" delay={0}>
            <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-amber-500/25 bg-amber-500/[0.07] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-400 shadow-[0_0_20px_rgba(212,168,67,0.08)]">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              Live SMS numbers • Instant delivery
            </div>
          </Reveal>

          <Reveal variant="up" delay={80}>
            <h1 className="font-display mx-auto mb-5 max-w-4xl text-[clamp(2.6rem,7vw,5.5rem)] font-bold leading-[1.08] tracking-[-0.02em] text-white">
              Rent Phone Numbers{" "}
              <span className="gradient-text italic">Instantly</span>
            </h1>
          </Reveal>

          <Reveal variant="up" delay={160}>
            <p className="mx-auto mb-10 max-w-[540px] text-[16px] font-normal leading-relaxed text-slate-400">
              Add funds, rent a real phone number from anywhere in the world, and receive verification codes within seconds — all from one elegant, professional dashboard.
            </p>
          </Reveal>

          <Reveal variant="up" delay={230}>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={onLogin}
                className="group h-12 w-full sm:w-auto px-10 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[15px] font-semibold text-slate-900 hover:from-amber-400 hover:to-amber-500 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_4px_20px_rgba(212,168,67,0.3)]"
                data-testid="button-hero-cta"
              >
                Rent a number now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <a
                href="#how-it-works"
                className="h-12 inline-flex items-center justify-center rounded-xl border border-white/10 px-9 text-[15px] font-medium text-white/70 hover:text-white hover:border-amber-500/20 hover:bg-amber-500/[0.04] transition-all duration-200"
              >
                How it works
              </a>
            </div>
          </Reveal>

          {/* Trust badges */}
          <Reveal variant="up" delay={290}>
            <div className="mx-auto mt-10 flex flex-wrap items-center justify-center gap-4">
              {trustBadges.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-[12px] text-slate-500">
                  <Icon className="h-3.5 w-3.5 text-amber-500/70" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </Reveal>

          {/* Stats row */}
          <Reveal variant="up" delay={350}>
            <div className="mx-auto mt-14 max-w-xl">
              <div className="grid grid-cols-2 sm:grid-cols-4 rounded-2xl border border-amber-900/20 overflow-hidden"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.025) 0%, rgba(212,168,67,0.02) 100%)" }}>
                {stats.map((stat, i) => (
                  <div key={stat.label} className={`px-4 py-5 text-center ${i < stats.length - 1 ? "border-r border-amber-900/15" : ""}`}>
                    <div className="font-display text-2xl font-bold text-amber-400 tracking-tight">{stat.value}</div>
                    <div className="mt-1 text-[11px] font-medium text-slate-600 uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Dashboard preview mockup */}
          <Reveal variant="up" delay={420}>
            <div className="mx-auto mt-14 max-w-2xl">
              <div className="rounded-2xl border border-amber-900/20 bg-[#080c18] shadow-[0_20px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(212,168,67,0.04)] overflow-hidden text-left">
                {/* Window chrome */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05] bg-white/[0.015]">
                  <div className="h-2.5 w-2.5 rounded-full bg-rose-500/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
                  <div className="ml-2 flex-1 flex items-center justify-center">
                    <div className="flex items-center gap-1.5 rounded-md bg-white/[0.04] px-3 py-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 status-pulse" />
                      <span className="text-[10px] text-slate-500 font-mono">sky-sms.app — SMS received</span>
                    </div>
                  </div>
                </div>
                {/* Mock dashboard content */}
                <div className="p-5 space-y-3">
                  {/* Active rental card */}
                  <div className="rounded-xl border border-amber-500/12 bg-amber-500/[0.04] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                          <img src="https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://telegram.org&size=64" className="h-5 w-5" alt="Telegram" onError={(e) => { (e.target as HTMLImageElement).style.display="none"; }} />
                        </div>
                        <div>
                          <div className="text-[13px] font-semibold text-white">Telegram</div>
                          <div className="text-[11px] text-slate-500">+1 (555) 847-2901 · United States</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-amber-400 font-mono">14:22</span>
                    </div>
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] p-3 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-500 mb-1">Verification code</div>
                        <div className="text-[20px] font-black text-white tracking-widest font-mono">481 293</div>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 px-3 py-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-[11px] font-semibold text-emerald-400">Copy code</span>
                      </div>
                    </div>
                  </div>
                  {/* Balance + quick stats row */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Balance",  val: "$4.85", color: "text-amber-400" },
                      { label: "Rentals",  val: "12",    color: "text-white" },
                      { label: "Refunds",  val: "100%",  color: "text-emerald-400" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                        <div className={`text-[15px] font-bold ${s.color}`}>{s.val}</div>
                        <div className="text-[10px] text-slate-600 mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* ── Services ── */}
        <section id="services" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal variant="up">
              <div className="mb-12 text-center">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-500">50+ Platforms</p>
                <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-tight text-white">Works with every major service</h2>
                <p className="mt-3 text-[15px] text-slate-400 max-w-md mx-auto">Get verification codes from the world's most popular platforms with real-time availability.</p>
              </div>
            </Reveal>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((svc, i) => (
                <Reveal key={svc.name} variant="up" delay={i * 40}>
                  <button
                    onClick={onLogin}
                    className="w-full group relative flex cursor-pointer items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-amber-500/15 hover:bg-amber-500/[0.03] active:scale-[0.98]"
                  >
                    <div className="h-11 w-11 shrink-0 rounded-xl bg-white/[0.05] border border-white/[0.07] flex items-center justify-center overflow-hidden group-hover:border-amber-500/20 transition-all duration-200">
                      <img
                        src={svcIcon(svc.domain)}
                        alt={svc.name}
                        className="h-6 w-6 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-semibold text-white">{svc.name}</div>
                      <div className="text-[11.5px] text-slate-500 mt-0.5 truncate">{svc.desc}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-amber-500 transition-colors shrink-0" />
                  </button>
                </Reveal>
              ))}
            </div>

            <Reveal variant="up" delay={100}>
              <p className="text-center text-[13px] text-slate-600 mt-6">
                And 40+ more services available in your dashboard
              </p>
            </Reveal>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal variant="up">
              <div className="mb-14 text-center">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-500">Features</p>
                <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-tight text-white">Everything you need</h2>
                <p className="mt-3 text-[15px] text-slate-400">Built for speed, privacy, and developer automation.</p>
              </div>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feat, i) => (
                <Reveal key={feat.title} variant="up" delay={i * 55}>
                  <div className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:-translate-y-1 hover:border-amber-500/12 hover:bg-amber-500/[0.02] transition-all duration-200 h-full">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/15 text-amber-400 group-hover:bg-amber-500/15 transition-colors">
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

        {/* ── How It Works ── */}
        <section id="how-it-works" className="py-20">
          <div className="mx-auto max-w-4xl px-6">
            <Reveal variant="up">
              <div className="mb-14 text-center">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-500">Simple Process</p>
                <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-tight text-white">Up and running in minutes</h2>
                <p className="mt-3 text-[15px] text-slate-400">No complicated setup. No technical knowledge required.</p>
              </div>
            </Reveal>

            <div className="grid gap-5 md:grid-cols-3">
              {steps.map((step, i) => (
                <Reveal key={step.num} variant="up" delay={i * 80}>
                  <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.02] p-7 hover:border-amber-500/12 transition-all duration-200">
                    <div className="font-display text-[3.5rem] font-bold leading-none text-amber-500/12 mb-4 select-none">{step.num}</div>
                    <h3 className="text-[16px] font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-[13px] leading-relaxed text-slate-500">{step.desc}</p>
                    {i < steps.length - 1 && (
                      <div className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                        <ChevronRight className="h-5 w-5 text-amber-500/30" />
                      </div>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="py-20">
          <div className="mx-auto max-w-3xl px-6">
            <Reveal variant="up">
              <div className="mb-14 text-center">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-500">Pricing</p>
                <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-tight text-white">Simple, transparent pricing</h2>
                <p className="mt-3 text-[15px] text-slate-400">No subscriptions. No lock-in. Pay only for what you use.</p>
              </div>
            </Reveal>

            <Reveal variant="up" delay={80}>
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(212,168,67,0.06) 0%, transparent 60%)" }} />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-5">
                    Pay as you go
                  </div>
                  <div className="mb-5">
                    <span className="font-display text-[4rem] font-bold text-white leading-none">$0.10</span>
                    <span className="text-slate-500 text-[15px] ml-2">starting per SMS</span>
                  </div>
                  <ul className="space-y-3 mb-8 text-left max-w-xs mx-auto">
                    {[
                      "Live number allocation in seconds",
                      "20-minute activation window",
                      "Automatic refund if no SMS arrives",
                      "Full REST API included free",
                      "Crypto payments only — fully private",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-3 text-[13.5px] text-slate-300">
                        <div className="h-5 w-5 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3 text-amber-400" />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={onLogin}
                    className="h-12 px-10 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[15px] font-semibold text-slate-900 hover:from-amber-400 hover:to-amber-500 transition-all active:scale-95 shadow-[0_4px_20px_rgba(212,168,67,0.3)]"
                  >
                    Start renting — it's free to join
                  </button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-20">
          <div className="mx-auto max-w-2xl px-6">
            <Reveal variant="up">
              <div className="mb-14 text-center">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-500">FAQ</p>
                <h2 className="font-display text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-tight text-white">Common questions</h2>
              </div>
            </Reveal>

            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <Reveal key={i} variant="up" delay={i * 40}>
                  <div className={`rounded-2xl overflow-hidden border transition-all duration-250 ${
                    openFaq === i
                      ? "border-amber-500/20 bg-amber-500/[0.04]"
                      : "border-white/[0.06] bg-white/[0.015] hover:border-white/[0.09]"
                  }`}>
                    <button
                      className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span className="text-[14px] font-semibold text-white">{faq.q}</span>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-amber-500 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${openFaq === i ? "rotate-180" : ""}`} />
                    </button>
                    <div className={`faq-body ${openFaq === i ? "faq-body-open" : ""}`}>
                      <div className="faq-inner px-6 pb-5 text-[13.5px] text-slate-400 leading-relaxed border-t border-amber-900/10 pt-4">
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
              <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-amber-800/5" />
              <div className="absolute inset-0 border border-amber-500/15 rounded-3xl" />
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(212,168,67,0.08) 0%, transparent 60%)" }} />

              <div className="relative z-10 p-10 md:p-14 text-center">
                <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/25">
                  <Phone className="h-7 w-7 text-amber-400" />
                </div>
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-amber-500">Get started today</p>
                <h2 className="font-display text-[clamp(1.7rem,4vw,2.8rem)] font-bold tracking-tight text-white mb-4">
                  Rent your first number now
                </h2>
                <p className="text-[15px] text-slate-400 mb-9 leading-relaxed max-w-md mx-auto">
                  Fast, private, and globally available. No subscription — just pay as you go and get verified in seconds.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={onLogin}
                    className="group h-12 px-10 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-[15px] font-semibold text-slate-900 hover:from-amber-400 hover:to-amber-500 transition-all flex items-center gap-2 active:scale-95 shadow-[0_4px_20px_rgba(212,168,67,0.3)]"
                  >
                    Create free account
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                  <a
                    href="#features"
                    className="h-12 inline-flex items-center gap-2 rounded-xl border border-white/10 px-7 text-[14px] font-medium text-white/70 hover:text-white hover:border-amber-500/15 hover:bg-amber-500/[0.03] transition-all duration-200"
                  >
                    Learn more
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </section>

      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.05] py-10 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <Phone className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <span className="text-[14px] font-bold text-white">SKY SMS</span>
            </div>
            <div className="flex items-center gap-6 text-[12px] text-slate-600">
              <a href="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</a>
              <a href="/refund-policy" className="hover:text-amber-400 transition-colors">Refund Policy</a>
              <a href="#faq" className="hover:text-amber-400 transition-colors">FAQ</a>
            </div>
            <p className="text-[12px] text-slate-700">© {new Date().getFullYear()} SKY SMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
