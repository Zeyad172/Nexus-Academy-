import {
    BookOpen,
    Users,
    DollarSign,
    TrendingUp,
    Plus,
    Eye,
    Edit,
    Trash2,
    Loader2,
    Star,
    Clock,
    BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import RatingStars from "@/components/RatingStars";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi } from "@/lib/courses-api";
import { earningsApi } from "@/lib/earnings-api";
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
import { getMediaUrl } from "@/lib/utils";
import { toast } from "sonner";

import MonthlyRevenueChart from "@/components/MonthlyRevenueChart";
import TopEarningsChart from "@/components/TopEarningsChart";

const InstructorDashboard = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: coursesData, isLoading: isCoursesLoading } = useQuery({
        queryKey: ["instructor-courses"],
        queryFn: () => coursesApi.getMyCourses(1, 100),
    });

    const courses = coursesData?.courses || [];
    const totalCoursesCount = coursesData?.total || 0;

    const { data: summary, isLoading: isSummaryLoading } = useQuery({
        queryKey: ["earnings-summary"],
        queryFn: () => earningsApi.getSummary(),
    });

    const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
        queryKey: ["earnings-analytics"],
        queryFn: () => earningsApi.getAnalytics(),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => coursesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
            toast.success("Course deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete course");
        },
    });

    const totalStudents = courses.reduce(
        (sum, c) => sum + (c.students_count || 0),
        0,
    );

    const stats = [
        {
            label: "Total Students",
            value: (totalStudents || 0).toLocaleString(),
            icon: Users,
        },
        {
            label: "Active Courses",
            value: (totalCoursesCount || 0).toString(),
            icon: BarChart3,
        },
        {
            label: "Total Revenue",
            value: `$${(summary?.total_revenue || 0).toLocaleString()}`,
            icon: TrendingUp,
        },
        {
            label: "Avg. Rating",
            value: (() => {
                const totalRating = courses.reduce(
                    (sum, c) => sum + (c.rating || 0) * (c.review_count || 0),
                    0,
                );
                const totalReviews = courses.reduce(
                    (sum, c) => sum + (c.review_count || 0),
                    0,
                );
                return totalReviews > 0
                    ? (totalRating / totalReviews).toFixed(1)
                    : "0.0";
            })(),
            icon: Clock,
        },
    ];

    return (
        <DashboardLayout type="instructor">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div>
                    <h1 className="text-h1 text-foreground">
                        Instructor Dashboard
                    </h1>
                    <p className="text-body text-muted-foreground mt-1">
                        Manage your courses and track performance
                    </p>
                </div>
                <Button
                    asChild
                    className="gradient-primary border-0 text-primary-foreground rounded-button hover:opacity-90 transition-all hover:scale-105"
                >
                    <Link to="/instructor/upload">
                        <Plus size={18} className="mr-2" /> Create Course
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {isCoursesLoading || isSummaryLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                          <div
                              key={i}
                              className="bg-card rounded-card card-shadow p-5 h-32 animate-pulse"
                          />
                      ))
                    : stats.map((s, idx) => (
                          <div
                              key={s.label}
                              className="bg-card rounded-card card-shadow p-5 group border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                              style={{ animationDelay: `${idx * 100}ms` }}
                          >
                              <div className="flex items-center justify-between mb-3">
                                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                                      <s.icon
                                          size={20}
                                          className="text-primary"
                                      />
                                  </div>
                              </div>
                              <div className="text-2xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                                  {s.value}
                              </div>
                              <div className="text-small text-muted-foreground">
                                  {s.label}
                              </div>
                          </div>
                      ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
                <MonthlyRevenueChart
                    data={analytics}
                    isLoading={isAnalyticsLoading}
                    title="Revenue Overview"
                    className="lg:col-span-2"
                />
                <div className="bg-card rounded-card card-shadow p-6 transition-all duration-300 hover:shadow-md border border-border/50">
                    <h2 className="text-h3 text-card-foreground mb-4">
                        Quick Actions
                    </h2>
                    <div className="space-y-4">
                        <Link
                            to="/instructor/upload"
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-all hover:pl-5 group"
                        >
                            <div className="flex items-center gap-3">
                                <Plus
                                    size={18}
                                    className="text-primary group-hover:scale-110 transition-transform"
                                />
                                <span className="text-small font-medium">
                                    Create new course
                                </span>
                            </div>
                        </Link>
                        <Link
                            to="/instructor/analytics"
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-all hover:pl-5 group"
                        >
                            <div className="flex items-center gap-3">
                                <TrendingUp
                                    size={18}
                                    className="text-primary group-hover:scale-110 transition-transform"
                                />
                                <span className="text-small font-medium">
                                    View full analytics
                                </span>
                            </div>
                        </Link>
                        <Link
                            to="/instructor/reviews"
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-all hover:pl-5 group"
                        >
                            <div className="flex items-center gap-3">
                                <Star
                                    size={18}
                                    className="text-primary group-hover:scale-110 transition-transform"
                                />
                                <span className="text-small font-medium">
                                    Manage reviews
                                </span>
                            </div>
                        </Link>
                        <Link
                            to="/instructor/students"
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-all hover:pl-5 group"
                        >
                            <div className="flex items-center gap-3">
                                <Users
                                    size={18}
                                    className="text-primary group-hover:scale-110 transition-transform"
                                />
                                <span className="text-small font-medium">
                                    Manage students
                                </span>
                            </div>
                        </Link>
                        <Link
                            to="/instructor/revenue"
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-all hover:pl-5 group"
                        >
                            <div className="flex items-center gap-3">
                                <DollarSign
                                    size={18}
                                    className="text-primary group-hover:scale-110 transition-transform"
                                />
                                <span className="text-small font-medium">
                                    Revenue reports
                                </span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Course Management Table */}
            <div className="bg-card rounded-card card-shadow transition-all  hover:shadow-md animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400 fill-mode-both">
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-h3 text-card-foreground">
                        Recent Courses
                    </h2>
                    <Link to="/instructor/courses">
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-button"
                        >
                            <BookOpen size={14} className="mr-2" /> View all
                            courses
                        </Button>
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/20">
                                <th className="text-left text-[10px] font-black text-muted-foreground tracking-widest px-6 py-4">
                                    Course
                                </th>
                                <th className="text-left text-[10px] font-black text-muted-foreground tracking-widest px-6 py-4 hidden md:table-cell">
                                    Students
                                </th>
                                <th className="text-left text-[10px] font-black text-muted-foreground tracking-widest px-6 py-4 hidden md:table-cell">
                                    Rating
                                </th>
                                <th className="text-left text-[10px] font-black text-muted-foreground tracking-widest px-6 py-4 hidden lg:table-cell">
                                    Original Price
                                </th>
                                <th className="text-left text-[10px] font-black text-muted-foreground tracking-widest px-6 py-4 hidden lg:table-cell">
                                    Current Price
                                </th>
                                <th className="text-left text-[10px] font-black text-muted-foreground tracking-widest px-6 py-4 hidden lg:table-cell">
                                    Status
                                </th>
                                <th className="text-right text-[10px] font-black text-muted-foreground tracking-widest px-6 py-4">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {isCoursesLoading ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-12 text-center"
                                    >
                                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                                    </td>
                                </tr>
                            ) : courses.length > 0 ? (
                                courses.slice(0, 5).map((c) => (
                                    <tr
                                        key={c.course_id}
                                        className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border">
                                                    {c.thumbnail_url ? (
                                                        <img
                                                            src={getMediaUrl(
                                                                c.thumbnail_url,
                                                            )}
                                                            alt={c.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <BookOpen
                                                            size={16}
                                                            className="text-muted-foreground/40"
                                                        />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-small font-medium text-card-foreground truncate max-w-[200px] group-hover:text-primary transition-colors">
                                                        {c.title}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {c.category_name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className="text-small text-card-foreground">
                                                {c.students_count?.toLocaleString() ||
                                                    0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <RatingStars
                                                showValue={false}
                                                rating={c.rating}
                                                size={12}
                                            />
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            {c.price &&
                                            c.original_price &&
                                            c.price < c.original_price ? (
                                                <span className="text-small font-medium text-muted-foreground line-through">
                                                    ${c.original_price}
                                                </span>
                                            ) : null}
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            {c.price === 0 ? (
                                                <span className="text-small font-bold text-emerald-600">
                                                    Free
                                                </span>
                                            ) : (
                                                <span className="text-small font-bold text-[#1e5a7d]">
                                                    $
                                                    {c.price ??
                                                        c.original_price}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <span
                                                className={`px-2.5 py-1 text-[10px] font-black rounded-full border shadow-sm ${
                                                    c.is_available
                                                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                                }`}
                                            >
                                                {c.is_available
                                                    ? "Published"
                                                    : "Draft"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    to={`/courses/${c.course_id}`}
                                                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground group-hover:text-primary transition-colors"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/instructor/edit/${c.course_id}`,
                                                        )
                                                    }
                                                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground group-hover:text-primary transition-colors"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <button className="p-1.5 rounded-md hover:bg-[#F24848]/10 text-muted-foreground hover:text-[#F24848] transition-colors">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </AlertDialogTrigger>

                                                    <AlertDialogContent className="rounded-card border-border bg-card">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="text-h3 text-[#1A1F2C]">
                                                                Are you sure?
                                                            </AlertDialogTitle>
                                                            <AlertDialogDescription className="text-body text-[#606977]">
                                                                This action
                                                                cannot be
                                                                undone. This
                                                                will permanently
                                                                delete the
                                                                course and
                                                                remove its data
                                                                from our
                                                                servers.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>

                                                        <AlertDialogFooter className="gap-2">
                                                            <AlertDialogCancel className="rounded-button border-[#E2E8F0] bg-white text-[#606977] hover:bg-[#F5F5F5] transition-colors">
                                                                No, Cancel
                                                            </AlertDialogCancel>

                                                            <AlertDialogAction
                                                                onClick={() =>
                                                                    deleteMutation.mutate(
                                                                        c.course_id,
                                                                    )
                                                                }
                                                                className="rounded-button bg-[#F24848] text-white hover:bg-[#D93D3D] transition-opacity border-0"
                                                            >
                                                                {deleteMutation.isPending
                                                                    ? "Deleting..."
                                                                    : "Yes, Delete"}
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
                                        colSpan={7}
                                        className="px-6 py-12 text-center text-muted-foreground"
                                    >
                                        No courses available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InstructorDashboard;
