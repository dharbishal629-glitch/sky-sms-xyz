import { Link } from "wouter";
import { Shield, Zap, Globe, Lock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight">SMS Rentals</span>
          </div>
          <div className="flex items-center gap-4">
            <a href={`${basePath}/sign-in`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" data-testid="link-landing-login">
              Log in
            </a>
            <a href={`${basePath}/sign-up`}>
              <Button data-testid="button-landing-signup">Get Started</Button>
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-6 max-w-4xl mx-auto leading-tight">
            Fast, secure temporary verification numbers.
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Protect your privacy with disposable phone numbers from over 50 countries. Perfect for verifying accounts, testing SMS flows, and staying anonymous online.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href={`${basePath}/sign-up`}>
              <Button size="lg" className="h-14 px-8 text-lg w-full sm:w-auto group" data-testid="button-hero-cta">
                Rent a Number Now
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-6 py-4">
              View Features
            </a>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 bg-gray-50 border-t">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Why choose SMS Rentals?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">Everything you need to verify accounts without exposing your personal number.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl border shadow-sm" data-testid="card-feature-speed">
                <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Instant Delivery</h3>
                <p className="text-gray-600 leading-relaxed">Numbers are allocated instantly. Receive SMS codes in real-time as soon as they are sent by the service.</p>
              </div>

              <div className="bg-white p-8 rounded-2xl border shadow-sm" data-testid="card-feature-global">
                <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Global Coverage</h3>
                <p className="text-gray-600 leading-relaxed">Access clean, non-VoIP numbers from dozens of countries to bypass regional restrictions and blocks.</p>
              </div>

              <div className="bg-white p-8 rounded-2xl border shadow-sm" data-testid="card-feature-privacy">
                <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Total Privacy</h3>
                <p className="text-gray-600 leading-relaxed">Keep your real phone number off marketing lists, data breaches, and spam databases forever.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-bold tracking-tight">SMS Rentals</span>
          </div>
          <p className="text-sm text-gray-500">© {new Date().getFullYear()} SMS Rentals. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
