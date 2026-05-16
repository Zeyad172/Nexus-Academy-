import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const EmailDeliveryError = () => {
    return (
        <Alert
            variant="destructive"
            className="bg-destructive/10 border-destructive/20"
        >
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="font-bold">
                Email delivery is temporarily unavailable
            </AlertTitle>
            <AlertDescription>
                Email features like signup verification and password reset are
                currently disabled. You can still login with Google, browse and 
                use the platform - we're working on a fix.
            </AlertDescription>
        </Alert>
    );
};

export default EmailDeliveryError;
