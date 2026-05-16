import { Link } from "react-router-dom";
import type { Category } from "@/lib/data";

type CategoryCardProps = {
    category: Category;
    to?: string;
};

const CategoryCard = ({ category, to }: CategoryCardProps) => {
    const cardContent = (
        <>
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full group-hover:bg-primary/10 transition-colors" />

            <div className="relative z-10">
                <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                    {category.name}
                </h3>
                <div className="mt-4 flex items-center gap-2">
                    {category.course_count !== undefined && (
                        <>
                            <span className="h-px w-8 bg-primary/30 group-hover:w-12 transition-all duration-300" />
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                {category.course_count} Courses
                            </p>
                        </>
                    )}
                    {category.course_count === undefined && (
                         <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Explore Courses
                        </p>
                    )}
                </div>
            </div>
        </>
    );

    const commonClasses =
        "group relative block overflow-hidden bg-card p-8 rounded-2xl border border-border hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer";

    return to ? (
        <Link to={to} className={commonClasses}>
            {cardContent}
        </Link>
    ) : (
        <div className={commonClasses}>{cardContent}</div>
    );
};

export default CategoryCard;
