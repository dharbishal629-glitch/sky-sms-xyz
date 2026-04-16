import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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
  const [selectedCountry, setSelectedCountry] = useState<string>("global");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const { toast } = useToast();

  const loadServices = async (country = selectedCountry) => {
    setLoading(true);
    setError(false);
    try {
      const params = country !== "global" ? `?countryCode=${encodeURIComponent(country)}` : "";
      const response = await fetch(`${API_URL}/api/admin/services${params}`, { credentials: "include" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json() as { services: AdminService[]; countries: AdminCountry[] };
      setServices(data.services);
      setCountries(data.countries ?? []);
      setDrafts(Object.fromEntries(data.services.map((s) => [s.code, String(s.price)])));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadServices("global"); }, []);

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    loadServices(value);
  };

  const savePrice = async (service: AdminService) => {
    const price = Number(drafts[service.code]);
    if (!Number.isFinite(price) || price < 0) {
      toast({ title: "Invalid price", description: "Use 0 for free or any positive number.", variant: "destructive" });
      return;
    }
    setSaving(service.code);
    try {
      const response = await fetch(`${API_URL}/api/admin/services/${service.code}/price`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price, countryCode: selectedCountry === "global" ? undefined : selectedCountry }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`);
      setServices((c) => c.map((item) => item.code === service.code ? { ...item, price, customPrice: true, countryPrice: selectedCountry === "global" ? item.countryPrice : price, globalPrice: selectedCountry === "global" ? price : item.globalPrice } : item));
      const scope = selectedCountry === "global" ? "all countries" : countries.find((c) => c.code === selectedCountry)?.name ?? selectedCountry;
      toast({ title: price === 0 ? "Service is now free" : "Service price updated", description: `${service.name} set to ${price === 0 ? "0 credits" : `${price.toFixed(2)} credits`} for ${scope}.` });
    } catch (err) {
      toast({ title: "Failed to update price", description: err instanceof Error ? err.message : "Please try again.", variant: "destructive" });
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-destructive">Failed to load services</h2>
        <p className="text-muted-foreground mt-2">Please refresh the page and try again.</p>
        <button onClick={() => loadServices()} className="mt-4 text-sm text-cyan-400 hover:underline">Retry</button>
      </div>
    );
  }

  const scopeLabel = selectedCountry === "global" ? "Global default" : countries.find((c) => c.code === selectedCountry)?.name ?? selectedCountry;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Service Pricing</h1>
          <p className="text-muted-foreground mt-1 text-sm">Set a global price or choose a country to override prices only for that country.</p>
        </div>
        <div className="w-full lg:w-80 space-y-2">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pricing scope</label>
          <Select value={selectedCountry} onValueChange={handleCountryChange}>
            <SelectTrigger className="h-11 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">Global default</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country.code} value={country.code}>{country.name} ({country.available.toLocaleString()} live)</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {services.map((service) => (
          <Card key={service.code} className="glass-card">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-white">{service.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{service.code} · {service.available.toLocaleString()} live</div>
                </div>
                <Badge variant="outline" className="border-white/10 bg-white/[0.05] text-slate-300 shrink-0">{service.category}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2">
                  <div className="text-xs text-muted-foreground mb-0.5">Provider cost</div>
                  <div className="font-mono font-bold text-muted-foreground">{service.basePrice.toFixed(2)}</div>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-2">
                  <div className="text-xs text-muted-foreground mb-0.5">{scopeLabel}</div>
                  <div className="font-mono font-bold text-white">{service.price === 0 ? "Free" : service.price.toFixed(2)}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Input type="number" min="0" step="0.01" value={drafts[service.code] ?? ""} onChange={(e) => setDrafts((c) => ({ ...c, [service.code]: e.target.value }))} className="flex-1 text-right" placeholder="0.00" />
                {Number(drafts[service.code]) === 0 && <Badge className="bg-emerald-400/10 text-emerald-200 border border-emerald-300/20 shrink-0">Free</Badge>}
                <Button size="sm" onClick={() => savePrice(service)} disabled={saving === service.code} className="shrink-0">{saving === service.code ? "Saving..." : "Save"}</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card overflow-hidden hidden md:block">
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>Editing scope: {scopeLabel}. Live stock comes from Hero SMS and refreshes when this page loads or scope changes.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/10 hover:bg-white/[0.02]">
                  <TableHead className="text-muted-foreground">Service</TableHead>
                  <TableHead className="text-muted-foreground">Category</TableHead>
                  <TableHead className="text-right text-muted-foreground">Live Stock</TableHead>
                  <TableHead className="text-right text-muted-foreground">Provider Cost</TableHead>
                  <TableHead className="text-right text-muted-foreground">Your Price</TableHead>
                  <TableHead className="text-right text-muted-foreground">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.code} className="border-white/10 hover:bg-white/[0.03]">
                    <TableCell>
                      <div className="font-medium text-white">{service.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">{service.code}</div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="border-white/10 bg-white/[0.05] text-slate-300">{service.category}</Badge></TableCell>
                    <TableCell className="text-right text-muted-foreground font-mono">{service.available.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-muted-foreground font-mono">{service.basePrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Input type="number" min="0" step="0.01" value={drafts[service.code] ?? ""} onChange={(e) => setDrafts((c) => ({ ...c, [service.code]: e.target.value }))} className="w-28 text-right" />
                        {Number(drafts[service.code]) === 0 && <Badge className="bg-emerald-400/10 text-emerald-200 border border-emerald-300/20">Free</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right"><Button size="sm" onClick={() => savePrice(service)} disabled={saving === service.code}>{saving === service.code ? "Saving..." : "Save"}</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
