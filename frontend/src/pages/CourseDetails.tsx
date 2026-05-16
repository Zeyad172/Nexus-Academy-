import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Star,
    Clock,
    BookOpen,
    Users,
    Award,
    PlayCircle,
    CheckCircle,
    ChevronDown,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/layouts/MainLayout";
import RatingStars from "@/components/RatingStars";
import { getMediaUrl } from "@/lib/utils";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi } from "@/lib/courses-api";
import { enrollmentApi } from "@/lib/enrollment-api";
import { paymentApi } from "@/lib/payment-api";
import { reviewApi } from "@/lib/reviews-api";
import { useAuth } from "@/hooks/use-auth";

const CourseDetails = () => {
    const { id } = useParams();
    const courseId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const [isEnrolling, setIsEnrolling] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [userRating, setUserRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isEditingReview, setIsEditingReview] = useState(false);

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

    const { data: reviewsData, isLoading: isReviewsLoading } = useQuery({
        queryKey: ["course-reviews", courseId],
        queryFn: () => reviewApi.getByCourse(courseId),
        enabled: !!courseId,
    });

    const reviews = reviewsData?.reviews || [];

    const { data: userReview } = useQuery({
        queryKey: ["user-review", courseId],
        queryFn: () => reviewApi.getUserReview(courseId),
        enabled:
            !!user &&
            user.role === "user" &&
            !!courseId &&
            !!course?.is_enrolled,
        retry: false,
    });

    useEffect(() => {
        if (userReview) {
            setUserRating(userReview.rating);
            setReviewComment(userReview.comment);
            setIsEditingReview(true);
        }
    }, [userReview]);

    const enrollMutation = useMutation({
        mutationFn: (paymentMethod: string) =>
            enrollmentApi.enroll(courseId, paymentMethod),
        onSuccess: () => {
            toast.success("Successfully enrolled in " + course?.title);
            queryClient.invalidateQueries({ queryKey: ["course", courseId] });
            queryClient.invalidateQueries({
                queryKey: ["course-content", courseId],
            });
            queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
            setIsDialogOpen(false);
            navigate(`/payment-success?session_id=free&course_id=${courseId}`);
        },
        onError: (error: any) => {
            toast.error(error.message || "Enrollment failed");
        },
        onSettled: () => {
            setIsEnrolling(false);
        },
    });

    const checkoutMutation = useMutation({
        mutationFn: () => paymentApi.createCheckoutSession(courseId),
        onSuccess: (data: { url: string }) => {
            if (data?.url) {
                // If it's a Stripe URL or a direct success redirect
                window.location.href = data.url;
            } else {
                toast.error("Failed to process enrollment");
            }
        },
        onError: (error: any) => {
            toast.error(error.message || "Enrollment failed");
        },
        onSettled: () => {
            setIsEnrolling(false);
        },
    });

    const reviewMutation = useMutation({
        mutationFn: (data: { rating: number; comment: string }) =>
            isEditingReview
                ? reviewApi.update(courseId, data)
                : reviewApi.create(courseId, data),
        onSuccess: () => {
            toast.success(
                isEditingReview
                    ? "Review updated successfully!"
                    : "Thank you! Your review has been submitted.",
            );
            setShowReviewForm(false);
            queryClient.invalidateQueries({
                queryKey: ["course-reviews", courseId],
            });
            queryClient.invalidateQueries({
                queryKey: ["user-review", courseId],
            });
            queryClient.invalidateQueries({ queryKey: ["course", courseId] });
        },
        onError: (error: any) => {
            toast.error(
                error.message || "Failed to submit review",
            );
        },
    });

    const handleEnroll = () => {
        if (!user) {
            toast.error("Please login to enroll in courses");
            navigate("/login");
            return;
        }
        setIsEnrolling(true);

        if (course.price === 0) {
            enrollMutation.mutate("free");
        } else {
            checkoutMutation.mutate();
        }
    };

    const handleSubmitReview = () => {
        if (!reviewComment.trim()) {
            toast.error("Please enter a comment");
            return;
        }
        reviewMutation.mutate({ rating: userRating, comment: reviewComment });
    };

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    if (isCourseLoading || isContentLoading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            </MainLayout>
        );
    }

    if (!course) {
        return (
            <MainLayout>
                <div className="container mx-auto px-4 py-20 text-center">
                    <h2 className="text-h2">Course not found</h2>
                    <Button
                        onClick={() => navigate("/courses")}
                        className="mt-4"
                    >
                        Back to Courses
                    </Button>
                </div>
            </MainLayout>
        );
    }

    const totalLessons =
        content?.sections.reduce((a, s) => a + s.lessons.length, 0) || 0;
    const courseImageUrl = getMediaUrl(course.thumbnail_url);

    return (
        <MainLayout>
            {/* Hero Section */}
            <section className="relative gradient-primary overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-40 border-b border-border/50 h-[calc(100dvh-60px)]">
                <div className="container relative z-10 mx-auto px-4 lg:px-8 h-full flex items-center">
                    <div className="grid lg:grid-cols-3 gap-12 w-full">
                        <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full bg-white/20 text-white border border-white/30 shadow-sm">
                                    {course.category_name}
                                </span>
                                <span className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full bg-white/10 text-white/80 border border-white/20 shadow-sm">
                                    {course.level}
                                </span>
                                {course.is_enrolled && (
                                    <span className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 shadow-sm flex items-center gap-1.5">
                                        <CheckCircle size={12} /> Enrolled
                                    </span>
                                )}
                            </div>

                            {/* Title and Description */}
                            <div className="space-y-6">
                                <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-[1.15] tracking-tight">
                                    {course.title}
                                </h1>
                                <p className="text-lg lg:text-xl text-white/70 leading-relaxed max-w-3xl">
                                    {course.description.split("\n")[0]}
                                </p>
                            </div>

                            {/* Metadata & Instructor */}
                            <div className="flex flex-wrap items-center gap-6 lg:gap-10 pt-4">
                                <div className="flex items-center gap-4 group cursor-pointer bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-2xl border border-white/20 shadow-sm transition-colors">
                                    <div className="w-12 h-12 rounded-full p-0.5 bg-white/30 overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300">
                                        <div className="w-full h-full rounded-full bg-white/20 overflow-hidden flex items-center justify-center">
                                            {course.instructor_avatar ? (
                                                <img
                                                    src={getMediaUrl(
                                                        course.instructor_avatar,
                                                    )}
                                                    alt={course.instructor_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-base font-black text-white">
                                                    {course.instructor_name
                                                        ?.split(" ")
                                                        .map((n) => n[0])
                                                        .join("")}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-0.5">
                                            Instructor
                                        </div>
                                        <div className="text-sm font-bold text-white group-hover:text-white/80 transition-colors">
                                            {course.instructor_name}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                                        Course Rating
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold text-white">
                                            {course.rating?.toFixed(1) || "0.0"}
                                        </span>
                                        <RatingStars
                                            rating={course.rating}
                                            showValue={false}
                                            size={16}
                                        />
                                    </div>
                                </div>

                                <div className="h-10 w-px bg-white/20 hidden sm:block" />

                                <div className="flex flex-col gap-1.5">
                                    <div className="text-[10px] font-bold text-white/50 uppercase tracking-widest">
                                        Active Students
                                    </div>
                                    <div className="flex items-center gap-2 text-white font-bold text-lg">
                                        <Users
                                            size={18}
                                            className="text-white/70"
                                        />
                                        {(
                                            course.students_count || 0
                                        ).toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="flex flex-wrap gap-x-8 gap-y-4 pt-8 border-t border-white/20 text-[11px] font-bold uppercase tracking-wider text-white/60">
                                <span className="flex items-center gap-2 group cursor-pointer hover:text-white transition-colors">
                                    <Clock
                                        size={16}
                                        className="text-white/50 group-hover:scale-110 group-hover:text-white transition-all"
                                    />
                                    {formatDuration(course.duration)}
                                </span>
                                <span className="flex items-center gap-2 group cursor-pointer hover:text-white transition-colors">
                                    <BookOpen
                                        size={16}
                                        className="text-white/50 group-hover:scale-110 group-hover:text-white transition-all"
                                    />
                                    {totalLessons} lessons
                                </span>
                                <span className="flex items-center gap-2 group cursor-pointer hover:text-white transition-colors">
                                    <Award
                                        size={16}
                                        className="text-white/50 group-hover:scale-110 group-hover:text-white transition-all"
                                    />
                                    Certificate
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="container relative z-20 mt-20 mx-auto px-4 lg:px-8 pb-20">
                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* What you'll learn */}
                        <div className="bg-card rounded-card card-shadow p-6">
                            <h2 className="text-h3 text-card-foreground mb-4">
                                Course Description
                            </h2>
                            <p className="text-small text-muted-foreground whitespace-pre-wrap">
                                {course.description}
                            </p>
                        </div>

                        {/* Curriculum */}
                        <div>
                            <h2 className="text-h3 text-foreground mb-4">
                                Course Curriculum
                            </h2>
                            <p className="text-small text-muted-foreground mb-6">
                                {content?.sections.length || 0} sections •{" "}
                                {totalLessons} lessons •{" "}
                                {formatDuration(course.duration)} total
                            </p>
                            <Accordion
                                type="multiple"
                                defaultValue={["section-1"]}
                                className="space-y-3"
                            >
                                {content?.sections.map((section, i) => (
                                    <AccordionItem
                                        key={section.section_order}
                                        value={`section-${section.section_order}`}
                                        className="bg-card rounded-card card-shadow overflow-hidden border-0"
                                    >
                                        <AccordionTrigger className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors hover:no-underline [&>svg]:hidden">
                                            <div className="flex items-center gap-3">
                                                <BookOpen
                                                    size={18}
                                                    className="text-primary"
                                                />
                                                <span className="font-medium text-card-foreground text-small">
                                                    {section.title}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-muted-foreground">
                                                    {section.lessons.length}{" "}
                                                    lessons
                                                </span>
                                                <ChevronDown
                                                    size={16}
                                                    className="shrink-0 transition-transform duration-200"
                                                />
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-0 border-t border-border">
                                            {section.lessons.map((lesson) => (
                                                <div
                                                    key={lesson.lesson_order}
                                                    className="flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {lesson.is_completed ? (
                                                            <CheckCircle
                                                                size={16}
                                                                className="text-secondary"
                                                            />
                                                        ) : (
                                                            <PlayCircle
                                                                size={16}
                                                                className="text-muted-foreground"
                                                            />
                                                        )}
                                                        <span
                                                            className={`text-small ${lesson.is_completed ? "text-muted-foreground" : "text-card-foreground"}`}
                                                        >
                                                            {lesson.title}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatDuration(
                                                            lesson.duration,
                                                        )}
                                                    </span>
                                                </div>
                                            ))}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>

                        {/* Instructor */}
                        <div className="bg-card rounded-card card-shadow p-6">
                            <h2 className="text-h3 text-card-foreground mb-4">
                                Your Instructor
                            </h2>
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center shrink-0 overflow-hidden">
                                    {course.instructor_avatar ? (
                                        <img
                                            src={getMediaUrl(
                                                course.instructor_avatar,
                                            )}
                                            alt={course.instructor_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-xl font-bold text-primary-foreground">
                                            {course.instructor_name
                                                ?.split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-body font-semibold text-card-foreground">
                                        {course.instructor_name}
                                    </h3>
                                    <p className="text-small text-muted-foreground mb-3">
                                        Course Instructor
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Reviews */}
                        <div id="reviews">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-h3 text-foreground">
                                    Student Reviews
                                </h2>
                                {(course.is_enrolled && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-button"
                                        onClick={() =>
                                            setShowReviewForm(!showReviewForm)
                                        }
                                    >
                                        {showReviewForm
                                            ? "Cancel"
                                            : isEditingReview
                                              ? "Edit your Review"
                                              : "Write a Review"}
                                    </Button>
                                )) || (
                                    <span className="text-small text-muted-foreground">
                                        {course.review_count || 0} reviews
                                    </span>
                                )}
                            </div>

                            {showReviewForm && (
                                <div className="bg-card rounded-card card-shadow p-6 mb-8 border border-primary/20 animate-in fade-in slide-in-from-top-4">
                                    <h3 className="text-body font-bold mb-4">
                                        {isEditingReview
                                            ? "Edit your review"
                                            : "Share your experience"}
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground block mb-2">
                                                Rating
                                            </label>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        onClick={() =>
                                                            setUserRating(star)
                                                        }
                                                        className="focus:outline-none"
                                                    >
                                                        <Star
                                                            size={24}
                                                            className={`${star <= userRating ? "text-amber-400 fill-amber-400" : "text-muted border-muted"} transition-colors`}
                                                        />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-muted-foreground block mb-2">
                                                Your Review
                                            </label>
                                            <textarea
                                                rows={4}
                                                value={reviewComment}
                                                onChange={(e) =>
                                                    setReviewComment(
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="What did you like or dislike about this course?"
                                                className="w-full px-4 py-3 text-small border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 bg-muted/30 resize-none"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleSubmitReview}
                                            disabled={reviewMutation.isPending}
                                            className="gradient-primary border-0 text-primary-foreground font-bold rounded-button"
                                        >
                                            {reviewMutation.isPending
                                                ? "Submitting..."
                                                : isEditingReview
                                                  ? "Update Review"
                                                  : "Submit Review"}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                {Array.isArray(reviews) &&
                                    reviews.map((review, i) => (
                                        <div
                                            key={i}
                                            className="bg-card rounded-card card-shadow p-5"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                                        {review.avatar_url ? (
                                                            <img
                                                                src={getMediaUrl(
                                                                    review.avatar_url,
                                                                )}
                                                                alt={`${review.first_name} ${review.last_name}`}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-xs font-bold text-muted-foreground">
                                                                {
                                                                    review
                                                                        .first_name[0]
                                                                }
                                                                {
                                                                    review
                                                                        .last_name[0]
                                                                }
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-small font-medium text-card-foreground">
                                                        {review.first_name}{" "}
                                                        {review.last_name}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(
                                                        review.reviewed_at,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <RatingStars
                                                rating={review.rating}
                                                size={14}
                                                showValue={false}
                                            />
                                            <p className="text-small text-muted-foreground mt-2">
                                                {review.comment}
                                            </p>
                                        </div>
                                    ))}
                                {reviews.length === 0 && (
                                    <p className="text-center py-10 text-muted-foreground text-small">
                                        No reviews yet. Be the first to review
                                        this course!
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sticky Purchase Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-card rounded-card elevated-shadow p-6 space-y-5">
                            <div className="aspect-video rounded-lg bg-muted overflow-hidden flex items-center justify-center relative">
                                {courseImageUrl ? (
                                    <img
                                        src={courseImageUrl}
                                        alt={course.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 gradient-primary opacity-80 flex items-center justify-center">
                                        <PlayCircle
                                            size={56}
                                            className="text-primary-foreground/90"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="flex items-baseline gap-3">
                                <span className="text-3xl font-bold text-primary">
                                    {course.price === 0 ? (
                                        <span className="text-green-600">
                                            Free
                                        </span>
                                    ) : (
                                        `$${course.price ?? course.original_price}`
                                    )}
                                </span>

                                {course.price !== null &&
                                    course.price !== undefined &&
                                    course.price > 0 &&
                                    course.price < course.original_price && (
                                        <>
                                            <span className="text-body text-muted-foreground line-through">
                                                ${course.original_price}
                                            </span>
                                            <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                                                {Math.round(
                                                    (1 -
                                                        course.price /
                                                            course.original_price) *
                                                        100,
                                                )}
                                                % OFF
                                            </span>
                                        </>
                                    )}
                            </div>

                            {
                            (user?.role === "instructor" && user?.id == course?.instructor_id) ||
                            user?.role === "admin" ||
                            course.is_enrolled ?
                            (
                                <Button
                                    onClick={() =>
                                        navigate(`/learn/${courseId}`)
                                    }
                                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-button py-3 font-semibold transition-colors"
                                >
                                    Go to Course
                                </Button>
                            ) : (
                                <Dialog
                                    open={isDialogOpen}
                                    onOpenChange={setIsDialogOpen}
                                >
                                    <DialogTrigger asChild>
                                        <Button className="w-full gradient-primary border-0 text-primary-foreground rounded-button py-3 font-semibold hover:opacity-90 transition-opacity">
                                            Enroll Now
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md">
                                        <DialogHeader>
                                            <DialogTitle>
                                                Complete Enrollment
                                            </DialogTitle>
                                            <DialogDescription>
                                                You are about to enroll in{" "}
                                                <strong>{course.title}</strong>
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                                                <div className="flex justify-between text-small">
                                                    <span>Course Price</span>
                                                    <span className="font-bold">
                                                        $
                                                        {course.price ??
                                                            course.original_price}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between text-small text-muted-foreground">
                                                    <span>Tax</span>
                                                    <span>$0.00</span>
                                                </div>
                                                <div className="border-t border-border pt-2 flex justify-between font-bold">
                                                    <span>Total</span>
                                                    <span className="text-primary">
                                                        $
                                                        {course.price ??
                                                            course.original_price}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button
                                                className="w-full gradient-primary border-0 text-primary-foreground font-bold"
                                                onClick={handleEnroll}
                                                disabled={isEnrolling}
                                            >
                                                {isEnrolling
                                                    ? "Processing..."
                                                    : course.price === 0
                                                      ? "Enroll for Free"
                                                      : `Pay $${course.price ?? course.original_price} & Enroll`}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                            <div className="space-y-3 pt-2">
                                {[
                                    {
                                        label: "Duration",
                                        value: formatDuration(course.duration),
                                    },
                                    {
                                        label: "Lessons",
                                        value: `${totalLessons} lessons`,
                                    },
                                    { label: "Level", value: course.level },
                                    { label: "Certificate", value: "Yes" },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        className="flex justify-between text-small"
                                    >
                                        <span className="text-muted-foreground">
                                            {item.label}
                                        </span>
                                        <span className="font-medium text-card-foreground">
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default CourseDetails;
