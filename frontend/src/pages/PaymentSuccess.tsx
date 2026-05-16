import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/layouts/MainLayout";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const course_id = searchParams.get("course_id");
  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    if (sessionId) {
      queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
      toast.success("Payment successful! You are now enrolled.");
    }
  }, [sessionId, queryClient]);

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-20 text-center h-[calc(100vh-145px)] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle className="text-emerald-500" size={48} />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Payment Successful!</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Thank you for your purchase. Your enrollment is being processed and you can start learning right away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              onClick={() => navigate(`/learn/${course_id}`)}
              className="gradient-primary border-0 text-primary-foreground font-bold rounded-button px-8"
            >
              Go to the course
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/courses")}
              className="rounded-button px-8"
            >
              Browse More Courses
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentSuccess;
