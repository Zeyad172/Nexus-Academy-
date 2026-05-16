import { Users, Clock, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import RatingStars from "./RatingStars";
import { Course } from "@/lib/courses-api";
import { getMediaUrl } from "@/lib/utils";

interface CourseCardProps {
  course: Course;
  showProgress?: boolean;
  progress?: number;
}

const CourseCard = ({ course, showProgress = false, progress }: CourseCardProps) => {
  const imageUrl = getMediaUrl(course.thumbnail_url);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <Link to={`/courses/${course.course_id}`} className="block rounded-card group">
      <div className="bg-card rounded-card card-shadow hover-lift overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="relative h-44 overflow-hidden bg-muted">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={course.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <>
              <div className="absolute inset-0 gradient-primary opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="text-primary-foreground" size={48} strokeWidth={1} />
              </div>
            </>
          )}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-card/90 text-foreground backdrop-blur-sm">
              {course.level}
            </span>
          </div>
          {course.price !== null && course.price !== undefined && course.price < course.original_price && (
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-destructive text-destructive-foreground">
                {course.price === 0 ? "FREE" : `${Math.round((1 - course.price / course.original_price) * 100)}% OFF`}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <span className="text-xs font-medium text-secondary uppercase tracking-wider mb-2">
            {course.category_name}
          </span>
          <h3 className="text-body font-semibold text-card-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <span className="flex flex-row justify-start items-center">
            <p className="text-small text-muted-foreground mr-2">{course.instructor_name}</p>
            <RatingStars rating={course.rating} reviewCount={course.review_count || 0} size={14} />
          </span>

          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users size={13} /> {(course.students_count || 0).toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={13} /> {formatDuration(course.duration)}
            </span>
          </div>

          {showProgress && progress !== undefined ? (
            <div className="mt-auto pt-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium text-primary">{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full gradient-primary" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : (
            <div className="mt-auto pt-4 flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                {course.price === 0 ? (
                  <span className="text-lg font-bold text-emerald-600">Free</span>
                ) : (
                  <span className="text-lg font-bold text-primary">
                    ${course.price ?? course.original_price}
                  </span>
                )}

                {course.price !== undefined && 
                 course.price !== null && 
                 course.price > 0 && 
                 course.price < course.original_price && (
                  <span className="text-small text-muted-foreground line-through">
                    ${course.original_price}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                View Course →
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
