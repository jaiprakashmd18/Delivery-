import Image from "next/image";
import { Star, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Review } from "@/types";

interface ReviewCardProps {
  review: Review;
  className?: string;
}

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i < Math.floor(rating)
              ? "fill-amber-400 text-amber-400"
              : i < rating
              ? "fill-amber-400/50 text-amber-400"
              : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
          )}
        />
      ))}
    </div>
  );
}

function formatReviewDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function ReviewCard({ review, className }: ReviewCardProps) {
  const userName = review.user?.name ?? review.customer?.name ?? "Anonymous";
  const userImage = review.user?.image ?? review.customer?.image;

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3 shadow-sm",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {userImage ? (
            <Image
              src={userImage}
              alt={userName}
              width={40}
              height={40}
              className="rounded-full object-cover border-2 border-gray-100 dark:border-gray-700"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              {userName === "Anonymous" ? (
                <User className="h-5 w-5 text-primary" />
              ) : (
                <span className="text-sm font-semibold text-primary">
                  {initials}
                </span>
              )}
            </div>
          )}

          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              {userName}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {formatReviewDate(review.createdAt)}
            </p>
          </div>
        </div>

        {/* Overall rating badge */}
        <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded-full text-sm font-semibold flex-shrink-0">
          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
          {review.rating.toFixed(1)}
        </div>
      </div>

      {/* Star breakdown */}
      <div className="flex items-center gap-2">
        <StarRating rating={review.rating} />
        {review.deliveryRating != null && (
          <>
            <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Delivery {review.deliveryRating}/5
            </span>
          </>
        )}
      </div>

      {/* Comment */}
      {review.comment && (
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          {review.comment}
        </p>
      )}

      {/* Review images */}
      {review.images && review.images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {review.images.slice(0, 4).map((img, idx) => (
            <div
              key={idx}
              className="relative h-16 w-16 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800"
            >
              <Image
                src={img}
                alt={`Review image ${idx + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
              {idx === 3 && review.images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-semibold">
                  +{review.images.length - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
