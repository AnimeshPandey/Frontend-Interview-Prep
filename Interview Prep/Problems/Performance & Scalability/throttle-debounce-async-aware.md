# 🔎 Problem 16: Throttle & Debounce (Async-Aware)
* Step 1 → Debounce basics.
* Step 2 → Throttle basics.
* Step 3 → Make both async-aware (return promises).
* Step 4 → Add cancellation.
* Step 5 → Discuss perf & real-world usage.
---

## Step 1. Interviewer starts:

*"Implement a debounce function: waits for N ms after the last call before executing."*

---

### ✅ Basic Debounce

```js
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Example
const log = debounce(() => console.log("Debounced!"), 500);
log(); log(); log(); // only 1 call after 500ms
```

---

## Step 2. Interviewer says:

*"Now implement throttle: ensures function runs at most once every N ms."*

---

### ✅ Basic Throttle

```js
function throttle(fn, limit) {
  let inThrottle = false;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Example
const log2 = throttle(() => console.log("Throttled!"), 1000);
setInterval(log2, 200); // prints once every ~1s
```

---

## Step 3. Interviewer twists:

*"Nice. But now make them **async-aware**:
If `fn` returns a promise (e.g., API call), return that promise to the caller."*

---

### ✅ Async-Aware Debounce

```js
function debounceAsync(fn, delay) {
  let timer, pendingReject;

  return function(...args) {
    if (pendingReject) pendingReject("Debounced"); // cancel prev promise
    clearTimeout(timer);

    return new Promise((resolve, reject) => {
      pendingReject = reject;
      timer = setTimeout(async () => {
        try {
          const result = await fn.apply(this, args);
          resolve(result);
        } catch (e) {
          reject(e);
        }
      }, delay);
    });
  };
}

// Example (search API)
const search = debounceAsync(async query => {
  console.log("Fetching for:", query);
  return "Results for " + query;
}, 500);

search("re").then(console.log).catch(console.warn);
search("react").then(console.log).catch(console.warn); // only this executes
```

---

### ✅ Async-Aware Throttle

```js
function throttleAsync(fn, limit) {
  let inThrottle = false;
  let lastPromise;

  return function(...args) {
    if (!inThrottle) {
      inThrottle = true;
      lastPromise = Promise.resolve(fn.apply(this, args))
        .finally(() => {
          setTimeout(() => inThrottle = false, limit);
        });
    }
    return lastPromise; // return ongoing promise
  };
}

// Example (rate-limited API)
const fetchUser = throttleAsync(async id => {
  console.log("Fetching user:", id);
  return { id };
}, 1000);

fetchUser(1).then(console.log);
fetchUser(2).then(console.log); // ignored → returns last promise
```

---

## Step 4. Interviewer final twist:

*"Can you add **cancellation**? E.g., cancel a pending debounce/throttle call."*

---

### ✅ Debounce with Cancellation

```js
function debounceAsyncCancelable(fn, delay) {
  let timer, rejectFn;

  function wrapped(...args) {
    if (rejectFn) rejectFn("Cancelled");
    clearTimeout(timer);

    return new Promise((resolve, reject) => {
      rejectFn = reject;
      timer = setTimeout(async () => {
        try {
          resolve(await fn(...args));
        } catch (err) {
          reject(err);
        }
      }, delay);
    });
  }

  wrapped.cancel = () => {
    if (rejectFn) rejectFn("Cancelled");
    clearTimeout(timer);
  };

  return wrapped;
}
```

---

## Step 5. Interviewer final boss:

*"How does this perform in the **real world**? What are the tradeoffs?"*

---

### ✅ Performance & Real-World Discussion

* **Time Complexity**:

  * O(1) per call (just resetting timers).
  * Memory: 1 active timer per debounced/throttled fn.

* **Real-world usage**:

  * Debounce: search suggestions, resize events, form validation.
  * Throttle: scroll events, API rate-limiting, analytics.

* **Async tradeoffs**:

  * Debounce with promises → must cancel older requests to avoid race conditions.
  * Throttle with promises → returning last promise avoids duplicate calls.

* **Edge cases**:

  * Rapid cancel → ensures no memory leaks.
  * Async errors → must propagate (reject promise).
  * React hooks → must clean up timers in `useEffect`.

* **Production libs**:

  * Lodash debounce/throttle are sync-only.
  * For async, wrap with promise + cancellation (as we did).

---

# 🎯 Final Interview Takeaways (Throttle & Debounce Async-Aware)

* ✅ Step 1: Basic debounce.
* ✅ Step 2: Basic throttle.
* ✅ Step 3: Make both async-aware (return promises).
* ✅ Step 4: Add cancellation support.
* ✅ Step 5: Discuss perf tradeoffs, real-world use cases, React hook cleanup.
