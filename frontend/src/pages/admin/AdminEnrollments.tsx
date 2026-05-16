import {
    Search,
    MoreVertical,
    Trash2,
    Loader2,
    Calendar,
    BookOpen,
    CreditCard,
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { enrollmentApi } from "@/lib/enrollment-api";
import { useToast } from "@/hooks/use-toast";
import { AppPagination } from "@/components/ui/app-pagination";
import { format } from "date-fns";
import { getMediaUrl } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppSelect } from "@/components/ui/app-select";
import { coursesApi } from "@/lib/courses-api";

const AdminEnrollments = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [courseFilter, setCourseFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const limit = 10;
    
    const { toast } = useToast();
    const queryClient = useQueryClient();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data: enrollmentsData, isLoading } = useQuery({
        queryKey: ["admin-enrollments", debouncedSearch, courseFilter, statusFilter, page],
        queryFn: () =>
            enrollmentApi.getAll({
                page,
                limit,
                search: debouncedSearch || undefined,
                course_id: courseFilter === "all" ? undefined : Number(courseFilter),
                payment_status: statusFilter === "all" ? undefined : statusFilter,
            }),
    });

    const { data: coursesData } = useQuery({
        queryKey: ["all-courses-minimal"],
        queryFn: () => coursesApi.getAll({ limit: 1000 }), // Get all courses for filter
    });

    const unenrollMutation = useMutation({
        mutationFn: ({ userId, courseId }: { userId: number; courseId: number }) => 
            enrollmentApi.unenroll(courseId, userId), 
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-enrollments"] });
            toast({
                title: "Success",
                description: "Student unenrolled successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error unenrolling",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const enrollments = enrollmentsData?.enrollments || [];
    const total = enrollmentsData?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const courseOptions = [
        { label: "All Courses", value: "all" },
        ...(coursesData?.courses?.map((c: any) => ({ label: c.title, value: c.course_id.toString() })) || []),
    ];

    const statusOptions = [
        { label: "All Status", value: "all" },
        { label: "Paid", value: "paid" },
        { label: "Pending", value: "pending" },
    ];

    const handleUnenroll = (userId: number, courseId: number) => {
        if (confirm("Are you sure you want to unenroll this student? This will also delete their progress.")) {
            unenrollMutation.mutate({ userId, courseId });
        }
    };

    return (
        <DashboardLayout type="admin">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-h1 text-foreground font-black tracking-tight">Enrollment History</h1>
                    <p className="text-body text-muted-foreground mt-1">
                        Monitor and manage all student course enrollments platform-wide
                    </p>
                </div>
            </div>

            <div className="bg-card rounded-card card-shadow p-5 mb-6 border border-border/50">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative max-w-md w-full">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        />
                        <input
                            type="text"
                            placeholder="Search by student, email or course..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-small bg-muted/30 rounded-xl border border-border outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <AppSelect
                            options={courseOptions.map(o => o.label)}
                            value={courseOptions.find(o => o.value === courseFilter)?.label || "All Courses"}
                            onValueChange={(val) => {
                                const option = courseOptions.find(o => o.label === val);
                                if (option) {
                                    setCourseFilter(option.value);
                                    setPage(1);
                                }
                            }}
                            className="flex-1 md:w-[250px]"
                        />
                        <AppSelect
                            options={statusOptions.map(o => o.label)}
                            value={statusOptions.find(o => o.value === statusFilter)?.label || "All Status"}
                            onValueChange={(val) => {
                                const option = statusOptions.find(o => o.label === val);
                                if (option) {
                                    setStatusFilter(option.value);
                                    setPage(1);
                                }
                            }}
                            className="flex-1 md:w-[130px]"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-card rounded-card card-shadow overflow-hidden border border-border/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/20">
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase">
                                    Student
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase">
                                    Course
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase">
                                    Enrolled Date
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase">
                                    Status & Method
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase">
                                    Cost
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                                    </td>
                                </tr>
                            ) : enrollments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground text-sm">
                                        No enrollments found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                enrollments.map((e, index) => (
                                    <tr
                                        key={`${e.user_id}-${e.course_id}-${index}`}
                                        className="hover:bg-muted/10 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-black shadow-sm overflow-hidden">
                                                    {e.avatar_url ? (
                                                    <img
                                                        src={getMediaUrl(e.avatar_url)}
                                                        alt={e.first_name}
                                                        className="w-10 h-10 rounded-xl object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-black shadow-sm">
                                                        {e.first_name?.[0] ||
                                                            e.email?.[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                                </div>
                                                <div>
                                                    <div className="text-small font-bold text-foreground group-hover:text-primary transition-colors">
                                                        {e.first_name} {e.last_name}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground">
                                                        {e.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-10 rounded-lg overflow-hidden bg-muted shrink-0 border border-border flex items-center justify-center">
                                                    {e.thumbnail_url ? (
                                                        <img
                                                            src={getMediaUrl(e.thumbnail_url)}
                                                            alt={e.course_title}
                                                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                                                        />
                                                    ) : (
                                                        <BookOpen
                                                            size={20}
                                                            className="text-muted-foreground/40"
                                                        />
                                                    )}
                                                </div>
                                                <span className="text-xs font-bold text-foreground line-clamp-1 max-w-[180px]">
                                                    {e.course_title}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                                                <Calendar size={12} className="text-muted-foreground" />
                                                {format(new Date(e.enrolled_at), "MMM dd, yyyy")}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-full w-fit ${
                                                    e.payment_status === 'paid' 
                                                        ? 'text-emerald-600 bg-emerald-500/10' 
                                                        : 'text-amber-600 bg-amber-500/10'
                                                }`}>
                                                    {e.payment_status}
                                                </span>
                                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                    <CreditCard size={10} /> {e.payment_method}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-small font-black text-primary">
                                                ${e.enrollment_cost?.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-xl hover:bg-muted group-hover:text-primary transition-colors"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-2xl">
                                                    <DropdownMenuItem 
                                                        onClick={() => handleUnenroll(e.user_id, e.course_id)}
                                                        className="gap-3 cursor-pointer rounded-lg py-2.5 font-medium text-destructive focus:text-white focus:bg-destructive"
                                                    >
                                                        <Trash2 size={16} /> Unenroll Student
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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

export default AdminEnrollments;
