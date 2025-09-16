# 🖼️ The Concept of Lazy Loading Images

> **Lazy loading** means deferring the loading of images until they’re actually needed (i.e., about to appear in the viewport).

* **Why?** Performance. Don’t waste bandwidth loading images the user may never see (e.g., below-the-fold).
* **Two ways:**

  1. **Native HTML**: `<img loading="lazy">` (modern browsers).
  2. **Fallback**: Use **IntersectionObserver** to detect when the image enters the viewport.

---

# 🔍 Step-by-Step Breakdown of the Implementation

```js
const LazyLoadImage = ({
  alt,
  src,
  className,
  loadInitially = false,
  observerOptions = { root: null, rootMargin: '200px 0px' },
  ...props
}) => {
```

* This is a reusable **React component**.
* Accepts standard `img` props (`alt`, `src`, `className`).
* `loadInitially` = whether to load right away (no lazy loading).
* `observerOptions` = tuning for the IntersectionObserver (e.g., “start loading when image is 200px away from viewport”).
* `...props` → forward any other props (like `width`, `height`, etc.).

---

```js
  const observerRef = React.useRef(null);
  const imgRef = React.useRef(null);
  const [isLoaded, setIsLoaded] = React.useState(loadInitially);
```

* `observerRef` → holds the **IntersectionObserver instance** (if needed).
* `imgRef` → points to the `<img>` DOM element.
* `isLoaded` → boolean state: whether we should actually load the image.

  * Defaults to `true` if `loadInitially` is set.
  * Otherwise starts as `false`.

---

```js
  const observerCallback = React.useCallback(
    entries => {
      if (entries[0].isIntersecting) {
        observerRef.current.disconnect();
        setIsLoaded(true);
      }
    },
    [observerRef]
  );
```

* **IntersectionObserver callback**.

* When the image enters the viewport (`isIntersecting = true`):

  * Disconnect observer (no longer need to track).
  * Update `isLoaded = true` → triggers re-render → `src` gets applied.

* Wrapped in `useCallback` → stable reference, avoids re-creating function unnecessarily.

---

```js
  React.useEffect(() => {
    if (loadInitially) return;

    if ('loading' in HTMLImageElement.prototype) {
      setIsLoaded(true);
      return;
    }

    observerRef.current = new IntersectionObserver(
      observerCallback,
      observerOptions
    );
    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current.disconnect();
    };
  }, []);
```

* This effect runs **once on mount**.
* If `loadInitially` is `true` → skip everything.
* If the browser natively supports `loading="lazy"` (feature detection via `HTMLImageElement.prototype`) → just set `isLoaded = true` (let the browser handle it).
* Otherwise:

  * Create a new `IntersectionObserver` with our callback.
  * Start observing the `<img>` element.
* Cleanup: on unmount, disconnect the observer.

---

```js
  return (
    <img
      alt={alt}
      src={isLoaded ? src : ''}
      ref={imgRef}
      className={className}
      loading={loadInitially ? undefined : 'lazy'}
      {...props}
    />
  );
};
```

* Render the actual `<img>`.
* If `isLoaded` → provide the `src`. Otherwise → empty string (prevents early load).
* Attach `imgRef` for IntersectionObserver.
* Apply `loading="lazy"` if not loading initially.
* Spread any other props.

---

```js
ReactDOM.createRoot(document.getElementById('root')).render(
  <LazyLoadImage
    src="https://picsum.photos/id/1080/600/600"
    alt="Strawberries"
  />
);
```

* Usage example.
* Initially, `src=""` (image not loaded).
* When the image scrolls into viewport, `isLoaded` flips to true, `src` is set, and image loads.

---

# 📊 Mental Model

* Think of this as a **gatekeeper** in front of your `<img>`.

* Gatekeeper rules:

  1. If `loadInitially = true` → open gate immediately.
  2. Else if browser supports `loading="lazy"` → open gate immediately (let browser handle).
  3. Else → station an observer guard.

     * When `<img>` enters viewport → open gate, remove guard.

* "Opening the gate" = setting `isLoaded = true`, which finally attaches `src`.

---

# 🧩 Why This Works Well

* **Progressive enhancement:** Use native lazy loading if available.
* **Fallback:** Otherwise, IntersectionObserver polyfill behavior.
* **Optimized UX:** Avoids network waste, speeds up initial rendering.
* **Cleanups:** Observer disconnects when done → no memory leaks.

---

# 🪜 How to Build This Yourself in an Interview

1. **State the problem:**
   “We want an image that loads only when in viewport.”

2. **Think of API support:**

   * Check if browser supports `loading="lazy"`.

3. **Else, use IntersectionObserver:**

   * Set up observer to watch the `<img>`.
   * When it intersects → load the image.

4. **Edge case:** Provide `loadInitially` prop for opt-out.

5. **Add cleanup:** Disconnect observer on unmount.

---

# 🎯 Takeaway

Lazy loading images is all about **delaying network requests** until content is needed.
This React component combines:

* `useRef` for DOM refs,
* `useState` for load status,
* `useEffect` for observer setup/cleanup,
* `useCallback` for stable observer callback.

---

## 🧩 Complete Running Code

```jsx
import React from "react";
import ReactDOM from "react-dom/client";

const LazyLoadImage = ({
  alt,
  src,
  className,
  loadInitially = false,
  observerOptions = { root: null, rootMargin: "200px 0px" },
  ...props
}) => {
  const observerRef = React.useRef(null);
  const imgRef = React.useRef(null);
  const [isLoaded, setIsLoaded] = React.useState(loadInitially);

  const observerCallback = React.useCallback(
    (entries) => {
      if (entries[0].isIntersecting) {
        observerRef.current.disconnect();
        setIsLoaded(true);
      }
    },
    [observerRef]
  );

  React.useEffect(() => {
    if (loadInitially) return;

    // Native lazy-loading support
    if ("loading" in HTMLImageElement.prototype) {
      setIsLoaded(true);
      return;
    }

    // Fallback: use IntersectionObserver
    observerRef.current = new IntersectionObserver(
      observerCallback,
      observerOptions
    );
    observerRef.current.observe(imgRef.current);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  return (
    <img
      alt={alt}
      src={isLoaded ? src : ""}
      ref={imgRef}
      className={className}
      loading={loadInitially ? undefined : "lazy"}
      {...props}
    />
  );
};

const App = () => (
  <div style={{ height: "200vh", padding: "50px" }}>
    <p>Scroll down to load the image lazily 👇</p>
    <div style={{ marginTop: "120vh" }}>
      <LazyLoadImage
        src="https://picsum.photos/id/1080/600/600"
        alt="Strawberries"
        className="demo-img"
      />
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
```

✅ You can run this in a React environment and see lazy loading in action.

---

## ❓ Follow-up Questions / Improvements / Edge Cases

### 🔥 Interview Questions

* How would you **test this component** (unit + E2E)?
* What’s the difference between **lazy loading** and **progressive image loading** (low-res placeholders)?
* Why use **IntersectionObserver** over **scroll event listeners**?

### 🛠 Improvements

* Add a **placeholder image or skeleton** before the real image loads.
* Add **onLoad callback** for when the image finishes loading.
* Add **fade-in animation** when image becomes visible.
* Handle **error state** (e.g., broken `src`) gracefully.

### ⚠️ Edge Cases

* Images that are already in viewport when mounted → should load immediately.
* Multiple images on the page → reuse a **shared observer** instead of one per image for performance.
* Server-side rendering → no `window.IntersectionObserver`, must guard for that.

---
