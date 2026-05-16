import {
    Search,
    MoreVertical,
    Eye,
    ExternalLink,
    BookOpen,
    Users,
    Star,
    Loader2,
    EyeOff,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppSelect } from "@/components/ui/app-select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi } from "@/lib/courses-api";
import { getMediaUrl } from "@/lib/utils";
import { toast } from "sonner";
import { categoryApi } from "@/lib/categories-api";
import { AppPagination } from "@/components/ui/app-pagination";

const AdminCourses = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const limit = 10;

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data: coursesData, isLoading } = useQuery({
        queryKey: [
            "admin-courses",
            debouncedSearch,
            categoryFilter,
            statusFilter,
            page,
        ],
        queryFn: () =>
            coursesApi.getAll({
                page,
                limit,
                search: debouncedSearch || undefined,
                category_id:
                    categoryFilter === "all"
                        ? undefined
                        : Number(categoryFilter),
                sortBy: "created_at",
                order: "DESC",
                is_available: statusFilter === "all" ? undefined : statusFilter === "Published",
            }),
    });

    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: () => categoryApi.getAll(),
    });

    const toggleVisibilityMutation = useMutation({
        mutationFn: ({
            id,
            is_available,
        }: {
            id: number;
            is_available: boolean;
        }) => {
            const formData = new FormData();
            formData.append("is_available", String(is_available));
            return coursesApi.update(id, formData);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["admin-courses"] });
            toast.success(
                `Course is now ${variables.is_available ? "visible" : "invisible"}`,
            );
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update visibility");
        },
    });

    const courses = coursesData?.courses || [];
    const total = coursesData?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const categoryOptions = [
        { label: "All Categories", value: "all" },
        ...(categories?.map((c: any) => ({
            label: c.name,
            value: c.category_id.toString(),
        })) || []),
    ];

    const statusOptions = [
        { label: "All Status", value: "all" },
        { label: "Published", value: "Published" },
        { label: "Draft", value: "Draft" },
    ];

    return (
        <DashboardLayout type="admin">
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-h1 text-foreground font-black tracking-tight">
                        Course Inventory
                    </h1>
                    <p className="text-body text-muted-foreground mt-1">
                        Audit, monitor, and manage platform visibility
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
                            placeholder="Search courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-small bg-muted/30 rounded-xl border border-border outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <AppSelect
                            options={categoryOptions.map((o) => o.label)}
                            value={
                                categoryOptions.find(
                                    (o) => o.value === categoryFilter,
                                )?.label || "All Categories"
                            }
                            onValueChange={(val) => {
                                const option = categoryOptions.find(
                                    (o) => o.label === val,
                                );
                                if (option) {
                                    setCategoryFilter(option.value);
                                    setPage(1);
                                }
                            }}
                            className="flex-1 md:w-[270px]"
                        />
                        <AppSelect
                            options={statusOptions.map((o) => o.label)}
                            value={
                                statusOptions.find(
                                    (o) => o.value === statusFilter,
                                )?.label || "All Status"
                            }
                            onValueChange={(val) => {
                                const option = statusOptions.find(
                                    (o) => o.label === val,
                                );
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
                                    Course Information
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase">
                                    Instructor
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase">
                                    Performance
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase">
                                    Pricing
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase text-right">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-12 text-center"
                                    >
                                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                                    </td>
                                </tr>
                            ) : courses.length > 0 ? (
                                courses.map((c) => (
                                    <tr
                                        key={c.course_id}
                                        className="hover:bg-muted/10 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-10 rounded-lg overflow-hidden bg-muted shrink-0 border border-border flex items-center justify-center">
                                                    {c.thumbnail_url ? (
                                                        <img
                                                            src={getMediaUrl(
                                                                c.thumbnail_url,
                                                            )}
                                                            alt={c.title}
                                                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                                                        />
                                                    ) : (
                                                        <BookOpen
                                                            size={20}
                                                            className="text-muted-foreground/40"
                                                        />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-[13px] font-bold text-foreground truncate max-w-[200px] group-hover:text-primary transition-colors">
                                                        {c.title}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-muted-foreground tracking-tighter">
                                                        {c.category_name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-black shadow-sm overflow-hidden">
                                                    {c.instructor_avatar ? (
                                                        <img
                                                            src={getMediaUrl(
                                                                c.instructor_avatar,
                                                            )}
                                                            alt={
                                                                c.instructor_name
                                                            }
                                                            className="w-10 h-10 rounded-xl object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white font-black shadow-sm">
                                                            {
                                                                c
                                                                    .instructor_name?.[0]
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-xs font-bold text-foreground">
                                                    {c.instructor_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground">
                                                    <Users
                                                        size={12}
                                                        className="text-primary"
                                                    />
                                                    {c.students_count?.toLocaleString() ||
                                                        0}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
                                                    <Star
                                                        size={10}
                                                        className="text-amber-400 fill-amber-400"
                                                    />
                                                    {c.rating?.toFixed(1) ||
                                                        "0.0"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[14px] font-black text-primary">
                                                {c.price === 0
                                                    ? "Free"
                                                    : `$${c.price}`}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-3 py-1 text-[10px] font-black rounded-full tracking-tighter border ${
                                                    c.is_available
                                                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-sm"
                                                        : "bg-amber-500/10 text-amber-600 border-amber-500/20 shadow-sm"
                                                }`}
                                            >
                                                {c.is_available
                                                    ? "Published"
                                                    : "Draft"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-xl hover:bg-muted group-hover:text-primary transition-colors"
                                                    >
                                                        <MoreVertical
                                                            size={18}
                                                        />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent
                                                    align="end"
                                                    className="w-52 rounded-xl p-2 shadow-2xl"
                                                >
                                                    <DropdownMenuItem
                                                        className="gap-3 group cursor-pointer rounded-lg py-2.5 font-medium"
                                                        onClick={() =>
                                                            navigate(
                                                                `/courses/${c.course_id}`,
                                                            )
                                                        }
                                                    >
                                                        <Eye
                                                            size={16}
                                                            className="text-primary group-hover:text-white"
                                                        />
                                                        View Details
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        className="gap-3 group cursor-pointer rounded-lg py-2.5 font-medium"
                                                        onClick={() =>
                                                            toggleVisibilityMutation.mutate(
                                                                {
                                                                    id: c.course_id,
                                                                    is_available:
                                                                        !c.is_available,
                                                                },
                                                            )
                                                        }
                                                    >
                                                        {c.is_available ? (
                                                            <>
                                                                <EyeOff
                                                                    size={16}
                                                                    className="text-amber-500 group-hover:text-white"
                                                                />
                                                                Make Invisible
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Eye
                                                                    size={16}
                                                                    className="text-emerald-500 group-hover:text-white"
                                                                />
                                                                Make Visible
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem
                                                        className="gap-3 group cursor-pointer rounded-lg py-2.5 font-medium"
                                                        onClick={() =>
                                                            navigate(
                                                                `/learn/${c.course_id}`,
                                                            )
                                                        }
                                                    >
                                                        <ExternalLink
                                                            size={16}
                                                            className="text-primary group-hover:text-white"
                                                        />
                                                        Preview Player
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-6 py-12 text-center text-muted-foreground"
                                    >
                                        No courses found matching your criteria.
                                    </td>
                                </tr>
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

export default AdminCourses;
