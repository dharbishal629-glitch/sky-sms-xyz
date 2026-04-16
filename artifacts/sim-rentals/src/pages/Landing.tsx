import { Shield, Zap, Globe, Lock, ChevronRight, Sparkles, MessageSquare, RefreshCw, CreditCard, ChevronDown, Phone, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import { useState } from "react";

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
  { icon: Zap,          title: "Instant Delivery",   desc: "Numbers are allocated in seconds. Receive SMS codes as soon as they arrive — no queues, no waiting." },
  { icon: Globe,        title: "Global Coverage",     desc: "Browse 8+ countries with live availability counts. See real stock before spending a single dollar." },
  { icon: Lock,         title: "Crypto Payments",     desc: "Top up with BTC, ETH, USDT and 30+ coins via OxaPay. Fully private, borderless, no chargebacks." },
  { icon: MessageSquare,title: "Live SMS Inbox",      desc: "Incoming verification codes appear instantly on your rental card. One tap to copy the code." },
  { icon: RefreshCw,    title: "Cancel & Refund",     desc: "Cancel any rental before the 20-minute window ends. Your balance is returned instantly." },
  { icon: Clock,        title: "20-Min Window",       desc: "A live countdown tracks your activation window. If no SMS arrives, you get a full automatic refund." },
];

const faqs = [
  { q: "How does SMS number rental work?",    a: "Add funds, select a country and service, and get a temporary phone number instantly. Any incoming SMS is shown in your dashboard in real time. Numbers stay active for 20 minutes." },
  { q: "Which countries are supported?",      a: "We support numbers from the US, UK, Germany, France, Netherlands, Canada, Brazil, India, and many more. New countries are added regularly based on provider availability." },
  { q: "What payment methods are accepted?",  a: "We accept cryptocurrency payments via OxaPay, which supports BTC, ETH, USDT, and many other coins. Purchases are private and borderless." },
  { q: "What if I don't receive an SMS?",     a: "You can cancel an active rental before the 20-minute window closes and receive a full refund to your balance instantly. If the window expires with no SMS, you're also refunded automatically." },
  { q: "Are the numbers reused?",             a: "Numbers are recycled between sessions but each rental starts completely fresh — you only see messages received during your active window. No shared history." },
];

const stats = [
  { value: "8+",    label: "Countries" },
  { value: "50+",   label: "Services" },
  { value: "20 min",label: "Activation window" },
  { value: "100%",  label: "Refund if no SMS" },
];

/* 32 stars spread across the full page */
const stars = Array.from({ length: 32 }, (_, i) => ({
  top:      `${(i * 3.1 + Math.sin(i * 1.7) * 12 + 50) % 100}%`,
  left:     `${(i * 3.7 + Math.cos(i * 2.3) * 18 + 50) % 100}%`,
  duration: `${2.2 + (i % 7) * 0.45}s`,
  opacity:  0.2 + (i % 5) * 0.07,
  size:     i % 4 === 0 ? 3 : 2,
  delay:    `${(i % 5) * 0.6}s`,
}));

export default function Landing({ onLogin }: { onLogin?: () => void }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [pressedService, setPressedService] = useState<string | null>(null);

  const handleServiceClick = (name: string) => {
    setPressedService(name);
    setTimeout(() => setPressedService(null), 300);
    onLogin?.();
  };

  return (
    <div className="min-h-screen premium-shell text-white" style={{ overflowX: "hidden" }}>

      {/* ── Full-page star field (absolute, covers entire scroll height) ── */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        {stars.map((s, i) => (
          <div
            key={i}
            className="star"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              "--duration": s.duration,
              "--opacity": s.opacity,
              animationDelay: s.delay,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ── Fixed ambient glow orbs (behind everything) ── */}
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
        <div className="orb" style={{ width: 700, height: 700, top: "-20%",  left: "-12%", background: "radial-gradient(circle, rgba(0,200,255,0.10) 0%, transparent 68%)" }} />
        <div className="orb" style={{ width: 580, height: 580, bottom:"-15%",right: "-10%", background: "radial-gradient(circle, rgba(56,100,255,0.08) 0%, transparent 68%)", animationDelay: "4s" }} />
        <div className="orb" style={{ width: 350, height: 350, top: "42%",   right: "8%",  background: "radial-gradient(circle, rgba(0,220,255,0.06) 0%, transparent 68%)", animationDelay: "2s" }} />
        <div className="orb" style={{ width: 280, height: 280, top: "68%",   left: "6%",   background: "radial-gradient(circle, rgba(120,80,255,0.05) 0%, transparent 68%)", animationDelay: "6s" }} />
      </div>

      {/* ── Sticky Nav ── */}
      <header className="sticky top-4 z-50 mx-auto flex max-w-6xl justify-center px-4">
        <div className="glass-card flex h-14 w-full items-center justify-between rounded-full px-5 neon-border">
          <div className="flex items-center gap-2 font-black text-base">
            <Phone className="h-4 w-4 text-cyan-400" />
            <span className="gradient-text">SKY SMS</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-400 md:flex">
            <a className="text-cyan-300 font-bold" href="#home">Home</a>
            <a className="hover:text-white transition-colors" href="#services">Services</a>
            <a className="hover:text-white transition-colors" href="#features">Features</a>
            <a className="hover:text-white transition-colors" href="#faq">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={onLogin} className="hidden text-sm font-bold text-slate-400 transition hover:text-white sm:inline" data-testid="link-landing-login">Login</button>
            <Button
              onClick={onLogin}
              className="rounded-full bg-cyan-400 text-black hover:bg-cyan-300 font-bold shadow-[0_0_20px_rgba(0,220,255,0.35)] text-sm h-9 px-5"
              data-testid="button-landing-signup"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10">

        {/* ── Hero ── */}
        <section id="home" className="relative mx-auto max-w-7xl px-4 pb-24 pt-28 text-center sm:px-6 lg:px-8 dot-grid">
          <Reveal variant="up" delay={0}>
            <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/[0.08] px-5 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
              <Star className="h-3.5 w-3.5 fill-cyan-400 text-cyan-400" />
              Real SMS verification marketplace
            </div>
          </Reveal>

          <Reveal variant="up" delay={80}>
            <h1 className="mx-auto mb-6 max-w-5xl text-[clamp(3rem,9vw,6.5rem)] font-black leading-[1.02] tracking-tight text-white">
              Rent SMS numbers{" "}
              <span className="gradient-text text-glow">instantly</span>
            </h1>
          </Reveal>

          <Reveal variant="up" delay={160}>
            <p className="mx-auto mb-10 max-w-xl text-lg font-medium leading-relaxed text-slate-400">
              Add funds, rent clean temporary numbers, and receive verification codes in a premium dashboard — built for speed.
            </p>
          </Reveal>

          <Reveal variant="up" delay={240}>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                onClick={onLogin}
                size="lg"
                className="group h-14 w-full rounded-full bg-cyan-400 px-10 text-base font-black text-black shadow-[0_0_50px_rgba(0,220,255,0.4)] hover:bg-cyan-300 hover:shadow-[0_0_70px_rgba(0,220,255,0.55)] transition-all duration-300 sm:w-auto"
                data-testid="button-hero-cta"
              >
                Rent a Number Now
                <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <a
                href="#features"
                className="rounded-full border border-white/15 px-8 py-4 text-sm font-bold text-white transition-all duration-200 hover:border-cyan-400/40 hover:bg-cyan-400/[0.08] hover:scale-[1.02] active:scale-[0.97]"
              >
                View Features
              </a>
            </div>
          </Reveal>

          {/* Stats bar */}
          <Reveal variant="up" delay={320}>
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="glass-card rounded-2xl px-4 py-5 text-center">
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ── Services ── */}
        <section id="services" className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal variant="up">
              <div className="mb-14 text-center">
                <div className="mx-auto mb-5 w-fit rounded-full border border-cyan-400/20 bg-cyan-400/[0.08] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
                  Platform coverage
                </div>
                <h2 className="mb-4 text-[clamp(2rem,4vw,3.5rem)] font-black tracking-tight text-white">Works with every service</h2>
                <p className="text-slate-400">Receive verification codes from any platform.</p>
              </div>
            </Reveal>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((svc, i) => {
                const pressed = pressedService === svc.name;
                return (
                  <Reveal key={svc.name} variant="up" delay={i * 55}>
                    <button
                      onClick={() => handleServiceClick(svc.name)}
                      className={`shine-hover ripple-container w-full glass-card group flex cursor-pointer items-center gap-4 rounded-2xl p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-cyan-400/20 hover:shadow-[0_8px_32px_rgba(0,220,255,0.1)] active:scale-[0.97] ${pressed ? "scale-[0.97] border-cyan-400/30" : ""}`}
                    >
                      <div className="h-12 w-12 shrink-0 rounded-xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center overflow-hidden group-hover:bg-white/[0.09] transition-colors">
                        <img
                          src={serviceIcons[svc.name]}
                          alt={svc.name}
                          className="h-7 w-7 object-contain rounded"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      </div>
                      <div>
                        <div className="font-bold text-white">{svc.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{svc.desc}</div>
                      </div>
                      <ChevronRight className="ml-auto h-4 w-4 text-slate-700 group-hover:text-cyan-400 transition-colors shrink-0" />
                    </button>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Reveal variant="up">
              <div className="mb-14 text-center">
                <div className="mx-auto mb-5 w-fit rounded-full border border-cyan-400/20 bg-cyan-400/[0.08] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
                  <Sparkles className="inline h-3.5 w-3.5 mr-1.5" />
                  Premium features
                </div>
                <h2 className="mb-4 text-[clamp(2rem,4vw,3.5rem)] font-black tracking-tight text-white">Everything you need</h2>
                <p className="text-slate-400">Built for speed, privacy, and reliability.</p>
              </div>
            </Reveal>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, i) => (
                <Reveal key={feature.title} variant="up" delay={i * 65}>
                  <div className="shine-hover glass-card group cursor-default rounded-2xl p-6 hover:-translate-y-1 hover:border-cyan-400/15 transition-all duration-200 h-full">
                    <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 border border-cyan-400/15 text-cyan-400 group-hover:bg-cyan-400/15 transition-colors">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 text-lg font-black text-white">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-500">{feature.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-24">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <Reveal variant="up">
              <div className="mb-14 text-center">
                <div className="mx-auto mb-5 w-fit rounded-full border border-cyan-400/20 bg-cyan-400/[0.08] px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
                  Got questions?
                </div>
                <h2 className="mb-4 text-[clamp(2rem,4vw,3.5rem)] font-black tracking-tight text-white">FAQ</h2>
                <p className="text-slate-400">Everything you need to know about renting numbers.</p>
              </div>
            </Reveal>

            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <Reveal key={i} variant="up" delay={i * 55}>
                  <div className="glass-card rounded-2xl overflow-hidden">
                    <button
                      className="ripple-container w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-white/[0.02] active:scale-[0.99]"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    >
                      <span className="font-bold text-white text-sm">{faq.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-cyan-400 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${openFaq === i ? "rotate-180" : ""}`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${openFaq === i ? "max-h-[280px] opacity-100" : "max-h-0 opacity-0"}`}
                    >
                      <div className="px-6 pb-5 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-24 px-4">
          <div className="mx-auto max-w-2xl">
            <Reveal variant="scale">
              <div className="glass-card blue-glow shimmer-border rounded-3xl p-12 text-center relative overflow-hidden">
                <div className="orb" style={{ width: 300, height: 300, top: "-30%", left: "50%", transform: "translateX(-50%)", background: "radial-gradient(circle, rgba(0,220,255,0.08) 0%, transparent 70%)" }} />
                <div className="relative z-10">
                  <div className="mx-auto mb-6 w-fit rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
                    <Sparkles className="inline h-3.5 w-3.5 mr-1.5" />
                    Get started today
                  </div>
                  <h2 className="text-4xl font-black tracking-tight text-white mb-4">
                    Ready to rent<br />your first number?
                  </h2>
                  <p className="text-slate-400 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
                    Join thousands of users renting SMS numbers for fast, private account verification.
                  </p>
                  <Button
                    onClick={onLogin}
                    size="lg"
                    className="group h-14 rounded-full bg-cyan-400 px-10 text-base font-black text-black shadow-[0_0_50px_rgba(0,220,255,0.4)] hover:bg-cyan-300 hover:shadow-[0_0_70px_rgba(0,220,255,0.55)] transition-all duration-300"
                  >
                    Create Free Account
                    <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 sm:px-6 md:flex-row lg:px-8">
          <div className="flex items-center gap-2 font-black">
            <Phone className="h-4 w-4 text-cyan-400" />
            <span className="gradient-text">SKY SMS</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-slate-600">
            <a href="#services"      className="hover:text-white transition-colors">Services</a>
            <a href="#features"      className="hover:text-white transition-colors">Features</a>
            <a href="#faq"           className="hover:text-white transition-colors">FAQ</a>
            <a href="/terms"         className="hover:text-white transition-colors">Terms of Service</a>
            <a href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</a>
          </nav>
          <p className="text-xs text-slate-700">© {new Date().getFullYear()} SKY SMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
