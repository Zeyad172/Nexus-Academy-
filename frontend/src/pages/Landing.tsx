import { useState, useEffect } from "react";
import {
    ArrowRight,
    Users,
    BookOpen,
    Award,
    TrendingUp,
    Star,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MainLayout from "@/layouts/MainLayout";
import CourseCard from "@/components/CourseCard";
import InstructorCard from "@/components/InstructorCard";
import CategoryCard from "@/components/CategoryCard";
import ReviewCard from "@/components/ReviewCard";
import ScrollReveal from "@/components/ScrollReveal";
import { categoryApi } from "@/lib/categories-api";
import { reviewApi } from "@/lib/reviews-api";
import { coursesApi  } from "@/lib/courses-api";
import heroImage from "@/assets/landing-img.svg";
import Marquee from "@/components/Marquee";
import { usersApi } from "@/lib/users-api";

const Landing = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [instructors, setInstructors] = useState<any[]>([]);
    const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
    const [bestReviews, setBestReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [
                    categoriesData,
                    coursesData,
                    instructorsData,
                    bestReviewsData,
                ] = await Promise.all([
                    categoryApi.getAll(),
                    coursesApi.getAll({
                        limit: 4,
                        sortBy: "Rating",
                        order: "DESC",
                    }),
                    usersApi.getBestInstructors(),
                    reviewApi.getBestReviews(),
                ]);
                setCategories(categoriesData);
                setFeaturedCourses(coursesData.courses);
                setInstructors(instructorsData);
                setBestReviews(bestReviewsData.reviews);
            } catch (error) {
                console.error("Failed to fetch landing data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <MainLayout>
            {/* Hero */}
            <section className="relative overflow-hidden h-[calc(100vh_-_65px)] flex items-center">
                <div className="container mx-auto px-4 lg:px-8 py-16 lg:py-24">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="animate-in fade-in slide-in-from-left-8 duration-1000 fill-mode-both">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-small font-medium mb-6 animate-in zoom-in-95 duration-500 delay-300 fill-mode-both">
                                <TrendingUp size={14} /> #1 Learning Platform in
                                {" " + new Date().getFullYear()}
                            </div>
                            <h1 className="text-h1 lg:text-5xl font-extrabold text-foreground leading-tight mb-6">
                                Unlock Your Potential with{" "}
                                <span className="gradient-text">
                                    World-Class
                                </span>{" "}
                                Courses
                            </h1>
                            <p className="text-body text-muted-foreground max-w-lg mb-8 leading-relaxed">
                                Join over 100,000+ learners mastering new skills
                                with expert-led courses. From coding to design,
                                advance your career with NexusAcademy.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link to="/courses">
                                    <Button
                                        size="lg"
                                        className="gradient-primary border-0 text-primary-foreground rounded-button px-8 hover:opacity-90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                                    >
                                        Explore Courses{" "}
                                        <ArrowRight
                                            size={18}
                                            className="ml-2"
                                        />
                                    </Button>
                                </Link>
                                <Link to="/signup">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="rounded-button px-8 transition-all hover:scale-105 active:scale-95"
                                    >
                                        Start Free Trial
                                    </Button>
                                </Link>
                            </div>
                            <div className="flex items-center gap-8 mt-10">
                                {[
                                    {
                                        label: "Active Students",
                                        value: "100K+",
                                    },
                                    {
                                        label: "Expert Instructors",
                                        value: "500+",
                                    },
                                    {
                                        label: "Courses Available",
                                        value: "1,200+",
                                    },
                                ].map((stat, idx) => (
                                    <div
                                        key={stat.label}
                                        className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                                        style={{
                                            animationDelay: `${idx * 150 + 500}ms`,
                                        }}
                                    >
                                        <div className="text-2xl font-bold text-primary">
                                            {stat.value}
                                        </div>
                                        <div className="text-small text-muted-foreground">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="hidden lg:block animate-in fade-in zoom-in-95 duration-1000 delay-300 fill-mode-both">
                            <img
                                src={heroImage}
                                alt="Hero Illustration"
                                className="w-full h-auto object-contain transition-transform duration-500"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Bar */}
            <ScrollReveal animation="fade-in" duration={1000}>
                <section className="border-y border-border bg-card">
                    <div className="container mx-auto px-4 lg:px-8 py-8">
                        <Marquee pauseOnHover={false}>
                            {[
                                {
                                    icon: Users,
                                    label: "Students Enrolled",
                                    value: "100,000+",
                                },
                                {
                                    icon: BookOpen,
                                    label: "Total Courses",
                                    value: "1,200+",
                                },
                                {
                                    icon: Award,
                                    label: "Certificates Issued",
                                    value: "45,000+",
                                },
                                {
                                    icon: Star,
                                    label: "Average Rating",
                                    value: "4.8/5",
                                },
                            ].map((s) => (
                                <div
                                    key={s.label}
                                    className="flex items-center gap-4 w-64 shrink-0 mx-4 group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                                        <s.icon
                                            size={24}
                                            className="text-primary"
                                        />
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-foreground">
                                            {s.value}
                                        </div>
                                        <div className="text-small text-muted-foreground">
                                            {s.label}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </Marquee>
                    </div>
                </section>
            </ScrollReveal>

            {/* Featured Courses */}
            <section className="container mx-auto px-4 lg:px-8 py-16">
                <ScrollReveal animation="slide-up">
                    <div className="mb-10">
                        <div className="text-center">
                            <h2 className="text-h2 text-foreground">
                                Featured Courses
                            </h2>
                            <p className="text-body text-muted-foreground mt-2">
                                Learn from the best instructors in the industry
                            </p>
                        </div>
                    </div>
                </ScrollReveal>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-64 rounded-card bg-muted animate-pulse"
                            />
                        ))
                    ) : featuredCourses.length > 0 ? (
                        featuredCourses.map((c, index) => (
                            <ScrollReveal
                                key={c.course_id}
                                animation="slide-up"
                                delay={index * 100}
                            >
                                <CourseCard course={c} />
                            </ScrollReveal>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10 text-muted-foreground">
                            No courses found.
                        </div>
                    )}
                </div>
            </section>

            {/* Categories */}
            <section className="bg-card border-y border-border">
                <div className="container mx-auto px-4 lg:px-8 py-16">
                    <ScrollReveal animation="slide-up">
                        <div className="text-center mb-10">
                            <h2 className="text-h2 text-foreground">
                                Browse by Category
                            </h2>
                            <p className="text-body text-muted-foreground mt-2">
                                Find courses in your area of interest
                            </p>
                        </div>
                    </ScrollReveal>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {categories.length > 0 ? (
                            categories.slice(0, 4).map((c, index) => (
                                <ScrollReveal
                                    key={c.category_id}
                                    animation="zoom-in"
                                    delay={index * 100}
                                >
                                    <CategoryCard
                                        category={c}
                                        to={`/courses?category_id=${c.category_id}`}
                                    />
                                </ScrollReveal>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10 text-muted-foreground">
                                No categories found.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Top Instructors */}
            <section className="container mx-auto px-4 lg:px-8 py-16">
                <ScrollReveal animation="slide-up">
                    <div className="text-center mb-10">
                        <h2 className="text-h2 text-foreground">
                            Top Instructors
                        </h2>
                        <p className="text-body text-muted-foreground mt-2">
                            Learn from industry-leading experts
                        </p>
                    </div>
                </ScrollReveal>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {instructors.length > 0 ? (
                        instructors.map((i, index) => (
                            <ScrollReveal
                                key={i.id}
                                animation="slide-up"
                                delay={index * 100}
                            >
                                <InstructorCard instructor={i} />
                            </ScrollReveal>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10 text-muted-foreground">
                            No instructors found.
                        </div>
                    )}
                </div>
            </section>

            {/* Testimonials */}
            <section className="bg-card border-y border-border">
                <div className="container mx-auto px-4 lg:px-8 py-16">
                    <ScrollReveal animation="slide-up">
                        <div className="text-center mb-10">
                            <h2 className="text-h2 text-foreground">
                                What Our Students Say
                            </h2>
                            <p className="text-body text-muted-foreground mt-2">
                                Success stories from learners worldwide
                            </p>
                        </div>
                    </ScrollReveal>
                    <div className="grid md:grid-cols-3 gap-6">
                        {bestReviews.length > 0 ? (
                            bestReviews.map((r, index) => (
                                <ScrollReveal
                                    key={r.user_id + "-" + r.course_id}
                                    animation="slide-up"
                                    delay={index * 100}
                                >
                                    <ReviewCard {...r} />
                                </ScrollReveal>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10 text-muted-foreground">
                                No reviews found.
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="container mx-auto px-4 lg:px-8 py-16">
                <ScrollReveal animation="zoom-in" duration={800}>
                    <div className="gradient-primary rounded-card p-10 md:p-16 text-center shadow-xl hover:shadow-2xl transition-shadow duration-500">
                        <h2 className="text-h2 text-primary-foreground mb-4">
                            Ready to Start Learning?
                        </h2>
                        <p className="text-body text-primary-foreground/80 max-w-lg mx-auto mb-8">
                            Join thousands of students already transforming
                            their careers. Start your journey today.
                        </p>
                        <Link to="/signup">
                            <Button
                                size="lg"
                                className="bg-card text-primary hover:bg-card/90 rounded-button px-10 font-semibold transition-all hover:scale-105 active:scale-95 shadow-md"
                            >
                                Get Started Free{" "}
                                <ArrowRight size={18} className="ml-2" />
                            </Button>
                        </Link>
                    </div>
                </ScrollReveal>
            </section>
        </MainLayout>
    );
};

export default Landing;
