import {
    DollarSign,
    TrendingUp,
    ArrowDownRight,
    Loader2,
    Users,
} from "lucide-react";
import { useState } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { earningsApi } from "@/lib/earnings-api";
import { enrollmentApi } from "@/lib/enrollment-api";
import { AppPagination } from "@/components/ui/app-pagination";
import TopEarningsChart from "@/components/TopEarningsChart";

const InstructorRevenue = () => {
    const [enrollmentPage, setEnrollmentPage] = useState(1);
    const [coursePage, setCoursePage] = useState(1);
    const limit = 10;

    const { data: summary, isLoading: isSummaryLoading } = useQuery({
        queryKey: ["earnings-summary", coursePage],
        queryFn: () => earningsApi.getSummary(coursePage, 4),
    });

    const { data: analytics = [], isLoading: isAnalyticsLoading } = useQuery({
        queryKey: ["earnings-analytics"],
        queryFn: () => earningsApi.getAnalytics(),
    });

    const { data: recentRes, isLoading: isRecentLoading } = useQuery({
        queryKey: ["recent-enrollments", enrollmentPage],
        queryFn: () =>
            enrollmentApi.getInstructorEnrollments(enrollmentPage, limit),
    });

    const transactions = recentRes?.enrollments || [];
    const totalEnrollments = recentRes?.total || 0;
    const totalEnrollmentPages = Math.ceil(totalEnrollments / limit);

    const courseEarningsData = (summary?.details || []).map((c) => ({
        id: c.course_id,
        label: c.title,
        value: c.earning,
        subLabel: `${c.total_students} students`,
    }));

    const totalCourses = summary?.total || 0;
    const totalCoursePages = Math.ceil(totalCourses / 5);

    const currentMonthRevenue = analytics?.[analytics.length - 1]?.revenue || 0;
    const totalStudentsCount =
        summary?.details?.reduce(
            (acc, curr) => acc + (curr.total_students || 0),
            0,
        ) || 0;

    const stats = [
        {
            label: "Total Revenue",
            value: `$${(summary?.total_revenue || 0).toLocaleString()}`,
            change: "",
            up: true,
        },
        {
            label: "This Month",
            value: `$${(currentMonthRevenue || 0).toLocaleString()}`,
            change: "",
            up: true,
        },
        {
            label: "Total Students",
            value: (totalStudentsCount || 0).toLocaleString(),
            change: "",
            up: true,
        },
        { label: "Pending Payout", value: "$0", change: "", up: true },
    ];

    return (
        <DashboardLayout type="instructor">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div>
                    <h1 className="text-h1 text-foreground">Revenue</h1>
                    <p className="text-body text-muted-foreground mt-1">
                        Track your earnings and payouts
                    </p>
                </div>
            </div>

            {/* Revenue Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {isSummaryLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                          <div
                              key={i}
                              className="bg-card rounded-card card-shadow p-5 h-32 animate-pulse"
                          />
                      ))
                    : stats.map((s) => (
                          <div
                              key={s.label}
                              className="bg-card rounded-card card-shadow p-5 group border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                          >
                              <div className="flex items-center gap-2 mb-3 transition-transform duration-500 group-hover:scale-105">
                                  {s.label === "Total Students" ? (
                                      <Users
                                          size={16}
                                          className="text-primary"
                                      />
                                  ) : (
                                      <DollarSign
                                          size={16}
                                          className="text-primary"
                                      />
                                  )}
                                  <span className="text-small text-muted-foreground">
                                      {s.label}
                                  </span>
                              </div>
                              <div className="text-2xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                                  {s.value}
                              </div>
                              {s.change && (
                                  <div
                                      className={`flex items-center gap-1 text-xs mt-1 ${s.up ? "text-emerald-600" : "text-destructive"}`}
                                  >
                                      {s.up ? (
                                          <TrendingUp size={12} />
                                      ) : (
                                          <ArrowDownRight size={12} />
                                      )}
                                      {s.change} vs last month
                                  </div>
                              )}
                          </div>
                      ))}
            </div>

            {/* Revenue by Course */}
            <div className="mb-8">
                <TopEarningsChart
                    data={courseEarningsData}
                    isLoading={isSummaryLoading}
                    title="Revenue by Course"
                    // maxItems={}
                />
                {totalCoursePages > 1 && (
                    <div className="mt-4 flex justify-center">
                        <AppPagination
                            currentPage={coursePage}
                            totalPages={totalCoursePages}
                            onPageChange={setCoursePage}
                        />
                    </div>
                )}
            </div>

            {/* Recent Transactions */}
            <div className="bg-card rounded-card card-shadow overflow-hidden border border-border/50 transition-all duration-300 hover:shadow-md">
                <div className="p-6 border-b border-border">
                    <h2 className="text-h3 text-card-foreground">
                        Recent Enrollments
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/20">
                                <th className="text-left text-[10px] font-black text-muted-foreground tracking-widest px-6 py-4 uppercase">
                                    Student
                                </th>
                                <th className="text-left text-[10px] font-black text-muted-foreground tracking-widest px-6 py-4 uppercase">
                                    Course
                                </th>
                                <th className="text-left text-[10px] font-black text-muted-foreground tracking-widest px-6 py-4 uppercase">
                                    Date
                                </th>
                                <th className="text-right text-[10px] font-black text-muted-foreground tracking-widest px-6 py-4 uppercase">
                                    Earning
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {isRecentLoading ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-12 text-center"
                                    >
                                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                                    </td>
                                </tr>
                            ) : transactions.length > 0 ? (
                                transactions.map((t, idx) => (
                                    <tr
                                        key={idx}
                                        className="border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="text-small font-medium text-card-foreground">
                                                {t.first_name} {t.last_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-small text-muted-foreground truncate max-w-[200px]">
                                                {t.course_title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-small text-muted-foreground">
                                                {new Date(
                                                    t.enrolled_at,
                                                ).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="text-small font-bold text-primary">
                                                $
                                                {(
                                                    t.enrollment_cost * 0.7
                                                ).toLocaleString(undefined, {
                                                    minimumFractionDigits: 2,
                                                })}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-6 py-12 text-center text-muted-foreground"
                                    >
                                        No recent enrollments found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {totalEnrollmentPages > 1 && (
                <div className="mt-8 flex justify-center">
                    <AppPagination
                        currentPage={enrollmentPage}
                        totalPages={totalEnrollmentPages}
                        onPageChange={setEnrollmentPage}
                    />
                </div>
            )}
        </DashboardLayout>
    );
};

export default InstructorRevenue;
