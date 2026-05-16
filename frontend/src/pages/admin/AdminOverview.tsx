import {
    Users,
    BookOpen,
    DollarSign,
    Star,
    Loader2,
    MessageSquare,
    Settings,
    ArrowRight,
    Scroll,
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { coursesApi } from "@/lib/courses-api";
import { categoryApi } from "@/lib/categories-api";
import { enrollmentApi } from "@/lib/enrollment-api";
import { earningsApi } from "@/lib/earnings-api";
import { AdminEarningDetail } from "@/types";
import { getMediaUrl } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MonthlyRevenueChart from "@/components/MonthlyRevenueChart";
import TopEarningsChart from "@/components/TopEarningsChart";

const AdminOverview = () => {
    const { data: coursesData, isLoading: isCoursesLoading } = useQuery({
        queryKey: ["admin-overview-courses"],
        queryFn: () => coursesApi.getAll({ page: 1, limit: 5, order: "DESC" }),
    });

    const { data: coursesStatsData, isLoading: isStatsLoading } = useQuery({
        queryKey: ["admin-overview-courses-stats"],
        queryFn: () => coursesApi.getAll({ page: 1, limit: 1000 }),
    });

    const { data: earningsSummary, isLoading: isEarningsLoading } = useQuery({
        queryKey: ["admin-overview-earnings"],
        queryFn: () => earningsApi.getSummary<AdminEarningDetail>(1, 5),
    });

    const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
        queryKey: ["admin-overview-analytics"],
        queryFn: () => earningsApi.getAnalytics(),
    });

    const { data: recentEnrollmentsRes, isLoading: isEnrollmentsLoading } =
        useQuery({
            queryKey: ["admin-overview-recent-enrollments"],
            queryFn: () => enrollmentApi.getAll({ page: 1, limit: 5 }),
        });

    const { data: categories, isLoading: isCategoriesLoading } = useQuery({
        queryKey: ["admin-overview-categories"],
        queryFn: () => categoryApi.getAll(),
    });

    const latestCourses = coursesData?.courses || [];
    const recentEnrollments = recentEnrollmentsRes?.enrollments || [];
    const allCourses = coursesStatsData?.courses || [];

    const totalStudents = allCourses.reduce(
        (sum, c) => sum + (c.students_count || 0),
        0,
    );

    const totalRevenue = earningsSummary?.total_revenue || 0;

    const avgRating = (() => {
        const totalRating = allCourses.reduce(
            (sum, c) => sum + (c.rating || 0) * (c.review_count || 0),
            0,
        );
        const totalReviews = allCourses.reduce(
            (sum, c) => sum + (c.review_count || 0),
            0,
        );
        return totalReviews > 0
            ? (totalRating / totalReviews).toFixed(1)
            : "0.0";
    })();

    const stats = [
        {
            label: "Total Students",
            value: totalStudents.toLocaleString(),
            icon: Users,
            color: "text-primary",
            bg: "bg-primary/10",
        },
        {
            label: "Platform Revenue",
            value: `$${totalRevenue.toLocaleString()}`,
            icon: DollarSign,
            color: "text-secondary",
            bg: "bg-secondary/10",
        },
        {
            label: "Active Courses",
            value: (coursesStatsData?.total || 0).toLocaleString(),
            icon: BookOpen,
            color: "text-amber-600",
            bg: "bg-amber-500/10",
        },
        {
            label: "Avg. Rating",
            value: avgRating,
            icon: Star,
            color: "text-emerald-600",
            bg: "bg-emerald-500/10",
        },
    ];

    const formatDate = (dateString: string) => {
        const d = new Date(dateString);
        return d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const earningInstructors = (earningsSummary?.details || []).map((i) => ({
        id: i.user_id,
        label: `${i.first_name} ${i.last_name}`,
        value: i.earning,
    }));

    return (
        <DashboardLayout type="admin">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-h1 text-foreground font-black tracking-tight">
                        Admin Command Center
                    </h1>
                    <p className="text-body text-muted-foreground mt-1">
                        Real-time platform insights and oversight
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        asChild
                        variant="outline"
                        className="rounded-button"
                    >
                        <Link to="/admin/settings">
                            <Settings size={18} className="mr-2" /> Settings
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {isStatsLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                          <div
                              key={i}
                              className="bg-card rounded-card card-shadow p-5 h-28 animate-pulse"
                          />
                      ))
                    : stats.map((s) => (
                          <div
                              key={s.label}
                              className="bg-card rounded-card card-shadow p-5 hover-lift border border-border/50 transition-all hover:shadow-lg"
                          >
                              <div
                                  className={`w-10 h-10 rounded-lg ${s.bg} ${s.color} flex items-center justify-center mb-3`}
                              >
                                  <s.icon size={20} />
                              </div>
                              <div className="text-2xl font-bold text-card-foreground">
                                  {s.value}
                              </div>
                              <div className="text-small text-muted-foreground uppercase tracking-widest text-[10px] font-black mt-1">
                                  {s.label}
                              </div>
                          </div>
                      ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Platform Revenue Overview — scrollable on small screens */}
                <div className="lg:col-span-2 overflow-x-auto bg-card rounded-card card-shadow border border-border/50">
                    <div className="min-w-[560px] h-full">
                        <MonthlyRevenueChart
                            data={analytics}
                            isLoading={isAnalyticsLoading}
                            title="Platform Revenue Overview"
                            showPlatformFeeLabel={true}
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-card rounded-card card-shadow p-6 border border-border/50">
                        <h2 className="text-h3 text-card-foreground mb-4">
                            Quick Actions
                        </h2>
                        <div className="space-y-3">
                            <Link
                                to="/admin/courses"
                                className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-primary/10 hover:text-primary transition-all group border border-border/50"
                            >
                                <div className="flex items-center gap-3">
                                    <BookOpen
                                        size={18}
                                        className="text-primary"
                                    />
                                    <span className="text-small font-bold">
                                        Manage Courses
                                    </span>
                                </div>
                                <ArrowRight
                                    size={14}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                            </Link>
                            <Link
                                to="/admin/users"
                                className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-primary/10 hover:text-primary transition-all group border border-border/50"
                            >
                                <div className="flex items-center gap-3">
                                    <Users size={18} className="text-primary" />
                                    <span className="text-small font-bold">
                                        User Directory
                                    </span>
                                </div>
                                <ArrowRight
                                    size={14}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                            </Link>
                            <Link
                                to="/admin/enrollments"
                                className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-primary/10 hover:text-primary transition-all group border border-border/50"
                            >
                                <div className="flex items-center gap-3">
                                    <Scroll
                                        size={18}
                                        className="text-primary"
                                    />
                                    <span className="text-small font-bold">
                                        Enrollment History
                                    </span>
                                </div>
                                <ArrowRight
                                    size={14}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                            </Link>
                            <Link
                                to="/admin/reviews"
                                className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-primary/10 hover:text-primary transition-all group border border-border/50"
                            >
                                <div className="flex items-center gap-3">
                                    <MessageSquare
                                        size={18}
                                        className="text-primary"
                                    />
                                    <span className="text-small font-bold">
                                        Audit Reviews
                                    </span>
                                </div>
                                <ArrowRight
                                    size={14}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                            </Link>
                            <Link
                                to="/admin/payments"
                                className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-primary/10 hover:text-primary transition-all group border border-border/50"
                            >
                                <div className="flex items-center gap-3">
                                    <DollarSign
                                        size={18}
                                        className="text-primary"
                                    />
                                    <span className="text-small font-bold">
                                        Payment History
                                    </span>
                                </div>
                                <ArrowRight
                                    size={14}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <TopEarningsChart
                        data={earningInstructors}
                        isLoading={isEarningsLoading}
                        title="Top Earning Instructors"
                        viewAllLink="/admin/payments"
                        viewAllText="Detailed Reports"
                    />
                </div>

                {/* Latest Courses — scrollable on small screens */}
                <div className="lg:col-span-2 bg-card rounded-card card-shadow p-6 border border-border/50 mb-8 overflow-x-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-h3 text-card-foreground">
                            Latest Courses
                        </h2>
                        <Link
                            to="/admin/courses"
                            className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
                        >
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="overflow-auto max-h-[400px]">
                        <table className="w-full relative min-w-[520px]">
                            <thead className="sticky top-0 z-10">
                                <tr className="border-b border-border bg-muted/90 backdrop-blur-sm">
                                    <th className="text-left text-[10px] font-black text-muted-foreground tracking-widest px-4 py-3 uppercase">
                                        Title
                                    </th>
                                    <th className="text-left text-[10px] font-black text-muted-foreground tracking-widest px-4 py-3 uppercase">
                                        Price
                                    </th>
                                    <th className="text-left text-[10px] font-black text-muted-foreground tracking-widest px-4 py-3 uppercase">
                                        Rating
                                    </th>
                                    <th className="text-left text-[10px] font-black text-muted-foreground tracking-widest px-4 py-3 uppercase">
                                        Level
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {isCoursesLoading ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-4 py-8 text-center"
                                        >
                                            <Loader2
                                                className="animate-spin text-primary mx-auto"
                                                size={22}
                                            />
                                        </td>
                                    </tr>
                                ) : latestCourses.length > 0 ? (
                                    latestCourses.map((course) => (
                                        <tr
                                            key={course.course_id}
                                            className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                                        >
                                            <td className="px-4 py-3 text-small font-bold text-card-foreground max-w-[260px] truncate">
                                                {course.title}
                                            </td>
                                            <td className="px-4 py-3 text-small text-card-foreground font-medium">
                                                {course.price === 0
                                                    ? "Free"
                                                    : `$${course.price}`}
                                            </td>
                                            <td className="px-4 py-3 text-small text-card-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Star
                                                        size={12}
                                                        className="text-amber-400 fill-amber-400"
                                                    />
                                                    {course.rating?.toFixed(
                                                        1,
                                                    ) || "0.0"}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-small text-muted-foreground font-bold text-[10px]">
                                                {course.level}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-4 py-8 text-center text-muted-foreground"
                                        >
                                            No courses found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Enrollments — scrollable on small screens */}
                <div className="bg-card rounded-card lg:col-span-3 card-shadow p-6 border border-border/50 overflow-x-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-h3 text-card-foreground">
                            Recent Enrollments
                        </h2>
                        <Link
                            to="/admin/enrollments"
                            className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
                        >
                            View History <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="overflow-auto max-h-[400px]">
                        <table className="w-full relative min-w-[600px]">
                            <thead className="sticky top-0 z-10">
                                <tr className="border-b border-border bg-muted/90 backdrop-blur-sm">
                                    <th className="text-left text-[10px] font-black text-muted-foreground tracking-widest px-4 py-3 uppercase">
                                        Student
                                    </th>
                                    <th className="text-left text-[10px] font-black text-muted-foreground tracking-widest px-4 py-3 uppercase">
                                        Course
                                    </th>
                                    <th className="text-left text-[10px] font-black text-muted-foreground tracking-widest px-4 py-3 uppercase">
                                        Enrolled Date
                                    </th>
                                    <th className="text-right text-[10px] font-black text-muted-foreground tracking-widest px-4 py-3 uppercase">
                                        Cost
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {isEnrollmentsLoading ? (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-4 py-8 text-center"
                                        >
                                            <Loader2
                                                className="animate-spin text-primary mx-auto"
                                                size={22}
                                            />
                                        </td>
                                    </tr>
                                ) : recentEnrollments.length > 0 ? (
                                    recentEnrollments.map(
                                        (enrollment, index) => (
                                            <tr
                                                key={`${enrollment.user_id}-${enrollment.course_title}-${index}`}
                                                className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-black shadow-sm group-hover:scale-110 transition-transform overflow-hidden">
                                                            {enrollment.avatar_url ? (
                                                                <img
                                                                    src={getMediaUrl(
                                                                        enrollment.avatar_url,
                                                                    )}
                                                                    alt={
                                                                        enrollment.first_name
                                                                    }
                                                                    className="w-10 h-10 rounded-xl object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-black shadow-sm">
                                                                    {enrollment
                                                                        .first_name?.[0] ||
                                                                        enrollment.email?.[0]?.toUpperCase()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-small font-bold text-card-foreground">
                                                            {`${enrollment.first_name} ${enrollment.last_name}`}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-small text-card-foreground font-medium">
                                                    {enrollment.course_title}
                                                </td>
                                                <td className="px-4 py-3 text-small text-muted-foreground">
                                                    {formatDate(
                                                        enrollment.enrolled_at,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right text-small font-black text-primary">
                                                    $
                                                    {enrollment.enrollment_cost?.toLocaleString()}
                                                </td>
                                            </tr>
                                        ),
                                    )
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-4 py-8 text-center text-muted-foreground"
                                        >
                                            No recent enrollments found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminOverview;