import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { SearchableSelect } from "@/components/SearchableSelect";
import { CheckCircle2, Loader2, Save, ShieldCheck } from "lucide-react";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

type AdminCountry = {
  code: string;
  name: string;
  flag: string;
  available: number;
  startingPrice: number;
};

type AdminService = {
  code: string;
  name: string;
  category: string;
  available: number;
  basePrice: number;
  price: number;
  customPrice: boolean;
  countryPrice: number | null;
  globalPrice: number | null;
};

export default function AdminServices() {
  const [services, setServices] = useState<AdminService[]>([]);
  const [countries, setCountries] = useState<AdminCountry[]>([]);
  const [enabledDraft, setEnabledDraft] = useState<Set<string>>(new Set());
  const [selectedServiceCode, setSelectedServiceCode] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("global");
  const [priceDraft, setPriceDraft] = useState<string>("");
  const [enabledSearch, setEnabledSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingPrice, setSavingPrice] = useState(false);
  const [savingEnabled, setSavingEnabled] = useState(false);
  const [error, setError] = useState(false);
  const { toast } = useToast();

  const loadServices = async (country = selectedCountry) => {
    setLoading(true);
    setError(false);
    try {
      const params = country !== "global" ? `?countryCode=${encodeURIComponent(country)}` : "";
      const response = await fetch(`${API_URL}/api/admin/services${params}`, { credentials: "include" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json() as { services: AdminService[]; countries: AdminCountry[]; enabledServiceCodes: string[] };
      setServices(data.services);
      setCountries(data.countries ?? []);
      setEnabledDraft(new Set(data.enabledServiceCodes ?? []));
      if (data.services[0] && (!selectedServiceCode || !data.services.some((service) => service.code === selectedServiceCode))) {
        setSelectedServiceCode(data.services[0].code);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadServices("global"); }, []);

  const selectedService = services.find((service) => service.code === selectedServiceCode);
  const scopeLabel = selectedCountry === "global" ? "Global default" : countries.find((country) => country.code === selectedCountry)?.name ?? selectedCountry;

  useEffect(() => {
    if (!selectedService) return;
    setPriceDraft(String(selectedService.price));
  }, [selectedServiceCode, selectedCountry, selectedService?.price]);

  const serviceOptions = useMemo(() => services.map((service) => ({
    value: service.code,
    label: service.name,
    searchText: `${service.name} ${service.code} ${service.category}`,
    meta: `${service.available.toLocaleString()} live`,
  })), [services]);

  const countryOptions = useMemo(() => [
    { value: "global", label: "Global default", searchText: "global all countries default", meta: "All countries", icon: "🌐" },
    ...countries.map((country) => ({
      value: country.code,
      label: country.name,
      searchText: `${country.name} ${country.code}`,
      meta: `${country.available.toLocaleString()} live`,
      icon: country.flag || "🌍",
    })),
  ], [countries]);

  const enabledCount = enabledDraft.size;
  const filteredServices = useMemo(() => {
    const query = enabledSearch.trim().toLowerCase();
    if (!query) return services;
    return services.filter((service) => `${service.name} ${service.code} ${service.category}`.toLowerCase().includes(query));
  }, [enabledSearch, services]);

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    loadServices(value);
  };

  const toggleEnabled = (code: string) => {
    setEnabledDraft((current) => {
      const next = new Set(current);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  };

  const saveEnabledServices = async () => {
    setSavingEnabled(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/services/enabled`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceCodes: Array.from(enabledDraft) }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`);
      toast({ title: "Enabled services updated", description: `${enabledDraft.size} services are now visible to users everywhere.` });
    } catch (err) {
      toast({ title: "Failed to save enabled services", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setSavingEnabled(false);
    }
  };

  const savePrice = async () => {
    if (!selectedService) return;
    const price = Number(priceDraft);
    if (!Number.isFinite(price) || price < 0) {
      toast({ title: "Invalid price", description: "Use 0 for free or any positive number.", variant: "destructive" });
      return;
    }
    setSavingPrice(true);
    try {
      const response = await fetch(`${API_URL}/api/admin/services/${selectedService.code}/price`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price, countryCode: selectedCountry === "global" ? undefined : selectedCountry }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`);
      setServices((current) => current.map((service) => service.code === selectedService.code ? {
        ...service,
        price,
        customPrice: true,
        countryPrice: selectedCountry === "global" ? service.countryPrice : price,
        globalPrice: selectedCountry === "global" ? price : service.globalPrice,
      } : service));
      toast({ title: "Service price updated", description: `${selectedService.name} set to ${price === 0 ? "free" : `$${price.toFixed(2)}`} for ${scopeLabel}.` });
    } catch (err) {
      toast({ title: "Failed to update price", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setSavingPrice(false);
    }
  };

  if (loading && services.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error && services.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-destructive">Failed to load services</h2>
        <p className="text-muted-foreground mt-2">Please refresh the page and try again.</p>
        <button onClick={() => loadServices()} className="mt-4 text-sm text-cyan-400 hover:underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Service Control</h1>
        <p className="text-muted-foreground mt-1 text-sm">Search services, set prices, and choose exactly which Hero SMS services users can see.</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-cyan-300" /> Enabled Services Portal</CardTitle>
              <CardDescription>Only checked services appear on the user Rent page, country dropdowns, and rental flow.</CardDescription>
            </div>
            <Badge className="bg-cyan-400/10 text-cyan-200 border border-cyan-300/20">{enabledCount} enabled</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={enabledSearch}
            onChange={(event) => setEnabledSearch(event.target.value)}
            placeholder="Search service to enable..."
            className="h-12 rounded-xl"
          />
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
            <div className="max-h-80 overflow-y-auto pr-1 space-y-1">
              {filteredServices.map((service) => (
                <label key={service.code} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 hover:bg-white/[0.05]">
                  <Checkbox checked={enabledDraft.has(service.code)} onCheckedChange={() => toggleEnabled(service.code)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white">{service.name}</span>
                      <Badge variant="outline" className="border-white/10 bg-white/[0.04] text-slate-300">{service.category}</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">{service.code} · {service.available.toLocaleString()} live</div>
                  </div>
                  {enabledDraft.has(service.code) ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-300" /> : null}
                </label>
              ))}
              {filteredServices.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">No services found.</div>
              ) : null}
            </div>
          </div>
          <Button onClick={saveEnabledServices} disabled={savingEnabled} className="w-full sm:w-auto rounded-full">
            {savingEnabled ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Enabled Services
          </Button>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Pricing Editor</CardTitle>
          <CardDescription>Choose a service and country like a normal dropdown, type the price, then save.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Service</label>
              <SearchableSelect
                value={selectedServiceCode}
                options={serviceOptions}
                placeholder="Search and select service"
                searchPlaceholder="Type service name..."
                emptyText="No service found."
                onChange={setSelectedServiceCode}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Country</label>
              <SearchableSelect
                value={selectedCountry}
                options={countryOptions}
                placeholder="Search and select country"
                searchPlaceholder="Type country name..."
                emptyText="No country found."
                onChange={handleCountryChange}
              />
            </div>
          </div>

          {selectedService ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-white">{selectedService.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{selectedService.code} · {scopeLabel}</div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="border-white/10 bg-white/[0.05] text-slate-300">Provider ${selectedService.basePrice.toFixed(2)}</Badge>
                  <Badge className="bg-cyan-400/10 text-cyan-200 border border-cyan-300/20">Current ${selectedService.price.toFixed(2)}</Badge>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input type="number" min="0" step="0.01" value={priceDraft} onChange={(e) => setPriceDraft(e.target.value)} className="h-12 text-lg font-bold" placeholder="0.00" />
                <Button onClick={savePrice} disabled={savingPrice} className="h-12 rounded-full px-8">
                  {savingPrice ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Price
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Use 0 to make this service free for the selected scope.</p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
