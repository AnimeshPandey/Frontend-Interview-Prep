# **2. Modal Dialog**

### ✅ Requirements

* Renders content in an overlay above the page.
* Blocks background interaction (clicks, keyboard focus).
* Closeable via:

  * Click outside (backdrop).
  * `Esc` key.
  * Close button.
* Accessibility:

  * `role="dialog"` with `aria-modal="true"`.
  * Focus trap (focus stays within modal).
  * Restore focus to trigger element when closed.

---

### ⚙️ Step-by-Step Solution

1. **State**: `isOpen` boolean to track visibility.
2. **Portal**: Render modal outside normal DOM flow (e.g. `document.body`).
3. **Keyboard handling**: Close on `Escape`.
4. **Focus management**:

   * On open: move focus to first focusable element (or modal).
   * On close: restore focus to last trigger.
   * Trap focus with `tab` cycling.
5. **Backdrop click**: Close if user clicks outside content.

---

### 🧑‍💻 React Implementation

```tsx
import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const lastActiveElement = useRef<HTMLElement | null>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      lastActiveElement.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      lastActiveElement.current?.focus();
    }
  }, [isOpen]);

  // Handle Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white p-6 rounded-2xl shadow-xl relative max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <h2 id="modal-title" className="text-lg font-bold mb-4">
            {title}
          </h2>
        )}

        {/* Body */}
        <div>{children}</div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-black"
          aria-label="Close modal"
        >
          ✕
        </button>
      </div>
    </div>,
    document.body
  );
}
```

---

### 🔥 Follow-up Questions & Extensions

* **Focus trap**: Implement a real tab-trap (cycle focusable elements).
* **Animation**: Add fade/scale transitions (Framer Motion).
* **Accessibility**: `aria-describedby` if modal has descriptive text.
* **Variants**: Confirm dialog vs Form modal.
* **Portal flexibility**: Let users specify a custom container instead of `document.body`.

---

# **3. Image Carousel**

### ✅ Requirements

* Display a list of images (or slides).
* Navigate with:

  * Next / Prev buttons.
  * Dots (indicators).
  * Swipe gestures (mobile).
* Accessibility:

  * `aria-roledescription="carousel"`.
  * Each slide should have `aria-hidden` unless active.
  * Buttons with accessible labels.
* Optional: Auto-play with pause on hover.

---

### ⚙️ Step-by-Step Solution

1. **State**: `activeIndex` for current slide.
2. **Controls**:

   * Next / Prev buttons (wrap around).
   * Indicators (`onClick` sets index).
3. **Keyboard**: Arrow keys left/right to navigate.
4. **Auto-play** (if enabled): `setInterval`. Clear on hover or unmount.
5. **Responsiveness**: Slides adapt to container size.

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

  // Auto play
  useEffect(() => {
    if (!autoPlay) return;
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % images.length);
    }, interval);
    return () => clearInterval(id);
  }, [autoPlay, interval, images.length]);

  const prev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setActiveIndex((i) => (i + 1) % images.length);

  return (
    <div className="relative w-full max-w-xl mx-auto" aria-roledescription="carousel">
      {/* Slides */}
      <div className="overflow-hidden rounded-2xl">
        <img
          src={images[activeIndex]}
          alt={`Slide ${activeIndex + 1}`}
          className="w-full h-64 object-cover transition-transform duration-500"
        />
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
      <div className="flex justify-center gap-2 mt-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`w-3 h-3 rounded-full ${i === activeIndex ? "bg-blue-500" : "bg-gray-400"}`}
          />
        ))}
      </div>
    </div>
  );
}
```

---

### 🔥 Follow-up Questions & Extensions

* **Infinite scroll**: Add smooth infinite effect instead of jump.
* **Touch support**: Handle swipe with `pointerdown/move/up`.
* **Lazy loading**: Only render current + nearby slides.
* **Video slides**: Support mixed media.
* **Accessibility**: Announce “Slide X of Y” to screen readers.