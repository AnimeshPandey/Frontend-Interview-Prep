1. **System Design (Frontend-specific)**
2. **Coding / Polyfills / Utilities**
3. **Performance & Tradeoff Follow-ups**

Each question below includes:

* **Prompt** (what interviewer asks)
* **Hints** (directions you should think about)
* **Expected Discussion Points** (what senior-level answers should include)

---

# 🚀 Senior Frontend Mock Interview Set

---

## **1. Frontend System Design**

### Q1: Design an infinite scrolling news feed (like Twitter/Instagram)

* **Hints:**

  * How to fetch data in chunks?
  * How to prevent duplicate fetches?
  * How to handle "loading state"?
  * What about performance (DOM nodes in memory)?
* **Expected Discussion:**

  * Use **IntersectionObserver** to detect scroll near bottom.
  * Paginated API requests.
  * Debounce/throttle scroll events.
  * Virtualized list (e.g., React Window, react-virtualized) → avoids 10,000 DOM nodes.
  * Tradeoff: simplicity (append items) vs complexity (virtualization).

---

### Q2: Design YouTube’s frontend homepage

* **Hints:**

  * How to render different card types (video, ad, live, shorts)?
  * How to handle responsive layouts?
  * Caching & prefetch strategies?
* **Expected Discussion:**

  * Component-driven design (Card → VideoCard, AdCard, etc.).
  * CSS Grid/Flexbox for layout.
  * Client-side cache (stale-while-revalidate pattern).
  * Lazy loading thumbnails.
  * Tradeoffs: CSR vs SSR vs SSG (SEO + performance).

---

### Q3: Build a collaborative document editor (like Google Docs) \[harder, senior-level]

* **Hints:**

  * How do multiple users edit same doc?
  * How do you handle conflicts?
  * What happens if user goes offline?
* **Expected Discussion:**

  * Use **Operational Transformation (OT)** or **CRDTs** for conflict resolution.
  * WebSockets for real-time sync.
  * Local cache & retry queue for offline edits.
  * Tradeoff: OT = more complex, CRDT = heavier payloads.

---

## **2. Coding / Polyfill Style**

### Q4: Implement `Promise.race()` (polyfill)

* **Hints:**

  * Returns the result/reason of the *first* promise to settle.
* **Expected:**

```js
MyPromise.race = function(promises) {
  return new MyPromise((resolve, reject) => {
    promises.forEach(p => {
      MyPromise.resolve(p).then(resolve, reject);
    });
  });
};
```

* **Discussion:**

  * Time complexity: O(n) to register.
  * Space complexity: O(n).
  * Follow-up: difference between race vs any.

---

### Q5: Implement `setInterval` using `setTimeout`

* **Hints:**

  * How to repeatedly schedule function?
  * How to cancel it?
* **Expected:**

```js
function mySetInterval(fn, delay) {
  let timer;
  function run() {
    fn();
    timer = setTimeout(run, delay);
  }
  timer = setTimeout(run, delay);
  return { clear: () => clearTimeout(timer) };
}
```

* **Discussion:**

  * Real `setInterval` does not guarantee exact timing → drift.
  * This version waits for fn + delay → safer in some cases.

---

### Q6: Implement a `pipe()` function

* **Prompt:** Compose functions left-to-right.
* **Expected:**

```js
function pipe(...fns) {
  return (input) => fns.reduce((acc, fn) => fn(acc), input);
}
```

* **Discussion:**

  * Functional programming pattern.
  * Used in Redux middlewares.

---

### Q7: Implement a simple `LRU Cache`

* **Hints:**

  * Remove least recently used item when capacity is reached.
* **Expected:**

```js
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map(); // preserves order
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, val); // refresh order
    return val;
  }
  put(key, val) {
    if (this.map.has(key)) this.map.delete(key);
    else if (this.map.size === this.capacity) {
      const firstKey = this.map.keys().next().value;
      this.map.delete(firstKey);
    }
    this.map.set(key, val);
  }
}
```

* **Discussion:**

  * Time: O(1) for get/put (because of Map).
  * Space: O(capacity).
  * Used in caching strategies (React Query, SWR).

---

### Q8: Implement a basic Virtual DOM `diff` algorithm (high-value senior question)

* **Hints:**

  * How to compare old vs new tree?
  * Which nodes need update?
* **Expected (simplified):**

```js
function diff(oldNode, newNode) {
  if (!oldNode) return { type: "CREATE", newNode };
  if (!newNode) return { type: "REMOVE" };
  if (oldNode.type !== newNode.type) return { type: "REPLACE", newNode };
  const patch = [];
  const childCount = Math.max(
    oldNode.children.length, 
    newNode.children.length
  );
  for (let i = 0; i < childCount; i++) {
    patch.push(diff(oldNode.children[i], newNode.children[i]));
  }
  return { type: "UPDATE", children: patch };
}
```

* **Discussion:**

  * Real React diff = “Reconciliation” with heuristics.
  * Time complexity: O(n) with optimizations (keys).

---

## **3. Performance Tradeoff Questions**

### Q9: Page with 1000+ images, how do you optimize loading?

* **Expected:**

  * Lazy load with `loading="lazy"`.
  * Use `IntersectionObserver` for visibility.
  * Serve WebP/AVIF images.
  * CDN with caching.
  * Tradeoff: lower bandwidth vs CPU decode cost.

---

### Q10: React app is slow on first load. What optimizations do you consider?

* **Expected:**

  * Code splitting (dynamic imports).
  * Tree-shaking unused code.
  * Minify & gzip (or Brotli).
  * SSR/SSG for faster FCP.
  * Prefetch critical assets.
  * Tradeoff: SSR complexity vs CSR simplicity.

---

### Q11: Large table (10k+ rows) renders slowly. How do you optimize?

* **Expected:**

  * Virtualization (React Window).
  * Infinite scrolling instead of rendering all.
  * Pagination at server.
  * Tradeoff: virtualization = smooth UX but more dev complexity.

---

### Q12: Single-page app memory keeps growing (leak). How do you debug?

* **Expected:**

  * Chrome DevTools → Memory profiling.
  * Look for listeners not removed.
  * Check timers/intervals not cleared.
  * Detached DOM nodes.
  * Tradeoff: higher dev time vs preventing production crashes.

---

# ✅ How to Use This

* **Daily practice**: Pick 2 coding + 1 system design + 1 performance Q.
* **Explain aloud**: After coding, explain *complexity + tradeoffs*.
* **Mock interviews**: Simulate whiteboard (no IDE) + system design diagram.

---

👉 Do you want me to now **assemble this into a one-week sprint schedule** (Day 1 → Polyfills, Day 2 → Promises + async utils, Day 3 → System design, etc.), so you can maximize your prep in just **7 days**?
