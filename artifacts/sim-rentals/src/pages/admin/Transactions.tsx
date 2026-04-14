import { useListAdminTransactions } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Search, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export default function AdminTransactions() {
  const { data, isLoading, error } = useListAdminTransactions();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-destructive">Failed to load transactions</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground mt-1">Platform-wide payment and credit activity.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search transactions..." className="pl-9" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.transactions.map((tx) => (
                    <TableRow key={tx.id} data-testid={`admin-row-tx-${tx.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${tx.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            {tx.type === 'deposit' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                          </div>
                          <span className="font-medium capitalize">{tx.type}</span>
                        </div>
                        <div className="text-xs text-gray-400 font-mono mt-1">{tx.id}</div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {tx.userEmail}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(tx.createdAt), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={
                          tx.status === 'completed' || tx.status === 'paid' ? 'text-green-600 border-green-200 bg-green-50' :
                          tx.status === 'pending' ? 'text-amber-600 border-amber-200 bg-amber-50' :
                          'text-red-600 border-red-200 bg-red-50'
                        }>
                          {tx.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
