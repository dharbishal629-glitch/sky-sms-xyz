import { useState } from "react";
import { useListServices, useGetAvailability, useCreateRental, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Loader2, Globe, Server, CheckCircle2, AlertCircle, Zap, ArrowRight, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchableSelect } from "@/components/SearchableSelect";
import { useToast } from "@/hooks/use-toast";
import { Reveal } from "@/components/Reveal";

interface LiveCountry {
  code: string;
  name: string;
  flag: string;
  available: number;
  heroPrice: number;
  price: number;
}

function useCountriesForService(serviceCode: string) {
  return useQuery<{ countries: LiveCountry[] }>({
    queryKey: ["/api/catalog/countries-for-service", serviceCode],
    queryFn: async () => {
      const res = await fetch(`/api/catalog/countries-for-service?serviceCode=${serviceCode}`);
      if (!res.ok) throw new Error("Failed to load countries");
      return res.json();
    },
    enabled: !!serviceCode,
    refetchInterval: 20_000,
    staleTime: 20_000,
  });
}

const serviceIconDomains: Record<string, string> = {
  aol: "aol.com", aliexpress: "aliexpress.com", telegram: "telegram.org",
  whatsapp: "whatsapp.com", google: "google.com", instagram: "instagram.com",
  facebook: "facebook.com", twitter: "x.com", "x / twitter": "x.com",
  discord: "discord.com", amazon: "amazon.com", tiktok: "tiktok.com",
  snapchat: "snapchat.com", linkedin: "linkedin.com", netflix: "netflix.com",
  spotify: "spotify.com", uber: "uber.com", airbnb: "airbnb.com",
  paypal: "paypal.com", apple: "apple.com", yandex: "yandex.com",
  yahoo: "yahoo.com", proton: "proton.me", "ok.ru": "ok.ru", qq: "qq.com",
  wechat: "wechat.com", viber: "viber.com", vk: "vk.com",
  tinder: "tinder.com", bumble: "bumble.com", "pof.com": "pof.com",
  coinbase: "coinbase.com", steam: "steampowered.com", naver: "naver.com",
  bolt: "bolt.eu", wise: "wise.com", nike: "nike.com",
};

function getServiceIcon(name: string): string | null {
  const key = name.toLowerCase();
  const domain = serviceIconDomains[key] ?? Object.entries(serviceIconDomains).find(([label]) => key.includes(label))?.[1];
  if (!domain) return null;
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

function maskProviderName(name: string): string {
  return name === "Hero SMS" ? "SKY SMS" : name;
}

function InfoRow({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0">
      <span className="text-[13px] text-slate-500 font-medium">{label}</span>
      <span className={`text-[13px] font-semibold ${highlight ? "text-white" : "text-slate-300"}`}>{value}</span>
    </div>
  );
}

export default function Rent() {
  const [serviceCode, setServiceCode] = useState<string>("");
  const [countryCode, setCountryCode] = useState<string>("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: servicesData, isLoading: loadingServices, isError: servicesError, refetch: refetchServices } = useListServices({}, {
    query: { queryKey: ["/api/catalog/services"], refetchInterval: 20_000, staleTime: 20_000 }
  });

  const { data: countriesData, isLoading: loadingCountries } = useCountriesForService(serviceCode);

  const { data: availability, isLoading: loadingAvailability, isFetching: fetchingAvailability } = useGetAvailability(
    { countryCode, serviceCode },
    {
      query: {
        enabled: !!countryCode && !!serviceCode,
        queryKey: ["/api/catalog/availability", { countryCode, serviceCode }],
        refetchInterval: 15000,
      }
    }
  );

  const createRental = useCreateRental();

  const handleRent = () => {
    if (!countryCode || !serviceCode) return;
    createRental.mutate({ data: { countryCode, serviceCode } }, {
      onSuccess: (rental) => {
        toast({
          title: "Number rented successfully",
          description: `You have 20 minutes to receive an SMS for ${rental.serviceName}.`,
        });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        queryClient.invalidateQueries({ queryKey: ["/api/rentals"] });
        setLocation("/rentals");
      },
      onError: (error: unknown) => {
        const apiErr = error as { data?: { error?: string }; message?: string } | null;
        const description = apiErr?.data?.error || apiErr?.message || "An unexpected error occurred. You might need more funds.";
        toast({ title: "Failed to rent number", description, variant: "destructive" });
      }
    });
  };

  const liveCountries = countriesData?.countries ?? [];
  const serviceOptions = (servicesData?.services ?? []).map((service) => ({
    value: service.code,
    label: service.name,
    searchText: `${service.name} ${service.code} ${service.category}`,
    meta: `$${service.price.toFixed(2)}`,
    icon: getServiceIcon(service.name),
  }));
  const countryOptions = liveCountries.map((country) => ({
    value: country.code,
    label: country.name,
    searchText: `${country.name} ${country.code}`,
    meta: `${country.price > 0 ? `$${country.price.toFixed(2)} · ` : ""}${country.available.toLocaleString()} left`,
    icon: country.flag || "🌍",
  }));

  const isAvailable = availability && availability.available > 0 && availability.provider.mode === "live";
  const canRent = isAvailable && !createRental.isPending;

  return (
    <div className="max-w-2xl mx-auto space-y-7">

      {/* Header */}
      <Reveal variant="up">
        <div>
          <h1 className="text-[2rem] font-black tracking-tight text-white">Rent a Number</h1>
          <p className="text-slate-500 mt-1.5 text-[14px]">Select a service, then choose a live country. Prices and stock refresh every 20 seconds.</p>
        </div>
      </Reveal>

      {/* Selection card */}
      <Reveal variant="up" delay={60}>
        <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.04] to-transparent overflow-hidden" data-testid="card-rent-selection">
          <div className="px-6 py-5 border-b border-white/[0.06]">
            <div className="font-black text-white text-[15px]">Configure Rental</div>
            <div className="text-[12px] text-slate-500 mt-0.5">Choose your service first, then select a country.</div>
          </div>

          <div className="p-6 space-y-6">
            {/* Service */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-[13px] font-semibold text-slate-300">
                <div className="h-5 w-5 rounded-md bg-sky-500/15 border border-sky-500/25 flex items-center justify-center">
                  <Server className="h-3 w-3 text-sky-400" />
                </div>
                Service
              </Label>
              <SearchableSelect
                value={serviceCode}
                options={serviceOptions}
                placeholder={loadingServices ? "Loading services…" : servicesError ? "Could not load services" : "Search and select a service"}
                searchPlaceholder="Type service name…"
                emptyText="No service found."
                disabled={loadingServices || servicesError}
                onChange={(val) => { setServiceCode(val); setCountryCode(""); }}
              />
              {servicesError && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-400/20 bg-amber-400/8 px-4 py-3 text-[12.5px] text-amber-200">
                  <span>Services could not be loaded. Please retry.</span>
                  <button type="button" onClick={() => refetchServices()} className="font-bold text-amber-100 flex items-center gap-1 hover:text-white transition-colors">
                    <RefreshCw className="h-3 w-3" /> Retry
                  </button>
                </div>
              )}
            </div>

            {/* Country */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-[13px] font-semibold text-slate-300">
                <div className="h-5 w-5 rounded-md bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                  <Globe className="h-3 w-3 text-indigo-400" />
                </div>
                Country
                {serviceCode && loadingCountries && (
                  <Loader2 className="h-3 w-3 animate-spin text-slate-600 ml-1" />
                )}
              </Label>
              <SearchableSelect
                value={countryCode}
                options={countryOptions}
                placeholder={
                  !serviceCode ? "Select a service first" :
                  loadingCountries ? "Loading available countries…" :
                  liveCountries.length === 0 ? "No countries available for this service" :
                  "Search and select a country"
                }
                searchPlaceholder="Type country name…"
                emptyText="No country found."
                disabled={!serviceCode || loadingCountries || liveCountries.length === 0}
                onChange={setCountryCode}
              />
              {serviceCode && !loadingCountries && liveCountries.length === 0 && (
                <div className="flex items-center gap-2.5 rounded-xl border border-amber-400/20 bg-amber-400/8 px-4 py-3 text-[12.5px] text-amber-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  No countries currently have stock for this service. Try a different service or check back later.
                </div>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      {/* Availability card */}
      {countryCode && serviceCode && (
        <Reveal variant="up" delay={80}>
          <div className={`rounded-2xl border overflow-hidden transition-all duration-300 ${isAvailable ? "border-sky-500/20 shadow-[0_0_30px_rgba(14,165,233,0.08)]" : "border-white/[0.07]"} bg-gradient-to-br from-white/[0.04] to-transparent`} data-testid="card-availability">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.06]">
              <div className="font-black text-white text-[15px]">Availability</div>
              {(loadingAvailability || fetchingAvailability) && (
                <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
              )}
            </div>

            <div className="p-6">
              {!availability && !loadingAvailability ? (
                <div className="flex items-center gap-3 text-rose-300 bg-rose-400/8 border border-rose-400/15 rounded-xl p-4">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span className="text-[13.5px] font-medium">Failed to check availability. Please try again.</span>
                </div>
              ) : availability ? (
                <div className="space-y-5">
                  {/* Status banner */}
                  {availability.available > 0 ? (
                    <div className="flex items-start gap-3.5 bg-emerald-400/8 border border-emerald-400/15 rounded-xl p-4">
                      <div className="h-8 w-8 rounded-xl bg-emerald-400/15 border border-emerald-400/20 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div>
                        <div className="font-bold text-emerald-200 text-[14px]">Numbers available</div>
                        <div className="text-[12.5px] mt-1 text-emerald-100/70 leading-relaxed">
                          {availability.available.toLocaleString()} numbers ready · Est. wait: {availability.estimatedWait} · 20-min activation window
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3.5 bg-amber-400/8 border border-amber-400/15 rounded-xl p-4">
                      <div className="h-8 w-8 rounded-xl bg-amber-400/15 border border-amber-400/20 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertCircle className="h-4 w-4 text-amber-400" />
                      </div>
                      <div>
                        <div className="font-bold text-amber-200 text-[14px]">No numbers available</div>
                        <div className="text-[12.5px] mt-1 text-amber-100/70">
                          This provider is out of stock for this combination. Try a different country or check back later.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Info rows */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-5">
                    <InfoRow label="Price per SMS" value={
                      <span className="text-2xl font-black text-white" data-testid="text-price-quote">${availability.price.toFixed(2)}</span>
                    } highlight />
                    <InfoRow label="Numbers in stock" value={availability.available.toLocaleString()} />
                    <InfoRow label="Network" value={maskProviderName(availability.provider.name)} />
                    {availability.provider.mode !== "live" && (
                      <InfoRow label="Status" value={
                        <Badge variant="outline" className="text-amber-200 border-amber-400/20 bg-amber-400/10 text-[11px] font-semibold">
                          {availability.provider.mode}
                        </Badge>
                      } />
                    )}
                    {availability.price === 0 && (
                      <InfoRow label="" value={
                        <span className="text-[11px] text-amber-400">Price not set — configure in admin panel</span>
                      } />
                    )}
                  </div>

                  {/* Rent button */}
                  <button
                    className={`w-full h-13 rounded-xl text-[15px] font-bold transition-all duration-250 flex items-center justify-center gap-2.5 active:scale-[0.98] ${
                      canRent
                        ? "btn-reflect bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_45px_rgba(14,165,233,0.45)] hover:from-sky-400 hover:to-sky-500"
                        : "bg-white/[0.05] border border-white/[0.08] text-slate-600 cursor-not-allowed"
                    }`}
                    disabled={!canRent}
                    onClick={handleRent}
                    data-testid="button-confirm-rent"
                  >
                    {createRental.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Allocating number…
                      </>
                    ) : availability?.provider.mode !== "live" ? (
                      "Provider Unavailable"
                    ) : availability?.available === 0 ? (
                      "No Numbers Available"
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
                        Rent Number — ${availability.price.toFixed(2)}
                        <ArrowRight className="h-4 w-4 ml-auto" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full rounded-xl bg-white/[0.04]" />
                  <Skeleton className="h-24 w-full rounded-xl bg-white/[0.04]" />
                  <Skeleton className="h-13 w-full rounded-xl bg-white/[0.04]" />
                </div>
              )}
            </div>
          </div>
        </Reveal>
      )}

      {/* Tips */}
      {!countryCode && (
        <Reveal variant="up" delay={120}>
          <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.02] to-transparent p-6">
            <div className="text-[13px] font-bold text-slate-500 mb-4 uppercase tracking-wider">How it works</div>
            <div className="space-y-4">
              {[
                { n: "01", title: "Pick a service", desc: "Search for Telegram, WhatsApp, Google, or any of 50+ platforms." },
                { n: "02", title: "Choose a country", desc: "Live stock counts are shown per country before you commit." },
                { n: "03", title: "Get your number", desc: "A real phone number is allocated instantly after purchase." },
                { n: "04", title: "Receive the SMS", desc: "Codes appear on your rental card in real time. Copy with one tap." },
              ].map((step) => (
                <div key={step.n} className="flex items-start gap-4">
                  <span className="text-[11px] font-black text-sky-400/60 font-mono w-6 shrink-0 mt-0.5">{step.n}</span>
                  <div>
                    <div className="text-[13px] font-bold text-white">{step.title}</div>
                    <div className="text-[12px] text-slate-500 mt-0.5">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}
