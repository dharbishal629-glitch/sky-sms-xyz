import { useState } from "react";
import { useListServices, useGetAvailability, useCreateRental, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Globe, Server, CheckCircle2, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchableSelect } from "@/components/SearchableSelect";

interface LiveCountry {
  code: string;
  name: string;
  flag: string;
  available: number;
  heroPrice: number;
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
  aol: "aol.com",
  aliexpress: "aliexpress.com",
  telegram: "telegram.org",
  whatsapp: "whatsapp.com",
  google: "google.com",
  instagram: "instagram.com",
  facebook: "facebook.com",
  twitter: "x.com",
  "x / twitter": "x.com",
  discord: "discord.com",
  amazon: "amazon.com",
  tiktok: "tiktok.com",
  snapchat: "snapchat.com",
  linkedin: "linkedin.com",
  netflix: "netflix.com",
  spotify: "spotify.com",
  uber: "uber.com",
  airbnb: "airbnb.com",
  paypal: "paypal.com",
  apple: "apple.com",
  yandex: "yandex.com",
  yahoo: "yahoo.com",
  proton: "proton.me",
  "ok.ru": "ok.ru",
  qq: "qq.com",
  wechat: "wechat.com",
  viber: "viber.com",
  vk: "vk.com",
  tinder: "tinder.com",
  bumble: "bumble.com",
  "pof.com": "pof.com",
  coinbase: "coinbase.com",
  steam: "steampowered.com",
  naver: "naver.com",
  bolt: "bolt.eu",
  wise: "wise.com",
  nike: "nike.com",
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
        setLocation(`/rentals`);
      },
      onError: (error: unknown) => {
        const apiErr = error as { data?: { error?: string }; message?: string } | null;
        const description =
          apiErr?.data?.error ||
          apiErr?.message ||
          "An unexpected error occurred. You might need more funds.";
        toast({
          title: "Failed to rent number",
          description,
          variant: "destructive"
        });
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
    meta: `${country.heroPrice > 0 ? `$${country.heroPrice.toFixed(2)} · ` : ""}${country.available.toLocaleString()} left`,
    icon: country.flag || "🌍",
  }));

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">Rent a Number</h1>
        <p className="text-muted-foreground mt-1">Select a service first, then choose a live country. Stock and prices refresh automatically every 20 seconds.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2 glass-card" data-testid="card-rent-selection">
          <CardHeader>
            <CardTitle>Select Options</CardTitle>
            <CardDescription>Choose your service first, then select a country.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="service" className="flex items-center gap-2">
                <Server className="h-4 w-4 text-muted-foreground" />
                Service
              </Label>
              <SearchableSelect
                value={serviceCode}
                options={serviceOptions}
                placeholder={loadingServices ? "Loading services..." : servicesError ? "Could not load services" : "Search and select a service"}
                searchPlaceholder="Type service name..."
                emptyText="No service found."
                disabled={loadingServices || servicesError}
                onChange={(val) => { setServiceCode(val); setCountryCode(""); }}
              />
              {servicesError && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-300/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-100">
                  <span>Services did not load. Please retry.</span>
                  <button type="button" onClick={() => refetchServices()} className="font-bold text-amber-50 underline">
                    Retry
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label htmlFor="country" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                Country
                {serviceCode && loadingCountries && (
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                )}
              </Label>
              <SearchableSelect
                value={countryCode}
                options={countryOptions}
                placeholder={
                  !serviceCode ? "Select a service first" :
                  loadingCountries ? "Loading available countries..." :
                  liveCountries.length === 0 ? "No countries available for this service" :
                  "Search and select a country"
                }
                searchPlaceholder="Type country name..."
                emptyText="No country found."
                disabled={!serviceCode || loadingCountries || liveCountries.length === 0}
                onChange={setCountryCode}
              />
              {serviceCode && !loadingCountries && liveCountries.length === 0 && (
                <p className="text-xs text-amber-400">No countries currently have stock for this service. Try a different service or check back later.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {countryCode && serviceCode && (
          <Card className="md:col-span-2 glass-card blue-glow" data-testid="card-availability">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                Availability Check
                {(loadingAvailability || fetchingAvailability) && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!availability && !loadingAvailability ? (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <span>Failed to check availability. Please try again.</span>
                </div>
              ) : availability ? (
                <div className="space-y-4">
                  {availability.available > 0 ? (
                    <div className="flex items-start gap-3 text-emerald-200 bg-emerald-400/10 p-4 rounded-2xl border border-emerald-300/20">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-emerald-100">Numbers available</div>
                        <div className="text-sm mt-1 text-emerald-100/80">
                          {availability.available.toLocaleString()} numbers ready. Estimated wait: {availability.estimatedWait}.
                          Activations stay open for 20 minutes after purchase.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 text-amber-200 bg-amber-400/10 p-4 rounded-2xl border border-amber-300/20">
                      <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-amber-100">No numbers currently available</div>
                        <div className="text-sm mt-1 text-amber-100/80">
                          This provider is out of stock for this combination right now. Try a different country or check back later.
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2 px-1 border-t border-b border-white/10">
                    <span className="text-muted-foreground text-sm font-medium">Price per SMS</span>
                    <span className="text-xl font-bold text-primary" data-testid="text-price-quote">
                      {availability.price === 0 ? "Free" : `$${availability.price.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground flex justify-between items-center px-1">
                    <span>Network: {maskProviderName(availability.provider.name)}</span>
                    {availability.provider.mode !== 'live' && (
                      <Badge variant="outline" className="text-amber-200 border-amber-300/20 bg-amber-400/10">
                        {availability.provider.mode}
                      </Badge>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <Skeleton className="h-10 w-full" />
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Button
                size="lg"
                className="w-full h-12 text-base font-medium rounded-full"
                disabled={!availability || availability.available === 0 || createRental.isPending || availability.provider.mode !== 'live'}
                onClick={handleRent}
                data-testid="button-confirm-rent"
              >
                {createRental.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Allocating number...
                  </>
                ) : availability?.provider.mode !== 'live' ? (
                  "Provider Unavailable"
                ) : availability?.available === 0 ? (
                  "No Numbers Available"
                ) : availability?.price === 0 ? (
                  "Rent Free Number"
                ) : (
                  "Rent Number"
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
