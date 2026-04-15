import { Layout } from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Rent from "@/pages/Rent";
import Rentals from "@/pages/Rentals";
import Payments from "@/pages/Payments";
import Settings from "@/pages/Settings";
import AdminOverview from "@/pages/admin/Overview";
import AdminUsers from "@/pages/admin/Users";
import AdminTransactions from "@/pages/admin/Transactions";
import AdminServices from "@/pages/admin/Services";
import { useAuth } from "@/hooks/useAuth";
import { useGetMe } from "@workspace/api-client-react";
import { Switch, Route, Redirect } from "wouter";

function LoadingScreen() {
  return (
    <div className="min-h-screen premium-shell flex items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-300 border-t-transparent" />
    </div>
  );
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isLoading, isAuthenticated, login } = useAuth();

  if (isLoading) return <LoadingScreen />;

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

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { isLoading: authLoading, isAuthenticated, login } = useAuth();
  const { data: user, isLoading: userLoading } = useGetMe();

  if (authLoading || (isAuthenticated && userLoading)) return <LoadingScreen />;

  if (!isAuthenticated) {
    login();
    return null;
  }

  if (user && user.role !== "admin") {
    return <Redirect to="/dashboard" />;
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
        <AdminRoute component={AdminOverview} />
      </Route>
      <Route path="/admin/users">
        <AdminRoute component={AdminUsers} />
      </Route>
      <Route path="/admin/services">
        <AdminRoute component={AdminServices} />
      </Route>
      <Route path="/admin/transactions">
        <AdminRoute component={AdminTransactions} />
      </Route>
    </Switch>
  );
}
