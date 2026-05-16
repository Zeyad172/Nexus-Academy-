import {
    Loader2,
    Search,
    Eye,
    ShieldAlert,
    Star,
    Trash2,
    Filter,
    X,
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewApi } from "@/lib/reviews-api";
import { coursesApi } from "@/lib/courses-api";
import RatingStars from "@/components/RatingStars";
import { getMediaUrl } from "@/lib/utils";
import { useState, useEffect } from "react";
import { AppSelect } from "@/components/ui/app-select";
import { Button } from "@/components/ui/button";
import { AppPagination } from "@/components/ui/app-pagination";
import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

const AdminReviews = () => {
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [courseFilter, setCourseFilter] = useState("All Courses");
    const [ratingFilter, setRatingFilter] = useState("All Ratings");
    const [page, setPage] = useState(1);
    const limit = 10;

    const [selectedReview, setSelectedReview] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data: coursesData } = useQuery({
        queryKey: ["admin-all-courses-for-reviews"],
        queryFn: () => coursesApi.getAll({ page: 1, limit: 1000 }),
    });

    const courses = coursesData?.courses || [];

    const selectedCourseId =
        courseFilter === "All Courses"
            ? undefined
            : courses.find((c) => c.title === courseFilter)?.course_id;

    const selectedRating =
        ratingFilter === "All Ratings" ? undefined : parseInt(ratingFilter[0]);

    const { data: reviewsRes, isLoading } = useQuery({
        queryKey: [
            "admin-all-reviews",
            debouncedSearch,
            selectedCourseId,
            selectedRating,
            page,
        ],
        queryFn: () =>
            reviewApi.getAllReviews({
                page,
                limit,
                search: debouncedSearch || undefined,
                course_id: selectedCourseId,
                rating: selectedRating,
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: ({
            courseId,
            userId,
        }: {
            courseId: number;
            userId: number;
        }) => {
            return reviewApi.delete(courseId, { user_id: userId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-all-reviews"] });
            toast.success("Review deleted successfully");
            setIsDialogOpen(false);
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete review");
        },
    });

    const reviews = reviewsRes?.reviews || [];
    const total = reviewsRes?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const courseOptions = ["All Courses", ...courses.map((c) => c.title)];
    const ratingOptions = [
        "All Ratings",
        "5 Stars",
        "4 Stars",
        "3 Stars",
        "2 Stars",
        "1 Star",
    ];

    return (
        <DashboardLayout type="admin">
            <div className="mb-8">
                <h1 className="text-h1 text-foreground font-black tracking-tight">
                    Review Moderation
                </h1>
                <p className="text-body text-muted-foreground mt-1">
                    Audit and manage student feedback globally across the
                    platform
                </p>
            </div>

            {/* Advanced Filters */}
            <div className="bg-card rounded-card card-shadow p-6 mb-6 border border-border/50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">
                            Search Feedback
                        </label>
                        <div className="relative">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            />
                            <input
                                type="text"
                                placeholder="Search by student name, course, or comment..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 text-small bg-muted/30 rounded-xl border border-border outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">
                            Course Filter
                        </label>
                        <AppSelect
                            options={courseOptions}
                            value={courseFilter}
                            onValueChange={(val) => {
                                setCourseFilter(val);
                                setPage(1);
                            }}
                        />
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 block">
                            Rating Filter
                        </label>
                        <AppSelect
                            options={ratingOptions}
                            value={ratingFilter}
                            onValueChange={(val) => {
                                setRatingFilter(val);
                                setPage(1);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-card rounded-card card-shadow overflow-hidden border border-border/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/20">
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase">
                                    Student
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase">
                                    Course
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase">
                                    Rating
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase hidden lg:table-cell">
                                    Feedback
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase hidden sm:table-cell">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="text-center py-20"
                                    >
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                    </td>
                                </tr>
                            ) : reviews.length > 0 ? (
                                reviews.map((r, i) => (
                                    <tr
                                        key={i}
                                        className="hover:bg-muted/30 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0 overflow-hidden border border-border shadow-sm">
                                                    {r.avatar_url ? (
                                                        <img
                                                            src={getMediaUrl(
                                                                r.avatar_url,
                                                            )}
                                                            alt={r.first_name}
                                                            className="w-10 h-10 rounded-xl object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-black shadow-sm">
                                                            {r
                                                                .first_name?.[0] ||
                                                                r.last_name?.[0]?.toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-small font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                                        {r.first_name}{" "}
                                                        {r.last_name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-[11px] font-bold text-muted-foreground max-w-[150px] truncate">
                                            {r.course_title}
                                        </td>
                                        <td className="px-6 py-4">
                                            <RatingStars
                                                rating={r.rating}
                                                showValue={false}
                                                size={10}
                                            />
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell max-w-xs">
                                            <p className="text-[11px] text-muted-foreground italic line-clamp-1 leading-relaxed">
                                                "{r.comment}"
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell whitespace-nowrap">
                                            <div className="text-small font-medium text-muted-foreground">
                                                {new Date(
                                                    r.reviewed_at,
                                                ).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="hover:bg-primary/10 hover:text-primary transition-colors h-8 w-8"
                                                    onClick={() => {
                                                        setSelectedReview(r);
                                                        setIsDialogOpen(true);
                                                    }}
                                                >
                                                    <Eye size={16} />
                                                </Button>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="hover:bg-destructive/10 hover:text-destructive transition-colors h-8 w-8"
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>
                                                                Delete Review?
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                Permanently
                                                                remove this
                                                                feedback from
                                                                the platform?
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>
                                                                Cancel
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                className="bg-destructive"
                                                                onClick={() =>
                                                                    deleteMutation.mutate(
                                                                        {
                                                                            courseId:
                                                                                r.course_id,
                                                                            userId: r.user_id,
                                                                        },
                                                                    )
                                                                }
                                                            >
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="text-center py-20 text-muted-foreground"
                                    >
                                        No reviews found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                    <AppPagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                    />
                </div>
            )}

            {/* Dialog for Full Message */}
            <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) setSelectedReview(null);
                }}
            >
                <DialogContent className="rounded-card border-border bg-card">
                    {selectedReview && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-h3 font-black">
                                    {selectedReview.first_name}{" "}
                                    {selectedReview.last_name}
                                </DialogTitle>
                                <DialogDescription className="text-body">
                                    Full student feedback for moderation audit
                                </DialogDescription>
                            </DialogHeader>

                            <div className="flex flex-col gap-4 mt-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground text-small font-bold">
                                        Course:
                                    </span>
                                    <span className="text-small font-black text-primary">
                                        {selectedReview.course_title}
                                    </span>
                                </div>

                                <RatingStars
                                    rating={selectedReview.rating}
                                    showValue={false}
                                />

                                <div className="bg-muted/30 p-5 rounded-xl text-sm italic border border-border leading-relaxed">
                                    "{selectedReview.comment}"
                                </div>

                                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                    {new Date(
                                        selectedReview.reviewed_at,
                                    ).toLocaleString()}
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <Button
                                        variant="outline"
                                        className="rounded-button"
                                        onClick={() => setIsDialogOpen(false)}
                                    >
                                        Close
                                    </Button>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="destructive"
                                                className="rounded-button"
                                            >
                                                <Trash2
                                                    size={16}
                                                    className="mr-2"
                                                />{" "}
                                                Delete Review
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>
                                                    Confirm Deletion
                                                </AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Delete this student feedback
                                                    permanently?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>
                                                    Cancel
                                                </AlertDialogCancel>
                                                <AlertDialogAction
                                                    className="bg-destructive"
                                                    onClick={() =>
                                                        deleteMutation.mutate({
                                                            courseId:
                                                                selectedReview.course_id,
                                                            userId: selectedReview.user_id,
                                                        })
                                                    }
                                                >
                                                    Yes, Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default AdminReviews;
