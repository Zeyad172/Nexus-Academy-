import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GraduationCap, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/auth-api";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const VerifyOTP = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [otp, setOtp] = useState("");
    const [timeLeft, setTimeLeft] = useState(120);
    const [isTimerActive, setIsTimerActive] = useState(true);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");

    useEffect(() => {
        const storedEmail = localStorage.getItem("verify_email");
        if (!storedEmail) {
            toast({
                title: "Error",
                description:
                    "No email found for verification. Please sign up again.",
                variant: "destructive",
            });
            navigate("/signup");
            return;
        }
        setEmail(storedEmail);
    }, [navigate, toast]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isTimerActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsTimerActive(false);
        }
        return () => clearInterval(timer);
    }, [timeLeft, isTimerActive]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 6) {
            toast({
                title: "Invalid OTP",
                description:
                    "Please enter the full 6-digit code sent to your email.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            await authApi.verifyOtp({ email, otp });
            toast({
                title: "Email Verified",
                description: "You can now proceed to login.",
            });
            localStorage.removeItem("verify_email");
            navigate("/login");
        } catch (error: any) {
            toast({
                title: "Verification Failed",
                description: error.message || "Invalid or expired code",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            await authApi.resendOtp(email);
            setTimeLeft(120);
            setIsTimerActive(true);
            toast({
                title: "OTP Sent",
                description: "A new code has been sent to your email.",
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to resend OTP",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="h-screen overflow-y-auto custom-scrollbar bg-background">
            <div className="min-h-full flex items-center justify-center px-4">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo & Header */}
                    <div className="text-center">
                        <Link
                            to="/signup"
                            className="inline-flex items-center gap-2 mb-6 text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ArrowLeft size={16} />
                            <span className="text-small font-medium">
                                Back to Sign Up
                            </span>
                        </Link>

                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <ShieldCheck
                                    size={32}
                                    className="text-primary-foreground"
                                />
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold text-foreground">
                            Verify your Email
                        </h1>
                        <p className="text-muted-foreground mt-2 px-6 text-sm">
                            We've sent a 6-digit verification code to{" "}
                            <span className="font-bold text-foreground">
                                {email}
                            </span>
                        </p>
                    </div>
                    <Alert className="bg-yellow-500/10 border-yellow-500/30">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        <AlertTitle className="font-semibold text-yellow-600 dark:text-yellow-400">
                            Didn't receive the email?
                        </AlertTitle>
                        <AlertDescription className="text-yellow-600/80 dark:text-yellow-400/80 text-sm">
                            Check your spam or junk folder — the email may have
                            been filtered.
                        </AlertDescription>
                    </Alert>
                    {/* OTP Form */}
                    <form
                        onSubmit={handleVerify}
                        className="space-y-6 bg-card border border-border rounded-xl p-8 shadow-sm"
                    >
                        <div className="space-y-4">
                            <div className="flex flex-col items-center gap-4">
                                <Input
                                    type="text"
                                    placeholder="000000"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) =>
                                        setOtp(
                                            e.target.value.replace(/\D/g, ""),
                                        )
                                    }
                                    disabled={loading}
                                    className="text-center text-2xl tracking-[0.5em] font-bold h-14 border-2 focus-visible:ring-primary/20"
                                />
                            </div>

                            {/* Timer & Resend Section */}
                            <div className="text-center">
                                {isTimerActive ? (
                                    <div className="text-small text-muted-foreground">
                                        Resend code in{" "}
                                        <span className="text-primary font-mono font-bold">
                                            {formatTime(timeLeft)}
                                        </span>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={loading}
                                        className="text-small font-bold text-primary hover:underline transition-all animate-in fade-in slide-in-from-top-1 disabled:opacity-50"
                                    >
                                        Didn't receive a code? Sent OTP Again
                                    </button>
                                )}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading || otp.length < 6}
                            className="w-full gradient-primary border-0 text-primary-foreground font-bold h-12 shadow-md hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2
                                        size={18}
                                        className="mr-2 animate-spin"
                                    />{" "}
                                    Verifying...
                                </>
                            ) : (
                                "Verify Account"
                            )}
                        </Button>
                    </form>

                    {/* Footer info */}
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                            <GraduationCap size={14} />
                            <span>Secure Verification by Nexus Academy</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
