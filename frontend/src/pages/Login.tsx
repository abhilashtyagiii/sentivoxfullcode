import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { LogIn, Mail, Lock } from "lucide-react";
import esolutionsLogo from "@/assets/image-removebg-preview_1762999283517.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { checkAuth } = useAuth();

  const validateEmail = (email: string): boolean => {
    const allowedDomains = [
      '@esolglobal.com',
      '@esol.com',
      '@otomashen.com',
      '@esglobal.com'
    ];
    
    const emailLower = email.toLowerCase();
    return allowedDomains.some(domain => emailLower.endsWith(domain));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid Email Domain",
        description: "Please use an authorized email domain: @esolglobal.com, @esol.com, @otomashen.com, or @esglobal.com",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Log API URL for debugging (only in development)
      if (import.meta.env.DEV) {
        console.log('API Base URL:', import.meta.env.VITE_API_URL || 'NOT SET');
        console.log('Login attempt:', { email, hasPassword: !!password });
      }

      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: `Network error (${response.status}): ${response.statusText}. Check if VITE_API_URL is configured correctly.` };
        }
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (response.ok && data.user) {
        // Store user in localStorage
        localStorage.setItem('sentivox_user', JSON.stringify(data.user));
        
        toast({
          title: "Welcome to Sentivox!",
          description: "Login successful.",
        });
        
        // Force a page reload to ensure clean state
        window.location.href = '/';
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred. Please try again.';
      
      // More specific error messages
      let displayMessage = errorMessage;
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        displayMessage = 'Cannot connect to server. Please check your internet connection and ensure the backend API is running.';
      } else if (errorMessage.includes('API URL is not configured') || errorMessage.includes('VITE_API_URL')) {
        displayMessage = 'Backend API is not configured. Please contact support.';
      } else if (errorMessage.includes('401') || errorMessage.includes('Invalid credentials')) {
        displayMessage = 'Invalid email or password. If this is your first login, try the default password: esol123';
      } else if (errorMessage.includes('403') || errorMessage.includes('Unauthorized email domain')) {
        displayMessage = errorMessage;
      }
      
      toast({
        title: "Login Error",
        description: displayMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black dark text-white relative overflow-hidden flex items-center justify-center">
      {/* AI Particle Background */}
      <div className="ai-particles fixed inset-0 z-0">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="ai-particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* eSolutions Logo - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <img 
          src={esolutionsLogo} 
          alt="eSolutions" 
          className="h-20 w-auto opacity-90 hover:opacity-100 transition-opacity"
          data-testid="img-esolutions-logo"
        />
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md mx-4 bg-gray-900/80 backdrop-blur-md border-cyan-500/30 shadow-2xl relative z-10">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
              <LogIn className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold sentivox-text-gradient">
            Welcome to Sentivox
          </CardTitle>
          <CardDescription className="text-gray-300">
            AI-Powered Voice Analysis Platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-200 flex items-center">
                <Mail className="h-4 w-4 mr-2 text-cyan-400" />
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your.name@esolglobal.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-cyan-500/30 text-white placeholder:text-gray-500 focus:border-cyan-400"
                data-testid="input-email"
                disabled={isLoading}
                required
              />
              <p className="text-xs text-gray-400">
                Use @esolglobal.com, @esol.com, @otomashen.com, or @esglobal.com
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-200 flex items-center">
                <Lock className="h-4 w-4 mr-2 text-cyan-400" />
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 border-cyan-500/30 text-white placeholder:text-gray-500 focus:border-cyan-400"
                data-testid="input-password"
                disabled={isLoading}
                required
              />
              <p className="text-xs text-gray-400 mt-1">
                First time? Use default password: <span className="font-mono text-cyan-400">esol123</span>
              </p>
            </div>

            <Button
              type="submit"
              className="w-full glowing-button text-white font-semibold py-6 text-lg"
              disabled={isLoading}
              data-testid="button-login"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing In...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <LogIn className="mr-2 h-5 w-5" />
                  Sign In
                </span>
              )}
            </Button>

          </form>
        </CardContent>
      </Card>

    </div>
  );
}
