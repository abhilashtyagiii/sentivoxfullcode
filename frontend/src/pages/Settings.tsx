import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { Lock, Home, LogOut, Key, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Settings() {
  const [, setLocation] = useLocation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, logout, checkAuth } = useAuth();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "All Fields Required",
        description: "Please fill in all password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation must match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password Too Short",
        description: "New password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Password Changed",
          description: "Your password has been updated successfully",
        });
        
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        
        await checkAuth();
      } else {
        toast({
          title: "Failed to Change Password",
          description: data.message || "An error occurred",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent" data-testid="text-settings-title">
            Settings
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setLocation('/')}
              data-testid="button-home"
            >
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
            <Button
              variant="outline"
              onClick={() => logout()}
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {user?.isDefaultPassword && (
          <Alert className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" data-testid="alert-default-password">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              You are currently using the default password. For security reasons, please change your password.
            </AlertDescription>
          </Alert>
        )}

        <Card data-testid="card-change-password">
          <CardHeader>
            <div className="flex items-center">
              <Key className="h-6 w-6 mr-2 text-cyan-600" />
              <CardTitle>Change Password</CardTitle>
            </div>
            <CardDescription>
              Update your password to keep your account secure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="currentPassword" className="text-sm font-medium flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-gray-500" />
                  Current Password
                </label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  data-testid="input-current-password"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="newPassword" className="text-sm font-medium flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-gray-500" />
                  New Password
                </label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter your new password (min 8 characters)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  data-testid="input-new-password"
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium flex items-center">
                  <Lock className="h-4 w-4 mr-2 text-gray-500" />
                  Confirm New Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  data-testid="input-confirm-password"
                  disabled={isLoading}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-submit-change-password"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Updating Password...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Lock className="mr-2 h-5 w-5" />
                    Change Password
                  </span>
                )}
              </Button>

              <p className="text-sm text-gray-500 text-center mt-2">
                Password must be at least 8 characters long
              </p>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6" data-testid="card-account-info">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Email:</span>
              <span className="font-medium" data-testid="text-user-email">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Name:</span>
              <span className="font-medium" data-testid="text-user-name">{user?.name}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
