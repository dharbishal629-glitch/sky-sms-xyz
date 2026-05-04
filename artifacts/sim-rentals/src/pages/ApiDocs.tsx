import { useState } from "react";
import { Code2, Key, Copy, Check, ChevronDown, Shield, Phone, MessageSquare, Globe, Zap, Lock, Terminal } from "lucide-react";
import { Reveal } from "@/components/Reveal";

const BASE = typeof window !== "undefined"
  ? `${window.location.protocol}//${window.location.host}/api`
  : "/api";

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
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
      {copied ? "Copied!" : label}
    </button>
  );
}

function JsonBlock({ json, label }: { json: object; label: string }) {
  const text = JSON.stringify(json, null, 2);
  return (
    <div>
      <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1.5">{label}</div>
      <div className="rounded-xl border border-white/[0.07] bg-[#060b18] overflow-hidden">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.05]">
          <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">json</span>
          <CopyButton text={text} />
        </div>
        <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
          <pre className="m-0 px-3.5 py-3 text-[11.5px] leading-relaxed font-mono whitespace-pre">
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
  curlArgs: string; // just the args after BASE, e.g. "/me" or "-X POST /rentals ..."
}

function EndpointCard({ ep }: { ep: Endpoint }) {
  const [open, setOpen] = useState(false);
  const curlFull = ep.method === "GET"
    ? `curl "${BASE}${ep.curlArgs}" \\\n  -H "X-API-Key: YOUR_KEY"`
    : `curl -X ${ep.method} "${BASE}${ep.curlArgs}" \\\n  -H "X-API-Key: YOUR_KEY"${ep.body ? ` \\\n  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(ep.body)}'` : ""}`;

  return (
    <div className={`rounded-xl border overflow-hidden transition-colors ${open ? "border-white/[0.1] bg-white/[0.015]" : "border-white/[0.06]"}`}>
      <button
        className="w-full flex items-center gap-2.5 px-4 py-3.5 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className={`inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-[10px] font-black font-mono tracking-wider shrink-0 ${METHOD_STYLE[ep.method]}`}>
          {ep.method}
        </span>
        <code className="flex-1 text-[12px] font-mono text-slate-200 min-w-0 break-all leading-snug">{ep.path}</code>
        <ChevronDown className={`h-4 w-4 text-slate-600 transition-transform duration-200 shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="border-t border-white/[0.05] px-4 pb-5 pt-4 space-y-4">
          <p className="text-[12.5px] text-slate-400 leading-relaxed">{ep.desc}</p>
          {ep.body && <JsonBlock json={ep.body} label="PAYLOAD" />}
          <JsonBlock json={ep.response} label="RESPONSE" />
          <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
            <div className="flex items-center gap-1.5">
              <Terminal className="h-3 w-3 text-slate-600" />
              <span className="text-[11px] text-slate-600">cURL command</span>
            </div>
            <CopyButton text={curlFull} label="Copy cURL" />
          </div>
        </div>
      )}
    </div>
  );
}

const sections = [
  {
    title: "Auth",
    icon: Key,
    endpoints: [] as Endpoint[],
    content: (
      <div className="space-y-4 text-[12.5px] text-slate-400 leading-relaxed">
        <p>
          All API requests require an API key in the{" "}
          <code className="text-sky-300 bg-sky-400/8 px-1.5 py-0.5 rounded text-[11px] font-mono">X-API-Key</code>{" "}
          header.
        </p>
        <p>
          Generate your key in <span className="text-white font-semibold">Settings → API Keys</span>. Never expose it in client-side code.
        </p>
        <div className="rounded-xl border border-amber-400/15 bg-amber-400/5 p-3.5 flex gap-3">
          <Shield className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-[12.5px] font-semibold text-amber-200 mb-0.5">Rate Limit</div>
            <div className="text-[12px]">
              60 requests/minute per key. Exceeding returns{" "}
              <code className="text-sky-300 bg-sky-400/8 px-1 rounded text-[11px]">429</code>.
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Services",
    icon: Zap,
    content: null,
    endpoints: [
      {
        method: "GET" as const,
        path: "/api/catalog/services",
        desc: "List all available SMS services with pricing.",
        response: { services: [{ code: "telegram", name: "Telegram", price: 0.15, category: "messaging" }] },
        curlArgs: "/catalog/services",
      },
    ],
  },
  {
    title: "Countries",
    icon: Globe,
    content: null,
    endpoints: [
      {
        method: "GET" as const,
        path: "/api/catalog/countries-for-service",
        desc: "Available countries with live stock for a service.",
        response: { countries: [{ code: "us", name: "United States", available: 4820, price: 0.15 }] },
        curlArgs: "/catalog/countries-for-service?serviceCode=telegram",
      },
      {
        method: "GET" as const,
        path: "/api/catalog/availability",
        desc: "Real-time availability and price for a service + country.",
        response: { available: 4820, price: 0.15, estimatedWait: "instant" },
        curlArgs: "/catalog/availability?serviceCode=telegram&countryCode=us",
      },
    ],
  },
  {
    title: "Rentals",
    icon: Phone,
    content: null,
    endpoints: [
      {
        method: "POST" as const,
        path: "/api/rentals",
        desc: "Create a rental. Deducts balance and allocates a real phone number. Active for 20 minutes.",
        body: { serviceCode: "telegram", countryCode: "us" },
        response: { id: "rnt_01J2K4P8", serviceName: "Telegram", phoneNumber: "14158675309", status: "active", price: 0.15, expiresAt: "2026-05-04T10:50:00Z" },
        curlArgs: "/rentals",
      },
      {
        method: "GET" as const,
        path: "/api/rentals",
        desc: "List your rentals, paginated. Filter by status.",
        response: { rentals: [{ id: "rnt_01J2K4P8", serviceName: "Telegram", status: "active" }], total: 1 },
        curlArgs: "/rentals?status=active&page=1",
      },
      {
        method: "GET" as const,
        path: "/api/rentals/:id",
        desc: "Get a rental with all received SMS messages.",
        response: { id: "rnt_01J2K4P8", status: "sms_received", messages: [{ body: "Your code: 481624", code: "481624" }] },
        curlArgs: "/rentals/rnt_01J2K4P8",
      },
      {
        method: "POST" as const,
        path: "/api/rentals/:id/refresh",
        desc: "Manually poll for new SMS messages on an active rental.",
        response: { id: "rnt_01J2K4P8", status: "active", messages: [] },
        curlArgs: "/rentals/rnt_01J2K4P8/refresh",
      },
      {
        method: "POST" as const,
        path: "/api/rentals/:id/cancel",
        desc: "Cancel an active rental. Full refund if window hasn't expired.",
        response: { id: "rnt_01J2K4P8", status: "cancelled", refunded: true, refundAmount: 0.15 },
        curlArgs: "/rentals/rnt_01J2K4P8/cancel",
      },
    ],
  },
  {
    title: "Account",
    icon: MessageSquare,
    content: null,
    endpoints: [
      {
        method: "GET" as const,
        path: "/api/me",
        desc: "Get your account information and balance.",
        response: { id: "usr_01J2K4P8", name: "John Doe", email: "john@example.com", credits: 12.50, role: "user" },
        curlArgs: "/me",
      },
    ],
  },
];

export default function ApiDocs() {
  const [activeSection, setActiveSection] = useState(0);

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-8">

      {/* Header */}
      <Reveal variant="up">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="h-8 w-8 rounded-xl bg-violet-500/10 border border-violet-400/18 flex items-center justify-center shrink-0">
                <Code2 className="h-4 w-4 text-violet-400" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white">API Reference</h1>
            </div>
            <p className="text-slate-500 text-[12.5px]">SKY SMS REST API. All endpoints return JSON.</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-emerald-400/18 bg-emerald-400/6 px-3 py-2 shrink-0">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            <span className="text-[11px] font-semibold text-emerald-300">Online</span>
          </div>
        </div>
      </Reveal>

      {/* Auth notice */}
      <Reveal variant="up" delay={30}>
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 flex gap-3">
          <Lock className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
          <div className="text-[12.5px] text-slate-400 leading-relaxed">
            All endpoints require an{" "}
            <code className="text-sky-300 bg-sky-400/8 px-1.5 py-0.5 rounded text-[11px] font-mono">X-API-Key</code>{" "}
            header. Generate your key in{" "}
            <span className="text-white font-semibold">Settings → API Keys</span>.
            <div className="mt-2 flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <span className="text-[11px] text-slate-600 font-mono">Base URL</span>
              <div className="flex items-center gap-2 min-w-0 ml-3">
                <span className="text-[11px] text-sky-400 font-mono truncate">{BASE}</span>
                <CopyButton text={BASE} />
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Section tabs */}
      <Reveal variant="up" delay={60}>
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}>
          {sections.map((sec, i) => (
            <button
              key={sec.title}
              onClick={() => setActiveSection(i)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11.5px] font-semibold border transition-colors whitespace-nowrap shrink-0 ${
                activeSection === i
                  ? "bg-sky-500/12 border-sky-500/22 text-sky-300"
                  : "border-white/[0.07] text-slate-400 hover:text-white hover:border-white/[0.1] hover:bg-white/[0.03]"
              }`}
            >
              <sec.icon className="h-3.5 w-3.5 shrink-0" />
              {sec.title}
              {sec.endpoints.length > 0 && (
                <span className={`text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shrink-0 ${activeSection === i ? "bg-sky-400/18 text-sky-300" : "bg-white/[0.05] text-slate-600"}`}>
                  {sec.endpoints.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Section content */}
      <div className="space-y-2">
        {sections[activeSection].content && (
          <Reveal variant="up">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
              {sections[activeSection].content}
            </div>
          </Reveal>
        )}
        {sections[activeSection].endpoints.map((ep, i) => (
          <Reveal key={ep.path + ep.method} variant="up" delay={i * 40}>
            <EndpointCard ep={ep} />
          </Reveal>
        ))}
      </div>

      {/* Error codes */}
      <Reveal variant="up">
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/[0.05]">
            <div className="font-semibold text-white text-[13px]">Error Codes</div>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {[
              { code: "200", label: "OK",               desc: "Success.",                        color: "emerald" },
              { code: "400", label: "Bad Request",      desc: "Missing or invalid parameters.",  color: "amber" },
              { code: "401", label: "Unauthorized",     desc: "Invalid or missing API key.",     color: "rose" },
              { code: "402", label: "Payment Required", desc: "Insufficient balance.",            color: "amber" },
              { code: "404", label: "Not Found",        desc: "Resource does not exist.",        color: "rose" },
              { code: "409", label: "Conflict",         desc: "No numbers available.",           color: "amber" },
              { code: "429", label: "Rate Limited",     desc: "Limit: 60 req/min.",              color: "amber" },
              { code: "500", label: "Server Error",     desc: "Contact support.",                color: "rose" },
            ].map(({ code, label, desc, color }) => (
              <div key={code} className="flex items-center gap-3 px-4 py-2.5">
                <span className={`font-mono font-bold text-[12px] w-9 shrink-0 ${color === "emerald" ? "text-emerald-400" : color === "rose" ? "text-rose-400" : "text-amber-400"}`}>{code}</span>
                <span className="text-[11.5px] font-semibold text-white w-24 shrink-0">{label}</span>
                <span className="text-[11px] text-slate-500">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

    </div>
  );
}
