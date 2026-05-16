import { useState, useRef, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    Menu,
    X,
    Star,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi, lessonsApi } from "@/lib/courses-api";
import { reviewApi } from "@/lib/reviews-api";
import { getMediaUrl } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import VideoPlayer from "@/components/VideoPlayer";

const LessonPlayer = () => {
    const { id } = useParams();
    const courseId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
    const [currentLessonIdx, setCurrentLessonIdx] = useState(0);

    const { data: course, isLoading: isCourseLoading } = useQuery({
        queryKey: ["course", courseId],
        queryFn: () => coursesApi.getById(courseId),
        enabled: !!courseId,
    });

    const { data: content, isLoading: isContentLoading } = useQuery({
        queryKey: ["course-content", courseId],
        queryFn: () => coursesApi.getCourseContent(courseId),
        enabled: !!courseId,
    });

    const [reviewOpen, setReviewOpen] = useState(false);
    const [userRating, setUserRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [isEditingReview, setIsEditingReview] = useState(false);

    const { data: userReview } = useQuery({
        queryKey: ["user-review", courseId],
        queryFn: () => reviewApi.getUserReview(courseId),
        enabled: !!courseId && user?.role === "user",
    });

    useEffect(() => {
        if (userReview) {
            setUserRating(userReview.rating);
            setReviewComment(userReview.comment);
            setIsEditingReview(true);
        }
    }, [userReview]);

    const currentSection = content?.sections[currentSectionIdx];
    const currentLesson = currentSection?.lessons[currentLessonIdx];

    const videoUrl = currentLesson?.video_url ? getMediaUrl(currentLesson.video_url) : "";

    const completeMutation = useMutation({
        mutationFn: ({ sectionOrder, lessonOrder }: { sectionOrder: number, lessonOrder: number }) => 
            lessonsApi.complete(courseId, sectionOrder, lessonOrder),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["course-content", courseId] });
            toast.success("Lesson completed!");
        }
    });

    const reviewMutation = useMutation({
        mutationFn: (data: { rating: number; comment: string }) => 
            isEditingReview 
                ? reviewApi.update(courseId, data) 
                : reviewApi.create(courseId, data),
        onSuccess: () => {
            toast.success(isEditingReview ? "Review updated successfully!" : "Thank you! Your review has been submitted.");
            setReviewOpen(false);
            queryClient.invalidateQueries({ queryKey: ["course-reviews", courseId] });
            queryClient.invalidateQueries({ queryKey: ["user-review", courseId] });
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to submit review");
        }
    });

    const hasCompletedRef = useRef(false);

    useEffect(() => {
        hasCompletedRef.current = false;
    }, [currentLesson?.lesson_order]);

    const triggerComplete = () => {
        if (
            user?.role !== "user" ||
            currentLesson?.is_completed ||
            hasCompletedRef.current || 
            completeMutation.isPending ||
            !currentSection ||
            !currentLesson
        ) return;

        hasCompletedRef.current = true;
        completeMutation.mutate({
            sectionOrder: currentSection.section_order,
            lessonOrder: currentLesson.lesson_order,
        });
    };

    const handleNextLesson = () => {
        if (!content) return;
        if (currentLessonIdx < currentSection!.lessons.length - 1) {
            setCurrentLessonIdx(currentLessonIdx + 1);
        } else if (currentSectionIdx < content.sections.length - 1) {
            setCurrentSectionIdx(currentSectionIdx + 1);
            setCurrentLessonIdx(0);
        } else {
            toast.info("Course Completed!");
        }
    };

    const handlePrev = () => {
        if (currentLessonIdx > 0) {
            setCurrentLessonIdx(currentLessonIdx - 1);
        } else if (currentSectionIdx > 0) {
            const prevSectionIdx = currentSectionIdx - 1;
            setCurrentSectionIdx(prevSectionIdx);
            setCurrentLessonIdx(content!.sections[prevSectionIdx].lessons.length - 1);
        }
    };

    const handleVideoEnded = () => {
        triggerComplete();
        setTimeout(() => handleNextLesson(), 1500);
    };

    const handleProgressUpdate = (progress: number) => {
        if (progress >= 0.95) {
            triggerComplete();
        }
    };

    const handleSubmitReview = () => {
        if (!reviewComment.trim()) {
            toast.error("Please enter a comment");
            return;
        }
        reviewMutation.mutate({ rating: userRating, comment: reviewComment });
    };

    const totalLessons = useMemo(() => content?.sections.reduce((a, s) => a + s.lessons.length, 0) || 0, [content]);
    const completedCount = useMemo(() => content?.sections.reduce((a, s) => a + s.lessons.filter(l => l.is_completed).length, 0) || 0, [content]);
    const progressPercent = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

    if (isCourseLoading || isContentLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!course || !content) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background gap-4">
                <h2 className="text-h2">Course content not found</h2>
                <Button onClick={() => navigate("/dashboard/courses")}>Back to Dashboard</Button>
            </div>
        );
    }

    return (
        <div
            className="flex h-screen bg-background font-sans overflow-hidden relative"
        >
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-full sm:w-[320px] lg:w-[380px] bg-card border-r border-border transform transition-transform duration-500 ease-in-out lg:translate-x-0 lg:static flex flex-col ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}
            >
                <div className="p-6 border-b border-border shrink-0">
                    <div className="flex items-center justify-between mb-4">
                        <Link
                            to="/dashboard/courses"
                            className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-primary transition-colors group uppercase tracking-widest"
                        >
                            <ChevronLeft
                                size={14}
                                className="mr-1 group-hover:-translate-x-0.5 transition-transform"
                            />{" "}
                            Back to Dashboard
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 text-muted-foreground"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <h2 className="text-base font-bold text-foreground leading-tight mb-4 line-clamp-1 uppercase tracking-tight">
                        {course.title}
                    </h2>

                    <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
                        {user?.role === "user" && (
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full mb-6 rounded-xl border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary font-bold text-[10px] h-9 transition-all tracking-widest uppercase"
                                >
                                <Star size={12} className="mr-2 fill-primary" />{" "}
                                {isEditingReview ? "Edit your Review" : "Leave a Review"}
                            </Button>
                        </DialogTrigger>
                        )}
                        <DialogContent className="sm:max-w-[400px]">
                            <DialogHeader>
                                <DialogTitle>{isEditingReview ? "Edit your review" : "Rate this Course"}</DialogTitle>
                                <DialogDescription>
                                    {isEditingReview ? "Update your thoughts about this course." : "Share your thoughts about this course."}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-4">
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setUserRating(s)}
                                            className="transition-transform hover:scale-110"
                                        >
                                            <Star
                                                size={28}
                                                className={
                                                    s <= userRating
                                                        ? "text-amber-400 fill-amber-400"
                                                        : "text-muted"
                                                }
                                            />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={reviewComment}
                                    onChange={(e) =>
                                        setReviewComment(e.target.value)
                                    }
                                    placeholder="Your feedback..."
                                    className="w-full p-3 text-sm border border-border rounded-xl outline-none bg-muted/30 min-h-[100px]"
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={handleSubmitReview}
                                    disabled={reviewMutation.isPending}
                                    className="w-full gradient-primary border-0 text-primary-foreground font-bold h-11 rounded-xl"
                                >
                                    {reviewMutation.isPending ? "Submitting..." : (isEditingReview ? "Update" : "Submit")}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <span>Your Progress</span>
                            <span className="text-primary">
                                {Math.round(progressPercent)}%
                            </span>
                        </div>
                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full gradient-primary transition-all duration-1000"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                </div>

                <ScrollArea className="flex-1 px-4 py-4">
                    {content.sections.map((section, sIdx) => (
                        <div key={sIdx} className="mb-6 last:mb-0">
                            <div className="flex items-center gap-2 px-3 mb-2 opacity-50">
                                <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                                    {section.title}
                                </span>
                            </div>
                            <div className="space-y-1">
                                {section.lessons.map((lesson, lIdx) => {
                                    const isActive =
                                        sIdx === currentSectionIdx &&
                                        lIdx === currentLessonIdx;
                                    const isFinished = lesson.is_completed;
                                    return (
                                        <button
                                            key={lIdx}
                                            onClick={() => {
                                                setCurrentSectionIdx(sIdx);
                                                setCurrentLessonIdx(lIdx);
                                                if (window.innerWidth < 1024)
                                                    setSidebarOpen(false);
                                            }}
                                            className={`w-full group flex items-start gap-3 p-2.5 rounded-lg transition-all ${isActive ? "bg-muted shadow-sm" : "hover:bg-muted/50"}`}
                                        >
                                            <div
                                                className={`mt-0.5 shrink-0 flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all ${isFinished ? "bg-primary border-primary text-primary-foreground" : isActive ? "border-primary" : "border-muted-foreground/30"}`}
                                            >
                                                {isFinished ? (
                                                    <CheckCircle
                                                        size={10}
                                                        strokeWidth={4}
                                                        className="shrink-0"
                                                    />
                                                ) : isActive ? (
                                                    <div className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                                                ) : (
                                                    <span className="text-[9px] font-bold text-muted-foreground leading-none flex items-center justify-center">
                                                        {lIdx + 1}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex-1 text-left min-w-0">
                                                <p
                                                    className={`text-[13px] font-bold leading-snug ${isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}
                                                >
                                                    {lesson.title}
                                                </p>
                                                <span className="text-[10px] font-bold text-muted-foreground mt-0.5 block">
                                                    {Math.floor(lesson.duration / 60)}m {lesson.duration % 60}s
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </ScrollArea>
            </aside>

            <main className="flex-1 flex flex-col relative overflow-hidden bg-background">
                <header className="lg:hidden h-14 bg-card border-b border-border px-4 flex items-center justify-between shrink-0 z-20">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="flex items-center gap-2 text-muted-foreground font-bold uppercase text-[10px] tracking-widest"
                    >
                        <Menu size={18} /> Menu
                    </button>
                    <div className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-widest">
                        Lesson {currentLessonIdx + 1}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
                    <div className="p-4 sm:p-6 lg:p-10">
                        <div className="max-w-[1000px] mx-auto">
                            <VideoPlayer 
                                src={videoUrl} 
                                onEnded={handleVideoEnded}
                                onProgressUpdate={handleProgressUpdate}
                            />

                            <div className="mt-8 bg-card p-6 sm:p-10 rounded-card card-shadow border border-border">
                                <div className="flex flex-col md:flex-row items-start justify-between gap-8 mb-10">
                                    <div className="flex-1">
                                        <div className="inline-flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest mb-3 bg-primary/10 px-3 py-1 rounded-full">
                                            <BookOpen
                                                size={12}
                                                strokeWidth={3}
                                            />{" "}
                                            {currentSection?.title}
                                        </div>
                                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight tracking-tight">
                                            {currentLesson?.title}
                                        </h1>
                                        <p className="mt-4 text-muted-foreground ">
                                            {currentLesson?.description ||
                                                "No description provided for this lesson."}
                                        </p>
                                    </div>
                                </div>
                                <div className="h-px bg-border w-full mb-10" />
                                <div className="flex items-center justify-between bg-muted/30 p-4 rounded-2xl border border-border">
                                    <Button
                                        variant="ghost"
                                        onClick={handlePrev}
                                        disabled={
                                            currentSectionIdx === 0 &&
                                            currentLessonIdx === 0
                                        }
                                        className="font-bold text-muted-foreground text-xs h-10 px-4 rounded-lg hover:bg-card hover:text-primary transition-all uppercase tracking-widest"
                                    >
                                        <ChevronLeft
                                            size={16}
                                            className="mr-1"
                                        />{" "}
                                        Prev
                                    </Button>
                                    <div className="hidden sm:block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-50">
                                        Next:{" "}
                                        {currentLessonIdx <
                                        currentSection!.lessons.length - 1
                                            ? currentSection!.lessons[
                                                  currentLessonIdx + 1
                                              ].title
                                            : "End"}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        onClick={handleNextLesson}
                                        disabled={
                                            currentSectionIdx ===
                                                content.sections.length - 1 &&
                                            currentLessonIdx ===
                                                currentSection!.lessons.length -
                                                    1
                                        }
                                        className="font-bold hover:text-primary text-xs h-10 px-4 rounded-lg hover:bg-card transition-all uppercase tracking-widest"
                                    >
                                        Next{" "}
                                        <ChevronRight
                                            size={16}
                                            className="ml-1"
                                        />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LessonPlayer;