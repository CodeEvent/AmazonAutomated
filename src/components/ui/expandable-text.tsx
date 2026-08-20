"use client";

import { useState } from "react";

export function ExpandableText({
  text,
  clampLines = 4,
  className = "",
  buttonClassName = "mt-2 text-sm font-semibold text-ink underline underline-offset-2",
}: {
  text: string;
  clampLines?: number;
  className?: string;
  buttonClassName?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <p
        className={`whitespace-pre-line ${className}`}
        style={
          expanded
            ? undefined
            : {
                display: "-webkit-box",
                WebkitLineClamp: clampLines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
        }
      >
        {text}
      </p>
      <button type="button" onClick={() => setExpanded((v) => !v)} className={buttonClassName}>
        {expanded ? "Show less" : "Show more"}
      </button>
    </div>
  );
}
