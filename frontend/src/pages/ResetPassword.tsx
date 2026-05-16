import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GraduationCap, Loader2, ArrowLeft, Key, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/auth-api";

const ResetPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [form, setForm] = useState({
    email: location.state?.email || "",
    otp: "",
    new_password: "",
    confirm_password: ""
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.otp.trim()) newErrors.otp = "OTP is required";
    else if (form.otp.length !== 6) newErrors.otp = "OTP must be 6 characters";
    
    if (!form.new_password) newErrors.new_password = "Password is required";
    else if (form.new_password.length < 6) newErrors.new_password = "Password must be at least 6 characters";
    
    if (form.new_password !== form.confirm_password) {
      newErrors.confirm_password = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await authApi.resetPassword(form);
      toast({
        title: "Success",
        description: "Password reset successfully. You can now log in.",
      });
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
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
            <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">Reset Password</h1>
            <p className="text-body text-muted-foreground mt-1">Enter the OTP and your new password</p>
          </div>

          <div className="space-y-5 bg-card border border-border rounded-xl p-6 shadow-xl relative overflow-hidden group">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`rounded-button py-6 border-border focus:ring-primary/20 transition-all ${errors.email ? "border-destructive focus:ring-destructive/20" : ""}`}
                  disabled={loading || !!location.state?.email}
                />
                {errors.email && <p className="text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">6-Digit OTP</Label>
                <div className="relative">
                  <Input
                    id="otp"
                    type="text"
                    maxLength={6}
                    placeholder="000000"
                    value={form.otp}
                    onChange={(e) => setForm({ ...form, otp: e.target.value })}
                    className={`rounded-button py-6 pl-10 border-border tracking-[0.5em] font-mono text-center focus:ring-primary/20 transition-all ${errors.otp ? "border-destructive focus:ring-destructive/20" : ""}`}
                    disabled={loading}
                  />
                  <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
                {errors.otp && <p className="text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1">{errors.otp}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password" title="Enter your account password" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">New Password</Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.new_password}
                    onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                    className={`rounded-button py-6 pl-10 border-border focus:ring-primary/20 transition-all pr-10 ${errors.new_password ? "border-destructive focus:ring-destructive/20" : ""}`}
                    disabled={loading}
                  />
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.new_password && <p className="text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1">{errors.new_password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm_password" title="Confirm your new password" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.confirm_password}
                    onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
                    className={`rounded-button py-6 pl-10 border-border focus:ring-primary/20 transition-all pr-10 ${errors.confirm_password ? "border-destructive focus:ring-destructive/20" : ""}`}
                    disabled={loading}
                  />
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
                {errors.confirm_password && <p className="text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1">{errors.confirm_password}</p>}
              </div>

              <Button 
                type="submit" 
                className="gradient-primary border-0 text-white w-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="mr-2 animate-spin" /> Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>

            <div className="pt-2">
              <Link to="/login" className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-primary transition-colors group">
                <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
