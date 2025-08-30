# 🚀 Interview Gold – Batch #23 (Data-Intensive Frontend Gold)

---

## 1. Real-Time Dashboards (Stocks, IoT, Monitoring)

**Problem:**

* Dashboards must update with **live data (10s–1000s updates/sec)**.
* Naive re-renders → browser freezes, jank, dropped frames.

**Solution:**

* Use **WebSockets/SSE** for live data.
* **Batch updates** before rendering (requestAnimationFrame or throttling).

**Detailed Design:**

```js
// WebSocket connection
const ws = new WebSocket("wss://example.com/data");

let buffer = [];
ws.onmessage = e => {
  buffer.push(JSON.parse(e.data));
};

// Batch render once per animation frame
function renderLoop() {
  if (buffer.length) {
    processBatch(buffer);
    buffer = [];
  }
  requestAnimationFrame(renderLoop);
}
renderLoop();
```

**Perf/Scaling Notes:**

* Don’t render per message → aggregate per 16ms frame.
* Use **virtualization** for large tables/lists.

**Pitfalls:**

* Memory leaks from unbounded buffers.
* Too much throttling → delayed data perception.

**Real-world Example:**

* Bloomberg Terminal shows **millisecond stock updates** using WebSockets.

**Follow-ups:**

* Why WebSockets > polling for real-time?
* How to avoid UI jank under high update frequency?
* What’s tradeoff between accuracy vs perceived latency?

---

## 2. Virtualized Tables & Lists

**Problem:**

* Rendering **10,000+ rows in DOM** kills performance.
* React reconciliation for giant arrays = slow.

**Solution:**

* Use **windowing/virtualization** (react-window, react-virtualized).
* Only render rows visible in viewport.

**Detailed Design:**

```tsx
import { FixedSizeList as List } from "react-window";

<List
  height={400}
  itemCount={100000}
  itemSize={35}
  width={300}
>
  {({ index, style }) => <div style={style}>Row {index}</div>}
</List>
```

**Perf/Scaling Notes:**

* Keeps DOM nodes under 50–100 at once.
* Smooth scroll, even for millions of rows.

**Pitfalls:**

* Harder to support variable-height rows.
* Accessibility concerns (screen readers expect full DOM).

**Real-world Example:**

* GitHub “Commits” page virtualizes commit lists.

**Follow-ups:**

* Why virtualization improves perf? → Fewer DOM nodes.
* How to handle variable-height rows? → react-virtualized CellMeasurer.
* Tradeoff: virtualization vs pagination?

---

## 3. Time-Series Visualization

**Problem:**

* Graphs with **millions of data points** (IoT sensors, metrics) overwhelm DOM & JS.

**Solution:**

* Use **canvas/WebGL rendering** instead of SVG.
* Aggregate/decimate data before plotting.

**Detailed Design:**

```js
// Canvas line chart
const ctx = canvas.getContext("2d");
ctx.beginPath();
ctx.moveTo(0, data[0]);
for (let i = 1; i < data.length; i++) {
  ctx.lineTo(i, data[i]);
}
ctx.stroke();
```

* For huge datasets:

  * Aggregate into bins (e.g., 1 point per pixel).
  * WebGL libraries (Plotly, deck.gl, regl).

**Perf/Scaling Notes:**

* SVG good for <10k points.
* Canvas better for 10k–1M.
* WebGL needed for >1M+.

**Pitfalls:**

* Canvas/WebGL harder to style & interact with.
* Memory usage high for giant buffers.

**Real-world Example:**

* Datadog dashboards → WebGL-based rendering for millions of points.

**Follow-ups:**

* Why not always use WebGL? → Complexity, overhead.
* How to downsample data without losing insight? → Aggregation per pixel.
* Why SVG unsuitable for 100k points?

---

## 4. Data Streaming & Backpressure Handling

**Problem:**

* Streaming APIs can overwhelm client if data arrives faster than UI can render.
* Example: IoT device sending 10k messages/sec.

**Solution:**

* Implement **backpressure**: client tells server when it’s ready for more.
* Buffer + drop strategies (sample every Nth event).

**Detailed Design:**

```js
let processing = false;

ws.onmessage = e => {
  if (processing) return; // drop if busy
  processing = true;
  handleEvent(e.data).then(() => processing = false);
};
```

* Or use **Reactive Streams (RxJS)**:

```js
fromWebSocket(ws)
  .pipe(throttleTime(100))
  .subscribe(updateUI);
```

**Perf/Scaling Notes:**

* Keeps UI responsive under high throughput.
* Avoids OOM from unbounded queues.

**Pitfalls:**

* Dropping messages may reduce accuracy.
* Backpressure protocols not supported by all servers.

**Real-world Example:**

* Kafka UI dashboards → consume streams with backpressure.

**Follow-ups:**

* Why backpressure important in streaming?
* Tradeoffs: drop vs sample vs buffer.
* How to apply backpressure with WebSockets?

---

## 5. Incremental Loading & Pagination Patterns

**Problem:**

* APIs often return huge datasets (10k+ rows).
* Loading all at once kills performance.

**Solution:**

* Use **incremental loading** (infinite scroll, cursor-based pagination).

**Detailed Design:**

```js
async function loadMore(cursor) {
  const res = await fetch(`/api/data?cursor=${cursor}`);
  setRows(rows.concat(res.data));
  setCursor(res.nextCursor);
}
```

* Prefer **cursor-based** (reliable ordering) over offset-based.

**Perf/Scaling Notes:**

* Keeps initial load fast.
* Users rarely scroll past first few pages anyway.

**Pitfalls:**

* Infinite scroll breaks SEO + bookmarking.
* Handling “scroll to end” events tricky.

**Real-world Example:**

* Twitter timeline = cursor-based infinite scroll.
* GitHub PRs = paginated by cursor.

**Follow-ups:**

* Why cursor > offset pagination? → Consistency under updates.
* How to restore scroll position with infinite scroll?
* Tradeoff: infinite scroll vs “Load More” button?

---

## 6. Real-Time Collaboration (Shared State)

**Problem:**

* Multi-user apps (docs, dashboards) → concurrent edits must sync.
* Conflicts arise with multiple writers.

**Solution:**

* Use **CRDTs (Conflict-Free Replicated Data Types)** or **Operational Transforms (OT)**.

**Detailed Design:**

* Example (CRDT for counters):

```js
function mergeCounters(a, b) {
  return Math.max(a, b);
}
```

* Collaboration layers: Y.js, Automerge.

**Perf/Scaling Notes:**

* CRDTs scale well for real-time, offline-first.
* Small overhead in serialized updates.

**Pitfalls:**

* Large CRDTs = memory bloat.
* OT requires central server coordination.

**Real-world Example:**

* Google Docs → OT.
* Figma → CRDT-based collaborative editing.

**Follow-ups:**

* Why CRDT better for offline-first?
* Compare OT vs CRDT tradeoffs.
* How to handle cursor positions in collab?

---

## 7. Web Workers & Off-Main-Thread Data Processing

**Problem:**

* Heavy data processing (sorting 100k rows, JSON parsing) blocks main thread.
* UI freezes → bad UX.

**Solution:**

* Move data processing to **Web Workers**.

**Detailed Design:**

```js
const worker = new Worker("worker.js");
worker.postMessage(bigData);
worker.onmessage = e => updateUI(e.data);
```

* For visualization: combine **Web Workers + OffscreenCanvas**.

**Perf/Scaling Notes:**

* True parallelism in browser.
* Prevents UI jank under heavy load.

**Pitfalls:**

* No DOM access in workers.
* Serialization overhead in `postMessage`.

**Real-world Example:**

* ObservableHQ notebooks → heavy data crunching in workers.
* Trading dashboards use workers for aggregation.

**Follow-ups:**

* Why workers better than setTimeout batching?
* How to reduce serialization cost? → Transferable objects.
* When would OffscreenCanvas be required?

---

# 📘 Key Takeaways – Batch #23

* **Real-time dashboards** → batch updates, WebSockets, animation frame.
* **Virtualization** → only render visible rows.
* **Time-series visualization** → Canvas/WebGL > SVG at scale.
* **Streaming backpressure** → throttle, sample, buffer.
* **Incremental loading** → infinite scroll, cursor pagination.
* **Collaboration** → CRDTs/OT for conflict-free sync.
* **Workers** → offload heavy compute to separate thread.

---

# 📑 Quick-Reference (Batch #23)

* **Dashboards**: batch updates every 16ms.
* **Lists**: virtualization (react-window).
* **Charts**: Canvas <1M pts, WebGL >1M.
* **Streams**: throttle/backpressure.
* **Pagination**: cursor-based > offset.
* **Collab**: CRDT vs OT.
* **Workers**: prevent main-thread jank.