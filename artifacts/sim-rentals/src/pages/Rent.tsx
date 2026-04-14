import { useState } from "react";
import { useListCountries, useListServices, useGetAvailability, useCreateRental, getGetDashboardQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Globe, Server, CheckCircle2, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";

export default function Rent() {
  const [countryCode, setCountryCode] = useState<string>("");
  const [serviceCode, setServiceCode] = useState<string>("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: countriesData, isLoading: loadingCountries } = useListCountries();
  const { data: servicesData, isLoading: loadingServices } = useListServices({ countryCode: countryCode || undefined }, { 
    query: { enabled: true, queryKey: ["/api/catalog/services", { countryCode: countryCode || undefined }] } 
  });

  const { data: availability, isLoading: loadingAvailability, isFetching: fetchingAvailability } = useGetAvailability(
    { countryCode, serviceCode },
    { 
      query: { 
        enabled: !!countryCode && !!serviceCode,
        queryKey: ["/api/catalog/availability", { countryCode, serviceCode }],
        refetchInterval: 10000 // Refetch every 10s if kept open
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
      onError: (error: any) => {
        toast({
          title: "Failed to rent number",
          description: error.message || "An unexpected error occurred. You might need more credits.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rent a Number</h1>
        <p className="text-muted-foreground mt-1">Select a country and service to get a temporary verification number.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2 shadow-sm border" data-testid="card-rent-selection">
          <CardHeader>
            <CardTitle>Select Options</CardTitle>
            <CardDescription>Choose your desired country and service.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="country" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                Country
              </Label>
              <Select value={countryCode} onValueChange={(val) => { setCountryCode(val); setServiceCode(""); }}>
                <SelectTrigger id="country" className="w-full h-12" data-testid="select-country">
                  <SelectValue placeholder={loadingCountries ? "Loading countries..." : "Select a country"} />
                </SelectTrigger>
                <SelectContent>
                  {countriesData?.countries.map(country => (
                    <SelectItem key={country.code} value={country.code} disabled={country.available === 0}>
                      <div className="flex items-center justify-between w-full min-w-[200px]">
                        <span>{country.flag} {country.name}</span>
                        {country.available === 0 && <span className="text-xs text-muted-foreground ml-4">Unavailable</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="service" className="flex items-center gap-2">
                <Server className="h-4 w-4 text-muted-foreground" />
                Service
              </Label>
              <Select value={serviceCode} onValueChange={setServiceCode} disabled={!countryCode || loadingServices}>
                <SelectTrigger id="service" className="w-full h-12" data-testid="select-service">
                  <SelectValue placeholder={
                    !countryCode ? "Select a country first" : 
                    loadingServices ? "Loading services..." : 
                    "Select a service (e.g. WhatsApp, Telegram)"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {servicesData?.services.map(service => (
                    <SelectItem key={service.code} value={service.code} disabled={service.available === 0}>
                      <div className="flex items-center justify-between w-full min-w-[200px]">
                        <span>{service.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-medium text-primary">${service.price.toFixed(2)}</span>
                          {service.available === 0 && <span className="text-xs text-muted-foreground">Unavailable</span>}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {countryCode && serviceCode && (
          <Card className="md:col-span-2 bg-gray-50 border-primary/20 shadow-sm" data-testid="card-availability">
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
                  <span>Failed to check availability.</span>
                </div>
              ) : availability ? (
                <div className="space-y-4">
                  {availability.available > 0 ? (
                    <div className="flex items-start gap-3 text-green-700 bg-green-50 p-4 rounded-lg border border-green-100">
                      <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-green-900">Numbers available</div>
                        <div className="text-sm mt-1 text-green-800/80">
                          {availability.available} numbers ready. Estimated wait: {availability.estimatedWait}.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 text-amber-700 bg-amber-50 p-4 rounded-lg border border-amber-100">
                      <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold text-amber-900">No numbers currently available</div>
                        <div className="text-sm mt-1 text-amber-800/80">
                          This provider is out of stock for this specific combination right now. Check back later.
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2 px-1 border-t border-b border-gray-200">
                    <span className="text-muted-foreground text-sm font-medium">Price per SMS</span>
                    <span className="text-xl font-bold text-primary" data-testid="text-price-quote">${availability.price.toFixed(2)} credits</span>
                  </div>
                  
                  <div className="text-xs text-muted-foreground flex justify-between items-center px-1">
                    <span>Provider: {availability.provider.name}</span>
                    {availability.provider.mode !== 'live' && (
                      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                        {availability.provider.mode}
                      </Badge>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full" />
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-0">
              <Button 
                size="lg" 
                className="w-full h-12 text-base font-medium" 
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
