import { Category, Testimonial } from "@/types";

export interface MockCourse {
  id: string;
  title: string;
  instructor: string;
  instructorAvatar: string;
  rating: number;
  reviewCount: number;
  students: number;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  duration: string;
  lessons: number;
  description?: string;
  progress?: number;
}

export const courses: MockCourse[] = [
  {
    id: "1",
    title: "Complete Web Development Bootcamp 2025",
    instructor: "Sarah Johnson",
    instructorAvatar: "",
    rating: 4.8,
    reviewCount: 2340,
    students: 15420,
    price: 49.99,
    originalPrice: 129.99,
    image: "",
    category: "Web Development",
    level: "Beginner",
    duration: "42h 30m",
    lessons: 320,
  },
  {
    id: "2",
    title: "Machine Learning & AI Masterclass Supervised & Unsupervised",
    instructor: "Dr. Michael Chen",
    instructorAvatar: "",
    rating: 4.9,
    reviewCount: 1890,
    students: 12300,
    price: 59.99,
    originalPrice: 149.99,
    image: "",
    category: "Data Science",
    level: "Intermediate",
    duration: "38h 15m",
    lessons: 280,
  },
  {
    id: "3",
    title: "UI/UX Design: From Wireframe to Prototype",
    instructor: "Emma Williams",
    instructorAvatar: "",
    rating: 4.7,
    reviewCount: 1560,
    students: 9800,
    price: 39.99,
    originalPrice: 99.99,
    image: "",
    category: "Design",
    level: "Beginner",
    duration: "28h 45m",
    lessons: 195,
  },
  {
    id: "4",
    title: "Advanced React & TypeScript Patterns",
    instructor: "Alex Rodriguez",
    instructorAvatar: "",
    rating: 4.9,
    reviewCount: 980,
    students: 7200,
    price: 54.99,
    originalPrice: 119.99,
    image: "",
    category: "Web Development",
    level: "Advanced",
    duration: "35h 20m",
    lessons: 240,
  },
  {
    id: "5",
    title: "Digital Marketing Complete Guide",
    instructor: "Lisa Park",
    instructorAvatar: "",
    rating: 4.6,
    reviewCount: 2100,
    students: 18500,
    price: 34.99,
    originalPrice: 89.99,
    image: "",
    category: "Marketing",
    level: "Beginner",
    duration: "24h 10m",
    lessons: 180,
  },
  {
    id: "6",
    title: "iOS & Swift Development Complete Course",
    instructor: "James Wilson",
    instructorAvatar: "",
    rating: 4.8,
    reviewCount: 1340,
    students: 8900,
    price: 44.99,
    originalPrice: 109.99,
    image: "",
    category: "Mobile Development",
    level: "Intermediate",
    duration: "40h 00m",
    lessons: 300,
  },
  {
    id: "7",
    title: "Python for Data Analysis & Visualization",
    instructor: "Dr. Michael Chen",
    instructorAvatar: "",
    rating: 4.7,
    reviewCount: 1780,
    students: 11200,
    price: 44.99,
    originalPrice: 109.99,
    image: "",
    category: "Data Science",
    level: "Beginner",
    duration: "30h 45m",
    lessons: 220,
  },
  {
    id: "8",
    title: "Cloud Architecture with AWS",
    instructor: "Robert Kim",
    instructorAvatar: "",
    rating: 4.8,
    reviewCount: 890,
    students: 6500,
    price: 64.99,
    originalPrice: 159.99,
    image: "",
    category: "Cloud Computing",
    level: "Advanced",
    duration: "45h 30m",
    lessons: 340,
  },
];

export const categories: Category[] = [
  { category_id: 1, name: "Web Development", course_count: 120 },
  { category_id: 2, name: "Data Science", course_count: 85 },
  { category_id: 3, name: "Design", course_count: 64 },
  { category_id: 4, name: "Mobile Development", course_count: 52 },
  { category_id: 5, name: "Marketing", course_count: 78 },
  { category_id: 6, name: "Cloud Computing", course_count: 45 },
  { category_id: 7, name: "Cybersecurity", course_count: 38 },
  { category_id: 8, name: "Business", course_count: 92 },
];

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "David Martinez",
    avatar: "",
    role: "Software Developer at Spotify",
    content: "NexusAcademy transformed my career. The courses are world-class and the instructors truly care about your progress. I landed my dream job within 6 months!",
    rating: 5,
  },
  {
    id: "2",
    name: "Priya Sharma",
    avatar: "",
    role: "Data Analyst at Netflix",
    content: "The data science track was incredibly well-structured. Real-world projects and mentor support made all the difference. Highly recommend to anyone looking to break into tech.",
    rating: 5,
  },
  {
    id: "3",
    name: "Tom Anderson",
    avatar: "",
    role: "UX Designer at Airbnb",
    content: "From zero design experience to working at a top tech company. The UX courses here are on par with bootcamps costing 10x more. Absolutely incredible value.",
    rating: 5,
  },
];

export const studentCourses: (MockCourse & { progress: number; lastAccessed: string })[] = [
  { ...courses[0], progress: 68, lastAccessed: "2 hours ago" },
  { ...courses[1], progress: 42, lastAccessed: "1 day ago" },
  { ...courses[2], progress: 89, lastAccessed: "3 hours ago" },
  { ...courses[3], progress: 15, lastAccessed: "5 days ago" },
];

export const curriculum = [
  {
    section: "Getting Started",
    lessons: [
      { title: "Welcome & Course Overview", duration: "5:30", completed: true, videoId: "1O5NiFn8G0JZfOIOVULfS4T1nybG_N_YG" },
      { title: "Setting Up Your Environment", duration: "12:45", completed: true, videoId: "1O5NiFn8G0JZfOIOVULfS4T1nybG_N_YG" },
      { title: "Understanding the Basics", duration: "18:20", completed: true, videoId: "1O5NiFn8G0JZfOIOVULfS4T1nybG_N_YG" },
    ],
  },
  {
    section: "Core Fundamentals",
    lessons: [
      { title: "HTML Structure & Semantics", duration: "22:10", completed: true, videoId: "1O5NiFn8G0JZfOIOVULfS4T1nybG_N_YG" },
      { title: "CSS Styling & Layouts", duration: "28:35", completed: false, videoId: "1O5NiFn8G0JZfOIOVULfS4T1nybG_N_YG" },
      { title: "JavaScript Essentials", duration: "35:00", completed: false, videoId: "1O5NiFn8G0JZfOIOVULfS4T1nybG_N_YG" },
      { title: "Responsive Design Principles", duration: "20:15", completed: false, videoId: "1O5NiFn8G0JZfOIOVULfS4T1nybG_N_YG" },
    ],
  },
  {
    section: "Advanced Topics",
    lessons: [
      { title: "React Fundamentals", duration: "30:00", completed: false, videoId: "1O5NiFn8G0JZfOIOVULfS4T1nybG_N_YG" },
      { title: "State Management", duration: "25:40", completed: false, videoId: "1O5NiFn8G0JZfOIOVULfS4T1nybG_N_YG" },
      { title: "API Integration", duration: "28:15", completed: false, videoId: "1O5NiFn8G0JZfOIOVULfS4T1nybG_N_YG" },
      { title: "Testing & Deployment", duration: "22:50", completed: false, videoId: "1O5NiFn8G0JZfOIOVULfS4T1nybG_N_YG" },
    ],
  },
  {
    section: "Final Project",
    lessons: [
      { title: "Project Planning", duration: "15:00", completed: false, videoId: "1O5NiFn8G0JZfOIOVULfS4T1nybG_N_YG" },
      { title: "Building the Application", duration: "45:00", completed: false, videoId: "1O5NiFn8G0JZfOIOVULfS4T1nybG_N_YG" },
      { title: "Code Review & Optimization", duration: "20:00", completed: false, videoId: "1O5NiFn8G0JZfOIOVULfS4T1nybG_N_YG" },
    ],
  },
];

export interface MockReview {
  id: string;
  courseId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}

export const initialReviews: MockReview[] = [
  {
    id: "r1",
    courseId: "1",
    userName: "John Doe",
    rating: 5,
    comment: "Absolutely fantastic course! The projects are challenging and practical.",
    date: "2 weeks ago",
  },
  {
    id: "r2",
    courseId: "1",
    userName: "Sarah Miller",
    rating: 4,
    comment: "Great structure and the instructor explains complex topics simply.",
    date: "1 month ago",
  },
  {
    id: "r3",
    courseId: "2",
    userName: "Alex Kumar",
    rating: 5,
    comment: "Best investment I've made in my career. Highly recommended for beginners.",
    date: "3 weeks ago",
  },
];
