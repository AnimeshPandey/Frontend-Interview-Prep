/**
 * once()
 *
 * What does once do?
 * - Ensures a function runs only once
 * - Future calls return the cached result
 *
 * Why implement it this way?
 * - Use a flag (`called`) to track if function was already invoked
 * - Store result so subsequent calls return same value
 *
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 *
 * Performance Considerations:
 * - Useful for init functions (connecting to DB, initializing config, setting up listeners)
 */
function once(fn) {
  let called = false, result;
  return function(...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args); // execute once
    }
    return result; // always return cached result
  };
}

/**
 * Follow-up Questions:
 * - How to reset once? (allow it to run again)
 * - How would you make an async once (e.g., connect to DB only once)?
 */



/**
 * memoize()
 *
 * What does memoize do?
 * - Caches results of function calls
 * - Returns cached result if called with same arguments
 *
 * Why implement it this way?
 * - Use a Map for cache
 * - Use JSON.stringify(args) as key (simple but not perfect)
 *
 * Time Complexity:
 * - Cache hit: O(1)
 * - Cache miss: O(1) + cost of fn
 * Space Complexity: O(n) for cache
 *
 * Performance Considerations:
 * - Great for expensive pure functions (e.g., Fibonacci, API calls)
 * - JSON.stringify has cost → weak for large objects
 */
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key); // fast return
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

/**
 * Async version: memoizeAsync
 *
 * - Handles async functions (returns promises)
 * - Cache stores promises too
 * - Ensures concurrent calls with same args share one promise
 */
function memoizeAsync(fn) {
  const cache = new Map();
  return async function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const promise = fn.apply(this, args);
    cache.set(key, promise);
    return promise;
  };
}

/**
 * Follow-up Questions:
 * - How to implement cache expiration (TTL)?
 * - How to limit cache size (LRU Cache)?
 * - What’s the difference between memoize and once?
 */



/**
 * flatten()
 *
 * What does flatten do?
 * - Flattens nested arrays into a single array
 * - Depth parameter controls how deep to flatten
 *
 * Why implement it this way?
 * - Use recursion with reduce
 * - If element is array, recurse with depth-1
 *
 * Time Complexity: O(n) – visits all elements
 * Space Complexity: O(n) – new flattened array
 *
 * Performance Considerations:
 * - Recursion depth can be high (stack overflow on very deep arrays)
 * - Modern JS has arr.flat(depth) built-in
 */
function flatten(arr, depth = 1) {
  if (depth === 0) return arr.slice(); // shallow copy
  return arr.reduce((acc, val) =>
    acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val), []);
}

/**
 * Async variant: flattenAsync
 *
 * - Handles arrays containing promises
 * - Awaits promises before flattening
 */
async function flattenAsync(arr, depth = 1) {
  if (depth === 0) return Promise.all(arr); // resolve shallow promises
  const resolved = await Promise.all(arr);
  return resolved.reduce(async (accP, val) => {
    const acc = await accP;
    if (Array.isArray(val)) {
      return acc.concat(await flattenAsync(val, depth - 1));
    }
    return acc.concat(val);
  }, Promise.resolve([]));
}

/**
 * Follow-up Questions:
 * - How to flatten infinitely deep arrays? (depth = Infinity)
 * - How would you implement a lazy flatten (generator)?
 */



/**
 * deepEqual()
 *
 * What does deepEqual do?
 * - Checks if two values are deeply equal
 * - Works for nested objects/arrays
 *
 * Why implement it this way?
 * - First check strict equality
 * - If objects, compare keys length and values recursively
 *
 * Time Complexity: O(n) – n = number of properties
 * Space Complexity: O(n) – recursion stack
 *
 * Performance Considerations:
 * - Expensive for large nested objects
 * - Can be optimized with WeakMap to track visited objects (handle cycles)
 */
function deepEqual(a, b) {
  if (a === b) return true; // handles primitives, identical refs
  if (typeof a !== "object" || typeof b !== "object" || a == null || b == null) return false;

  const keysA = Object.keys(a), keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (let key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false;
  }
  return true;
}

/**
 * Follow-up Questions:
 * - How would you handle cyclic references? (use WeakMap)
 * - How would you handle special objects (Date, RegExp, Map, Set)?
 * - Why does JSON.stringify comparison fail in some cases?
 */


// once → one-time functions

// memoize + memoizeAsync → caching results (sync + async)

// flatten + flattenAsync → array flattening (sync + async promises)

// deepEqual → deep object comparison