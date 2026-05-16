import {
  BookOpen,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  HelpCircle,
  Users,
  Loader2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/layouts/DashboardLayout";
import RatingStars from "@/components/RatingStars";
import { AppSelect } from "@/components/ui/app-select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi } from "@/lib/courses-api";
import { categoryApi } from "@/lib/categories-api";
import { getMediaUrl } from "@/lib/utils";
import { toast } from "sonner";
import { AppPagination } from "@/components/ui/app-pagination";

const InstructorCourses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
        setDebouncedSearch(searchQuery);
        setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: categoriesData = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryApi.getAll(),
  });

  const selectedCatId = categoryFilter === "All Categories" ? undefined : categoriesData.find(c => c.name === categoryFilter)?.category_id;
  const selectedStatus = statusFilter === "All Status" ? undefined : statusFilter === "Published";

  const { data, isLoading } = useQuery({
    queryKey: ["instructor-courses", page, debouncedSearch, selectedCatId, selectedStatus],
    queryFn: () => coursesApi.getMyCourses(page, limit, { 
        search: debouncedSearch, 
        category_id: selectedCatId,
        is_available: selectedStatus
    }),
  });

  const courses = data?.courses || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const filteredCourses = courses;

  const deleteMutation = useMutation({
    mutationFn: (id: number) => coursesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor-courses"] });
      toast.success("Course deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete course");
    },
  });

  const categories = ["All Categories", ...categoriesData.map(c => c.name)];

  return (
    <DashboardLayout type="instructor">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-h1 text-foreground">My Courses</h1>
          <p className="text-body text-muted-foreground mt-1">
            Manage and organize your published courses
          </p>
        </div>
        <Button
          asChild
          className="gradient-primary border-0 text-primary-foreground rounded-button hover:opacity-90 transition-all hover:scale-105 active:scale-95"
        >
          <Link to="/instructor/upload">
            <Plus size={18} className="mr-2" /> New Course
          </Link>
        </Button>
      </div>

      <div className="bg-card rounded-card card-shadow p-6 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search by title, description, etc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-small bg-muted/30 rounded-button border border-border outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <AppSelect
            options={categories}
            value={categoryFilter}
            onValueChange={(val) => {
                setCategoryFilter(val);
                setPage(1);
            }}
            className="flex-1 md:w-[270px]"
          />
          <AppSelect
            options={["All Status", "Published", "Draft"]}
            value={statusFilter}
            onValueChange={(val) => {
                setStatusFilter(val);
                setPage(1);
            }}
            className="flex-1 md:w-[80px]"
          />
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
                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase hidden md:table-cell">
                  Students
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase hidden md:table-cell">
                  Rating
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase hidden lg:table-cell">
                  Original Price
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase hidden lg:table-cell">
                  Current Price
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase hidden lg:table-cell">
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
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((c) => (
                  <tr
                    key={c.course_id}
                    className="hover:bg-muted/10 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border">
                          {c.thumbnail_url ? (
                            <img
                              src={getMediaUrl(c.thumbnail_url)}
                              alt={c.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookOpen
                              size={20}
                              className="text-muted-foreground/40"
                            />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="text-small font-bold text-foreground truncate max-w-[200px] group-hover:text-primary transition-colors">
                            {c.title}
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {c.category_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-small text-card-foreground">
                        {c.students_count?.toLocaleString() || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <RatingStars
                        showValue={false}
                        rating={c.rating}
                        size={12}
                      />
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      {c.price && c.original_price && c.price < c.original_price ? (
                        <span className="text-small font-medium text-muted-foreground line-through">
                          ${c.original_price}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      {c.price === 0 ? (
                        <span className="text-small font-bold text-emerald-600">
                          Free
                        </span>
                      ) : (
                        <span className="text-small font-bold text-[#1e5a7d]">
                          ${c.price ?? c.original_price}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className={`px-2.5 py-1 text-[10px] font-black rounded-full border shadow-sm ${
                        c.is_available ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }`}>
                        {c.is_available ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/courses/${c.course_id}`}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground group-hover:text-primary transition-colors"
                        >
                          <Eye size={16} />
                        </Link>
                        <button
                          onClick={() =>
                            navigate(`/instructor/edit/${c.course_id}`)
                          }
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground group-hover:text-primary transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="p-1.5 rounded-md hover:bg-[#F24848]/10 text-muted-foreground hover:text-[#F24848] transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </AlertDialogTrigger>

                          <AlertDialogContent className="rounded-card border-border bg-card max-w-[400px]">
                            <AlertDialogHeader className="flex flex-col items-center text-center">
                              <div className="w-12 h-12 rounded-full bg-[#72BFD9]/10 flex items-center justify-center mb-4">
                                <HelpCircle
                                  className="text-[#72BFD9]"
                                  size={24}
                                />
                              </div>
                              <AlertDialogTitle className="text-h3 text-[#1A1F2C]">
                                Are you sure?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-body text-[#606977]">
                                This action cannot be undone. This will
                                permanently delete the course from the platform.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex sm:justify-center gap-3 mt-4">
                              <AlertDialogCancel className="rounded-button border-[#E2E8F0] bg-white text-[#606977] hover:bg-[#F5F5F5] flex-1">
                                No, Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteMutation.mutate(c.course_id)}
                                disabled={deleteMutation.isPending}
                                className="rounded-button bg-[#F24848] text-white hover:bg-[#D93D3D] border-0 flex-1"
                              >
                                {deleteMutation.isPending ? "Deleting..." : "Yes, Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    No courses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <AppPagination 
        currentPage={page} 
        totalPages={totalPages} 
        onPageChange={setPage} 
      />
    </DashboardLayout>
  );
};

export default InstructorCourses;
