import { Award, Download, Eye, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useEffect, useState } from "react";
import { Certificate, Enrollment } from "@/types";
import { certificatesApi } from "@/lib/certificates-api";
import { enrollmentApi } from "@/lib/enrollment-api";
import { toast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const StudentCertificates = () => {
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [inProgress, setInProgress] = useState<Enrollment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isViewing, setIsViewing] = useState(false);
    const [viewingHtml, setViewingHtml] = useState("");
    const [isFetchingHtml, setIsFetchingHtml] = useState(false);
    const [selectedCourseName, setSelectedCourseName] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [certs, enrollmentsRes] = await Promise.all([
                    certificatesApi.getMyCertificates(),
                    enrollmentApi.getMyEnrollments(1, 100),
                ]);

                setCertificates(certs || []);

                const enrollments = enrollmentsRes.enrollments || [];
                const inProgressCourses = enrollments.filter(
                    (e: any) => e.progress > 0 && e.progress < 95,
                );
                setInProgress(inProgressCourses);
            } catch (error) {
                console.error("Error fetching certificates:", error);
                toast({
                    title: "Error",
                    description:
                        "Failed to load certificates. Please try again later.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleView = async (courseId: number, courseName: string) => {
        try {
            setIsFetchingHtml(true);
            setSelectedCourseName(courseName);
            const html = await certificatesApi.getCertificateHtml(courseId);
            setViewingHtml(html);
            setIsViewing(true);
        } catch (error) {
            console.error("Error fetching certificate HTML:", error);
            toast({
                title: "Error",
                description:
                    "Failed to load certificate preview. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsFetchingHtml(false);
        }
    };

    const handleDownload = (courseId: number) => {
        window.location.href = certificatesApi.getDownloadUrl(courseId);
    };

    const handlePrint = () => {
        const frame = document.getElementById(
            "cert-iframe",
        ) as HTMLIFrameElement;
        if (frame && frame.contentWindow) {
            frame.contentWindow.print();
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout type="student">
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                    <Loader2
                        size={40}
                        className="animate-spin text-primary mb-4"
                    />
                    <p className="text-muted-foreground">
                        Loading your certificates...
                    </p>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout type="student">
            <div className="mb-8">
                <h1 className="text-h1 text-foreground">Certificates</h1>
                <p className="text-body text-muted-foreground mt-1">
                    Your earned certificates and credentials
                </p>
            </div>

            {/* Earned */}
            <h2 className="text-h3 text-foreground mb-4">
                Earned Certificates
            </h2>
            {certificates.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {certificates.map((cert, idx) => (
                        <div
                            key={cert.certificate_id}
                            style={{ animationDelay: `${idx * 150 + 200}ms` }}
                            className="animate-in fade-in slide-in-from-bottom-6 fill-mode-both"
                        >
                            <div className="bg-card rounded-card card-shadow overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border/50">
                                <div className="h-32 gradient-primary flex items-center justify-center relative overflow-hidden">
                                    <Award
                                        size={48}
                                        className="text-primary-foreground/50 transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-medium text-primary">
                                        Verified
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="text-small font-semibold text-card-foreground mb-1 group-hover:text-primary transition-colors">
                                        {cert.course_name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground mb-1">
                                        By {cert.inst_first} {cert.inst_last}
                                    </p>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        Completed{" "}
                                        {new Date(
                                            cert.issue_date,
                                        ).toLocaleDateString()}
                                    </p>
                                    <div className="text-[10px] text-muted-foreground font-mono mb-4">
                                        ID: {cert.certificate_id}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="rounded-button flex-1 text-xs border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300"
                                            onClick={() =>
                                                handleView(
                                                    cert.course_id,
                                                    cert.course_name,
                                                )
                                            }
                                            disabled={isFetchingHtml}
                                        >
                                            {isFetchingHtml &&
                                            selectedCourseName ===
                                                cert.course_name ? (
                                                <Loader2
                                                    size={12}
                                                    className="mr-1 animate-spin"
                                                />
                                            ) : (
                                                <Eye
                                                    size={12}
                                                    className="mr-1"
                                                />
                                            )}
                                            View
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="rounded-button flex-1 text-xs gradient-primary border-0 text-primary-foreground"
                                            onClick={() =>
                                                handleDownload(cert.course_id)
                                            }
                                        >
                                            <Download
                                                size={12}
                                                className="mr-1"
                                            />{" "}
                                            Download
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-card rounded-card card-shadow p-10 text-center mb-10">
                    <Award
                        size={48}
                        className="mx-auto text-muted-foreground/30 mb-4"
                    />
                    <p className="text-body text-muted-foreground">
                        No certificates earned yet. Complete a course to earn
                        your first certificate!
                    </p>
                </div>
            )}

            {/* In Progress */}
            {inProgress.length > 0 && (
                <>
                    <h2 className="text-h3 text-foreground mb-4">
                        Almost There
                    </h2>
                    <div className="space-y-3">
                        {inProgress.map((c) => (
                            <div
                                key={c.course_id}
                                className="bg-card rounded-card card-shadow p-4 flex items-center gap-4"
                            >
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                    <Award
                                        size={20}
                                        className="text-muted-foreground"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-small font-medium text-card-foreground truncate">
                                        {c.title}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="flex-1 h-2 rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full gradient-primary"
                                                style={{
                                                    width: `${c.progress}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {Math.round(c.progress)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Certificate Viewer Dialog */}
            <Dialog open={isViewing} onOpenChange={setIsViewing}>
                <DialogContent className="max-w-[95vw] w-[1000px] h-[90vh] flex flex-col p-0 overflow-hidden bg-background">
                    <DialogHeader className="p-4 border-b flex flex-row items-center justify-between space-y-0">
                        <DialogTitle className="text-lg font-bold truncate pr-4">
                            {selectedCourseName}
                        </DialogTitle>
                        <div className="flex items-center gap-2 pr-8">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-4 text-xs"
                                onClick={() =>
                                    handleDownload(
                                        certificates.find(
                                            (c) =>
                                                c.course_name ===
                                                selectedCourseName,
                                        )?.course_id || 0,
                                    )
                                }
                            >
                                <Download size={14} className="mr-2" /> Download
                                PDF
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 bg-slate-50 p-4 md:p-8 flex items-center justify-center overflow-hidden">
                        <iframe
                            id="cert-iframe"
                            srcDoc={`
                ${viewingHtml}
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
                    el.style.transform = 'scale(' + (scale * 0.95) + ')';
                  }
                  window.onload = scale;
                  window.onresize = scale;
                </script>
              `}
                            className="w-full h-full border-0"
                            title="Certificate Preview"
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default StudentCertificates;
