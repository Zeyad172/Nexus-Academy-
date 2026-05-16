import { DollarSign, Users, TrendingUp, Loader2 } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { earningsApi } from "@/lib/earnings-api";
import { AdminEarningDetail } from "@/types";
import { AppPagination } from "@/components/ui/app-pagination";
import { useState } from "react";
import MonthlyRevenueChart from "@/components/MonthlyRevenueChart";
import TopEarningsChart from "@/components/TopEarningsChart";

const AdminPayments = () => {
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data: summaryData, isLoading } = useQuery({
        queryKey: ["admin-earnings-summary", page],
        queryFn: () => earningsApi.getSummary<AdminEarningDetail>(page, limit),
    });

    const { data: analytics, isLoading: isAnalyticsLoading } = useQuery({
        queryKey: ["admin-overview-analytics"],
        queryFn: () => earningsApi.getAnalytics(),
    });

    const details = summaryData?.details || [];
    const total = summaryData?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const earningInstructors = (details || []).map((i) => ({
        id: i.user_id,
        label: `${i.first_name} ${i.last_name}`,
        value: i.earning,
    }));

    return (
        <DashboardLayout type="admin">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-h1 text-foreground font-black tracking-tight">
                        Financial Hub
                    </h1>
                    <p className="text-body text-muted-foreground mt-1">
                        Monitor revenue streams and instructor shares
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-card rounded-card card-shadow p-6 hover-lift border border-border/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <DollarSign size={24} />
                        </div>
                    </div>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                        Platform Revenue (30% Share)
                    </div>
                    <div className="text-2xl font-black text-foreground">
                        ${summaryData?.total_revenue?.toFixed(2) || "0.00"}
                    </div>
                </div>

                <div className="bg-card rounded-card card-shadow p-6 hover-lift border border-border/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Users size={24} />
                        </div>
                    </div>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                        Total Earning Instructors
                    </div>
                    <div className="text-2xl font-black text-foreground">
                        {total}
                    </div>
                </div>
            </div>

            {/* Graphs Section */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Platform Revenue Overview — scrollable on small screens */}
                <div className="lg:col-span-2 overflow-x-auto bg-card rounded-card card-shadow border border-border/50">
                    <div className="min-w-[560px] h-full">
                        <MonthlyRevenueChart
                            data={analytics}
                            isLoading={isAnalyticsLoading}
                            title="Platform Revenue Overview"
                            showPlatformFeeLabel={true}
                            sliceCount={12}
                        />
                    </div>
                </div>

                <TopEarningsChart
                    data={earningInstructors}
                    isLoading={isLoading}
                    title="Revenue Contribution"
                    icon={TrendingUp}
                    maxItems={5}
                />
            </div>

            {/* Transactions Table (Instructor Shares) — scrollable on small screens */}
            <div className="bg-card rounded-card card-shadow overflow-hidden border border-border/50">
                <div className="p-5 border-b border-border bg-muted/20 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <h3 className="text-small font-black text-foreground uppercase tracking-widest">
                        Top Earning Instructors
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[520px]">
                        <thead>
                            <tr className="border-b border-border bg-muted/10">
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                    Instructor
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                    Platform Earnings (30%)
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                    Instructor Earnings (70%)
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="py-12 text-center"
                                    >
                                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                                    </td>
                                </tr>
                            ) : details.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="py-12 text-center text-muted-foreground text-sm"
                                    >
                                        No financial data found
                                    </td>
                                </tr>
                            ) : (
                                details.map((item, index) => (
                                    <tr
                                        key={item.user_id || index}
                                        className="hover:bg-muted/10 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="text-small font-bold text-foreground group-hover:text-primary transition-colors">
                                                {item.first_name}{" "}
                                                {item.last_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-small font-black text-emerald-600">
                                            ${item.earning?.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-small font-black text-primary">
                                            $
                                            {item.instructor_earning?.toFixed(
                                                2,
                                            )}
                                        </td>
                                    </tr>
                                ))
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
        </DashboardLayout>
    );
};

export default AdminPayments;