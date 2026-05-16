import {
  BookOpen,
  Trophy,
  Award,
  ArrowRight,
  PlayCircle,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/layouts/DashboardLayout";
import CourseCard from "@/components/CourseCard";
import ProgressBar from "@/components/ProgressBar";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { enrollmentApi } from "@/lib/enrollment-api";
import { certificatesApi } from "@/lib/certificates-api";
import { coursesApi } from "@/lib/courses-api";
import { getMediaUrl } from "@/lib/utils";

const StudentDashboard = () => {
  const { user } = useAuth();
  
  const { data: enrollmentsRes, isLoading: isEnrollmentsLoading } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: () => enrollmentApi.getMyEnrollments(1, 100),
  });

  const { data: certificatesRes, isLoading: isCertsLoading } = useQuery({
    queryKey: ["my-certificates"],
    queryFn: () => certificatesApi.getMyCertificates(),
  });

  const { data: recommendedRes, isLoading: isCoursesLoading } = useQuery({
    queryKey: ["recommended-courses"],
    queryFn: () => coursesApi.getAll({ limit: 3, sortBy: "Rating", order: "DESC" }),
  });

  const enrollmentData = enrollmentsRes?.enrollments || [];
  const recommendedCourses = (recommendedRes?.courses || []).filter(
    (rc) => !enrollmentData.some((e: any) => e.course_id === rc.course_id)
  );
  const certificatesCount = certificatesRes?.length || 0;
  const completedCount = enrollmentData.filter((e: any) => e.progress >= 95).length;
  const totalProgress = enrollmentData.length > 0 
    ? Math.round(enrollmentData.reduce((a: number, c: any) => a + (c.progress || 0), 0) / enrollmentData.length)
    : 0;

  const stats = [
    { icon: BookOpen, label: "Enrolled Courses", value: (enrollmentsRes?.total || 0).toString(), color: "bg-primary/10 text-primary" },
    { icon: TrendingUp, label: "Overall Progress", value: `${totalProgress}%`, color: "bg-secondary/10 text-secondary" },
    { icon: Trophy, label: "Completed", value: completedCount.toString(), color: "bg-amber-500/10 text-amber-600" },
    { icon: Award, label: "Certificates", value: certificatesCount.toString(), color: "bg-emerald-500/10 text-emerald-600" },
  ];

  const isLoading = isEnrollmentsLoading || isCertsLoading;

  return (
    <DashboardLayout type="student">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-h1 text-foreground">
            Welcome back, {user?.first_name || "Student"}! 👋
          </h1>
          <p className="text-body text-muted-foreground mt-1">
            Continue where you left off
          </p>
        </div>
        <Button asChild className="gradient-primary border-0 text-primary-foreground rounded-button transition-all hover:scale-105 active:scale-95 shadow-md">
          <Link to="/courses">Explore New Courses</Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
  {isLoading ? (
    Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-card rounded-card card-shadow p-5 h-24 animate-pulse" />
    ))
  ) : (
    stats.map((s, idx) => (
      <div
  key={s.label}
  className="bg-card rounded-card card-shadow p-5 group border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
  style={{
    animationDelay: `${idx * 100}ms`,
  }}
>
        <div className={`w-10 h-10 rounded-lg ${s.color} flex items-center justify-center mb-3 transition-transform duration-500 group-hover:scale-110`}>
          <s.icon size={20} />
        </div>
        <div className="text-2xl font-bold text-card-foreground group-hover:text-primary transition-colors">{s.value}</div>
        <div className="text-small text-muted-foreground">{s.label}</div>
      </div>
    ))
  )}
</div>

      {/* Continue Learning */}
      <div className="bg-card rounded-card card-shadow p-6 mb-8 animate-in fade-in slide-in-from-left-4 duration-500 delay-200 fill-mode-both">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-h3 text-card-foreground">Continue Learning</h2>
          <Link to="/student/courses" className="text-primary text-small font-bold hover:underline flex items-center gap-1 group">
            View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : enrollmentData.length > 0 ? (
          <div className="space-y-4">
            {enrollmentData.slice(0, 3).map((c, idx) => (
              <Link 
                key={c.course_id} 
                to={`/learn/${c.course_id}`} 
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 transition-all group animate-in fade-in slide-in-from-left-4 fill-mode-both"
                style={{ animationDelay: `${idx * 150 + 400}ms` }}
              >
                <div className="w-16 h-16 rounded-lg gradient-primary flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-105 transition-transform duration-500">
                  {c.thumbnail_url ? (
                    <img src={getMediaUrl(c.thumbnail_url)} alt={c.title} className="w-full h-full object-cover" />
                  ) : (
                    <PlayCircle size={24} className="text-primary-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-small font-bold text-card-foreground truncate group-hover:text-primary transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {c.instructor_first_name} {c.instructor_last_name} · {Math.round(c.progress)}% complete
                  </p>
                  <ProgressBar value={Math.round(c.progress)} className="mt-2 group-hover:bg-muted/30 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">You haven't enrolled in any courses yet.</p>
            <Button asChild variant="outline" className="rounded-button hover:bg-muted transition-all hover:scale-105 active:scale-95">
              <Link to="/courses">Browse Catalog</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Recommended */}
      <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-400 fill-mode-both">
        <h2 className="text-h3 text-foreground mb-5">Recommended for You</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isCoursesLoading ? (
             Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted animate-pulse" />
            ))
          ) : recommendedCourses.length > 0 ? (
            recommendedCourses.map((c) => (
              <CourseCard key={c.course_id} course={c} />
            ))
          ) : (
            <p className="text-muted-foreground text-small">No recommendations at the moment.</p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
