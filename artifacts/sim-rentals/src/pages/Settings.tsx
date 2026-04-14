import { useGetMe, useHealthCheck } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Shield, User, Key, Database, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Settings() {
  const { data: user, isLoading: userLoading } = useGetMe();
  const { data: health, isLoading: healthLoading } = useHealthCheck();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and settings.</p>
      </div>

      <div className="grid gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white"><User className="h-5 w-5 text-sky-300" /> Profile</CardTitle>
            <CardDescription>Your personal information synced from your account.</CardDescription>
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
                <Avatar className="h-20 w-20 border-2 border-sky-300/20">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback className="text-xl bg-sky-400/10 text-sky-200">{user.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white" data-testid="settings-user-name">{user.name}</h3>
                    {user.role === 'admin' && (
                      <Badge variant="outline" className="border-sky-300/20 bg-sky-400/10 text-sky-200">Admin</Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground" data-testid="settings-user-email">{user.email}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="text-sky-300 font-semibold">{user.credits}</span> credits available
                  </p>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white"><Shield className="h-5 w-5 text-sky-300" /> Security</CardTitle>
            <CardDescription>Your account security is managed by Replit's authentication system.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium text-white">Authentication</div>
                  <div className="text-sm text-muted-foreground">Secured via Replit OIDC — no password required.</div>
                </div>
              </div>
              <Badge variant="outline" className="border-emerald-300/20 bg-emerald-400/10 text-emerald-200">Active</Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium text-white">Session</div>
                  <div className="text-sm text-muted-foreground">Sessions are encrypted, httpOnly, and expire after 7 days.</div>
                </div>
              </div>
              <Badge variant="outline" className="border-sky-300/20 bg-sky-400/10 text-sky-200">Secure</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white"><Activity className="h-5 w-5 text-sky-300" /> System Status</CardTitle>
            <CardDescription>Current API and platform health.</CardDescription>
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <Skeleton className="h-12 w-full rounded-2xl" />
            ) : health ? (
              <div className="flex items-center justify-between p-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10" data-testid="system-health-status">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <div>
                    <div className="font-medium text-emerald-100">API Server: {health.status}</div>
                    <div className="text-sm text-emerald-200/70">All systems operational</div>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-300/20 bg-emerald-400/10 text-emerald-200">Live</Badge>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-2xl border border-red-300/20 bg-red-400/10">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                <span className="text-red-200 text-sm">Could not connect to API server.</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
