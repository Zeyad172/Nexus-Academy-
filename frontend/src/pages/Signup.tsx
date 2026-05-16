import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/auth-api";
import { SignupForm } from "@/types";
import { useAuth } from "@/hooks/use-auth";

const Signup = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    window.location.href = authApi.getGoogleAuthUrl();
  };

  useEffect(() => {
    if (!authLoading && user) {
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "instructor") {
        navigate("/instructor");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, authLoading, navigate]);

  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirm?: string;
  }>({});
  const [form, setForm] = useState<SignupForm>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
  });

  const passwordCriteria = {
    length: form.password.length >= 6,
    hasUpper: /[A-Z]/.test(form.password),
    hasLower: /[a-z]/.test(form.password),
    hasSymbol: /[!@#$%^&*(),.?":{}|<>]/.test(form.password),
    match: form.password === form.confirm && form.password !== "",
  };

  const isPasswordValid =
    passwordCriteria.length &&
    passwordCriteria.hasUpper &&
    passwordCriteria.hasLower &&
    passwordCriteria.hasSymbol;

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Invalid email address";

    if (!isPasswordValid) newErrors.password = "Password requirements not met";
    if (form.password !== form.confirm)
      newErrors.confirm = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast({
        title: "Registration Failed",
        description: "Please check the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("first_name", form.firstName);
      formData.append("last_name", form.lastName);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("confirm_password", form.confirm);

      await authApi.register(formData);
      
      localStorage.setItem("verify_email", form.email);
      
      toast({
        title: "OTP Sent",
        description: "Verification code sent to your email.",
      });

      navigate("/verify-otp");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-y-auto custom-scrollbar bg-background">
      <div className="min-h-full flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group transition-all hover:scale-105">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-primary/30">
              <GraduationCap size={22} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Nexus<span className="text-primary">Academy</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">
            Create your account
          </h1>
          <p className="text-body text-muted-foreground mt-1">
            Start your learning journey today
          </p>
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
              <span className="bg-card px-2 text-muted-foreground">Or sign up with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="Alex"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                  disabled={loading}
                  className={`rounded-button py-6 border-border focus:ring-primary/20 transition-all ${errors.firstName ? "border-destructive focus:ring-destructive/20" : ""}`}
                />
                {errors.firstName && (
                  <p className="text-[10px] text-destructive font-medium animate-in fade-in slide-in-from-top-1">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Johnson"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  disabled={loading}
                  className={`rounded-button py-6 border-border focus:ring-primary/20 transition-all ${errors.lastName ? "border-destructive focus:ring-destructive/20" : ""}`}
                />
                {errors.lastName && (
                  <p className="text-[10px] text-destructive font-medium animate-in fade-in slide-in-from-top-1">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={loading}
                className={`rounded-button py-6 border-border focus:ring-primary/20 transition-all ${errors.email ? "border-destructive focus:ring-destructive/20" : ""}`}
              />
              {errors.email && (
                <p className="text-[10px] text-destructive font-medium animate-in fade-in slide-in-from-top-1">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" title="Create a strong password" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  disabled={loading}
                  className={`rounded-button py-6 border-border focus:ring-primary/20 transition-all pr-10 ${errors.password ? "border-destructive focus:ring-destructive/20" : ""}`}
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Confirm Password</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="••••••••"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                disabled={loading}
                className={`rounded-button py-6 border-border focus:ring-primary/20 transition-all ${errors.confirm ? "border-destructive focus:ring-destructive/20" : ""}`}
              />
              {errors.confirm && (
                <p className="text-[10px] text-destructive font-medium animate-in fade-in slide-in-from-top-1">
                  {errors.confirm}
                </p>
              )}
            </div>

            <div className="p-4 bg-muted/20 rounded-xl space-y-2 border border-border/50">
              {[
                { label: "6+ Characters", met: passwordCriteria.length },
                { label: "Capital & Small letters", met: passwordCriteria.hasUpper && passwordCriteria.hasLower },
                { label: "Symbols (@, #, $)", met: passwordCriteria.hasSymbol },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[11px] transition-all duration-300">
                  {item.met ? (
                    <CheckCircle2 size={14} className="text-emerald-500 animate-in zoom-in duration-300" />
                  ) : (
                    <XCircle size={14} className="text-muted-foreground/30" />
                  )}
                  <span className={item.met ? "text-emerald-600 font-bold" : "text-muted-foreground"}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            <Button
              type="submit"
              disabled={!isPasswordValid || !form.confirm || loading}
              className="gradient-primary border-0 text-white w-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" /> Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-small text-muted-foreground animate-in fade-in duration-1000 delay-500 fill-mode-both">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary font-black hover:underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  </div>
  );
};

export default Signup;
