import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="h-screen overflow-y-auto custom-scrollbar bg-background">
      <div className="min-h-full flex items-center justify-center px-4 py-8">
        <div className="max-w-4xl w-full text-center flex flex-col items-center">
          <h1 className="text-8xl md:text-8xl font-extrabold gradient-text leading-none mb-0 relative z-10">
            404
          </h1>
          <div className="relative h-[500px] w-full flex items-center justify-center -mb-20 -mt-10">
            <img
              src="https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif"
              alt="Caveman 404"
              className="h-full w-full object-contain mix-blend-multiply opacity-95"
            />
          </div>
          <div className="flex flex-col items-center mb-6 relative z-10">
            <h2 className="text-3xl font-bold text-foreground">
              Look like you're lost...!
            </h2>
            <p className="text-muted-foreground text-lg mt-1">
              the page you are looking for is not available!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              size="lg"
              className="rounded-full px-8 border-primary text-primary hover:bg-primary/5 transition-all shadow-sm"
            >
              <ArrowLeft size={18} className="mr-2" />
              Go Back
            </Button>

            <Link to="/">
              <Button
                size="lg"
                className="gradient-primary border-0 text-white rounded-full px-8 hover:opacity-90 transition-opacity shadow-lg"
              >
                <Home size={18} className="mr-2" />
                Go to Home
              </Button>
            </Link>
          </div>

          <div className="border-t border-border w-full pt-4">
            <p className="text-sm text-muted-foreground">
              Need help? Visit our{" "}
              <Link to="/help" className="text-primary font-medium hover:underline">
                Help Center
              </Link>{" "}
              or contact support.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
