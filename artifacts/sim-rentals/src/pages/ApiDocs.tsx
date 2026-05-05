import { useState } from "react";
import { Copy, Check } from "lucide-react";

const BASE = typeof window !== "undefined"
  ? `${window.location.protocol}//${window.location.host}/api`
  : "/api";

/* ── exact DraxonMails CSS vars ── */
const C = {
  bg:       "#080b0e",
  bg2:      "#0c1015",
  surface:  "#101419",
  panel:    "#141b22",
  panelHi:  "#192028",
  accent:   "#1de9b6",
  accentDim:"rgba(29,233,182,0.10)",
  border:   "rgba(255,255,255,0.07)",
  borderHi: "rgba(255,255,255,0.11)",
  textMid:  "#9ca3af",
  text:     "#e2e8f0",
  code:     "#d1d5db",
  preBg:    "#0b0e14",
};

/* ── sections for sidebar ── */
const NAV = [
  { id: "overview",  label: "Overview" },
  { id: "services",  label: "Services" },
  { id: "countries", label: "Countries" },
  { id: "rentals",   label: "Rentals" },
  { id: "account",   label: "Account" },
  { id: "errors",    label: "Error Codes" },
];

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text.replace(/\$BASE_URL/g, BASE));
        setOk(true);
        setTimeout(() => setOk(false), 2000);
      }}
      style={{
        marginLeft: "auto",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontSize: ".72rem",
        fontWeight: 600,
        color: ok ? C.accent : C.textMid,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "2px 6px",
        borderRadius: 6,
        transition: "color .15s",
      }}
    >
      {ok ? <Check size={12} /> : <Copy size={12} />}
      {ok ? "Copied" : "Copy"}
    </button>
  );
}

/* pre that scrolls horizontally — exact DraxonMails style */
function Pre({ children, copyText }: { children: React.ReactNode; copyText?: string }) {
  return (
    <div style={{ position: "relative" }}>
      {copyText && (
        <div style={{
          position: "absolute", top: 10, right: 12, zIndex: 2,
        }}>
          <CopyBtn text={copyText} />
        </div>
      )}
      <pre style={{
        background: C.preBg,
        padding: "18px",
        borderRadius: 14,
        border: `1px solid ${C.borderHi}`,
        margin: "12px 0 18px",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: ".82rem",
        lineHeight: 1.6,
        color: C.code,
        whiteSpace: "pre",
      }}>
        {children}
      </pre>
    </div>
  );
}

function Label({ children }: { children: string }) {
  return (
    <div style={{
      fontSize: ".65rem",
      fontWeight: 800,
      color: C.textMid,
      textTransform: "uppercase",
      letterSpacing: "0.12em",
      marginBottom: 0,
      marginTop: 4,
    }}>
      {children}
    </div>
  );
}

function Method({ m }: { m: "GET"|"POST"|"DELETE"|"PATCH" }) {
  const colors: Record<string, string> = {
    GET:    "#1de9b6",
    POST:   "#facc15",
    DELETE: "#f87171",
    PATCH:  "#fb923c",
  };
  const bgs: Record<string, string> = {
    GET:    "rgba(29,233,182,0.12)",
    POST:   "rgba(250,204,21,0.12)",
    DELETE: "rgba(248,113,113,0.12)",
    PATCH:  "rgba(251,146,60,0.12)",
  };
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2px 10px",
      borderRadius: 8,
      fontSize: ".78rem",
      fontWeight: 800,
      fontFamily: "monospace",
      letterSpacing: ".04em",
      color: colors[m],
      background: bgs[m],
      flexShrink: 0,
    }}>{m}</span>
  );
}

function Endpoint({
  method, path, note, payload, response, curl,
}: {
  method: "GET"|"POST"|"DELETE"|"PATCH";
  path: string;
  note: string;
  payload?: string;
  response: string;
  curl: string;
}) {
  return (
    <>
      {/* method + path row — exact .endpoint style */}
      <div style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        background: C.bg2,
        border: `1px solid ${C.borderHi}`,
        borderRadius: 12,
        padding: 14,
        margin: "12px 0",
        fontFamily: "'JetBrains Mono', monospace",
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
        whiteSpace: "nowrap",
      }}>
        <Method m={method} />
        <span style={{ fontSize: ".84rem", color: C.accent, fontFamily: "monospace" }}>{path}</span>
      </div>

      {/* note */}
      <div style={{ fontSize: ".9rem", color: C.textMid, margin: "8px 0 14px" }}>{note}</div>

      {/* payload */}
      <Label>Payload</Label>
      <Pre copyText={payload ?? "No request body."}>
        {payload ?? "No request body."}
      </Pre>

      {/* response */}
      <Label>Response</Label>
      <Pre copyText={response}>{response}</Pre>

      {/* curl */}
      <Label>cURL</Label>
      <Pre copyText={curl}>{curl}</Pre>
    </>
  );
}

/* ── endpoint data ── */
const SECTIONS = [
  {
    id: "services",
    title: "Services",
    endpoints: [
      {
        method: "GET" as const,
        path: "/api/catalog/services",
        note: "Returns all available SMS services with pricing and categories.",
        response: JSON.stringify({ services: [{ code: "telegram", name: "Telegram", price: 0.15, category: "messaging" }] }, null, 2),
        curl: `curl "$BASE_URL/catalog/services" \\\n  -H "X-API-Key: YOUR_KEY"`,
      },
    ],
  },
  {
    id: "countries",
    title: "Countries",
    endpoints: [
      {
        method: "GET" as const,
        path: "/api/catalog/countries-for-service",
        note: "Returns available countries with live stock for a given service.",
        response: JSON.stringify({ countries: [{ code: "us", name: "United States", available: 4820, price: 0.15 }] }, null, 2),
        curl: `curl "$BASE_URL/catalog/countries-for-service?serviceCode=telegram" \\\n  -H "X-API-Key: YOUR_KEY"`,
      },
      {
        method: "GET" as const,
        path: "/api/catalog/availability",
        note: "Real-time availability and price for a service + country combination.",
        response: JSON.stringify({ available: 4820, price: 0.15, estimatedWait: "instant" }, null, 2),
        curl: `curl "$BASE_URL/catalog/availability?serviceCode=telegram&countryCode=us" \\\n  -H "X-API-Key: YOUR_KEY"`,
      },
    ],
  },
  {
    id: "rentals",
    title: "Rentals",
    endpoints: [
      {
        method: "POST" as const,
        path: "/api/rentals",
        note: "Create a rental. Deducts balance and allocates a phone number. Active for 20 minutes.",
        payload: JSON.stringify({ serviceCode: "telegram", countryCode: "us" }, null, 2),
        response: JSON.stringify({ id: "rnt_01J2K4P8", serviceName: "Telegram", phoneNumber: "14158675309", status: "active", price: 0.15, expiresAt: "2026-05-04T10:50:00Z" }, null, 2),
        curl: `curl -X POST "$BASE_URL/rentals" \\\n  -H "X-API-Key: YOUR_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"serviceCode":"telegram","countryCode":"us"}'`,
      },
      {
        method: "GET" as const,
        path: "/api/rentals",
        note: "List your rentals, paginated. Filter by status: active, expired, cancelled.",
        response: JSON.stringify({ rentals: [{ id: "rnt_01J2K4P8", serviceName: "Telegram", status: "active" }], total: 1 }, null, 2),
        curl: `curl "$BASE_URL/rentals?status=active&page=1" \\\n  -H "X-API-Key: YOUR_KEY"`,
      },
      {
        method: "GET" as const,
        path: "/api/rentals/:id",
        note: "Get a single rental with all received SMS messages.",
        response: JSON.stringify({ id: "rnt_01J2K4P8", status: "sms_received", messages: [{ body: "Your code: 481624", code: "481624" }] }, null, 2),
        curl: `curl "$BASE_URL/rentals/rnt_01J2K4P8" \\\n  -H "X-API-Key: YOUR_KEY"`,
      },
      {
        method: "POST" as const,
        path: "/api/rentals/:id/refresh",
        note: "Manually poll for new SMS messages on an active rental.",
        response: JSON.stringify({ id: "rnt_01J2K4P8", status: "active", messages: [] }, null, 2),
        curl: `curl -X POST "$BASE_URL/rentals/rnt_01J2K4P8/refresh" \\\n  -H "X-API-Key: YOUR_KEY"`,
      },
      {
        method: "POST" as const,
        path: "/api/rentals/:id/cancel",
        note: "Cancel an active rental. Full refund if cancelled within the free window.",
        response: JSON.stringify({ id: "rnt_01J2K4P8", status: "cancelled", refunded: true, refundAmount: 0.15 }, null, 2),
        curl: `curl -X POST "$BASE_URL/rentals/rnt_01J2K4P8/cancel" \\\n  -H "X-API-Key: YOUR_KEY"`,
      },
    ],
  },
  {
    id: "account",
    title: "Account",
    endpoints: [
      {
        method: "GET" as const,
        path: "/api/me",
        note: "Returns your account information, balance, and current role.",
        response: JSON.stringify({ id: "usr_01J2K4P8", name: "John Doe", email: "john@example.com", credits: 12.50, role: "user" }, null, 2),
        curl: `curl "$BASE_URL/me" \\\n  -H "X-API-Key: YOUR_KEY"`,
      },
    ],
  },
];

const ERROR_ROWS = [
  { code: "200", label: "OK",               color: "#1de9b6", desc: "Success." },
  { code: "400", label: "Bad Request",      color: "#fb923c", desc: "Missing or invalid parameters." },
  { code: "401", label: "Unauthorized",     color: "#f87171", desc: "Invalid or missing API key." },
  { code: "402", label: "Payment Required", color: "#fb923c", desc: "Insufficient balance." },
  { code: "404", label: "Not Found",        color: "#f87171", desc: "Resource does not exist." },
  { code: "409", label: "Conflict",         color: "#fb923c", desc: "No numbers available right now." },
  { code: "429", label: "Rate Limited",     color: "#fb923c", desc: "60 requests per minute limit exceeded." },
  { code: "500", label: "Server Error",     color: "#f87171", desc: "Internal error — contact support." },
];

export default function ApiDocs() {
  const [active, setActive] = useState("overview");

  return (
    /* docs-app grid — sidebar hidden on mobile */
    <div style={{
      display: "grid",
      gridTemplateColumns: "200px 1fr",
      minHeight: "calc(100vh - 56px)",
      gap: 0,
    }}
      className="docs-app-grid"
    >
      {/* ── sidebar ── */}
      <aside style={{
        background: C.bg,
        borderRight: `1px solid ${C.border}`,
        padding: 20,
        position: "sticky",
        top: 56,
        height: "calc(100vh - 56px)",
        overflowY: "auto",
      }}
        className="docs-sidebar"
      >
        {NAV.map(n => (
          <a
            key={n.id}
            href={`#${n.id}`}
            onClick={() => setActive(n.id)}
            style={{
              display: "block",
              padding: "9px 12px",
              borderRadius: 8,
              color: active === n.id ? C.accent : C.textMid,
              background: active === n.id ? C.accentDim : "none",
              textDecoration: "none",
              fontSize: ".84rem",
              fontWeight: active === n.id ? 600 : 400,
              marginBottom: 2,
              transition: "all .15s",
            }}
          >
            {n.label}
          </a>
        ))}
      </aside>

      {/* ── viewer ── */}
      <main style={{
        padding: 34,
        overflowX: "hidden",
      }}
        className="docs-viewer"
      >

        {/* Overview panel */}
        <section id="overview" style={{
          background: C.panel,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 22,
          marginBottom: 20,
        }}>
          <div style={{ fontSize: ".65rem", fontWeight: 800, color: C.accent, textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 10 }}>
            Public API
          </div>
          <h1 style={{ fontSize: "2.45rem", fontWeight: 900, color: C.text, margin: "0 0 12px", lineHeight: 1.15 }}>
            SKY SMS API Docs
          </h1>
          <p style={{ fontSize: ".9rem", color: C.textMid, margin: "0 0 16px" }}>
            This page documents the full SKY SMS REST API. All endpoints return JSON.
          </p>
          <ul style={{ margin: "0 0 16px", padding: "0 0 0 4px", listStyle: "none" }}>
            {[
              ["Number rental", "for allocating temporary phone numbers."],
              ["SMS polling", "to receive verification codes in real time."],
              ["Service catalog", "listing all supported apps and countries."],
              ["Account management", "for balance and API key operations."],
            ].map(([bold, rest]) => (
              <li key={bold} style={{ fontSize: ".9rem", color: C.textMid, marginBottom: 6, paddingLeft: 4 }}>
                <span style={{ color: C.accent, fontWeight: 600 }}>{bold}</span>{" "}{rest}
              </li>
            ))}
          </ul>
          <div style={{
            background: C.bg2,
            border: `1px solid ${C.borderHi}`,
            borderRadius: 12,
            padding: "12px 16px",
            fontSize: ".84rem",
            color: C.textMid,
            lineHeight: 1.6,
          }}>
            <strong style={{ color: C.text }}>Authentication:</strong> Every request requires an{" "}
            <code style={{ background: C.preBg, padding: "1px 6px", borderRadius: 5, fontFamily: "monospace", fontSize: ".82rem", color: C.accent }}>X-API-Key</code>{" "}
            header. Generate yours in <strong style={{ color: C.text }}>Settings → API Keys</strong>.
            <br />
            <strong style={{ color: C.text }}>Rate limit:</strong> 60 requests / minute. Exceeding returns{" "}
            <code style={{ background: C.preBg, padding: "1px 6px", borderRadius: 5, fontFamily: "monospace", fontSize: ".82rem", color: "#fb923c" }}>429</code>.
            <br />
            <strong style={{ color: C.text }}>Base URL:</strong>{" "}
            <code style={{ background: C.preBg, padding: "1px 6px", borderRadius: 5, fontFamily: "monospace", fontSize: ".82rem", color: C.accent }}>{BASE}</code>
          </div>
        </section>

        {/* Endpoint sections */}
        {SECTIONS.map(sec => (
          <section key={sec.id} id={sec.id} style={{
            background: C.panel,
            border: `1px solid ${C.border}`,
            borderRadius: 16,
            padding: 22,
            marginBottom: 20,
          }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: C.text, margin: "0 0 4px" }}>
              {sec.title}
            </h2>
            {sec.endpoints.map((ep, i) => (
              <div key={i} style={{ borderTop: i > 0 ? `1px solid ${C.border}` : "none", paddingTop: i > 0 ? 20 : 0, marginTop: i > 0 ? 20 : 0 }}>
                <Endpoint {...ep} />
              </div>
            ))}
          </section>
        ))}

        {/* Error codes */}
        <section id="errors" style={{
          background: C.panel,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: 22,
          marginBottom: 20,
        }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: C.text, margin: "0 0 16px" }}>
            Error Codes
          </h2>
          <div style={{ borderRadius: 12, border: `1px solid ${C.borderHi}`, overflow: "hidden" }}>
            {ERROR_ROWS.map((row, i) => (
              <div key={row.code} style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "11px 16px",
                borderTop: i > 0 ? `1px solid ${C.border}` : "none",
                background: i % 2 === 0 ? C.bg2 : C.surface,
              }}>
                <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: ".84rem", color: row.color, width: 36, flexShrink: 0 }}>{row.code}</span>
                <span style={{ fontSize: ".84rem", fontWeight: 600, color: C.text, width: 130, flexShrink: 0 }}>{row.label}</span>
                <span style={{ fontSize: ".82rem", color: C.textMid }}>{row.desc}</span>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* mobile: hide sidebar, reduce padding */}
      <style>{`
        @media (max-width: 900px) {
          .docs-app-grid { grid-template-columns: 1fr !important; }
          .docs-sidebar { display: none !important; }
          .docs-viewer { padding: 16px !important; }
        }
      `}</style>
    </div>
  );
}
