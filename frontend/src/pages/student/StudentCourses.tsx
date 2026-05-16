import { BookOpen, PlayCircle, Search } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProgressBar from "@/components/ProgressBar";
import { AppSelect } from "@/components/ui/app-select";
import { useQuery } from "@tanstack/react-query";
import { enrollmentApi } from "@/lib/enrollment-api";
import { getMediaUrl } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AppPagination } from "@/components/ui/app-pagination";

const StudentCourses = () => {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [page, setPage] = useState(1);
    const limit = 10;

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: enrollmentsRes, isLoading } = useQuery({
        queryKey: ["my-enrollments", page, debouncedSearch, statusFilter],
        queryFn: () =>
            enrollmentApi.getMyEnrollments(page, limit, {
                search: debouncedSearch,
                status:
                    statusFilter === "All Status" ? undefined : statusFilter,
            }),
    });

    const enrollmentData = enrollmentsRes?.enrollments || [];
    const total = enrollmentsRes?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const filteredEnrollments = enrollmentData;

    return (
        <DashboardLayout type="student">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div>
                    <h1 className="text-h1 text-foreground">My Courses</h1>
                    <p className="text-body text-muted-foreground mt-1">
                        Access and manage your learning journey
                    </p>
                </div>
                <Button
                    asChild
                    className="gradient-primary border-0 text-primary-foreground rounded-button transition-all hover:scale-105 active:scale-95 shadow-md"
                >
                    <Link to="/courses">Browse Catalog</Link>
                </Button>
            </div>

            {/* Search & Filters */}
            <div className="bg-card rounded-card card-shadow p-6 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
                <div className="relative w-full md:w-96">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                        type="text"
                        placeholder="Search your courses..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-small bg-muted/30 rounded-button border border-border outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
                <div className="w-full md:w-auto">
                    <AppSelect
                        options={[
                            "All Status",
                            "In Progress",
                            "Completed",
                            "Not Started",
                        ]}
                        value={statusFilter}
                        onValueChange={setStatusFilter}
                        triggerClassName="w-full md:w-[180px] hover:bg-muted/50 transition-colors"
                    />
                </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-64 rounded-card bg-muted animate-pulse"
                        />
                    ))
                ) : filteredEnrollments.length > 0 ? (
                    filteredEnrollments.map((course, idx) => (
                        <Link to={`/learn/${course.course_id}`}>
                            <div
                                key={course.course_id}
                                className="animate-in fade-in slide-in-from-bottom-6 fill-mode-both"
                                style={{
                                    animationDelay: `${idx * 150 + 200}ms`,
                                }}
                            >
                                <div className="bg-card rounded-card card-shadow overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-border/50 h-full flex flex-col">
                                    <div className="aspect-video overflow-hidden relative">
                                        {course.thumbnail_url ? (
                                            <img
                                                src={getMediaUrl(
                                                    course.thumbnail_url,
                                                )}
                                                alt={course.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                                                <BookOpen
                                                    size={40}
                                                    className="text-primary/20"
                                                />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button
                                                asChild
                                                className="rounded-full h-12 w-12 p-0 gradient-primary border-0 scale-90 group-hover:scale-100 transition-transform duration-300 shadow-xl"
                                            >
                                                <div>
                                                    <PlayCircle size={28} />
                                                </div>
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="text-small font-bold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                                            {course.title}
                                        </h3>
                                        <p className="text-xs text-muted-foreground mb-4">
                                            {course.instructor_first_name}{" "}
                                            {course.instructor_last_name}
                                        </p>
                                        <div className="mt-auto space-y-2">
                                            <ProgressBar
                                                value={Math.round(
                                                    course.progress,
                                                )}
                                                className="h-1.5 group-hover:bg-muted/30 transition-colors mb-2"
                                            />
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="w-full mt-4 text-xs font-bold rounded-button border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300"
                                            >
                                                <div>
                                                    {course.progress === 100
                                                        ? "Review Course"
                                                        : "Continue Learning"}
                                                </div>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="col-span-full py-16 text-center animate-in fade-in duration-700">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search
                                size={24}
                                className="text-muted-foreground"
                            />
                        </div>
                        <h3 className="text-h3 text-foreground mb-2">
                            No courses found
                        </h3>
                        <p className="text-body text-muted-foreground mb-8 max-w-xs mx-auto">
                            We couldn't find any courses that match your search.
                        </p>
                        <Button
                            asChild
                            variant="outline"
                            className="rounded-button hover:bg-muted transition-all hover:scale-105 active:scale-95"
                        >
                            <Link to="/courses">Browse All Courses</Link>
                        </Button>
                    </div>
                )}
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
                <AppPagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                />
            </div>
        </DashboardLayout>
    );
};

export default StudentCourses;
