import { Quote } from "lucide-react";
import RatingStars from "./RatingStars";
import { getMediaUrl } from "@/lib/utils";

interface ReviewCardProps {
    comment: string;
    rating: number;
    first_name: string;
    last_name: string;
    avatar_url?: string;
}

const ReviewCard = ({
    comment,
    rating,
    first_name,
    last_name,
    avatar_url,
}: ReviewCardProps) => {
    const imageUrl = getMediaUrl(avatar_url);
    return (
        <div className="bg-background rounded-card card-shadow p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group h-full">
            <Quote
                size={24}
                className="text-primary/30 mb-4 group-hover:text-primary/50 transition-colors"
            />
            <p className="text-body text-muted-foreground leading-relaxed mb-6">
                {comment}
            </p>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                    <span className="text-small font-bold text-primary-foreground">
                        {avatar_url ? (
                            <img src={imageUrl} alt={`${first_name} ${last_name}`} className="w-full h-full rounded-full object-cover" />
                        ) : (first_name.charAt(0))}
                    </span>
                </div>
                <div>
                    <div className="text-small font-semibold text-foreground">
                        {first_name} {last_name}
                    </div>
                    <div className="text-xs text-muted-foreground">Student</div>
                </div>
                <div className="ml-auto">
                    <RatingStars
                        rating={rating}
                        size={12}
                        showValue={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default ReviewCard;
