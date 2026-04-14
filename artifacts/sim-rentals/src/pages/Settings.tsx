import { useGetMe, useHealthCheck } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, User, Bell, Key, Database, Activity, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Settings() {
  const { data: user, isLoading: userLoading } = useGetMe();
  const { data: health, isLoading: healthLoading } = useHealthCheck();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and settings.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Profile</CardTitle>
            <CardDescription>Your personal information.</CardDescription>
          </CardHeader>
          <CardContent>
            {userLoading ? (
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ) : user ? (
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <Avatar className="h-20 w-20 border-2 border-primary/10">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="text-xl bg-primary/5 text-primary">{user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium" data-testid="settings-user-name">{user.name}</h3>
                    {user.role === 'admin' && <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20 border-0">Admin</Badge>}
                  </div>
                  <p className="text-muted-foreground" data-testid="settings-user-email">{user.email}</p>
                </div>
                <Button variant="outline" data-testid="btn-edit-profile">Edit Profile in Clerk</Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> Security</CardTitle>
            <CardDescription>Manage your security preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Password</div>
                  <div className="text-sm text-muted-foreground">Manage your password through Clerk authentication.</div>
                </div>
              </div>
              <Button variant="outline" size="sm">Change</Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Two-Factor Authentication</div>
                  <div className="text-sm text-muted-foreground">Add an extra layer of security to your account.</div>
                </div>
              </div>
              <Button variant="outline" size="sm">Setup</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> System Status</CardTitle>
            <CardDescription>Current API and platform health.</CardDescription>
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <Skeleton className="h-12 w-full rounded-lg" />
            ) : health ? (
              <div className="flex items-center justify-between p-4 border rounded-lg border-green-200 bg-green-50" data-testid="system-health-status">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium text-green-900">API Server: {health.status}</div>
                    <div className="text-sm text-green-700">All systems operational</div>
                  </div>
                </div>
                <Badge variant="outline" className="border-green-300 text-green-700 bg-white">Live</Badge>
              </div>
            ) : (
              <div className="p-4 border rounded-lg border-red-200 bg-red-50 text-red-800 text-sm">
                Could not connect to API server.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
