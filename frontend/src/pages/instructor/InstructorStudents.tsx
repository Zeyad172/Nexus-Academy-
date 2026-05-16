import {
    Search,
    Mail,
    Eye,
    Loader2,
    Calendar,
    BookOpen,
    GraduationCap,
} from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { enrollmentApi } from "@/lib/enrollment-api";
import { InstructorStudent } from "@/types";
import { useState, useEffect } from "react";
import { coursesApi } from "@/lib/courses-api";
import { getMediaUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AppSelect } from "@/components/ui/app-select";
import { AppPagination } from "@/components/ui/app-pagination";

const InstructorStudents = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedStudent, setSelectedStudent] =
        useState<InstructorStudent | null>(null);
    const [page, setPage] = useState(1);
    const limit = 10;

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // Reset to first page on search
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);
        
    const { data: coursesData } = useQuery({
        queryKey: ["instructor-courses"],
        queryFn: () => coursesApi.getMyCourses(1, 100),
    });

    const courses = coursesData?.courses || [];

    const [courseFilter, setCourseFilter] = useState("all");

    const selectedCourseId = courseFilter === "all" ? undefined : Number(courseFilter);

    const { data: studentsRes, isLoading } = useQuery({
        queryKey: ["instructor-students", debouncedSearch, selectedCourseId, page],
        queryFn: () =>
            enrollmentApi.getInstructorStudents(
                page,
                limit,
                debouncedSearch,
                selectedCourseId,
            ),
    });

    const students = studentsRes?.students || [];
    const total = studentsRes?.total || 0;
    const totalPages = Math.ceil(total / limit);
    const courseOptions = [
        { label: "All Courses", value: "all" },
        ...courses.map((c) => ({
            label: c.title,
            value: String(c.course_id),
        })),
    ];

    return (
        <DashboardLayout type="instructor">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                <div>
                    <h1 className="text-h1 text-foreground">Students</h1>
                    <p className="text-body text-muted-foreground mt-1">
                        View and manage your enrolled students
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-card rounded-card card-shadow p-6 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                        type="text"
                        placeholder="Search by student name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 text-small bg-muted/30 rounded-button border border-border outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <AppSelect
                      options={courseOptions}
                      value={courseFilter}
                      onValueChange={setCourseFilter}
                      className="flex-1 md:w-[250px]"
                  />
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-card rounded-card card-shadow overflow-hidden border border-border/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border bg-muted/20">
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase">
                                    Student
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase hidden md:table-cell">
                                    Courses
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase">
                                    Avg. Progress
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black text-muted-foreground tracking-widest uppercase hidden lg:table-cell">
                                    Joined
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
                                        colSpan={5}
                                        className="px-6 py-12 text-center"
                                    >
                                        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                                    </td>
                                </tr>
                            ) : students.length > 0 ? (
                                students.map((s) => (
                                    <tr
                                        key={s.user_id}
                                        className="hover:bg-muted/10 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center shrink-0 overflow-hidden border-2 border-white shadow-sm">
                                                    {s.avatar_url ? (
                                                        <img
                                                            src={getMediaUrl(
                                                                s.avatar_url,
                                                            )}
                                                            alt={s.first_name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-xs font-bold text-primary-foreground">
                                                            {s.first_name[0]}
                                                            {s.last_name[0]}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-small font-bold text-foreground truncate">
                                                        {s.first_name}{" "}
                                                        {s.last_name}
                                                    </div>
                                                    <div className="text-[11px] text-muted-foreground truncate">
                                                        {s.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className="text-small font-medium text-card-foreground">
                                                {s.courses_enrolled}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 rounded-full bg-muted max-w-[80px] overflow-hidden">
                                                    <div
                                                        className="h-full rounded-full gradient-primary"
                                                        style={{
                                                            width: `${s.avg_progress}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-[11px] font-bold text-primary">
                                                    {Math.round(s.avg_progress)}
                                                    %
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell">
                                            <span className="text-[11px] text-muted-foreground">
                                                {new Date(
                                                    s.joined_at,
                                                ).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                                                    asChild
                                                >
                                                    <a
                                                        href={`mailto:${s.email}`}
                                                    >
                                                        <Mail size={16} />
                                                    </a>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary"
                                                    onClick={() =>
                                                        setSelectedStudent(s)
                                                    }
                                                >
                                                    <Eye size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-12 text-center text-muted-foreground"
                                    >
                                        No students found matching your
                                        criteria.
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

            {/* Student Details Dialog */}
            <Dialog
                open={!!selectedStudent}
                onOpenChange={(open) => !open && setSelectedStudent(null)}
            >
                <DialogContent className="rounded-card border-border bg-card max-w-[450px] p-0 overflow-hidden shadow-2xl">
                    <DialogHeader className="p-6 bg-muted/20 border-b border-border text-left relative">
                        <DialogTitle className="text-h3 text-foreground flex items-center gap-2">
                            <GraduationCap size={20} className="text-primary" />
                            Student Profile
                        </DialogTitle>
                    </DialogHeader>

                    {selectedStudent && (
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-5">
                                <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center shrink-0 overflow-hidden border-4 border-white shadow-md">
                                    {selectedStudent.avatar_url ? (
                                        <img
                                            src={getMediaUrl(
                                                selectedStudent.avatar_url,
                                            )}
                                            alt={selectedStudent.first_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-2xl font-black text-primary-foreground">
                                            {selectedStudent.first_name[0]}
                                            {selectedStudent.last_name[0]}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <h4 className="text-h3 font-black text-foreground">
                                        {selectedStudent.first_name}{" "}
                                        {selectedStudent.last_name}
                                    </h4>
                                    <p className="text-small text-muted-foreground flex items-center gap-1.5 mt-0.5">
                                        <Mail
                                            size={12}
                                            className="text-primary"
                                        />
                                        {selectedStudent.email}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                                        <BookOpen
                                            size={12}
                                            className="text-primary"
                                        />
                                        Enrollments
                                    </div>
                                    <div className="text-small font-bold text-foreground">
                                        {selectedStudent.courses_enrolled}{" "}
                                        Courses
                                    </div>
                                </div>
                                <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                                        <Calendar
                                            size={12}
                                            className="text-primary"
                                        />
                                        Joined
                                    </div>
                                    <div className="text-small font-bold text-foreground">
                                        {new Date(
                                            selectedStudent.joined_at,
                                        ).toLocaleDateString(undefined, {
                                            dateStyle: "medium",
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h5 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border pb-2">
                                    Enrolled Courses
                                </h5>
                                <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                    {selectedStudent.courses && selectedStudent.courses.length > 0 ? (
                                        selectedStudent.courses.map((course) => (
                                            <div key={course.course_id} className="bg-muted/20 p-3 rounded-lg border border-border/50">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="text-small font-bold text-foreground line-clamp-1">
                                                        {course.title}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                                        {new Date(course.enrolled_at).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center justify-between text-[10px]">
                                                        <span className="text-muted-foreground font-medium">Progress</span>
                                                        <span className="font-bold text-primary">{Math.round(course.progress)}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full gradient-primary rounded-full"
                                                            style={{ width: `${course.progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-small text-muted-foreground italic">
                                            No course data available.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    className="flex-1 rounded-button"
                                    onClick={() => setSelectedStudent(null)}
                                >
                                    Close
                                </Button>
                                <Button
                                    className="flex-1 gradient-primary border-0 rounded-button shadow-lg shadow-primary/20"
                                    asChild
                                >
                                    <a href={`mailto:${selectedStudent.email}`}>
                                        <Mail size={16} className="mr-2" /> Send
                                        Email
                                    </a>
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default InstructorStudents;
