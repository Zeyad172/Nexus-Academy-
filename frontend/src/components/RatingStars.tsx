import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  size?: number;
  showValue?: boolean;
  reviewCount?: number;
}

const RatingStars = ({ rating, size = 16, showValue = true, reviewCount }: RatingStarsProps) => {
  return (
    <div className="flex items-center gap-1">
      {showValue && <span className="font-semibold text-primary-foreground/70 text-small">{rating}</span>}
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={
              star <= Math.floor(rating)
                ? "fill-amber-400 text-amber-400"
                : star - 0.5 <= rating
                ? "fill-amber-400/50 text-amber-400"
                : "text-muted-foreground/30"
            }
          />
        ))}
      </div>
      {reviewCount !== undefined && (
        <span className="text-small text-primary-foreground/70">({reviewCount.toLocaleString()})</span>
      )}
    </div>
  );
};

export default RatingStars;
