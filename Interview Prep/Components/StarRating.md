# **5. Star Rating**

### ✅ Requirements

* Display **N stars** (commonly 5).
* Users can **select a rating** by clicking a star.
* Hovering should show a **preview highlight** (before committing).
* Accessibility:

  * Use `role="radiogroup"` with each star as a `radio`.
  * `aria-checked` for selected star.
  * Keyboard navigation:

    * `ArrowLeft` / `ArrowRight` to move selection.
    * `Space` / `Enter` to select.
* Should support both **controlled** and **uncontrolled** usage.

---

### ⚙️ Step-by-Step Solution

1. **State**:

   * `rating` → committed value.
   * `hovered` → temporary preview.
2. **Events**:

   * `onMouseEnter` → update `hovered`.
   * `onMouseLeave` → reset to committed.
   * `onClick` → update `rating`.
3. **Accessibility**:

   * Wrap stars in `role="radiogroup"`.
   * Each star: `role="radio"`, `aria-checked`.
   * `tabIndex=0` on selected star, `-1` on others.
4. **Extensibility**: Support `max={10}` or half-star ratings.

---

### 🧑‍💻 React Implementation

```tsx
import React, { useState } from "react";

interface StarRatingProps {
  max?: number;
  value?: number; // controlled
  onChange?: (val: number) => void;
}

export default function StarRating({ max = 5, value, onChange }: StarRatingProps) {
  const [rating, setRating] = useState(value ?? 0);
  const [hovered, setHovered] = useState<number | null>(null);

  const activeValue = hovered ?? rating;

  const handleSelect = (val: number) => {
    if (onChange) {
      onChange(val);
    } else {
      setRating(val);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, val: number) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      handleSelect(Math.min((activeValue || 0) + 1, max));
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      handleSelect(Math.max((activeValue || 0) - 1, 1));
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect(val);
    }
  };

  return (
    <div role="radiogroup" aria-label="Star rating" className="flex gap-2">
      {Array.from({ length: max }, (_, i) => {
        const val = i + 1;
        const filled = val <= activeValue;
        return (
          <span
            key={val}
            role="radio"
            aria-checked={rating === val}
            tabIndex={rating === val ? 0 : -1}
            onClick={() => handleSelect(val)}
            onMouseEnter={() => setHovered(val)}
            onMouseLeave={() => setHovered(null)}
            onKeyDown={(e) => handleKeyDown(e, val)}
            className={`cursor-pointer text-2xl ${
              filled ? "text-yellow-500" : "text-gray-300"
            }`}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}
```

---

### 🔥 Follow-up Questions & Extensions

* **Half-stars**: Allow fractional selection (`val + 0.5`).
* **Read-only mode**: For displaying reviews without interaction.
* **Animations**: Scale stars on hover.
* **Custom icons**: Hearts, emojis, SVGs instead of ★.
* **Accessibility upgrade**: Add `aria-label="X out of Y stars"` on each star.