# 🔎 Problem 7: Custom Scheduler (setTimeout polyfill)
* Step 1 → Naive `setTimeout` with `while` loop (blocking).
* Step 2 → Switch to scheduling with a sorted task queue.
* Step 3 → Support cancellation (`clearTimeout`).
* Step 4 → Handle multiple tasks.
* Step 5 → Discuss perf tradeoffs vs real JS engines.
---

## Step 1. Interviewer starts:

*"Write a function `mySetTimeout(fn, delay)` that runs `fn` after `delay` ms. No using native setTimeout!"*

**Naive Idea**: Block thread until time passes → ❌ (bad).

---

### ❌ Blocking (Wrong)

```js
function mySetTimeout(fn, delay) {
  const start = Date.now();
  while (Date.now() - start < delay) {} // busy-wait
  fn();
}
```

⚠️ This freezes the entire thread → **not acceptable**.
But good to mention, because it shows you know why it’s wrong.

---

## Step 2. Interviewer clarifies:

*"Exactly. We don’t want blocking. Instead, simulate scheduling with a queue that checks tasks."*

---

### ✅ Task Queue Approach

We’ll use `requestAnimationFrame` or a loop with `Promise.resolve().then(...)` (microtask) to poll the clock.

```js
const tasks = [];

function mySetTimeout(fn, delay) {
  const runAt = Date.now() + delay;
  const task = { fn, runAt, cancelled: false };
  tasks.push(task);
  tasks.sort((a, b) => a.runAt - b.runAt); // keep queue sorted
  scheduleLoop();
  return task; // return handle
}

function scheduleLoop() {
  if (scheduleLoop.running) return;
  scheduleLoop.running = true;

  function loop() {
    const now = Date.now();
    while (tasks.length && tasks[0].runAt <= now) {
      const task = tasks.shift();
      if (!task.cancelled) task.fn();
    }
    if (tasks.length) {
      Promise.resolve().then(loop); // microtask scheduling
    } else {
      scheduleLoop.running = false;
    }
  }

  Promise.resolve().then(loop);
}
```

---

## Step 3. Interviewer adds:

*"Cool. Now add support for **cancelling timers** (`myClearTimeout`)."*

---

### ✅ Add Cancellation

```js
function myClearTimeout(handle) {
  handle.cancelled = true;
}
```

**Usage**

```js
const handle = mySetTimeout(() => console.log("Hi"), 1000);
myClearTimeout(handle); // cancels execution
```

---

## Step 4. Interviewer twists:

*"Good. But what about multiple timers at once?
Say I set 1000 timers with different delays."*

---

### ✅ Multiple Timers (Already Works!)

Our queue is sorted → nearest timer runs first.
But let’s **optimize**: instead of busy-checking every microtask, we calculate the **next delay** and sleep.

---

### ✅ Optimized Loop with Next Timeout

```js
function scheduleLoop() {
  if (scheduleLoop.running) return;
  scheduleLoop.running = true;

  function loop() {
    if (!tasks.length) {
      scheduleLoop.running = false;
      return;
    }

    const now = Date.now();
    const nextTask = tasks[0];
    const delay = Math.max(0, nextTask.runAt - now);

    setImmediate ? setImmediate(loop) : setTimeout(loop, delay); // Node vs browser

    while (tasks.length && tasks[0].runAt <= Date.now()) {
      const task = tasks.shift();
      if (!task.cancelled) task.fn();
    }
  }

  loop();
}
```

---

## Step 5. Interviewer final boss:

*"Great! But what about **accuracy & performance tradeoffs**? How does this compare to the real `setTimeout` implementation?"*

---

### ✅ Performance & Accuracy Considerations

* **Accuracy**:

  * Real `setTimeout` has a minimum delay (often 4ms in browsers after nested calls).
  * Our loop may drift slightly due to JS event loop scheduling.

* **Performance**:

  * Our queue sort is O(n log n) → fine for small n, costly for thousands of timers.
  * Better → **min-heap priority queue** (O(log n) insert, O(1) next).

* **Cancellation**:

  * We only mark as cancelled → task remains until popped.
  * Real V8 removes cancelled tasks from heap early.

* **Real-world engines**:

  * Timers are maintained in a **min-heap**.
  * Event loop pops the earliest runnable task.

---

# 🎯 Final Interview Takeaways (Custom Scheduler)

* ✅ Step 1: Naive blocking → explain why bad.
* ✅ Step 2: Implement task queue with microtask scheduling.
* ✅ Step 3: Add cancellation (`myClearTimeout`).
* ✅ Step 4: Handle multiple timers with priority queue optimization.
* ✅ Step 5: Discuss **perf & accuracy tradeoffs** vs real engines.
