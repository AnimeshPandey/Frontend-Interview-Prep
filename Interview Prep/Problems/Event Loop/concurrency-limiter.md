# 🔎 Problem 6: Promise Pool / Concurrency Limiter
* Step 1 → Run all promises concurrently.
* Step 2 → Limit concurrency (`max=2`).
* Step 3 → Support dynamic task queue.
* Step 4 → Add cancellation + error handling.
* Step 5 → Discuss **performance & real-world tradeoffs**.
---

## Step 1. Interviewer starts:

*"Implement a function that runs an array of async tasks (functions returning promises) and returns results once all are done."*

**Example Input**

```js
const tasks = [
  () => fetch("/api/1"),
  () => fetch("/api/2"),
  () => fetch("/api/3"),
];
```

---

### ✅ Initial "all concurrent"

```js
async function runAll(tasks) {
  return Promise.all(tasks.map(fn => fn()));
}
```

**But this has a problem**: If we had 1000 tasks → 🚨 1000 parallel requests (bad for browser, rate limits).

---

## Step 2. Interviewer adds:

*"Good. Now run tasks with a **max concurrency limit** (e.g., 2 at a time)."*

---

### ✅ Add Concurrency Limit

```js
async function promisePool(tasks, limit = 2) {
  const results = [];
  let i = 0;

  async function worker() {
    while (i < tasks.length) {
      const cur = i++;
      try {
        results[cur] = await tasks[cur]();
      } catch (e) {
        results[cur] = e; // or rethrow
      }
    }
  }

  // Start N workers
  const workers = Array(limit).fill().map(worker);
  await Promise.all(workers);
  return results;
}
```

**How it works**:

* Multiple workers pick tasks one by one.
* At most `limit` tasks run concurrently.

---

## Step 3. Interviewer twists:

*"Nice. But what if tasks arrive **dynamically** (like a stream of uploads)?
Your pool should handle tasks added after start."*

---

### ✅ Dynamic Task Queue

```js
class PromisePool {
  constructor(limit = 2) {
    this.limit = limit;
    this.running = 0;
    this.queue = [];
    this.results = [];
  }

  add(task, index) {
    return new Promise((resolve, reject) => {
      const run = async () => {
        this.running++;
        try {
          const res = await task();
          this.results[index] = res;
          resolve(res);
        } catch (e) {
          reject(e);
        } finally {
          this.running--;
          this.next();
        }
      };

      this.queue.push(run);
      this.next();
    });
  }

  next() {
    if (this.running < this.limit && this.queue.length) {
      const fn = this.queue.shift();
      fn();
    }
  }
}

// Example
const pool = new PromisePool(2);
pool.add(() => fetch("/api/1"), 0);
pool.add(() => fetch("/api/2"), 1);
setTimeout(() => pool.add(() => fetch("/api/3"), 2), 1000);
```

---

## Step 4. Interviewer final twist:

*"Great! Now add **cancellation** and **error handling**.
How do you cancel tasks that haven’t started yet?"*

---

### ✅ Add Cancellation

```js
class CancellablePromisePool extends PromisePool {
  constructor(limit = 2) {
    super(limit);
    this.cancelled = false;
  }

  cancel() {
    this.cancelled = true;
    this.queue = []; // clear queued tasks
  }

  add(task, index) {
    if (this.cancelled) return Promise.reject(new Error("Pool cancelled"));
    return super.add(task, index);
  }
}
```

**Error Handling Strategies:**

* **Fail-fast**: reject immediately on first error (like `Promise.all`).
* **Continue-on-error**: capture errors, keep running other tasks (like `Promise.allSettled`).
* Pool should be configurable for both.

---

## Step 5. Interviewer asks about Performance:

*"What about **real-world perf**? Suppose you’re uploading 10k images.
How would you optimize further?"*

---

### ✅ Performance Considerations

* **Browser constraints**: Most browsers cap concurrent requests (≈6–10 per domain).
* **Backoff/retries**: For flaky APIs → exponential backoff.
* **Chunking**: Group tasks into batches.
* **Idle callbacks**: Schedule non-urgent tasks with `requestIdleCallback`.
* **Streaming results**: Return results as tasks complete (instead of waiting all).

---

# 🎯 Final Interview Takeaways (Promise Pool)

* ✅ Step 1: Run all tasks concurrently.
* ✅ Step 2: Add concurrency limit.
* ✅ Step 3: Support dynamic queues.
* ✅ Step 4: Add cancellation + error handling.
* ✅ Step 5: Discuss **real-world perf** (browser caps, retries, backoff).
