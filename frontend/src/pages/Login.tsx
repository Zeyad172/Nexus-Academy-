import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, GraduationCap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/auth-api";
import { LoginForm } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();

  const from = location.state?.from?.pathname || null;

  useEffect(() => {
    if (!authLoading && user) {
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (user.role === "instructor") {
        navigate("/instructor", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, authLoading, navigate, from]);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [form, setForm] = useState<LoginForm>({ email: "", password: "" });

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    window.location.href = authApi.getGoogleAuthUrl();
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Invalid email address";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await authApi.login(form);

      // Update the auth-user query data
      queryClient.setQueryData(["auth-user"], user);

      toast({
        title: "Login successful",
        description: `Welcome back, ${user.first_name}!`
      });

      // Redirect to 'from' location or based on role
      const role = user.role;
      if (from) {
        navigate(from, { replace: true });
      } else if (role === "admin") {
        navigate("/admin", { replace: true });
      } else if (role === "instructor") {
        navigate("/instructor", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong during login.";
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      });
    } finally { 
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-y-auto custom-scrollbar bg-background">
      <div className="min-h-full flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8 py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group transition-all hover:scale-105">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-primary/30">
              <GraduationCap size={22} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Nexus<span className="text-primary">Academy</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Welcome back</h1>
          <p className="text-body text-muted-foreground mt-1">Sign in to continue learning</p>
        </div>

        <div className="space-y-5 bg-card border border-border rounded-xl p-6 shadow-xl relative overflow-hidden group">          
          <Button
            type="button"
            variant="outline"
            className="w-full border-border bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {googleLoading ? "Connecting..." : "Continue with Google"}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
              <span className="bg-card px-2 text-muted-foreground">Or email login</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`rounded-button py-6 border-border focus:ring-primary/20 transition-all ${errors.email ? "border-destructive focus:ring-destructive/20" : ""}`}
                disabled={loading}
              />
              {errors.email && <p className="text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" title="Enter your account password" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`rounded-button py-6 border-border focus:ring-primary/20 transition-all pr-10 ${errors.password ? "border-destructive focus:ring-destructive/20" : ""}`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-[10px] font-bold text-primary hover:underline underline-offset-2 uppercase tracking-widest transition-all">
                  Forgot password?
                </Link>
              </div>
              {errors.password && <p className="text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1">{errors.password}</p>}
            </div>

            <Button 
              type="submit" 
              className="gradient-primary border-0 text-white w-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" /> Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-small text-muted-foreground animate-in fade-in duration-1000 delay-500 fill-mode-both">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary font-black hover:underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  </div>
  );
};

export default Login;
