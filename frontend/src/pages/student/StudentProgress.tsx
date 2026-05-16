import { Trophy, Target, Loader2 } from "lucide-react";
import DashboardLayout from "@/layouts/DashboardLayout";
import ProgressBar from "@/components/ProgressBar";
import { useQuery } from "@tanstack/react-query";
import { enrollmentApi } from "@/lib/enrollment-api";

const StudentProgress = () => {
  const { data: enrollmentsRes, isLoading } = useQuery({
    queryKey: ["my-enrollments-progress"],
    queryFn: () => enrollmentApi.getMyEnrollments(1, 100),
  });

  const enrollmentData = enrollmentsRes?.enrollments || [];
  const totalProgress = enrollmentData.length > 0 
    ? Math.round(enrollmentData.reduce((a: number, c: any) => a + (c.progress || 0), 0) / enrollmentData.length)
    : 0;
  const completed = enrollmentData.filter((c) => (c.progress || 0) >= 95).length;

  return (
    <DashboardLayout type="student">
      <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-h1 text-foreground">Learning Progress</h1>
        <p className="text-body text-muted-foreground mt-1">Track your course completion and performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-card rounded-card card-shadow p-6 animate-in fade-in slide-in-from-left-4 duration-500 delay-100 fill-mode-both group">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
              <Target size={20} />
            </div>
            <h2 className="text-h3 text-card-foreground">Average Completion</h2>
          </div>
          <div className="flex items-end gap-4 mb-2">
            <div className="text-4xl font-black text-primary transition-transform group-hover:scale-105">{totalProgress}%</div>
            <div className="text-small text-muted-foreground mb-1">Overall progress</div>
          </div>
          <ProgressBar value={totalProgress} className="h-2 group-hover:bg-muted/30 transition-colors" />
        </div>

        <div className="bg-card rounded-card card-shadow p-6 animate-in fade-in slide-in-from-right-4 duration-500 delay-200 fill-mode-both group">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 group-hover:scale-110 transition-transform">
              <Trophy size={20} />
            </div>
            <h2 className="text-h3 text-card-foreground">Courses Completed</h2>
          </div>
          <div className="flex items-end gap-4 mb-2">
            <div className="text-4xl font-black text-amber-600 transition-transform group-hover:scale-105">{completed}</div>
            <div className="text-small text-muted-foreground mb-1">Out of {enrollmentData.length} courses</div>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 transition-all duration-1000 ease-out" style={{ width: `${(completed / (enrollmentData.length || 1)) * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="bg-card rounded-card card-shadow p-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 fill-mode-both">
        <h2 className="text-h3 text-card-foreground mb-6">Detailed Course Progress</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : enrollmentData.length > 0 ? (
          <div className="space-y-6">
            {enrollmentData.map((course, idx) => (
              <div 
                key={course.course_id} 
                className="group cursor-default animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                style={{ animationDelay: `${idx * 100 + 400}ms` }}
              >
                <div className="flex justify-between text-small mb-2">
                  <span className="font-bold text-foreground group-hover:text-primary transition-colors">{course.title}</span>
                </div>
                <ProgressBar value={Math.round(course.progress)} className="h-1.5 group-hover:bg-muted/30 transition-colors" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No course progress to display.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentProgress;
