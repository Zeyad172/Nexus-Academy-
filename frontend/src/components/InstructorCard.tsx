import { BookOpen, Star } from "lucide-react";
import { getMediaUrl } from "@/lib/utils";
import type { Instructor } from "@/lib/data";

const InstructorCard = ({ instructor }: { instructor: Instructor }) => {
  return (
    <div className="bg-card rounded-card card-shadow hover-lift p-6 text-center group">
      <div className="w-20 h-20 mx-auto rounded-full gradient-primary flex items-center justify-center mb-4">
        <span className="text-2xl font-bold text-primary-foreground">
          {instructor.avatar_url ? (
            <img src={getMediaUrl(instructor.avatar_url)} alt={`${instructor.first_name} ${instructor.last_name}`} className="w-full h-full object-cover rounded-full" />
          ) : (
            `${instructor.first_name[0]}${instructor.last_name[0]}`
          )}
        </span>
      </div>
      <h3 className="text-body font-semibold text-card-foreground group-hover:text-primary transition-colors">
        {instructor.first_name} {instructor.last_name}
      </h3>
      <p className="text-small text-muted-foreground mt-1 mb-4">{instructor.title || 'Instructor'}</p>
      <div className="flex items-center justify-center gap-4 text-small text-muted-foreground">
        <span className="flex items-center gap-1">
          {instructor.average_rating ? (
            <>
              <Star size={14} className="fill-amber-400 text-amber-400" /> {instructor.average_rating.toFixed(1)}
            </>
          ) : null}
        </span>
        <span className="flex items-center gap-1">
          <BookOpen size={14} /> {instructor.course_count || 0}
        </span>
      </div>
    </div>
  );
};

export default InstructorCard;
