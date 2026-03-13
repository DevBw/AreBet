"use client";

import { useState } from "react";

type Props = {
  value: number;              // 0 = unrated, 1–5 = rated
  onChange?: (stars: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
};

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: Props) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <span
      className={`star-rating star-rating--${size}`}
      role={readonly ? "img" : "group"}
      aria-label={
        value ? `Rated ${value} out of 5 stars` : "Not yet rated"
      }
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn${display >= star ? " is-filled" : ""}`}
          onClick={() => {
            if (readonly) return;
            // Clicking the same star again clears the rating
            onChange?.(star === value ? 0 : star);
          }}
          onMouseEnter={() => { if (!readonly) setHovered(star); }}
          onMouseLeave={() => { if (!readonly) setHovered(0); }}
          aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
          disabled={readonly}
          tabIndex={readonly ? -1 : 0}
        >
          {display >= star ? "\u2605" : "\u2606"}
        </button>
      ))}
    </span>
  );
}
