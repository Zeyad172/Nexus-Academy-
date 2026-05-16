import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    Search,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/layouts/MainLayout";
import CourseCard from "@/components/CourseCard";
import { AppSelect } from "@/components/ui/app-select";
import { coursesApi } from "@/lib/courses-api";
import { categoryApi } from "@/lib/categories-api";
import { useQuery } from "@tanstack/react-query";
import { AppPagination } from "@/components/ui/app-pagination";

const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];

const Courses = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
    
    const page = parseInt(searchParams.get("page") ?? "1");
    const selectedCategoryId = searchParams.get("category_id") ?? "All";
    const selectedLevel = searchParams.get("level") ?? "All Levels";
    const search = searchParams.get("search") ?? "";
    const sortBy = searchParams.get("sortBy") ?? "Time";
    const order = searchParams.get("order") ?? "DESC";
    
    const perPage = 8;

    const { data: categories = [] } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoryApi.getAll(),
    });

    const { data, status, isFetching, isPlaceholderData } = useQuery({
        queryKey: ["courses-explore", page, search, selectedCategoryId, selectedLevel, sortBy, order],
        queryFn: () => {
            const params: any = {
                page,
                limit: perPage,
                sortBy,
                order
            };
            if (search) params.search = search;
            if (selectedCategoryId !== "All") params.category_id = parseInt(selectedCategoryId);
            if (selectedLevel !== "All Levels") params.level = selectedLevel;
            return coursesApi.getAll(params);
        },
        placeholderData: (previousData) => previousData,
    });

    const courses = data?.courses ?? [];
    const totalCourses = data?.total ?? 0;

    const totalPages = Math.ceil(totalCourses / perPage);
    const showInitialLoading = status === "pending" && !isPlaceholderData;

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchInput !== search) {
                updateParams({ search: searchInput, page: "1" });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchInput, search]);

    const updateParams = (updates: Record<string, string | null>) => {
        const newParams = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "All" || value === "All Levels") {
                newParams.delete(key);
            } else {
                newParams.set(key, value);
            }
        });
        setSearchParams(newParams);
    };

    const handleCategoryChange = (val: string | number) => {
        updateParams({ category_id: val.toString(), page: "1" });
    };

    const handleLevelChange = (val: string) => {
        updateParams({ level: val, page: "1" });
    };

    const handleSortChange = (val: string) => {
        const [newSortBy, newOrder] = val.split("-");
        updateParams({ sortBy: newSortBy, order: newOrder, page: "1" });
    };

    const handlePageChange = (p: number) => {
        updateParams({ page: p.toString() });
    };

    return (
        <MainLayout>
            <div className="container mx-auto px-4 lg:px-8 py-10">
                {/* Header */}
                <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                    <h1 className="text-h1 text-foreground">Explore Courses</h1>
                    <p className="text-body text-muted-foreground mt-1">
                        Discover your next skill from our world-class library
                    </p>
                </div>

                {/* Filters Section */}
                <div className="bg-card rounded-card card-shadow p-6 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Search */}
                        <div className="flex-1">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                                Search
                            </label>
                            <div className="relative group">
                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                                />
                                <input
                                    type="text"
                                    placeholder="Search by title, instructor, keywords..."
                                    value={searchInput}
                                    onChange={(e) =>
                                        setSearchInput(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border rounded-button outline-none focus:ring-2 focus:ring-primary/20 focus:bg-background transition-all"
                                />
                            </div>
                        </div>

                        {/* Dropdown Filters */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:w-[600px]">
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                                    Category
                                </label>
                                <AppSelect
                                    options={[
                                        "All",
                                        ...categories.map((c) => ({
                                            value: c.category_id.toString(),
                                            label: c.name,
                                        })),
                                    ]}
                                    value={selectedCategoryId}
                                    onValueChange={handleCategoryChange}
                                    placeholder="All Categories"
                                    triggerClassName="w-full py-3 hover:bg-muted/50 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                                    Level
                                </label>
                                <AppSelect
                                    options={levels}
                                    value={selectedLevel}
                                    onValueChange={handleLevelChange}
                                    placeholder="All Levels"
                                    triggerClassName="w-full py-3 hover:bg-muted/50 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2 block">
                                    Sort By
                                </label>
                                <AppSelect
                                    options={[
                                        { label: "Newest", value: "Time-DESC" },
                                        { label: "Oldest", value: "Time-ASC" },
                                        {
                                            label: "Highest Rated",
                                            value: "Rating-DESC",
                                        },
                                        {
                                            label: "Price: Low to High",
                                            value: "Price-ASC",
                                        },
                                        {
                                            label: "Price: High to Low",
                                            value: "Price-DESC",
                                        },
                                    ]}
                                    value={`${sortBy}-${order}`}
                                    onValueChange={handleSortChange}
                                    placeholder="Sort Order"
                                    triggerClassName="w-full py-3 hover:bg-muted/50 transition-colors"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Section */}
                <div className="min-h-[400px] relative">
                    {showInitialLoading ? (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-[320px] rounded-card bg-muted animate-pulse"
                                />
                            ))}
                        </div>
                    ) : courses.length > 0 ? (
                        <>
                            <div className="flex items-center justify-between mb-6 animate-in fade-in duration-500">
                                <p className="text-small text-muted-foreground">
                                    Showing{" "}
                                    <span className="font-bold text-foreground">
                                        {courses.length}
                                    </span>{" "}
                                    of{" "}
                                    <span className="font-bold text-foreground">
                                        {totalCourses}
                                    </span>{" "}
                                    courses
                                </p>
                                {isFetching && (
                                    <Loader2
                                        size={16}
                                        className="animate-spin text-primary"
                                    />
                                )}
                            </div>

                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {courses.map((course, idx) => (
                                    <div key={course.course_id} className="animate-in fade-in zoom-in-95 fill-mode-both" style={{ animationDelay: `${(idx % 4) * 100}ms` }}>
                                        <CourseCard course={course} />
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700">
                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                                <Search size={32} className="text-muted-foreground/40" />
                            </div>
                            <h3 className="text-h3 text-foreground mb-2">
                                No courses found
                            </h3>
                            <p className="text-body text-muted-foreground max-w-xs text-center mb-8">
                                Try adjusting your search or filters to find what
                                you're looking for.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => setSearchInput("")}
                            >
                                Clear all filters
                            </Button>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {!showInitialLoading && totalPages > 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
                        <AppPagination 
                            currentPage={page} 
                            totalPages={totalPages} 
                            onPageChange={handlePageChange} 
                        />
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default Courses;
