import { useState, useEffect } from "react";
import { useListRentals, useRefreshRental, useCancelRental, getGetDashboardQueryKey, getListRentalsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { format, differenceInSeconds } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, X, MessageSquare, Clock, Copy, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

function RentalCard({ rental }: { rental: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const refreshMutation = useRefreshRental();
  const cancelMutation = useCancelRental();
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const isActive = rental.status === 'active';
  const hasMessages = rental.messages && rental.messages.length > 0;
  
  // Timer logic for active rentals
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  useEffect(() => {
    if (!isActive) return;
    
    const calculateTimeLeft = () => {
      const expiresAt = new Date(rental.expiresAt);
      const now = new Date();
      const diff = Math.max(0, differenceInSeconds(expiresAt, now));
      setTimeLeft(diff);
      
      // Auto-refresh logic could go here, but doing it manually or via query invalidation is safer
    };
    
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [isActive, rental.expiresAt]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string, isCode = false) => {
    navigator.clipboard.writeText(text);
    if (isCode) {
      setCopiedCode(text);
      setTimeout(() => setCopiedCode(null), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    toast({
      title: "Copied to clipboard",
      duration: 2000,
    });
  };

  const handleRefresh = () => {
    refreshMutation.mutate({ id: rental.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListRentalsQueryKey() });
        toast({ title: "Refreshed", description: "Checked for new messages." });
      }
    });
  };

  const handleCancel = () => {
    cancelMutation.mutate({ id: rental.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListRentalsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetDashboardQueryKey() });
        toast({ title: "Cancelled", description: "Rental cancelled and refunded if applicable." });
      }
    });
  };

  return (
    <Card className={`overflow-hidden transition-all duration-200 ${isActive ? 'border-primary/50 shadow-md ring-1 ring-primary/10' : 'opacity-80 hover:opacity-100'}`} data-testid={`card-rental-${rental.id}`}>
      <div className={`h-1.5 w-full ${isActive ? 'bg-primary' : rental.status === 'completed' || rental.status === 'sms_received' ? 'bg-green-500' : 'bg-gray-200'}`} />
      
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              {rental.serviceName}
              <Badge variant={
                isActive ? 'default' : 
                (rental.status === 'completed' || rental.status === 'sms_received') ? 'secondary' : 
                'outline'
              }>
                {rental.status}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              {rental.countryName} &bull; {format(new Date(rental.createdAt), "MMM d, yyyy HH:mm")}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="font-semibold text-lg" data-testid={`text-rental-price-${rental.id}`}>${rental.price.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">credits</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Phone Number</div>
            <div className="text-xl font-mono tracking-tight font-medium" data-testid={`text-rental-number-${rental.id}`}>
              {rental.phoneNumber ? `+${rental.phoneNumber}` : "Waiting for number..."}
            </div>
          </div>
          {rental.phoneNumber && (
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => copyToClipboard(`+${rental.phoneNumber}`)}
              className="shrink-0"
              title="Copy number"
              data-testid={`button-copy-number-${rental.id}`}
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium">
            <span className="flex items-center gap-2 text-muted-foreground">
              <MessageSquare className="h-4 w-4" /> Messages
            </span>
            {isActive && (
              <span className={`flex items-center gap-1.5 ${timeLeft < 300 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                <Clock className="h-3.5 w-3.5" />
                <span className="font-mono">{formatTime(timeLeft)}</span>
              </span>
            )}
          </div>
          
          {hasMessages ? (
            <div className="space-y-3 mt-3">
              {rental.messages.map((msg: any) => (
                <div key={msg.id} className="bg-blue-50 border border-blue-100 rounded-lg p-3" data-testid={`row-message-${msg.id}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-medium text-blue-800">{msg.sender}</span>
                    <span className="text-xs text-blue-600/70">{format(new Date(msg.receivedAt), "HH:mm:ss")}</span>
                  </div>
                  <div className="text-sm text-gray-800">{msg.message}</div>
                  
                  {msg.code && (
                    <div className="mt-2 pt-2 border-t border-blue-200/50 flex items-center justify-between">
                      <span className="text-xs text-blue-700 font-medium">Verification Code:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-lg text-primary tracking-widest">{msg.code}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0 rounded-full hover:bg-blue-100 text-blue-700"
                          onClick={() => copyToClipboard(msg.code, true)}
                        >
                          {copiedCode === msg.code ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50/50 rounded-lg border border-dashed text-sm text-muted-foreground">
              {isActive ? "Waiting for incoming SMS..." : "No messages received."}
            </div>
          )}
        </div>
      </CardContent>
      
      {isActive && (
        <CardFooter className="bg-gray-50 px-6 py-3 border-t flex justify-between">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            data-testid={`button-cancel-rental-${rental.id}`}
          >
            {cancelMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <X className="h-4 w-4 mr-2" />}
            Cancel & Refund
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshMutation.isPending}
            data-testid={`button-refresh-rental-${rental.id}`}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default function Rentals() {
  const { data, isLoading, error } = useListRentals();

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12 max-w-4xl mx-auto">
        <h2 className="text-xl font-semibold mb-2 text-destructive">Failed to load rentals</h2>
        <p className="text-muted-foreground">Please try refreshing the page.</p>
      </div>
    );
  }

  const activeRentals = data.rentals.filter((r: any) => r.status === 'active');
  const pastRentals = data.rentals.filter((r: any) => r.status !== 'active');

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Rentals</h1>
        <p className="text-muted-foreground mt-1">Manage active numbers and view your history.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            {activeRentals.length > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>}
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </span>
          Active Now ({activeRentals.length})
        </h2>
        
        {activeRentals.length === 0 ? (
          <Card className="border-dashed bg-gray-50/50">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Phone className="h-10 w-10 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4">You don't have any active rentals right now.</p>
              <Button asChild>
                <a href="/rent">Rent a Number</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {activeRentals.map((rental: any) => (
              <RentalCard key={rental.id} rental={rental} />
            ))}
          </div>
        )}
      </div>

      {pastRentals.length > 0 && (
        <div className="space-y-4 pt-6 border-t">
          <h2 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
            <History className="h-5 w-5" />
            Past Rentals
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {pastRentals.map((rental: any) => (
              <RentalCard key={rental.id} rental={rental} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
