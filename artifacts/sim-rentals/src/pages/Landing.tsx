import { Shield, Zap, Globe, Lock, ChevronRight, Sparkles, MessageSquare, RefreshCw, Clock, Phone, ChevronDown } from "lucide-react";
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
  { icon: Zap,           title: "Instant Delivery",   desc: "Numbers are allocated in seconds. SMS codes appear the moment they arrive — no queues, no delays." },
  { icon: Globe,         title: "Global Coverage",     desc: "8+ countries with live availability counts. See real stock before you spend a single cent." },
  { icon: Lock,          title: "Crypto Payments",     desc: "Top up with BTC, ETH, USDT, and 30+ coins via OxaPay. Private, borderless, zero chargebacks." },
  { icon: MessageSquare, title: "Live SMS Inbox",      desc: "Verification codes appear instantly on your rental card. One tap to copy." },
  { icon: RefreshCw,     title: "Auto Refunds",        desc: "Cancel before the 20-minute window ends and get your balance back immediately." },
  { icon: Clock,         title: "20-Min Window",       desc: "A live countdown tracks your activation. No SMS? Full automatic refund, no questions asked." },
];

const faqs = [
  { q: "How does SMS number rental work?",    a: "Add funds, pick a country and service, and get a temporary phone number instantly. Incoming SMS codes appear on your dashboard in real time. Numbers stay active for 20 minutes." },
  { q: "Which countries are supported?",      a: "We support numbers from the US, UK, Germany, France, Netherlands, Canada, Brazil, India, and more — with live availability shown before you purchase." },
  { q: "What payment methods are accepted?",  a: "We accept crypto payments via OxaPay — BTC, ETH, USDT (TRC20 & ERC20), LTC, TRX, DOGE, and 30+ other coins. Purchases are private and borderless." },
  { q: "What if I don't receive an SMS?",     a: "Cancel an active rental before the 20-minute window closes for an instant full refund. If the window expires with no SMS, your balance is also refunded automatically." },
  { q: "Are the numbers reused?",             a: "Numbers are recycled between sessions, but each rental starts completely fresh — you only see messages that arrive during your active window. No shared history." },
];

const stats = [
  { value: "8+",     label: "Countries" },
  { value: "50+",    label: "Services" },
  { value: "20 min", label: "Activation window" },
  { value: "100%",   label: "Refund if no SMS" },
];

export default function Landing({ onLogin }: { onLogin?: () => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowStickyBar(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen premium-shell text-white" style={{ overflowX: "hidden" }}>

      {/* Background orbs — subtle, not animated heavily */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="orb" style={{ width: 600, height: 600, top: "-15%", left: "-10%", background: "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)" }} />
        <div className="orb" style={{ width: 500, height: 500, bottom: "-12%", right: "-8%", background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)", animationDelay: "5s" }} />
      </div>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#080c18]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-sky-400/10 border border-sky-400/20 flex items-center justify-center">
              <Phone className="h-4 w-4 text-sky-400" />
            </div>
            <span className="font-bold text-white tracking-tight text-[15px]">SKY SMS</span>
          </div>

          <nav className="hidden items-center gap-7 text-[13px] font-medium text-slate-400 md:flex">
            <a className="hover:text-white transition-colors duration-150" href="#services">Services</a>
            <a className="hover:text-white transition-colors duration-150" href="#features">Features</a>
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
            <Button
              onClick={onLogin}
              className="rounded-full bg-sky-400 text-[#080c18] hover:bg-sky-300 font-semibold text-[13px] h-8 px-4 transition-all duration-200"
              data-testid="button-landing-signup"
            >
              Get started
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10">

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section id="home" className="relative mx-auto max-w-5xl px-5 pb-24 pt-24 text-center sm:px-6">

          <Reveal variant="up" delay={0}>
            <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/[0.06] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-sky-400">
              <Sparkles className="h-3 w-3" />
              Real SMS verification
            </div>
          </Reveal>

          <Reveal variant="up" delay={70}>
            <h1 className="mx-auto mb-5 max-w-3xl text-[clamp(2.6rem,7vw,5.5rem)] font-bold leading-[1.08] tracking-[-0.03em] text-white">
              Rent SMS numbers{" "}
              <span className="gradient-text">instantly</span>
            </h1>
          </Reveal>

          <Reveal variant="up" delay={140}>
            <p className="mx-auto mb-10 max-w-lg text-[15px] font-normal leading-relaxed text-slate-400">
              Add funds, rent a temporary number, and receive verification codes — in a clean, fast dashboard built for speed.
            </p>
          </Reveal>

          <Reveal variant="up" delay={210}>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                onClick={onLogin}
                className="group h-11 w-full rounded-full bg-sky-400 px-8 text-[14px] font-semibold text-[#080c18] shadow-[0_0_40px_rgba(56,189,248,0.3)] hover:bg-sky-300 hover:shadow-[0_0_55px_rgba(56,189,248,0.4)] transition-all duration-250 sm:w-auto"
                data-testid="button-hero-cta"
              >
                Rent a number now
                <ChevronRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <a
                href="#features"
                className="h-11 inline-flex items-center rounded-full border border-white/10 px-8 text-[14px] font-medium text-white/70 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all duration-200"
              >
                Learn more
              </a>
            </div>
          </Reveal>

          {/* Stats row */}
          <Reveal variant="up" delay={280}>
            <div className="mx-auto mt-16 grid grid-cols-2 sm:grid-cols-4 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] max-w-xl">
              {stats.map((stat) => (
                <div key={stat.label} className="px-4 py-4 text-center bg-white/[0.02]">
                  <div className="text-xl font-bold text-white">{stat.value}</div>
                  <div className="mt-0.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide leading-tight">{stat.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ── Services ─────────────────────────────────────────── */}
        <section id="services" className="py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <Reveal variant="up">
              <div className="mb-12 text-center">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-sky-400">Platform coverage</p>
                <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-tight text-white">Works with every service</h2>
                <p className="mt-3 text-[14px] text-slate-400">Get verification codes from any major platform.</p>
              </div>
            </Reveal>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((svc, i) => (
                <Reveal key={svc.name} variant="up" delay={i * 45}>
                  <button
                    onClick={onLogin}
                    className="w-full glass-card group flex cursor-pointer items-center gap-3.5 rounded-xl p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-400/15 active:scale-[0.98]"
                  >
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center overflow-hidden group-hover:bg-white/[0.08] transition-colors">
                      <img
                        src={serviceIcons[svc.name]}
                        alt={svc.name}
                        className="h-6 w-6 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-white">{svc.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">{svc.desc}</div>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-sky-400 transition-colors shrink-0" />
                  </button>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────────── */}
        <section id="features" className="py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-6">
            <Reveal variant="up">
              <div className="mb-12 text-center">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-sky-400">Features</p>
                <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-tight text-white">Everything you need</h2>
                <p className="mt-3 text-[14px] text-slate-400">Built for speed, privacy, and reliability.</p>
              </div>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feat, i) => (
                <Reveal key={feat.title} variant="up" delay={i * 55}>
                  <div className="glass-card group rounded-xl p-5 hover:-translate-y-0.5 hover:border-sky-400/12 transition-all duration-200 h-full">
                    <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-sky-400/8 border border-sky-400/12 text-sky-400">
                      <feat.icon className="h-4 w-4" />
                    </div>
                    <h3 className="mb-1.5 text-[14px] font-semibold text-white">{feat.title}</h3>
                    <p className="text-[13px] leading-relaxed text-slate-500">{feat.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section id="faq" className="py-20">
          <div className="mx-auto max-w-2xl px-5 sm:px-6">
            <Reveal variant="up">
              <div className="mb-12 text-center">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-sky-400">FAQ</p>
                <h2 className="text-[clamp(1.8rem,4vw,3rem)] font-bold tracking-tight text-white">Common questions</h2>
              </div>
            </Reveal>

            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <Reveal key={i} variant="up" delay={i * 45}>
                  <div className="glass-card rounded-xl overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/[0.02] transition-colors"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span className="text-[13px] font-semibold text-white">{faq.q}</span>
                      <ChevronDown className={`h-4 w-4 shrink-0 text-sky-400 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${openFaq === i ? "rotate-180" : ""}`} />
                    </button>
                    <div className={`faq-body ${openFaq === i ? "faq-body-open" : ""}`}>
                      <div className="faq-inner px-5 pb-4 pt-3 text-[13px] text-slate-400 leading-relaxed border-t border-white/[0.05]">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────── */}
        <section className="py-20 px-5">
          <div className="mx-auto max-w-xl">
            <Reveal variant="scale">
              <div className="glass-card blue-glow rounded-2xl p-10 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-sky-400/[0.04] to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-sky-400">Get started free</p>
                  <h2 className="text-[clamp(1.6rem,4vw,2.5rem)] font-bold tracking-tight text-white mb-3">
                    Rent your first number today
                  </h2>
                  <p className="text-[14px] text-slate-400 mb-8 leading-relaxed">
                    Fast, private, and globally available. No subscription required — just pay as you go.
                  </p>
                  <Button
                    onClick={onLogin}
                    className="group h-11 rounded-full bg-sky-400 px-8 text-[14px] font-semibold text-[#080c18] shadow-[0_0_40px_rgba(56,189,248,0.3)] hover:bg-sky-300 transition-all duration-250"
                  >
                    Create free account
                    <ChevronRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Sticky mobile CTA bar */}
      <div className={`fixed bottom-0 inset-x-0 z-50 sm:hidden transition-transform duration-300 ${showStickyBar ? "translate-y-0" : "translate-y-full"}`}>
        <div className="bg-[#080c18]/95 backdrop-blur-xl border-t border-white/[0.08] px-5 py-3 pb-safe flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-white leading-tight">Ready to verify?</div>
            <div className="text-[10px] text-slate-500">Numbers from $0.10</div>
          </div>
          <Button
            onClick={onLogin}
            className="shrink-0 h-9 rounded-full bg-sky-400 px-5 text-[13px] font-bold text-[#080c18] hover:bg-sky-300 transition-all"
          >
            Get started
          </Button>
        </div>
      </div>

      <footer className="relative z-10 border-t border-white/[0.05] py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 sm:flex-row">
          <div className="flex items-center gap-2">
            <Phone className="h-3.5 w-3.5 text-sky-400" />
            <span className="text-[13px] font-semibold text-white">SKY SMS</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-5 text-[12px] text-slate-500">
            <a href="#services"      className="hover:text-white transition-colors">Services</a>
            <a href="#features"      className="hover:text-white transition-colors">Features</a>
            <a href="#faq"           className="hover:text-white transition-colors">FAQ</a>
            <a href="/terms"         className="hover:text-white transition-colors">Terms</a>
            <a href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</a>
          </nav>
          <p className="text-[11px] text-slate-600">© {new Date().getFullYear()} SKY SMS</p>
        </div>
      </footer>
    </div>
  );
}
