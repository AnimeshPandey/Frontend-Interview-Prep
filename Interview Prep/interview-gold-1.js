/**
 * 1. Implement setInterval using setTimeout
 * setInterval with setTimeout
 *
 * What does it do?
 * - Native setInterval calls function repeatedly at given delay
 * - But it can "drift" if fn takes longer than delay
 *
 * Why implement this way?
 * - setTimeout ensures fn completes before scheduling next run
 * - More accurate for variable-time tasks
 *
 * Time Complexity: O(1) per call
 * Space Complexity: O(1)
 *
 * Performance Considerations:
 * - Prevents overlapping calls
 * - Better for UI tasks where drift is tolerable
 */
function mySetInterval(fn, delay) {
  let timer;
  function run() {
    fn(); // execute fn
    timer = setTimeout(run, delay); // schedule next
  }
  timer = setTimeout(run, delay);
  return { clear: () => clearTimeout(timer) };
}

/**
 * Follow-up Questions:
 * - Diff between setTimeout-loop and setInterval?
 * - How would you stop drift completely? (Date.now() adjustment)
 * - How to implement clearInterval?
 */



/**
 * 2. Implement Promise.retry(fn, retries)
 * Promise.retry()
 *
 * What does it do?
 * - Retry async fn up to N times if it fails
 *
 * Why asked?
 * - Real-world APIs fail (network flakiness, rate limits)
 * - Tests resilience & async control
 *
 * Time Complexity: O(retries)
 * Space Complexity: O(1)
 *
 * Performance Considerations:
 * - Exponential backoff often added for real-world retry
 */
function promiseRetry(fn, retries = 3, delay = 1000) {
  return new Promise((resolve, reject) => {
    function attempt(n) {
      fn().then(resolve).catch(err => {
        if (n === 0) reject(err);
        else setTimeout(() => attempt(n - 1), delay);
      });
    }
    attempt(retries);
  });
}

/**
 * Follow-up Questions:
 * - How to add exponential backoff?
 * - How to cancel retry (AbortController)?
 * - What if fn is not idempotent?
 */



/**
 * 3. Implement an LRU Cache
 * LRU Cache (Least Recently Used)
 *
 * What does it do?
 * - Stores up to capacity items
 * - Evicts least recently used when full
 *
 * Why asked?
 * - Common in frontend performance (React Query, SWR)
 * - Tests data structures: Map + ordering
 *
 * Time Complexity:
 * - get: O(1)
 * - put: O(1)
 * Space Complexity: O(capacity)
 */
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map(); // maintains insertion order
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const val = this.map.get(key);
    this.map.delete(key); // refresh order
    this.map.set(key, val);
    return val;
  }

  put(key, val) {
    if (this.map.has(key)) this.map.delete(key);
    else if (this.map.size === this.capacity) {
      const firstKey = this.map.keys().next().value; // oldest
      this.map.delete(firstKey);
    }
    this.map.set(key, val);
  }
}

/**
 * Follow-up Questions:
 * - Why use Map instead of object?
 * - How would you add TTL (time-to-live)?
 * - How does Redis implement LRU?
 */




/**
 * 4. Implement a Virtual DOM Diff Algorithm
 * Virtual DOM diff (simplified)
 *
 * What does it do?
 * - Compare two tree structures
 * - Generate patch operations (create, remove, replace, update)
 *
 * Why asked?
 * - React, Vue, Svelte all rely on reconciliation
 * - Senior frontend must know *why* VDOM exists
 *
 * Time Complexity: O(n) – n = nodes
 * Space Complexity: O(n)
 *
 * Performance Considerations:
 * - Real React uses heuristics (keys) to optimize diff
 */
function diff(oldNode, newNode) {
  if (!oldNode) return { type: "CREATE", newNode };
  if (!newNode) return { type: "REMOVE" };
  if (oldNode.type !== newNode.type) return { type: "REPLACE", newNode };

  const patches = [];
  const maxChildren = Math.max(oldNode.children.length, newNode.children.length);
  for (let i = 0; i < maxChildren; i++) {
    patches.push(diff(oldNode.children[i], newNode.children[i]));
  }
  return { type: "UPDATE", patches };
}

/**
 * Follow-up Questions:
 * - How do keys optimize diff?
 * - Why does React Fiber exist?
 * - Compare Virtual DOM vs Signals vs Direct DOM mutation
 */




/**
 * 5. Implement a Tiny Router (SPA)
 * Tiny Router
 *
 * What does it do?
 * - Single Page App (SPA) navigation
 * - Listens to URL changes (hash/history API)
 *
 * Why asked?
 * - Tests system design + JS APIs
 * - Must show you understand SPA architecture
 *
 * Time Complexity: O(1) per navigation
 * Space Complexity: O(n) for routes
 */
class Router {
  constructor() {
    this.routes = {};
    window.addEventListener("hashchange", this.hashChanged.bind(this));
  }

  register(path, callback) {
    this.routes[path] = callback;
  }

  hashChanged() {
    const path = window.location.hash.slice(1);
    if (this.routes[path]) this.routes[path]();
  }
}

/**
 * Follow-up Questions:
 * - How would you add history.pushState() support?
 * - How would you support dynamic params (/user/:id)?
 * - Compare hash routing vs history routing
 */



/**
 * 6. Implement a Scheduler (Task Queue)
 * Scheduler
 *
 * What does it do?
 * - Limits number of concurrent async tasks
 * - Runs queued tasks as slots free up
 *
 * Why asked?
 * - Real-world: API rate limiting, job scheduling
 *
 * Time Complexity: O(1) add, O(n) over n tasks
 * Space Complexity: O(n) queue
 */
class Scheduler {
  constructor(limit) {
    this.limit = limit;
    this.running = 0;
    this.queue = [];
  }

  add(task) {
    return new Promise(resolve => {
      const run = () => {
        this.running++;
        task().then(resolve).finally(() => {
          this.running--;
          if (this.queue.length) this.queue.shift()();
        });
      };
      if (this.running < this.limit) run();
      else this.queue.push(run);
    });
  }
}

/**
 * Follow-up Questions:
 * - How to handle retries in queue?
 * - How would you prioritize some tasks?
 * - How does browser event loop scheduling differ?
 */


// # 📘 Key Takeaways

// These are **golden questions** because:

// * They connect directly to **frontend system design** (router, scheduler, VDOM).
// * They test **performance + tradeoffs**.
// * They allow you to show **senior-level thinking** (not just code).

// ---

// # 📑 Quick-Reference (Last-Minute Review)

// * **setInterval via setTimeout** → prevents drift, implement clear.
// * **Promise.retry** → retry async fn, exponential backoff.
// * **LRU Cache** → Map, refresh order on access, O(1) ops.
// * **VDOM diff** → O(n), keys optimize.
// * **Tiny Router** → hashchange/history, dynamic params.
// * **Scheduler** → concurrency control, queue tasks.

