import { useState } from "react";
import { Code2, Key, Copy, Check, ChevronDown, ChevronRight, Terminal, Zap, Globe, Phone, MessageSquare, RefreshCw, Shield, ExternalLink } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const BASE = typeof window !== "undefined"
  ? `${window.location.protocol}//${window.location.host}/api`
  : "/api";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/[0.06]"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function CodeBlock({ children, lang = "bash" }: { children: string; lang?: string }) {
  return (
    <div className="relative group rounded-xl overflow-hidden border border-white/[0.07] bg-[#070c1a] mt-3">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
        <span className="text-[11px] font-mono text-slate-600 uppercase tracking-wider">{lang}</span>
        <CopyButton text={children.trim()} />
      </div>
      <pre className="p-5 text-[12.5px] leading-relaxed overflow-x-auto font-mono">
        <code className="text-slate-300">{children.trim()}</code>
      </pre>
    </div>
  );
}

function ResponseBlock({ json }: { json: object }) {
  const text = JSON.stringify(json, null, 2);
  return (
    <div className="relative group rounded-xl overflow-hidden border border-white/[0.07] bg-[#070c1a] mt-3">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
        <span className="text-[11px] font-mono text-emerald-500/70 uppercase tracking-wider">200 OK — JSON</span>
        <CopyButton text={text} />
      </div>
      <pre className="p-5 text-[12.5px] leading-relaxed overflow-x-auto font-mono">
        <code>
          {text.split("\n").map((line, i) => {
            const keyMatch = line.match(/^(\s*)"([^"]+)":/);
            const strMatch = line.match(/: "([^"]*)"(,?)$/);
            const numMatch = line.match(/: (\d[\d.]*)(,?)$/);
            const boolMatch = line.match(/: (true|false|null)(,?)$/);
            if (keyMatch) {
              const indent = keyMatch[1];
              const key = keyMatch[2];
              const rest = line.slice(keyMatch[0].length);
              return (
                <span key={i}>
                  {indent}<span className="text-sky-400">"{key}"</span>:{rest.startsWith(" \"") ? (
                    <span className="text-emerald-400">{rest}</span>
                  ) : rest.match(/: (\d|true|false|null)/) ? (
                    <span className="text-pink-400">{rest}</span>
                  ) : rest}
                  {"\n"}
                </span>
              );
            }
            return <span key={i}>{line}{"\n"}</span>;
          })}
        </code>
      </pre>
    </div>
  );
}

interface Endpoint {
  method: "GET" | "POST" | "DELETE" | "PATCH";
  path: string;
  desc: string;
  auth: boolean;
  body?: object;
  response: object;
  curlExample: string;
}

const methodColors: Record<string, string> = {
  GET:    "text-sky-400 bg-sky-400/10 border-sky-400/20",
  POST:   "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  DELETE: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  PATCH:  "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

const sections = [
  {
    title: "Authentication",
    icon: Key,
    color: "violet",
    endpoints: [] as Endpoint[],
    content: (
      <div className="space-y-4 text-[13.5px] text-slate-400 leading-relaxed">
        <p>All API requests require an API key passed in the <code className="text-sky-400 bg-sky-400/10 px-1.5 py-0.5 rounded text-[12px] font-mono">X-API-Key</code> header.</p>
        <p>Your API key is available from <span className="text-white font-medium">Settings → API Keys</span> after signing in. Keep it secret and never expose it in client-side code.</p>
        <CodeBlock lang="bash">{`curl -X GET "${BASE}/me" \\
  -H "X-API-Key: sk_live_your_api_key_here" \\
  -H "Content-Type: application/json"`}</CodeBlock>
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 flex gap-3">
          <Shield className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-[13px] font-semibold text-amber-200 mb-1">Rate Limiting</div>
            <div className="text-[12.5px] text-slate-400">Requests are rate limited to 60 per minute per API key. Exceeding this returns a <code className="text-sky-400 bg-sky-400/10 px-1 rounded text-[11px]">429</code> status.</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Services",
    icon: Zap,
    color: "blue",
    content: null,
    endpoints: [
      {
        method: "GET" as const,
        path: "/api/catalog/services",
        desc: "List all available SMS services with pricing.",
        auth: true,
        response: {
          services: [
            { code: "telegram", name: "Telegram", price: 0.15, category: "messaging" },
            { code: "whatsapp", name: "WhatsApp", price: 0.20, category: "messaging" },
            { code: "google",   name: "Google",   price: 0.18, category: "email" },
          ]
        },
        curlExample: `curl -X GET "${BASE}/catalog/services" \\\n  -H "X-API-Key: sk_live_your_api_key_here"`,
      },
    ],
  },
  {
    title: "Countries",
    icon: Globe,
    color: "indigo",
    content: null,
    endpoints: [
      {
        method: "GET" as const,
        path: "/api/catalog/countries-for-service",
        desc: "Get available countries with live stock count for a given service.",
        auth: true,
        response: {
          countries: [
            { code: "us", name: "United States", flag: "🇺🇸", available: 4820, price: 0.15 },
            { code: "gb", name: "United Kingdom", flag: "🇬🇧", available: 1243, price: 0.18 },
            { code: "de", name: "Germany",        flag: "🇩🇪", available: 987,  price: 0.16 },
          ]
        },
        curlExample: `curl -X GET "${BASE}/catalog/countries-for-service?serviceCode=telegram" \\\n  -H "X-API-Key: sk_live_your_api_key_here"`,
      },
      {
        method: "GET" as const,
        path: "/api/catalog/availability",
        desc: "Check real-time availability and price for a specific service + country pair.",
        auth: true,
        response: {
          available: 4820,
          price: 0.15,
          estimatedWait: "instant",
          provider: { name: "SKY SMS", mode: "live" }
        },
        curlExample: `curl -X GET "${BASE}/catalog/availability?serviceCode=telegram&countryCode=us" \\\n  -H "X-API-Key: sk_live_your_api_key_here"`,
      },
    ],
  },
  {
    title: "Rentals",
    icon: Phone,
    color: "emerald",
    content: null,
    endpoints: [
      {
        method: "POST" as const,
        path: "/api/rentals",
        desc: "Create a new rental. Deducts from your balance and allocates a real phone number. The rental stays active for 20 minutes.",
        auth: true,
        body: { serviceCode: "telegram", countryCode: "us" },
        response: {
          id: "rnt_01J2K4P8",
          serviceName: "Telegram",
          countryName: "United States",
          phoneNumber: "14158675309",
          status: "active",
          price: 0.15,
          createdAt: "2026-05-04T10:30:00Z",
          expiresAt: "2026-05-04T10:50:00Z",
          messages: []
        },
        curlExample: `curl -X POST "${BASE}/rentals" \\\n  -H "X-API-Key: sk_live_your_api_key_here" \\\n  -H "Content-Type: application/json" \\\n  -d '{"serviceCode":"telegram","countryCode":"us"}'`,
      },
      {
        method: "GET" as const,
        path: "/api/rentals",
        desc: "List your rentals, paginated. Supports filtering by status.",
        auth: true,
        response: {
          rentals: [
            { id: "rnt_01J2K4P8", serviceName: "Telegram", status: "active", phoneNumber: "14158675309", createdAt: "2026-05-04T10:30:00Z" }
          ],
          total: 1,
          page: 1,
          pageSize: 20
        },
        curlExample: `curl -X GET "${BASE}/rentals?status=active&page=1&pageSize=20" \\\n  -H "X-API-Key: sk_live_your_api_key_here"`,
      },
      {
        method: "GET" as const,
        path: "/api/rentals/:id",
        desc: "Get a single rental with all received SMS messages.",
        auth: true,
        response: {
          id: "rnt_01J2K4P8",
          serviceName: "Telegram",
          countryName: "United States",
          phoneNumber: "14158675309",
          status: "sms_received",
          price: 0.15,
          messages: [{ sender: "Telegram", body: "Your code: 481624", code: "481624", receivedAt: "2026-05-04T10:32:15Z" }]
        },
        curlExample: `curl -X GET "${BASE}/rentals/rnt_01J2K4P8" \\\n  -H "X-API-Key: sk_live_your_api_key_here"`,
      },
      {
        method: "POST" as const,
        path: "/api/rentals/:id/refresh",
        desc: "Manually poll for new SMS messages on an active rental.",
        auth: true,
        response: {
          id: "rnt_01J2K4P8",
          status: "active",
          messages: []
        },
        curlExample: `curl -X POST "${BASE}/rentals/rnt_01J2K4P8/refresh" \\\n  -H "X-API-Key: sk_live_your_api_key_here"`,
      },
      {
        method: "POST" as const,
        path: "/api/rentals/:id/cancel",
        desc: "Cancel an active rental. A full refund is issued to your balance if the rental window hasn't expired.",
        auth: true,
        response: { id: "rnt_01J2K4P8", status: "cancelled", refunded: true, refundAmount: 0.15 },
        curlExample: `curl -X POST "${BASE}/rentals/rnt_01J2K4P8/cancel" \\\n  -H "X-API-Key: sk_live_your_api_key_here"`,
      },
    ],
  },
  {
    title: "Account",
    icon: MessageSquare,
    color: "violet",
    content: null,
    endpoints: [
      {
        method: "GET" as const,
        path: "/api/me",
        desc: "Get your account information including balance.",
        auth: true,
        response: {
          id: "usr_01J2K4P8",
          name: "John Doe",
          email: "john@example.com",
          credits: 12.50,
          role: "user",
          createdAt: "2026-01-15T08:00:00Z"
        },
        curlExample: `curl -X GET "${BASE}/me" \\\n  -H "X-API-Key: sk_live_your_api_key_here"`,
      },
    ],
  },
];

function EndpointCard({ ep }: { ep: Endpoint }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${open ? "border-white/[0.1] bg-gradient-to-br from-white/[0.03] to-transparent" : "border-white/[0.06] bg-transparent hover:border-white/[0.09]"}`}>
      <button
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className={`inline-flex items-center justify-center rounded-lg border px-2.5 py-1 text-[11px] font-black font-mono tracking-wider shrink-0 ${methodColors[ep.method]}`}>
          {ep.method}
        </span>
        <code className="flex-1 text-[13px] font-mono text-slate-200 truncate">{ep.path}</code>
        {ep.auth && (
          <span className="hidden sm:flex items-center gap-1 text-[10px] text-violet-400 font-semibold bg-violet-400/8 border border-violet-400/15 rounded-full px-2 py-0.5">
            <Key className="h-2.5 w-2.5" /> Auth
          </span>
        )}
        <ChevronDown className={`h-4 w-4 text-slate-600 transition-transform duration-300 shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      <div className={`faq-body ${open ? "faq-body-open" : ""}`}>
        <div className="faq-inner px-5 pb-6 border-t border-white/[0.05] pt-5 space-y-4">
          <p className="text-[13.5px] text-slate-400 leading-relaxed">{ep.desc}</p>

          {ep.body && (
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Request Body</div>
              <ResponseBlock json={ep.body} />
            </div>
          )}

          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">cURL Example</div>
            <CodeBlock lang="bash">{ep.curlExample}</CodeBlock>
          </div>

          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Response</div>
            <ResponseBlock json={ep.response} />
          </div>
        </div>
      </div>
    </div>
  );
}

const colorMap: Record<string, string> = {
  violet: "text-violet-400 bg-violet-400/10 border-violet-400/20",
  blue:   "text-sky-400 bg-sky-400/10 border-sky-400/20",
  indigo: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
  emerald:"text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
};

export default function ApiDocs() {
  const [activeSection, setActiveSection] = useState(0);

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <Reveal variant="up">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-400/20 flex items-center justify-center">
                <Code2 className="h-5 w-5 text-violet-400" />
              </div>
              <h1 className="text-[2rem] font-black tracking-tight text-white">API Reference</h1>
            </div>
            <p className="text-slate-500 text-[14px] max-w-xl">
              Automate SMS number rentals with the SKY SMS REST API. All endpoints return JSON and use API key authentication.
            </p>
          </div>
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-400/20 bg-emerald-400/8 px-4 py-2.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[12px] font-bold text-emerald-300">API Online</span>
          </div>
        </div>
      </Reveal>

      {/* Base URL */}
      <Reveal variant="up" delay={60}>
        <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.03] to-transparent p-5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Base URL</div>
          <div className="flex items-center gap-3">
            <div className="flex-1 font-mono text-[13px] text-sky-300 bg-sky-400/5 border border-sky-400/10 rounded-xl px-4 py-3 overflow-x-auto">
              {BASE}
            </div>
            <CopyButton text={BASE} />
          </div>
        </div>
      </Reveal>

      {/* Quick start */}
      <Reveal variant="up" delay={100}>
        <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
            <Terminal className="h-4 w-4 text-sky-400" />
            <div className="font-black text-white text-[15px]">Quick Start</div>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              {["1. Get your API key from Settings", "2. List available services", "3. Create a rental"].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/15 border border-sky-500/25 text-[11px] font-black text-sky-400 mt-0.5">{i + 1}</span>
                  <span className="text-[13px] text-slate-400">{step.slice(3)}</span>
                </div>
              ))}
            </div>
            <CodeBlock lang="bash">{`# 1. List services
curl "${BASE}/catalog/services" -H "X-API-Key: YOUR_KEY"

# 2. Create a rental
curl -X POST "${BASE}/rentals" \\
  -H "X-API-Key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"serviceCode":"telegram","countryCode":"us"}'

# 3. Poll for SMS
curl "${BASE}/rentals/{rental_id}" -H "X-API-Key: YOUR_KEY"`}</CodeBlock>
          </div>
        </div>
      </Reveal>

      {/* Section tabs */}
      <Reveal variant="up" delay={140}>
        <div className="flex flex-wrap gap-2">
          {sections.map((sec, i) => (
            <button
              key={sec.title}
              onClick={() => setActiveSection(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold border transition-all duration-200 ${
                activeSection === i
                  ? "bg-sky-500/15 border-sky-500/25 text-sky-300 shadow-[0_0_12px_rgba(14,165,233,0.1)]"
                  : "border-white/[0.07] text-slate-400 hover:text-white hover:border-white/[0.12] hover:bg-white/[0.04]"
              }`}
            >
              <sec.icon className="h-3.5 w-3.5" />
              {sec.title}
              {sec.endpoints.length > 0 && (
                <span className={`text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center ${activeSection === i ? "bg-sky-400/20 text-sky-300" : "bg-white/[0.06] text-slate-500"}`}>
                  {sec.endpoints.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Active section */}
      <div className="space-y-4">
        {sections[activeSection].content && (
          <Reveal variant="up">
            <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.03] to-transparent p-6">
              {sections[activeSection].content}
            </div>
          </Reveal>
        )}
        {sections[activeSection].endpoints.map((ep, i) => (
          <Reveal key={ep.path + ep.method} variant="up" delay={i * 50}>
            <EndpointCard ep={ep} />
          </Reveal>
        ))}
      </div>

      {/* Error codes */}
      <Reveal variant="up">
        <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden">
          <div className="px-6 py-5 border-b border-white/[0.06]">
            <div className="font-black text-white text-[15px]">Error Codes</div>
            <div className="text-[12px] text-slate-500 mt-0.5">Standard HTTP status codes returned by the API</div>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {[
              { code: "200", label: "OK", desc: "Request successful.", color: "emerald" },
              { code: "400", label: "Bad Request", desc: "Missing or invalid parameters in request body.", color: "amber" },
              { code: "401", label: "Unauthorized", desc: "Missing or invalid API key.", color: "rose" },
              { code: "402", label: "Payment Required", desc: "Insufficient balance to complete the rental.", color: "amber" },
              { code: "404", label: "Not Found", desc: "The requested resource does not exist.", color: "rose" },
              { code: "409", label: "Conflict", desc: "No numbers available for the selected combination.", color: "amber" },
              { code: "429", label: "Rate Limited", desc: "Too many requests. Limit: 60 req/min per API key.", color: "amber" },
              { code: "500", label: "Server Error", desc: "Internal error. Contact support if this persists.", color: "rose" },
            ].map(({ code, label, desc, color }) => (
              <div key={code} className="flex items-center gap-4 px-6 py-3.5">
                <span className={`font-mono font-black text-[13px] w-10 shrink-0 ${color === "emerald" ? "text-emerald-400" : color === "rose" ? "text-rose-400" : "text-amber-400"}`}>{code}</span>
                <span className="text-[13px] font-semibold text-white w-36 shrink-0">{label}</span>
                <span className="text-[12.5px] text-slate-500">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

    </div>
  );
}
