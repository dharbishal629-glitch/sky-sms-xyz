import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Rent from "@/pages/Rent";
import Rentals from "@/pages/Rentals";
import Payments from "@/pages/Payments";
import Settings from "@/pages/Settings";
import AdminOverview from "@/pages/admin/Overview";
import AdminUsers from "@/pages/admin/Users";
import AdminTransactions from "@/pages/admin/Transactions";
import { useAuth } from "@/hooks/useAuth";
import { Switch, Route, Redirect } from "wouter";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isLoading, isAuthenticated, login } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen premium-shell flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-300 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    login();
    return null;
  }

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

export function AppRoutes() {
  return (
    <Switch>
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/rent">
        <ProtectedRoute component={Rent} />
      </Route>
      <Route path="/rentals">
        <ProtectedRoute component={Rentals} />
      </Route>
      <Route path="/payments">
        <ProtectedRoute component={Payments} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={Settings} />
      </Route>

      <Route path="/admin">
        <ProtectedRoute component={AdminOverview} />
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute component={AdminUsers} />
      </Route>
      <Route path="/admin/transactions">
        <ProtectedRoute component={AdminTransactions} />
      </Route>
    </Switch>
  );
}
