import { Loader2, ArrowRight, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface EarningItem {
    id: string | number;
    label: string;
    value: number;
    subLabel?: string;
}

interface TopEarningsChartProps {
    data: EarningItem[];
    isLoading: boolean;
    title: string;
    viewAllLink?: string;
    viewAllText?: string;
    icon?: LucideIcon;
    maxItems?: number;
}

const TopEarningsChart = ({
    data = [],
    isLoading,
    title,
    viewAllLink,
    viewAllText = "View All",
    icon: Icon,
    maxItems = 4,
}: TopEarningsChartProps) => {
    const safeData = Array.isArray(data) ? data : [];
    const items = safeData.slice(0, maxItems);
    const maxEarning = Math.max(...items.map((item) => Number(item.value) || 0), 1);

    return (
        <div className="bg-card rounded-card card-shadow p-6 flex flex-col border border-border/50 transition-all duration-300 hover:shadow-md h-[380px] w-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-h3 text-card-foreground font-black uppercase tracking-widest text-xs">
                    {title}
                </h2>
                {Icon && <Icon size={16} className="text-primary" />}
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : items.length > 0 ? (
                    items.map((item) => {
                        const val = Number(item.value) || 0;
                        const percentage = ((val / maxEarning) * 100);
                        return (
                            <div key={item.id} className="group">
                                <div className="flex justify-between text-small mb-2">
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-card-foreground truncate mr-4 group-hover:text-primary transition-colors text-xs">
                                            {item.label}
                                        </span>
                                        {item.subLabel && (
                                            <span className="text-[10px] text-muted-foreground">
                                                {item.subLabel}
                                            </span>
                                        )}
                                    </div>
                                    <span className="font-black text-primary text-xs shrink-0">
                                        ${val.toLocaleString()}
                                    </span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden transition-colors group-hover:bg-muted/80">
                                    <div
                                        className="h-full bg-primary gradient-primary rounded-full transition-all duration-1000 ease-out border-r border-white/20"
                                        style={{
                                            width: `${percentage}%`,
                                            // minWidth: '2px'
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-small">
                        No data available.
                    </div>
                )}
            </div>

            {viewAllLink && (
                <div className="mt-4 pt-4 border-t border-border/50">
                    <Link
                        to={viewAllLink}
                        className="text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline"
                    >
                        {viewAllText} <ArrowRight size={12} />
                    </Link>
                </div>
            )}
        </div>
    );
};

export default TopEarningsChart;
