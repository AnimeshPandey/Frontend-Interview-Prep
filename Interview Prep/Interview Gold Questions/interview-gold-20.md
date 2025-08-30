# 🚀 Interview Gold – Batch #20 (Frontend Performance Extreme Gold)

---

## 1. Frame Budget & 60fps Rendering

**Problem:**

* To achieve **smooth 60fps**, each frame must complete in **\~16ms**.
* If rendering, scripting, or painting exceeds this → dropped frames → jank.

**Solution:**

* Break long tasks into chunks.
* Use **requestIdleCallback** or **scheduler APIs** for non-urgent work.

**Detailed Design:**

```js
// Heavy task split into small chunks
function processBigList(items) {
  let i = 0;
  function work(deadline) {
    while (i < items.length && deadline.timeRemaining() > 0) {
      process(items[i++]);
    }
    if (i < items.length) requestIdleCallback(work);
  }
  requestIdleCallback(work);
}
```

**Perf/Scaling Notes:**

* **Main thread must stay under 16ms per frame**.
* Use Web Workers for CPU-heavy tasks.

**Pitfalls:**

* `requestIdleCallback` not supported in all browsers → polyfills needed.
* Over-scheduling can still block input responsiveness.

**Real-world Example:**

* Chrome’s rendering pipeline = script → style → layout → paint → composite.

**Follow-ups:**

* Why 16ms budget? (1000ms ÷ 60fps).
* What about 120Hz screens? (\~8ms budget).
* How do you profile frames? → Chrome Performance Tab.

---

## 2. Advanced Code Splitting & Preloading

**Problem:**

* Big single bundles = long initial load.
* But naive splitting = waterfalls (extra network hops).

**Solution:**

* **Granular code splitting** + **strategic preloading**.

**Detailed Design:**

```js
// Split route-based chunk
const Checkout = React.lazy(() => import("./Checkout"));

// Preload critical future route
link.rel = "preload";
link.href = "/checkout.bundle.js";
```

* Split by route, component, or vendor libraries.
* Use **webpack magic comments** for prefetch/preload:

```js
import(/* webpackPrefetch: true */ "./Profile");
```

**Perf/Scaling Notes:**

* Splitting reduces TTI (time to interactive).
* Preloading avoids “white screen” when navigating.

**Pitfalls:**

* Over-splitting → too many requests.
* Preloading too much → kills bandwidth on low-end devices.

**Real-world Example:**

* Next.js does **automatic route-based splitting** + link prefetching.

**Follow-ups:**

* Difference between prefetch vs preload?
* How to decide chunk boundaries? → Route + usage frequency.
* Why over-splitting bad? → Request overhead.

---

## 3. Hydration Strategies (SPA vs SSR vs CSR)

**Problem:**

* SSR improves TTFB, but hydration can block interactivity for seconds.
* Hydration = React attaching event listeners after HTML loads.

**Solution:**

* Optimize hydration:

  * **Partial Hydration (Islands)** → hydrate only interactive parts.
  * **Streaming SSR** → send chunks progressively.
  * **React Server Components (RSC)** → no hydration needed for server-only parts.

**Detailed Design:**

* Example: Astro / Qwik islands:

```html
<div>Static Header</div>
<div client:load> <CartWidget /> </div>
```

* Next.js 13 (React 18):

```tsx
export default function Page() {
  return (
    <>
      <ServerComponent /> {/* rendered on server, no hydration */}
      <ClientComponent /> {/* interactive, hydrated */}
    </>
  );
}
```

**Perf/Scaling Notes:**

* Full hydration = expensive (\~100–300ms per MB of HTML).
* Islands reduce cost by only hydrating active parts.

**Pitfalls:**

* Harder debugging with mixed rendering.
* Misplaced client components → hydration mismatch errors.

**Real-world Example:**

* Shopify Hydrogen → partial hydration with RSC.
* Qwik → resumable apps, zero hydration until interaction.

**Follow-ups:**

* What’s hydration mismatch? → Server + client markup differ.
* Why server components faster? → No JS bundle needed.
* Compare Next.js vs Astro hydration.

---

## 4. React Server Components (RSC)

**Problem:**

* Traditional React SSR still requires hydration, shipping JS to client.

**Solution:**

* **React Server Components**:

  * Components run entirely on server.
  * Send serialized result to client.
  * No hydration or JS cost.

**Detailed Design:**

```tsx
// Server Component
async function ProductList() {
  const products = await db.query("SELECT * FROM products");
  return products.map(p => <div>{p.name}</div>);
}

// Client Component
"use client";
function CartButton() { return <button>Add</button> }
```

**Perf/Scaling Notes:**

* Zero bundle cost for server-only components.
* Reduced hydration time.

**Pitfalls:**

* Still experimental; requires React 18 + Next.js 13+.
* Debugging client/server boundary can be tricky.

**Real-world Example:**

* Vercel/Next.js powering ecommerce sites with RSC.

**Follow-ups:**

* Why server components better than SSR? → No hydration overhead.
* Can RSC use hooks? → Only server-safe ones (`use` for promises).
* How does RSC help bundle size? → Removes server-only logic.

---

## 5. Partial Hydration & Islands Architecture

**Problem:**

* Full hydration replays all components → wasteful for mostly static pages.

**Solution:**

* **Islands architecture**: static HTML with isolated interactive “islands.”

**Detailed Design:**

* Astro / Qwik example:

```html
<StaticHeader />
<CartWidget client:idle /> <!-- hydrated only when idle -->
```

**Perf/Scaling Notes:**

* Hydrate only 20–30% of page instead of 100%.
* Huge win for marketing sites, ecommerce.

**Pitfalls:**

* More complexity in deciding hydration boundaries.
* Some frameworks don’t support islands natively.

**Real-world Example:**

* eBay uses Marko.js for partial hydration.
* Astro claims **90% less JS shipped** compared to Next.

**Follow-ups:**

* Compare full vs partial hydration.
* When islands ideal? → Static-heavy pages with few interactive widgets.
* Why Astro faster than Next in some cases? → Zero-JS by default.

---

## 6. Caching Layers for UI Data

**Problem:**

* Repeated API calls = wasteful, slow.
* Without caching, same data fetched multiple times.

**Solution:**

* Multi-layer caching:

  * **Browser cache (HTTP, SW)**.
  * **Memory cache (React Query, SWR)**.
  * **Edge cache (CDN)**.

**Detailed Design:**

```js
// React Query with stale-while-revalidate
const { data } = useQuery("user", fetchUser, { staleTime: 5000 });
```

* Service Worker:

```js
self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
```

**Perf/Scaling Notes:**

* React Query avoids duplicate requests.
* Edge cache reduces global latency.

**Pitfalls:**

* Stale data if cache not invalidated.
* Complex consistency rules.

**Real-world Example:**

* GitHub → GraphQL API cached on edge.
* Twitter → Service Workers cache timelines.

**Follow-ups:**

* What’s stale-while-revalidate? → Serve cached, update in background.
* Why not cache everything? → Consistency risk.
* Difference between memory cache vs SW cache?

---

## 7. Render Off Main Thread (Web Workers / OffscreenCanvas)

**Problem:**

* Heavy JS blocks UI thread → laggy inputs, frozen scroll.

**Solution:**

* Offload work to **Web Workers** or **OffscreenCanvas**.

**Detailed Design:**

* Web Worker:

```js
const worker = new Worker("worker.js");
worker.postMessage(data);
worker.onmessage = e => console.log(e.data);
```

* OffscreenCanvas (move canvas rendering off main thread):

```js
const offscreen = canvas.transferControlToOffscreen();
worker.postMessage({ canvas: offscreen }, [offscreen]);
```

**Perf/Scaling Notes:**

* Workers = true multithreading in browser.
* OffscreenCanvas = smooth rendering even under load.

**Pitfalls:**

* Workers have no DOM access.
* Serialization overhead in `postMessage`.

**Real-world Example:**

* Google Docs uses workers for spellcheck.
* Figma renders vectors with OffscreenCanvas.

**Follow-ups:**

* Why workers don’t block UI? → Separate thread.
* What’s transferable objects? → Zero-copy for large data.
* Why OffscreenCanvas important? → Avoids main thread jank.

---

# 📘 Key Takeaways – Batch #20

* **Frame budget (16ms)** → chunk tasks, workers, idle callbacks.
* **Code splitting** → smart chunks, preload/prefetch.
* **Hydration strategies** → partial hydration, streaming SSR, RSC.
* **RSC** → zero JS bundle for server-only components.
* **Islands** → hydrate only interactive parts.
* **Caching layers** → memory + SW + edge caches.
* **Workers/OffscreenCanvas** → move heavy work off main thread.

---

# 📑 Quick-Reference (Batch #20)

* **16ms frame** → 60fps.
* **Code splitting** → reduce TTI.
* **Hydration** → SSR + RSC + islands.
* **Caching** → stale-while-revalidate.
* **Workers** → parallelism.
* **OffscreenCanvas** → smooth graphics.