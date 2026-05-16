import { TrendingUp, Users, Clock, BarChart3, Loader2 } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { earningsApi } from "@/lib/earnings-api";
import { coursesApi } from "@/lib/courses-api";

import MonthlyRevenueChart from "@/components/MonthlyRevenueChart";
import TopEarningsChart from "@/components/TopEarningsChart";

const InstructorAnalytics = () => {
    const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
        queryKey: ["earnings-analytics"],
        queryFn: () => earningsApi.getAnalytics(),
    });

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

    const levelDist = courses.reduce((acc: any, c) => {
        acc[c.level] = (acc[c.level] || 0) + 1;
        return acc;
    }, {});

    const levels = ["Beginner", "Intermediate", "Advanced"];

    const topEarningCourses = (summary?.details || []).map((c: any) => ({
        id: c.course_id,
        label: c.title,
        value: c.earning,
        subLabel: `${c.total_students} students`,
    }));

    return (
        <DashboardLayout type="instructor">
            <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <h1 className="text-h1 text-foreground">Analytics</h1>
                <p className="text-body text-muted-foreground mt-1">
                    Track your course performance and engagement
                </p>
            </div>

            {/* Stats */}
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

            <div className="mb-8">
                <MonthlyRevenueChart
                    data={analytics}
                    isLoading={isAnalyticsLoading}
                    title="Monthly Revenue"
                    sliceCount={12}
                />
            </div>

            <div className="grid lg:grid-cols-2 gap-8 mb-8">
                <TopEarningsChart
                    data={topEarningCourses}
                    isLoading={isSummaryLoading}
                    title="Top Earning Courses"
                    maxItems={4}
                />

                {/* Level Distribution */}
                <div className="bg-card rounded-card card-shadow p-6 transition-all duration-300 hover:shadow-md border border-border/50 h-[380px]">
                    <h2 className="text-h3 text-card-foreground mb-6 font-black uppercase tracking-widest text-xs">
                        Level Distribution
                    </h2>
                    <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar max-h-[280px]">
                        {isCoursesLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2
                                    className="animate-spin text-primary"
                                    size={20}
                                />
                            </div>
                        ) : courses.length > 0 ? (
                            levels.map((level) => {
                                const count = levelDist[level] || 0;
                                const percentage =
                                    (count / courses.length) * 100;
                                return (
                                    <div key={level} className="group">
                                        <div className="flex justify-between text-small mb-1.5">
                                            <span className="text-muted-foreground group-hover:text-foreground transition-colors text-xs font-bold">
                                                {level}
                                            </span>
                                            <span className="font-black text-foreground text-xs">
                                                {count} courses
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden transition-colors group-hover:bg-muted/80">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                                    level === "Beginner"
                                                        ? "bg-emerald-500"
                                                        : level ===
                                                            "Intermediate"
                                                          ? "bg-amber-500"
                                                          : level === "Advanced"
                                                            ? "bg-red-500"
                                                            : "bg-primary"
                                                }`}
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-center text-muted-foreground text-small py-4">
                                No course data.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default InstructorAnalytics;
