# 🔎 Problem 8: `requestIdleCallback` Polyfill
* Step 1 → Explain what `requestIdleCallback` is.
* Step 2 → Implement a naive version with `setTimeout`.
* Step 3 → Add `performance.now()` and deadline handling.
* Step 4 → Add `cancelIdleCallback`.
* Step 5 → Discuss perf tradeoffs vs real browsers.
---

## Step 1. Interviewer starts:

*"What is `requestIdleCallback`?"*

👉 You explain:

* A browser API to schedule work **during idle periods**, so it doesn’t block animations or user input.
* The callback receives a **deadline object**:

  ```js
  { timeRemaining: () => ms, didTimeout: false }
  ```
* Typically used for **low-priority tasks**: analytics, prefetching, background cleanup.

---

## Step 2. Interviewer says:

*"Cool. Implement a naive `requestIdleCallback` polyfill using `setTimeout`."*

---

### ✅ Naive Version

```js
function requestIdleCallbackPolyfill(cb) {
  return setTimeout(() => {
    const deadline = {
      timeRemaining: () => Infinity, // naive: assume always plenty of time
      didTimeout: false
    };
    cb(deadline);
  }, 1); // just defer a bit
}
```

⚠️ Problem: This doesn’t respect frame budget.

---

## Step 3. Interviewer adds:

*"Good start. Now make it more realistic — each frame has \~16ms at 60fps. Use `performance.now()` to calculate remaining time."*

---

### ✅ Frame-Budget Aware Polyfill

```js
function requestIdleCallbackPolyfill(cb, { timeout } = {}) {
  const start = performance.now();
  const frameBudget = 16; // 60fps

  return setTimeout(() => {
    const now = performance.now();
    const deadline = {
      timeRemaining: () => Math.max(0, frameBudget - (now - start)),
      didTimeout: timeout ? (now - start) >= timeout : false
    };
    cb(deadline);
  }, 1);
}
```

**Usage**

```js
requestIdleCallbackPolyfill(deadline => {
  while (deadline.timeRemaining() > 0) {
    console.log("Do background work");
  }
});
```

---

## Step 4. Interviewer twists:

*"Nice! But what about cancelling? Add `cancelIdleCallback`."*

---

### ✅ Add Cancellation

```js
function requestIdleCallbackPolyfill(cb, { timeout } = {}) {
  const start = performance.now();
  const id = setTimeout(() => {
    const now = performance.now();
    const deadline = {
      timeRemaining: () => Math.max(0, 16 - (now - start)),
      didTimeout: timeout ? (now - start) >= timeout : false
    };
    cb(deadline);
  }, 1);
  return id;
}

function cancelIdleCallbackPolyfill(id) {
  clearTimeout(id);
}
```

---

## Step 5. Interviewer final boss:

*"How does your polyfill compare to the **real browser implementation**? Any perf tradeoffs?"*

---

### ✅ Performance & Real-World Notes

* **Our polyfill**:

  * Uses `setTimeout` → callback runs *after all higher-priority tasks*.
  * Approximates frame budget (16ms) with `performance.now()`.
  * Not perfect — can drift if main thread is blocked.

* **Real browser `requestIdleCallback`**:

  * Implemented inside rendering pipeline.
  * Scheduler knows exactly how much time is left in current frame.
  * Guarantees not to block rendering/input.

* **Tradeoffs**:

  * Polyfill ≈ “best effort”.
  * For **production apps**, better alternative: `scheduler.postTask()` (new spec).

---

# 🎯 Final Interview Takeaways (requestIdleCallback Polyfill)

* ✅ Step 1: Know what `requestIdleCallback` is (low-priority scheduler).
* ✅ Step 2: Naive `setTimeout` defer.
* ✅ Step 3: Add frame-budget awareness with `performance.now()`.
* ✅ Step 4: Add `cancelIdleCallback`.
* ✅ Step 5: Discuss real vs polyfill, perf tradeoffs.