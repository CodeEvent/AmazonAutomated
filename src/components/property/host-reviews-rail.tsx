"use client";

import { useState } from "react";
import { InitialAvatar } from "@/components/ui/initial-avatar";
import { relativeTimeLabel, tenureLabel } from "@/lib/relative-time";

type HostReview = {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  user: { name: string | null; createdAt: Date };
};

export function HostReviewsRail({ hostName, reviews }: { hostName: string; reviews: HostReview[] }) {
  const [showAll, setShowAll] = useState(false);
  if (reviews.length === 0) return null;

  const visible = showAll ? reviews : reviews.slice(0, 6);

  return (
    <div className="mt-6 border-t border-hairline-soft pt-6">
      <h3 className="text-base font-semibold text-ink">{hostName}&apos;s reviews</h3>
      <div className="mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {visible.map((review) => (
          <div key={review.id} className="w-[240px] shrink-0 snap-start">
            <div className="flex items-center gap-2">
              <InitialAvatar name={review.user.name ?? "Guest"} size={36} />
              <div>
                <p className="text-sm font-semibold text-ink">{review.user.name ?? "Guest"}</p>
                <p className="text-xs text-muted">{tenureLabel(review.user.createdAt)}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted">
              {"★".repeat(review.rating)}
              {"☆".repeat(Math.max(0, 5 - review.rating))} · {relativeTimeLabel(review.createdAt)}
            </p>
            <ReviewComment comment={review.comment} />
          </div>
        ))}
      </div>

      {reviews.length > 6 ? (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-4 rounded-lg border border-ink px-5 py-2.5 text-sm font-semibold text-ink hover:bg-surface-soft"
        >
          {showAll ? "Show less" : "Show more reviews"}
        </button>
      ) : null}
    </div>
  );
}

function ReviewComment({ comment }: { comment: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = comment.length > 140;

  return (
    <div>
      <p className={`mt-2 text-sm text-body ${expanded ? "" : "line-clamp-3"}`}>{comment}</p>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-xs font-semibold text-ink underline underline-offset-2"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      ) : null}
    </div>
  );
}
