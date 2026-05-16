import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/layouts/MainLayout";

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseId = searchParams.get("course_id");

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-20 text-center h-[calc(100vh-145px)] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
            <XCircle className="text-destructive" size={48} />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Payment Failed</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            We couldn't process your payment. This could be due to insufficient funds, an expired card, or a temporary issue with the payment provider.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              onClick={() => navigate(courseId ? `/courses/${courseId}` : "/courses")}
              className="gradient-primary border-0 text-primary-foreground font-bold rounded-button px-8"
            >
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/courses")}
              className="rounded-button px-8"
            >
              Browse Courses
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentFailed;
