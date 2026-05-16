import { Loader2 } from "lucide-react";

interface RevenueData {
    month: string;
    revenue: number;
}

interface MonthlyRevenueChartProps {
    className?: string;
    data: RevenueData[] | undefined;
    isLoading: boolean;
    title?: string;
    description?: string;
    sliceCount?: number;
    showPlatformFeeLabel?: boolean;
}

const MonthlyRevenueChart = ({
    className,
    data,
    isLoading,
    title = "Revenue Overview",
    description,
    sliceCount = 6,
    showPlatformFeeLabel = false,
}: MonthlyRevenueChartProps) => {
    const rawData = Array.isArray(data) ? data : [];
    const chartData = sliceCount && sliceCount > 0 ? rawData.slice(-sliceCount) : rawData;
    
    const maxRevenue = Math.max(
        ...chartData.map((item) => Number(item.revenue) || 0),
        1,
    );

    return (
        <div className={`bg-card rounded-card card-shadow p-6 flex flex-col transition-all duration-300 hover:shadow-md border border-border/50 h-[380px] w-full ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-h3 text-card-foreground font-black uppercase tracking-widest text-xs">
                        {title}
                    </h2>
                    {description && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex-1 flex items-end gap-2 overflow-x-auto pb-6 custom-scrollbar">
                {isLoading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : chartData.length > 0 ? (
                    chartData.map((d, i) => {
                        const rev = Number(d.revenue) || 0;
                        const percentage = (maxRevenue > 0 ? (rev / maxRevenue) * 100 : 0);

                        return (
                            <div
                                key={i}
                                className="flex-1 flex flex-col items-center justify-end gap-1 min-w-[40px] group relative h-full"
                            >
                                <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap z-10">
                                    ${rev.toLocaleString()}
                                </div>

                                <div className="text-[11px] font-bold text-primary mb-1">
                                    {rev > 0 ? `$${rev.toFixed(2)}` : ""}
                                </div>

                                <div
                                    className="w-full rounded-t-sm bg-primary gradient-primary opacity-90 hover:opacity-100 transition-all duration-300 cursor-pointer border border-primary/20"
                                    style={{ height: `${percentage}%`, minHeight: '4px' }}
                                />

                                <span className="text-[10px] text-muted-foreground mt-2 shrink-0 font-bold uppercase tracking-tighter text-center">
                                    {d.month}
                                </span>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground text-small">
                        No revenue analytics available.
                    </div>
                )}
            </div>

            {showPlatformFeeLabel && (
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        <div className="w-2.5 h-2.5 rounded-sm gradient-primary" />{" "}
                        Platform Fee (30%)
                    </div>
                </div>
            )}
        </div>
    );
};

export default MonthlyRevenueChart;
