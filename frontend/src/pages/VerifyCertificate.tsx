import { useState } from "react";
import { certificatesApi } from "@/lib/certificates-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, ShieldCheck, ShieldAlert, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import MainLayout from "@/layouts/MainLayout";
import PageTransition from "@/components/PageTransition";

const VerifyCertificate = () => {
  const [certId, setCertId] = useState("");
  const [loading, setLoading] = useState(false);
  const [certificateHtml, setCertificateHtml] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) {
      toast.error("Please enter a certificate ID");
      return;
    }

    setLoading(true);
    setCertificateHtml(null);
    setVerified(null);

    try {
      const html = await certificatesApi.verifyCertificate(certId);
      setCertificateHtml(html);
      setVerified(true);
      toast.success("Certificate verified successfully!");
    } catch (error: any) {
      console.error("Verification error:", error);
      setVerified(false);
      toast.error(error.message || "Certificate verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <PageTransition>
        <div className="container min-h-[calc(100vh_-_145px)] mt-auto px-4 py-12 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Verify Certificate</h1>
            <p className="text-muted-foreground text-lg">
              Enter the certificate ID found at the bottom of the certificate to verify its authenticity.
            </p>
          </div>

          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Verification Search</CardTitle>
              <CardDescription>
                (e.g., NEX-1-5)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerify} className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    placeholder="Enter Certificate ID"
                    className="pl-10"
                    value={certId}
                    onChange={(e) => setCertId(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={loading} className="min-w-[120px]">
                  {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                  Verify
                </Button>
              </form>
            </CardContent>
          </Card>

          {verified === true && certificateHtml && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 dark:text-green-400">
                <ShieldCheck size={24} />
                <div>
                  <h3 className="font-bold text-lg">Valid Certificate</h3>
                  <p>This certificate is authentic and was issued by NexusAcademy.</p>
                </div>
              </div>

              <div className="border rounded-xl overflow-hidden bg-white shadow-2xl h-[600px]">
                <iframe 
                  id="cert-iframe"
                  srcDoc={`
                    ${certificateHtml}
                    <style>
                      html, body { 
                        margin: 0; padding: 0; width: 100%; height: 100%; 
                        display: flex; align-items: center; justify-content: center;
                        background: #f8fafc; 
                        overflow: hidden;
                        font-family: 'Plus Jakarta Sans', sans-serif;
                      }
                      .cert-container {
                        box-shadow: 0 20px 50px rgba(0,0,0,0.1);
                        transform-origin: center center;
                        background: white;
                      }
                    </style>
                    <script>
                      function scale() {
                        const el = document.querySelector('.cert-container');
                        if(!el) return;
                        // A4 Landscape is 297mm x 210mm, which is approx 1122.5px x 793.7px
                        const scale = Math.min(window.innerWidth / 1122.5, window.innerHeight / 793.7);
                        el.style.transform = 'scale(' + (scale * 0.9) + ')';
                      }
                      window.onload = scale;
                      window.onresize = scale;
                    </script>
                  `} 
                  className="w-full h-full border-0"
                  title="Certificate Preview"
                />
              </div>
              
              <div className="flex justify-center">
                <p className="text-sm text-muted-foreground">
                    Certificate ID: <span className="font-mono font-medium">{certId}</span>
                </p>
              </div>
            </div>
          )}

          {verified === false && (
            <div className="flex items-center gap-3 p-6 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ShieldAlert size={32} />
              <div>
                <h3 className="font-bold text-xl">Invalid Certificate</h3>
                <p className="text-lg">We couldn't find a record for this certificate ID. It may be invalid or forged.</p>
              </div>
            </div>
          )}
        </div>
      </PageTransition>
    </MainLayout>
  );
};

export default VerifyCertificate;
