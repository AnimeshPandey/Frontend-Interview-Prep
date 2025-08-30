# 🔎 Problem 10: Custom Pub/Sub with Priorities

* Step 1 → Simple Pub/Sub (subscribe, publish).
* Step 2 → Add unsubscribe.
* Step 3 → Add priorities for subscribers.
* Step 4 → Add async vs sync delivery.
* Step 5 → Discuss perf & real-world tradeoffs.

---

## Step 1. Interviewer starts:

*"Implement a simple Pub/Sub system with `subscribe(event, fn)` and `publish(event, data)`."*

---

### ✅ Basic Pub/Sub

```js
class PubSub {
  constructor() {
    this.events = {}; // { eventName: [listeners] }
  }

  subscribe(event, fn) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(fn);
    return () => this.unsubscribe(event, fn); // return cleanup
  }

  unsubscribe(event, fn) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(f => f !== fn);
  }

  publish(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(fn => fn(data));
  }
}

// Usage
const bus = new PubSub();
bus.subscribe("msg", d => console.log("Got:", d));
bus.publish("msg", { text: "Hello" });
```

---

## Step 2. Interviewer adds:

*"Good. But we need `unsubscribe` support explicitly."*

---

✅ Already implemented above with `.unsubscribe` and cleanup function returned in `.subscribe()`.

---

## Step 3. Interviewer twists:

*"Now add **priority levels**. Higher-priority subscribers should run first."*

---

### ✅ Priority-Aware Pub/Sub

```js
class PriorityPubSub {
  constructor() {
    this.events = {}; // { eventName: [ {fn, priority} ] }
  }

  subscribe(event, fn, priority = 0) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push({ fn, priority });
    // Sort by priority (higher runs first)
    this.events[event].sort((a, b) => b.priority - a.priority);
    return () => this.unsubscribe(event, fn);
  }

  unsubscribe(event, fn) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(h => h.fn !== fn);
  }

  publish(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(h => h.fn(data));
  }
}

// Example
const bus = new PriorityPubSub();
bus.subscribe("order", d => console.log("Low priority:", d), 1);
bus.subscribe("order", d => console.log("High priority:", d), 10);
bus.publish("order", { id: 123 });
// High priority first
```

---

## Step 4. Interviewer pushes:

*"Nice. Can you support **async delivery** so slow subscribers don’t block fast ones?"*

---

### ✅ Async vs Sync Delivery

```js
class PriorityPubSub {
  constructor() {
    this.events = {};
  }

  subscribe(event, fn, priority = 0, async = false) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push({ fn, priority, async });
    this.events[event].sort((a, b) => b.priority - a.priority);
    return () => this.unsubscribe(event, fn);
  }

  unsubscribe(event, fn) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(h => h.fn !== fn);
  }

  publish(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(h => {
      if (h.async) Promise.resolve().then(() => h.fn(data));
      else h.fn(data);
    });
  }
}

// Example
const bus = new PriorityPubSub();
bus.subscribe("log", d => console.log("sync fast:", d), 5);
bus.subscribe("log", async d => {
  await new Promise(r => setTimeout(r, 1000));
  console.log("async slow:", d);
}, 1, true);
bus.publish("log", { msg: "Hello" });
```

---

## Step 5. Interviewer final boss:

*"Cool! But what about performance & scaling? Suppose we have **10k subscribers** across multiple events."*

---

### ✅ Performance & Real-World Discussion

* **Current implementation**:

  * `publish` → O(n) subscribers per event.
  * Priority sorting on every subscribe → O(n log n).

* **Optimizations**:

  * Use a **min-heap/max-heap** priority queue for efficient inserts.
  * Store subscribers in buckets by priority for faster dispatch.
  * Batch async events (buffer + flush).

* **Memory considerations**:

  * Remove stale listeners to avoid leaks.
  * Use WeakRefs if auto-cleanup is needed.

* **Real-world systems**:

  * Node’s EventEmitter → no priorities by default.
  * RxJS → explicit scheduling (sync/async).
  * Kafka / PubSub systems → partitioning + backpressure.

---

# 🎯 Final Interview Takeaways (Priority Pub/Sub)

* ✅ Step 1: Implement basic Pub/Sub.
* ✅ Step 2: Add unsubscribe.
* ✅ Step 3: Add priorities.
* ✅ Step 4: Add async delivery.
* ✅ Step 5: Discuss scaling to 10k+ subscribers, priority queues, batching.