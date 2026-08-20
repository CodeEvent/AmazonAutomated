"use client";

import { useState } from "react";
import { InitialAvatar } from "@/components/ui/initial-avatar";
import { relativeTimeLabel, tenureLabel } from "@/lib/relative-time";

type ReviewData = {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  user: { name: string | null; createdAt: Date };
};

const TOPIC_KEYWORDS: Array<{ label: string; emoji: string; keywords: string[] }> = [
  { label: "Location", emoji: "📍", keywords: ["location", "walk", "central", "close to"] },
  { label: "Cleanliness", emoji: "🧼", keywords: ["clean", "tidy", "spotless"] },
  { label: "Hospitality", emoji: "🎁", keywords: ["host", "hospitality", "welcom", "friendly"] },
  { label: "Beach", emoji: "🏖️", keywords: ["beach", "sea", "ocean", "coast"] },
  { label: "Value", emoji: "💰", keywords: ["value", "worth", "price", "affordable"] },
  { label: "View", emoji: "🌄", keywords: ["view", "sunset", "skyline", "overlook"] },
  { label: "Quiet", emoji: "🤫", keywords: ["quiet", "peaceful", "relax"] },
  { label: "Wifi", emoji: "📶", keywords: ["wifi", "wi-fi", "internet"] },
];

function extractTopics(reviews: ReviewData[]) {
  const text = reviews.map((r) => r.comment.toLowerCase()).join(" \n ");
  return TOPIC_KEYWORDS.map((topic) => {
    const count = topic.keywords.reduce((sum, keyword) => {
      const matches = text.match(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"));
      return sum + (matches?.length ?? 0);
    }, 0);
    return { ...topic, count };
  })
    .filter((topic) => topic.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

export function ReviewsSection({
  reviews,
  ratingAverage,
  reviewCount,
}: {
  reviews: ReviewData[];
  ratingAverage: number;
  reviewCount: number;
}) {
  const [showAll, setShowAll] = useState(false);
  const [howReviewsWorkOpen, setHowReviewsWorkOpen] = useState(false);
  const topics = extractTopics(reviews);
  const visible = showAll ? reviews : reviews.slice(0, 6);

  return (
    <section className="py-8">
      <h2 className="flex items-center gap-2 text-xl font-bold text-ink">
        <StarIcon /> {ratingAverage.toFixed(2)} · {reviewCount} review{reviewCount === 1 ? "" : "s"}
      </h2>

      {reviews.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No reviews yet.</p>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setHowReviewsWorkOpen((v) => !v)}
            className="mt-2 text-sm font-semibold text-ink underline underline-offset-2"
          >
            How reviews work
          </button>
          {howReviewsWorkOpen ? (
            <p className="mt-2 max-w-lg text-sm text-muted">
              Ratings and reviews are only visible once a guest has completed their stay, and only
              guests who booked through Wayfarer can leave one.
            </p>
          ) : null}

          {topics.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-base font-semibold text-ink">Guest reviews mention</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {topics.map((topic) => (
                  <span
                    key={topic.label}
                    className="flex items-center gap-1.5 rounded-full border border-hairline px-3 py-1.5 text-sm text-ink"
                  >
                    <span aria-hidden>{topic.emoji}</span> {topic.label} <span className="text-muted">{topic.count}</span>
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2">
            {visible.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>

          {reviews.length > 6 ? (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="mt-6 rounded-lg border border-ink px-5 py-3 text-sm font-semibold text-ink hover:bg-surface-soft"
            >
              {showAll ? "Show less" : `Show all ${reviews.length} reviews`}
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}

function ReviewCard({ review }: { review: ReviewData }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.comment.length > 220;
  const name = review.user.name ?? "Guest";

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <InitialAvatar name={name} size={40} />
        <div>
          <p className="text-sm font-semibold text-ink">{name}</p>
          <p className="text-xs text-muted">{tenureLabel(review.user.createdAt)}</p>
        </div>
      </div>
      <p className="mt-2 flex items-center gap-1 text-sm text-muted">
        {"★".repeat(review.rating)}
        {"☆".repeat(Math.max(0, 5 - review.rating))} · {relativeTimeLabel(review.createdAt)}
      </p>
      <p className={`mt-2 text-sm text-body ${expanded ? "" : "line-clamp-4"}`}>{review.comment}</p>
      {isLong ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-sm font-semibold text-ink underline underline-offset-2"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      ) : null}
    </div>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-4 w-4 fill-ink">
      <path d="M8 0l2.163 5.279 5.837.451-4.5 3.792L12.9 15.5 8 12.2 3.1 15.5l1.4-5.978L0 5.73l5.837-.451z" />
    </svg>
  );
}
