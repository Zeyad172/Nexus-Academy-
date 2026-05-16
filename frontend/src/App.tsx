import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import StudentDashboard from "./pages/student/StudentOverview";
import StudentCourses from "./pages/student/StudentCourses";
import StudentProgress from "./pages/student/StudentProgress";
import StudentCertificates from "./pages/student/StudentCertificates";
import LessonPlayer from "./pages/student/LessonPlayer";
import InstructorDashboard from "./pages/instructor/InstructorOverview";
import InstructorCourses from "./pages/instructor/InstructorCourses";
import UploadCourse from "./pages/instructor/UploadCourse";
import EditCourse from "./pages/instructor/EditCourse";
import InstructorAnalytics from "./pages/instructor/InstructorAnalytics";
import InstructorReviews from "./pages/instructor/InstructorReviews";
import InstructorStudents from "./pages/instructor/InstructorStudents";
import InstructorRevenue from "./pages/instructor/InstructorRevenue";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminEnrollments from "./pages/admin/AdminEnrollments";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import HelpCenter from "./pages/HelpCenter";
import ScrollToTopOnNavigation from "./components/ScrollToTopOnNavigation";
import PageTransition from "./components/PageTransition";
import MainLayout from "./layouts/MainLayout";
import VerifyOTP from "./pages/VerifyOTP";
import VerifyCertificate from "./pages/VerifyCertificate";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import ProtectedRoute from "./components/ProtectedRoute";
import About from "./pages/About";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
                <ScrollToTopOnNavigation />
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route
                        path="/login"
                        element={
                            <PageTransition>
                                <Login />
                            </PageTransition>
                        }
                    />
                    <Route
                        path="/signup"
                        element={
                            <PageTransition>
                                <Signup />
                            </PageTransition>
                        }
                    />
                    <Route
                        path="/forgot-password"
                        element={
                            <PageTransition>
                                <ForgotPassword />
                            </PageTransition>
                        }
                    />
                    <Route
                        path="/reset-password"
                        element={
                            <PageTransition>
                                <ResetPassword />
                            </PageTransition>
                        }
                    />
                    <Route path="/verify-otp" element={<VerifyOTP />} />
                    <Route path="/verify-certificate" element={<VerifyCertificate />} />
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/courses/:id" element={<CourseDetails />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    <Route path="/payment-failed" element={<PaymentFailed />} />
                    <Route
                        path="/help"
                        element={
                            <MainLayout>
                                <HelpCenter />
                            </MainLayout>
                        }
                    />
                    {/* Student Dashboard */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute
                                allowedRoles={["user"]}
                            >
                                <StudentDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard/courses"
                        element={
                            <ProtectedRoute
                                allowedRoles={["user"]}
                            >
                                <StudentCourses />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard/progress"
                        element={
                            <ProtectedRoute
                                allowedRoles={["user"]}
                            >
                                <StudentProgress />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard/certificates"
                        element={
                            <ProtectedRoute
                                allowedRoles={["user"]}
                            >
                                <StudentCertificates />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard/settings"
                        element={
                            <ProtectedRoute
                                allowedRoles={["user"]}
                            >
                                <Settings />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/learn/:id"
                        element={
                            <ProtectedRoute>
                                <PageTransition>
                                    <LessonPlayer />
                                </PageTransition>
                            </ProtectedRoute>
                        }
                    />
                    {/* Instructor Dashboard */}
                    <Route
                        path="/instructor"
                        element={
                            <ProtectedRoute
                                allowedRoles={["instructor"]}
                            >
                                <InstructorDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/instructor/courses"
                        element={
                            <ProtectedRoute
                                allowedRoles={["instructor"]}
                            >
                                <InstructorCourses />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/instructor/upload"
                        element={
                            <ProtectedRoute
                                allowedRoles={["instructor"]}
                            >
                                <UploadCourse />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/instructor/edit/:id"
                        element={
                            <ProtectedRoute
                                allowedRoles={["instructor"]}
                            >
                                <EditCourse />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/instructor/analytics"
                        element={
                            <ProtectedRoute
                                allowedRoles={["instructor"]}
                            >
                                <InstructorAnalytics />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/instructor/reviews"
                        element={
                            <ProtectedRoute
                                allowedRoles={["instructor"]}
                            >
                                <InstructorReviews />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/instructor/students"
                        element={
                            <ProtectedRoute
                                allowedRoles={["instructor"]}
                            >
                                <InstructorStudents />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/instructor/revenue"
                        element={
                            <ProtectedRoute
                                allowedRoles={["instructor"]}
                            >
                                <InstructorRevenue />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/instructor/settings"
                        element={
                            <ProtectedRoute
                                allowedRoles={["instructor"]}
                            >
                                <Settings />
                            </ProtectedRoute>
                        }
                    />
                    {/* Admin Dashboard */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <AdminOverview />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/enrollments"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <AdminEnrollments />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/users"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <AdminUsers />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/categories"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <AdminCategories />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/courses"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <AdminCourses />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/payments"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <AdminPayments />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/settings"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <Settings />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/reviews"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <AdminReviews />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="*"
                        element={
                            <PageTransition>
                                <NotFound />
                            </PageTransition>
                        }
                    />
                </Routes>
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
