# **3. Image Carousel**

### ✅ Requirements

* Displays a set of images/slides.
* Navigation:

  * Next / Previous buttons.
  * Dots/indicators for direct navigation.
  * Optional: swipe gestures (mobile).
* Accessibility:

  * `aria-roledescription="carousel"`.
  * Slides should have `aria-hidden="true"` unless active.
  * Controls must have descriptive labels.
* Optional: Auto-play with configurable interval (pause on hover).
* Smooth animations between slides.

---

### ⚙️ Step-by-Step Solution

1. **State**:

   * `activeIndex` = current slide index.
2. **Navigation controls**:

   * `next()` = `(index + 1) % length`.
   * `prev()` = `(index - 1 + length) % length`.
   * Direct dot click → `setActiveIndex(i)`.
3. **Auto-play**:

   * `setInterval` advancing slides every `interval`.
   * Pause on hover (clear interval).
4. **Accessibility**:

   * Wrap in `role="region"` and `aria-roledescription="carousel"`.
   * Each slide labeled with `"Slide X of Y"`.
   * `aria-hidden` on inactive slides.
5. **Animations**:

   * TranslateX or opacity fade transitions for smooth effect.

---

### 🧑‍💻 React Implementation

```tsx
import React, { useState, useEffect } from "react";

interface CarouselProps {
  images: string[];
  autoPlay?: boolean;
  interval?: number;
}

export default function Carousel({ images, autoPlay = true, interval = 3000 }: CarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const prev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setActiveIndex((i) => (i + 1) % images.length);

  // Auto-play with pause
  useEffect(() => {
    if (!autoPlay || isPaused) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % images.length);
    }, interval);
    return () => clearInterval(id);
  }, [autoPlay, interval, images.length, isPaused]);

  return (
    <div
      className="relative w-full max-w-xl mx-auto"
      role="region"
      aria-roledescription="carousel"
      aria-label="Image carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div className="overflow-hidden rounded-2xl relative h-64">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Slide ${i + 1} of ${images.length}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              i === activeIndex ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={i !== activeIndex}
          />
        ))}
      </div>

      {/* Controls */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 px-2 py-1 rounded"
      >
        ‹
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 px-2 py-1 rounded"
      >
        ›
      </button>

      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-3">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-pressed={i === activeIndex}
            className={`w-3 h-3 rounded-full ${
              i === activeIndex ? "bg-blue-500" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
```

---

### 🔥 Follow-up Questions & Extensions

* **Infinite looping**: Add seamless looping with “clone” slides for smoother UX.
* **Swipe gestures**: Handle `pointerdown/move/up` for mobile.
* **Lazy loading**: Render only active + nearby slides.
* **Mixed media**: Support videos alongside images.
* **Controlled component**: Accept `activeIndex` and `onChange` props so a parent can drive it.
* **Accessibility upgrade**: Add live region to announce “Slide X of Y” when slide changes.
