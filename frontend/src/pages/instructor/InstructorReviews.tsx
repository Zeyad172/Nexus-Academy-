import { Loader2, Search, Eye } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { reviewApi } from "@/lib/reviews-api";
import { coursesApi } from "@/lib/courses-api";
import RatingStars from "@/components/RatingStars";
import { getMediaUrl } from "@/lib/utils";
import { useState, useEffect } from "react";
import { AppSelect } from "@/components/ui/app-select";
import { Button } from "@/components/ui/button";
import { AppPagination } from "@/components/ui/app-pagination";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

const InstructorReviews = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [ratingFilter, setRatingFilter] = useState("All Ratings");
    const [courseFilter, setCourseFilter] = useState("All Courses");
    const [page, setPage] = useState(1);
    const limit = 10;

    const [selectedReview, setSelectedReview] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data: coursesData } = useQuery({
        queryKey: ["instructor-courses"],
        queryFn: () => coursesApi.getMyCourses(1, 100),
    });

    const courses = coursesData?.courses || [];

    const selectedCourseId =
        courseFilter === "All Courses"
            ? undefined
            : courses.find((c) => c.title === courseFilter)?.course_id;

    const selectedRating =
        ratingFilter === "All Ratings" ? undefined : ratingFilter.split(" ")[0];

    const { data: reviewsRes, isLoading } = useQuery({
        queryKey: ["instructor-reviews", selectedCourseId, selectedRating, debouncedSearch, page],
        queryFn: () =>
            reviewApi.getInstructorReviews({
                course_id: selectedCourseId,
                rating: selectedRating,
                search: debouncedSearch,
                page,
                limit,
            }),
    });

    const reviews = reviewsRes?.reviews || [];
    const total = reviewsRes?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const filteredReviews = reviews;

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
        <DashboardLayout type="instructor">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div>
                    <h1 className="text-h1 text-foreground">Course Reviews</h1>
                    <p className="text-body text-muted-foreground mt-1">
                        Manage student feedback and course ratings
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-card rounded-card card-shadow p-6 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                        type="text"
                        placeholder="Search by student or comment..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-small bg-muted/30 rounded-button border border-border outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <AppSelect
                        options={courseOptions}
                        value={courseFilter}
                        onValueChange={(val) => {
                            setCourseFilter(val);
                            setPage(1);
                        }}
                        className="flex-1 md:w-[250px]"
                    />
                    <AppSelect
                        options={ratingOptions}
                        value={ratingFilter}
                        onValueChange={(val) => {
                            setRatingFilter(val);
                            setPage(1);
                        }}
                        className="flex-1 md:w-[130px]"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-card rounded-card card-shadow overflow-hidden border border-border/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/20">
                                <th className="px-6 py-4 text-[10px] uppercase">
                                    Student
                                </th>
                                <th className="px-6 py-4 text-[10px] uppercase hidden md:table-cell">
                                    Course
                                </th>
                                <th className="px-6 py-4 text-[10px] uppercase">
                                    Rating
                                </th>
                                <th className="px-6 py-4 text-[10px] uppercase hidden lg:table-cell">
                                    Feedback
                                </th>
                                <th className="px-6 py-4 text-[10px] uppercase hidden sm:table-cell">
                                    Date
                                </th>
                                <th className="px-6 py-4 text-[10px] uppercase text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="text-center py-12"
                                    >
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                    </td>
                                </tr>
                            ) : filteredReviews.length > 0 ? (
                                filteredReviews.map((r, i) => (
                                    <tr key={i} className="hover:bg-muted/30">
                                        <td className="px-6 py-4">
                                            {" "}
                                            <div className="flex items-center gap-3">
                                                {" "}
                                                <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center shrink-0 overflow-hidden border border-border shadow-sm">
                                                    {" "}
                                                    {r.avatar_url ? (
                                                        <img
                                                            src={getMediaUrl(
                                                                r.avatar_url,
                                                            )}
                                                            alt={r.first_name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-[10px] font-black text-primary-foreground">
                                                            {" "}
                                                            {
                                                                r.first_name[0]
                                                            }{" "}
                                                            {
                                                                r.last_name[0]
                                                            }{" "}
                                                        </span>
                                                    )}{" "}
                                                </div>{" "}
                                                <div className="min-w-0">
                                                    {" "}
                                                    <div className="text-small font-bold text-foreground truncate">
                                                        {" "}
                                                        {r.first_name}{" "}
                                                        {r.last_name}{" "}
                                                    </div>{" "}
                                                </div>{" "}
                                            </div>{" "}
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            {" "}
                                            <div className="text-small font-medium text-card-foreground truncate max-w-[200px]">
                                                {" "}
                                                {r.course_title}{" "}
                                            </div>{" "}
                                        </td>
                                        <td className="px-6 py-4">
                                            {" "}
                                            <RatingStars
                                                rating={r.rating}
                                                showValue={false}
                                                size={10}
                                            />{" "}
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell max-w-xs">
                                            {" "}
                                            <p className="text-[11px] text-muted-foreground italic line-clamp-2 leading-relaxed max-w-[200px]">
                                                {" "}
                                                "{r.comment}"{" "}
                                            </p>{" "}
                                        </td>
                                        <td className="px-6 py-4 hidden sm:table-cell whitespace-nowrap">
                                            {" "}
                                            <div className="text-small font-medium text-card-foreground truncate max-w-[200px]">
                                                {" "}
                                                {new Date(
                                                    r.reviewed_at,
                                                ).toLocaleDateString()}{" "}
                                            </div>{" "}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setSelectedReview(r);
                                                    setIsDialogOpen(true);
                                                }}
                                            >
                                                <Eye size={16} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="text-center py-20"
                                    >
                                        No reviews found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AppPagination 
                currentPage={page} 
                totalPages={totalPages} 
                onPageChange={setPage} 
            />

            {/* Dialog */}
            <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) setSelectedReview(null);
                }}
            >
                <DialogContent>
                    {selectedReview && (
                        <>
                            <DialogHeader>
                                <DialogTitle>
                                    {selectedReview.first_name}{" "}
                                    {selectedReview.last_name}
                                </DialogTitle>
                                <DialogDescription>
                                    Full review details
                                </DialogDescription>
                            </DialogHeader>

                            <div className="flex flex-col gap-4 mt-2">
                                <div>
                                    <span className="text-muted-foreground text-sm">
                                        Course:
                                    </span>{" "}
                                    {selectedReview.course_title}
                                </div>

                                <RatingStars
                                    rating={selectedReview.rating}
                                    showValue={false}
                                />

                                <div className="bg-muted/30 p-4 rounded-lg text-sm">
                                    "{selectedReview.comment}"
                                </div>

                                <div className="text-xs text-muted-foreground">
                                    {new Date(
                                        selectedReview.reviewed_at,
                                    ).toLocaleString()}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default InstructorReviews;
