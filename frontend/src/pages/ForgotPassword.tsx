import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, Loader2, ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/auth-api";

const ForgotPassword = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const validate = () => {
        if (!email.trim()) {
            setError("Email is required");
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Invalid email address");
            return false;
        }
        setError("");
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            await authApi.forgotPassword(email);
            toast({
                title: "OTP Sent",
                description:
                    "If an account exists, you will receive an OTP shortly.",
            });
            navigate("/reset-password", { state: { email } });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to send OTP",
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
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 mb-6 group transition-all hover:scale-105"
                        >
                            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-primary/30">
                                <GraduationCap
                                    size={22}
                                    className="text-primary-foreground"
                                />
                            </div>
                            <span className="text-xl font-bold text-foreground">
                                Nexus
                                <span className="text-primary">Academy</span>
                            </span>
                        </Link>
                        <h1 className="text-2xl font-black text-foreground uppercase tracking-tight">
                            Forgot Password
                        </h1>
                        <p className="text-body text-muted-foreground mt-1">
                            Enter your email to receive a reset code
                        </p>
                    </div>

                    <div className="space-y-5 bg-card border border-border rounded-xl p-6 shadow-xl relative overflow-hidden group">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="email"
                                    className="text-xs font-bold text-muted-foreground uppercase tracking-wider"
                                >
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        className={`rounded-button py-6 pl-10 border-border focus:ring-primary/20 transition-all ${error ? "border-destructive focus:ring-destructive/20" : ""}`}
                                        disabled={loading}
                                    />
                                    <Mail
                                        size={16}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                    />
                                </div>
                                {error && (
                                    <p className="text-xs font-medium text-destructive animate-in fade-in slide-in-from-top-1">
                                        {error}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="gradient-primary border-0 text-white w-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-150"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2
                                            size={18}
                                            className="mr-2 animate-spin"
                                        />{" "}
                                        Sending...
                                    </>
                                ) : (
                                    "Send Reset Code"
                                )}
                            </Button>
                        </form>

                        <div className="pt-2">
                            <Link
                                to="/login"
                                className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-primary transition-colors group"
                            >
                                <ArrowLeft
                                    size={14}
                                    className="mr-2 group-hover:-translate-x-1 transition-transform"
                                />
                                Back to Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
