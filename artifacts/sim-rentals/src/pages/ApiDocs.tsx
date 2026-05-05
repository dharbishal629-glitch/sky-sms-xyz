import { useState } from "react";
import { Code2, Key, Copy, Check, Shield, Phone, MessageSquare, Globe, Zap, Lock, MoreVertical } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const BASE = typeof window !== "undefined"
  ? `${window.location.protocol}//${window.location.host}/api`
  : "/api";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async (e) => {
        e.stopPropagation();
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-white transition-colors rounded px-1.5 py-0.5 hover:bg-white/[0.06] shrink-0"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function CodeBlock({ children, lang = "bash" }: { children: string; lang?: string }) {
  const content = children.trim();
  return (
    <div className="w-full overflow-hidden" style={{
      display: "grid",
      gridTemplateColumns: "100%",
      borderRadius: "0.75rem",
      border: "1px solid rgba(255,255,255,0.07)",
      background: "#060b18",
    }}>
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.05]">
        <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">{lang}</span>
        <CopyButton text={content.replace(/\$BASE_URL/g, BASE)} />
      </div>
      <div className="overflow-x-auto w-full custom-scrollbar" style={{ WebkitOverflowScrolling: "touch" }}>
        <pre style={{ 
          margin: 0, 
          padding: "0.875rem", 
          fontSize: "11px", 
          lineHeight: "1.65", 
          fontFamily: "'JetBrains Mono', monospace", 
          color: "#cbd5e1", 
          whiteSpace: "pre", 
          display: "block",
          minWidth: "min-content" 
        }}>
          <code>{content}</code>
        </pre>
      </div>
    </div>
  );
}

function JsonBlock({ json, label }: { json: object; label: string }) {
  const text = JSON.stringify(json, null, 2);
  return (
    <div className="w-full overflow-hidden">
      <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">{label}</div>
      <div className="w-full" style={{
        display: "grid",
        gridTemplateColumns: "100%",
        borderRadius: "0.75rem",
        border: "1px solid rgba(255,255,255,0.07)",
        background: "#060b18",
      }}>
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.05]">
          <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">json</span>
          <CopyButton text={text} />
        </div>
        <div className="overflow-x-auto w-full custom-scrollbar" style={{ WebkitOverflowScrolling: "touch" }}>
          <pre style={{ 
            margin: 0, 
            padding: "0.875rem", 
            fontSize: "11px", 
            lineHeight: "1.65", 
            fontFamily: "'JetBrains Mono', monospace", 
            whiteSpace: "pre", 
            display: "block",
            minWidth: "min-content"
          }}>
            <code>
              {text.split("\n").map((line, i) => {
                const km = line.match(/^(\s*)"([^"]+)":/);
                if (km) {
                  const rest = line.slice(km[0].length);
                  return (
                    <span key={i}>
                      {km[1]}<span className="text-sky-400">"{km[2]}"</span>:
                      {rest.includes('"')
                        ? <span className="text-emerald-400">{rest}</span>
                        : rest.match(/: ?(true|false|null|-?\d)/)
                          ? <span className="text-pink-400">{rest}</span>
                          : <span className="text-slate-300">{rest}</span>}
                      {"\n"}
                    </span>
                  );
                }
                return <span key={i} className="text-slate-300">{line}{"\n"}</span>;
              })}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

const METHOD_STYLE: Record<string, string> = {
  GET:    "text-sky-400 bg-sky-400/10 border-sky-400/20",
  POST:   "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  DELETE: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  PATCH:  "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

interface Endpoint {
  method: "GET" | "POST" | "DELETE" | "PATCH";
  path: string;
  desc: string;
  body?: object;
  response: object;
  curl: string;
}

function EndpointCard({ ep }: { ep: Endpoint }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.01] overflow-hidden w-full">
      <div className="px-4 py-3.5 border-b border-white/[0.05]">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-[10px] font-black font-mono tracking-wider shrink-0 ${METHOD_STYLE[ep.method]}`}>
              {ep.method}
            </span>
            <code className="text-[12px] font-mono text-slate-200 truncate leading-snug">{ep.path}</code>
          </div>
          <button className="text-slate-600 hover:text-slate-400 transition-colors">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[12px] text-slate-500 leading-relaxed">{ep.desc}</p>
      </div>
      <div className="px-4 pb-4 pt-3.5 space-y-3.5">
        {ep.body && <JsonBlock json={ep.body} label="PAYLOAD" />}
        <JsonBlock json={ep.response} label="RESPONSE" />
        <CodeBlock lang="bash">{ep.curl}</CodeBlock>
      </div>
    </div>
  );
}

interface Section {
  title: string;
  icon: React.ElementType;
  endpoints: Endpoint[];
}

const sections: Section[] = [
  {
    title: "Services",
    icon: Zap,
    endpoints: [
      {
        method: "GET",
        path: "/api/catalog/services",
        desc: "List all available SMS services with pricing.",
        response: { services: [{ code: "telegram", name: "Telegram", price: 0.15, category: "messaging" }] },
        curl: `curl "$BASE_URL/catalog/services" \\\n  -H "X-API-Key: YOUR_KEY"`,
      },
    ],
  },
  {
    title: "Countries",
    icon: Globe,
    endpoints: [
      {
        method: "GET",
        path: "/api/catalog/countries-for-service",
        desc: "Available countries with live stock for a service.",
        response: { countries: [{ code: "us", name: "United States", available: 4820, price: 0.15 }] },
        curl: `curl "$BASE_URL/catalog/countries-for-service?serviceCode=telegram" \\\n  -H "X-API-Key: YOUR_KEY"`,
      },
      {
        method: "GET",
        path: "/api/catalog/availability",
        desc: "Real-time availability and price for a service + country.",
        response: { available: 4820, price: 0.15, estimatedWait: "instant" },
        curl: `curl "$BASE_URL/catalog/availability?serviceCode=telegram&countryCode=us" \\\n  -H "X-API-Key: YOUR_KEY"`,
      },
    ],
  },
  {
    title: "Rentals",
    icon: Phone,
    endpoints: [
      {
        method: "POST",
        path: "/api/rentals",
        desc: "Create a rental. Deducts balance and allocates a phone number. Active for 20 minutes.",
        body: { serviceCode: "telegram", countryCode: "us" },
        response: { id: "rnt_01J2K4P8", serviceName: "Telegram", phoneNumber: "14158675309", status: "active", price: 0.15, expiresAt: "2026-05-04T10:50:00Z" },
        curl: `curl -X POST "$BASE_URL/rentals" \\\n  -H "X-API-Key: YOUR_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"serviceCode":"telegram","countryCode":"us"}'`,
      },
      {
        method: "GET",
        path: "/api/rentals",
        desc: "List your rentals, paginated. Filter by status.",
        response: { rentals: [{ id: "rnt_01J2K4P8", serviceName: "Telegram", status: "active" }], total: 1 },
        curl: `curl "$BASE_URL/rentals?status=active&page=1" \\\n  -H "X-API-Key: YOUR_KEY"`,
      },
      {
        method: "GET",
        path: "/api/rentals/:id",
        desc: "Get a rental with all received SMS messages.",
        response: { id: "rnt_01J2K4P8", status: "sms_received", messages: [{ body: "Your code: 481624", code: "481624" }] },
        curl: `curl "$BASE_URL/rentals/rnt_01J2K4P8" \\\n  -H "X-API-Key: YOUR_KEY"`,
      },
      {
        method: "POST",
        path: "/api/rentals/:id/refresh",
        desc: "Manually poll for new SMS messages on an active rental.",
        response: { id: "rnt_01J2K4P8", status: "active", messages: [] },
        curl: `curl -X POST "$BASE_URL/rentals/rnt_01J2K4P8/refresh" \\\n  -H "X-API-Key: YOUR_KEY"`,
      },
      {
        method: "POST",
        path: "/api/rentals/:id/cancel",
        desc: "Cancel an active rental. Full refund if window hasn't expired.",
        response: { id: "rnt_01J2K4P8", status: "cancelled", refunded: true, refundAmount: 0.15 },
        curl: `curl -X POST "$BASE_URL/rentals/rnt_01J2K4P8/cancel" \\\n  -H "X-API-Key: YOUR_KEY"`,
      },
    ],
  },
  {
    title: "Account",
    icon: MessageSquare,
    endpoints: [
      {
        method: "GET",
        path: "/api/me",
        desc: "Get your account information and current balance.",
        response: { id: "usr_01J2K4P8", name: "John Doe", email: "john@example.com", credits: 12.50, role: "user" },
        curl: `curl "$BASE_URL/me" \\\n  -H "X-API-Key: YOUR_KEY"`,
      },
    ],
  },
];

export default function ApiDocs() {
  return (
    <div className="max-w-full md:max-w-3xl mx-auto space-y-6 pb-8 px-4 overflow-x-hidden">

      {/* Header */}
      <Reveal variant="up">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-400/18 flex items-center justify-center shrink-0">
                <Code2 className="h-4 w-4 text-violet-400" />
              </div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white truncate">API Reference</h1>
            </div>
            <p className="text-slate-500 text-[11px] md:text-[12.5px]">SKY SMS REST API · All endpoints return JSON.</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-emerald-400/18 bg-emerald-400/6 px-3 py-2 shrink-0 self-center">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            <span className="text-[11px] font-semibold text-emerald-300">Online</span>
          </div>
        </div>
      </Reveal>

      {/* Auth + Base URL */}
      <Reveal variant="up" delay={30}>
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 space-y-3">
          <div className="flex gap-2.5">
            <Lock className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
            <div className="text-[12px] text-slate-400 leading-relaxed">
              All requests need an{" "}
              <code className="text-sky-300 bg-sky-400/8 px-1.5 py-0.5 rounded text-[11px] font-mono">X-API-Key</code>{" "}
              header. Generate yours in{" "}
              <span className="text-white font-semibold">Settings → API Keys</span>.
            </div>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 flex items-center justify-between gap-2 min-w-0">
            <div className="min-w-0">
              <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">Base URL</div>
              <div className="font-mono text-[11px] text-sky-400 truncate">{BASE}</div>
            </div>
            <CopyButton text={BASE} />
          </div>
          <div className="rounded-xl border border-amber-400/15 bg-amber-400/5 p-3 flex gap-2.5">
            <Shield className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span className="text-[11px] text-slate-400">
              <span className="text-amber-200 font-semibold">Rate limit:</span> 60 req/min. Returns{" "}
              <code className="text-sky-300 bg-sky-400/8 px-1 rounded text-[10px]">429</code> when exceeded.
            </span>
          </div>
        </div>
      </Reveal>

      {/* All sections */}
      {sections.map((sec, si) => (
        <Reveal key={sec.title} variant="up" delay={si * 30}>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <sec.icon className="h-3.5 w-3.5 text-slate-500" />
              <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{sec.title}</h2>
            </div>
            <div className="space-y-3">
              {sec.endpoints.map((ep) => (
                <EndpointCard key={ep.method + ep.path} ep={ep} />
              ))}
            </div>
          </div>
        </Reveal>
      ))}

      {/* Error codes */}
      <Reveal variant="up">
        <div className="space-y-3">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Error Codes</h2>
          <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden overflow-x-auto custom-scrollbar">
            <div className="divide-y divide-white/[0.04] min-w-[300px]">
              {[
                { code: "200", label: "OK",               desc: "Success.",                       color: "emerald" },
                { code: "400", label: "Bad Request",      desc: "Missing/invalid parameters.",    color: "amber" },
                { code: "401", label: "Unauthorized",     desc: "Invalid/missing API key.",       color: "rose" },
                { code: "402", label: "Payment Required", desc: "Insufficient balance.",           color: "amber" },
                { code: "404", label: "Not Found",        desc: "Resource does not exist.",       color: "rose" },
                { code: "409", label: "Conflict",         desc: "No numbers available.",          color: "amber" },
                { code: "429", label: "Rate Limited",     desc: "Limit: 60 req/min.",             color: "amber" },
                { code: "500", label: "Server Error",     desc: "Contact support.",               color: "rose" },
              ].map(({ code, label, desc, color }) => (
                <div key={code} className="flex items-center gap-3 px-4 py-2.5">
                  <span className={`font-mono font-bold text-[12px] w-9 shrink-0 ${color === "emerald" ? "text-emerald-400" : color === "rose" ? "text-rose-400" : "text-amber-400"}`}>{code}</span>
                  <span className="text-[11.5px] font-semibold text-white w-28 shrink-0">{label}</span>
                  <span className="text-[11px] text-slate-500">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Global CSS for scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>

    </div>
  );
}
