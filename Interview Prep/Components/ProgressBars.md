# **6. Progress Bars**

### ✅ Requirements

* Display progress toward a goal (0 → 100%).
* Support both **determinate** (known progress, e.g. 70%) and **indeterminate** (unknown progress, e.g. spinner or animated bar).
* Accessibility:

  * Use `role="progressbar"`.
  * Add `aria-valuemin`, `aria-valuemax`, `aria-valuenow` (for determinate).
  * For indeterminate, omit `aria-valuenow`.
* Visual clarity: Should be responsive and color-coded.
* Variants: Linear vs Circular.

---

### ⚙️ Step-by-Step Solution

1. **State**: `value` (number between 0–100) for determinate progress.
2. **Props**:

   * `value?: number` (if omitted → indeterminate).
   * `max?: number` (default 100).
   * `label?: string` for screen reader text.
3. **Rendering**:

   * Outer track (background).
   * Inner filled bar with dynamic `width` proportional to `value`.
   * Animate width change smoothly.
4. **Indeterminate mode**:

   * Animate bar with CSS keyframes sliding left to right.

---

### 🧑‍💻 React Implementation

```tsx
import React from "react";

interface ProgressBarProps {
  value?: number; // if undefined -> indeterminate
  max?: number;
  label?: string;
}

export default function ProgressBar({ value, max = 100, label }: ProgressBarProps) {
  const isIndeterminate = value == null;
  const percentage = value != null ? Math.min(Math.max(value, 0), max) : 0;

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={isIndeterminate ? undefined : percentage}
      aria-label={label || "Progress"}
      className="w-full bg-gray-200 rounded-full h-4 overflow-hidden relative"
    >
      {/* Determinate */}
      {!isIndeterminate && (
        <div
          className="h-full bg-blue-500 transition-[width] duration-500 ease-out"
          style={{ width: `${(percentage / max) * 100}%` }}
        />
      )}

      {/* Indeterminate */}
      {isIndeterminate && (
        <div className="absolute inset-0 bg-blue-500 animate-progress-indeterminate" />
      )}
    </div>
  );
}
```

#### 🎨 CSS for Indeterminate Animation

```css
@keyframes indeterminate {
  0% {
    left: -40%;
    width: 40%;
  }
  50% {
    left: 20%;
    width: 60%;
  }
  100% {
    left: 100%;
    width: 40%;
  }
}

.animate-progress-indeterminate {
  position: absolute;
  height: 100%;
  animation: indeterminate 1.5s infinite;
}
```

---

### 🔥 Follow-up Questions & Extensions

* **Label display**: Show percentage text inside or above the bar.
* **Colors**: Different colors for warning (`<50%` yellow) or danger (`<20%` red).
* **Circular variant**: Render SVG circle with stroke-dasharray animation.
* **Accessibility**: Use `aria-valuetext="70 percent completed"` for better screen reader messages.
* **Buffer mode**: Add secondary track (like YouTube’s video buffering).