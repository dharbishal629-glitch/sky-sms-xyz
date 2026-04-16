import { Link } from "wouter";
import { Phone } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen premium-shell flex items-center justify-center px-4 text-white">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-cyan-400/10 border border-cyan-300/20 flex items-center justify-center">
          <Phone className="h-8 w-8 text-cyan-400/60" />
        </div>
        <h1 className="text-5xl font-black mb-3 text-white">Oops</h1>
        <p className="text-slate-400 text-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <span className="inline-flex items-center gap-2 rounded-full bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-300 transition-colors cursor-pointer">
            ← Back to Home
          </span>
        </Link>
      </div>
    </div>
  );
}
