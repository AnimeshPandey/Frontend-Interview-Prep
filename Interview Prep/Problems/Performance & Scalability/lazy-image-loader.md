# 🔎 Problem 17: Lazy Image Loader
* Step 1 → Naive lazy loading (load all at once).
* Step 2 → IntersectionObserver-based loader.
* Step 3 → Scroll event fallback.
* Step 4 → Add progressive enhancement (blur-up, placeholder).
* Step 5 → Discuss real-world tradeoffs (SEO, perf, browser support).
---

## Step 1. Interviewer starts:

*"Implement lazy loading by deferring image `src` until needed."*

---

### ❌ Naive Lazy Loader (loads all after page load)

```js
window.addEventListener("load", () => {
  document.querySelectorAll("img[data-src]").forEach(img => {
    img.src = img.dataset.src; // load after full page load
  });
});
```

⚠ Problem: This loads **all images** after page load → still heavy for long pages.

---

## Step 2. Interviewer says:

*"Use **IntersectionObserver** to load only when images are near viewport."*

---

### ✅ IntersectionObserver Lazy Loader

```js
function lazyLoadImages() {
  const imgs = document.querySelectorAll("img[data-src]");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src; // swap in real src
        observer.unobserve(img);  // stop observing once loaded
      }
    });
  }, { rootMargin: "100px" }); // preload slightly before visible

  imgs.forEach(img => observer.observe(img));
}

// Example
document.addEventListener("DOMContentLoaded", lazyLoadImages);
```

✔ Efficient: only loads when within 100px of viewport.

---

## Step 3. Interviewer twists:

*"Good. But what if IntersectionObserver is not supported (old browsers)? Add a **scroll fallback**."*

---

### ✅ Scroll Event Fallback

```js
function lazyLoadImagesFallback() {
  const imgs = document.querySelectorAll("img[data-src]");

  function loadVisible() {
    imgs.forEach(img => {
      const rect = img.getBoundingClientRect();
      if (rect.top < window.innerHeight + 100 && rect.bottom > -100) {
        img.src = img.dataset.src;
      }
    });
  }

  window.addEventListener("scroll", loadVisible);
  window.addEventListener("resize", loadVisible);
  loadVisible(); // initial check
}

// Auto choose best option
if ("IntersectionObserver" in window) {
  lazyLoadImages();
} else {
  lazyLoadImagesFallback();
}
```

✔ Works across browsers.

---

## Step 4. Interviewer final twist:

*"Nice. But in real apps, we also want **progressive loading UX** (e.g., blur placeholder → sharp image)."*

---

### ✅ Blur-Up / Placeholder Strategy

```html
<img data-src="large.jpg" src="tiny-blur.jpg" class="lazy" />
```

```css
.lazy {
  filter: blur(10px);
  transition: filter 0.3s ease;
}
.lazy.loaded {
  filter: blur(0);
}
```

```js
function lazyLoadImagesWithBlur() {
  const imgs = document.querySelectorAll("img[data-src]");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.onload = () => img.classList.add("loaded"); // remove blur
        observer.unobserve(img);
      }
    });
  }, { rootMargin: "100px" });

  imgs.forEach(img => observer.observe(img));
}
```

✔ Better UX: user sees blurred preview → sharp image loads.

---

## Step 5. Interviewer final boss:

*"How does this scale for **10k images**? Any SEO or performance issues?"*

---

### ✅ Performance & Real-World Discussion

* **Performance**:

  * IntersectionObserver handles **batch observation efficiently**.
  * Scroll fallback can cause **layout thrashing** (repeated `getBoundingClientRect`). → Throttle with `requestAnimationFrame`.
* **SEO**:

  * Search engines may not load lazy images. Use `loading="lazy"` (native in `<img>`).
  * Provide `<noscript>` fallback for critical content.
* **Accessibility**:

  * Always include `alt` text.
* **Scaling**:

  * Don’t observe all 10k images at once → chunk them.
  * Virtualize list (only insert images that could be visible).
* **Modern solution**:

  ```html
  <img src="..." loading="lazy" />
  ```

  Native lazy loading (Chrome, Firefox, Edge). IntersectionObserver fallback for Safari.

---

# 🎯 Final Interview Takeaways (Lazy Loader)

* ✅ Step 1: Naive load-all.
* ✅ Step 2: IntersectionObserver lazy loader.
* ✅ Step 3: Scroll event fallback.
* ✅ Step 4: Progressive enhancement (blur-up).
* ✅ Step 5: Discuss perf (10k images, throttling) & SEO (native `loading="lazy"`).
