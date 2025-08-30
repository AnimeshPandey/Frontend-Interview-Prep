/***********************************************************
 * 3. Lodash-like Utilities
 ***********************************************************/

/**
 * debounce()
 * Time Complexity: O(1) per call
 * Space Complexity: O(1)
 * Perf Notes:
 * - Useful for high-frequency events (resize, keyup)
 */
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * throttle()
 * Time Complexity: O(1) per call
 * Perf Notes:
 * - Useful when you want controlled execution (scroll events)
 */
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

/**
 * cloneDeep()
 * Time Complexity: O(n) – visits every property once
 * Space Complexity: O(n)
 * Perf Notes:
 * - Handles circular references
 * - Expensive for very large nested objects
 */
function cloneDeep(obj, map = new WeakMap()) {
  if (obj === null || typeof obj !== "object") return obj;
  if (map.has(obj)) return map.get(obj);

  const result = Array.isArray(obj) ? [] : {};
  map.set(obj, result);

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      result[key] = cloneDeep(obj[key], map);
    }
  }
  return result;
}

/**
 * groupBy()
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */
function groupBy(arr, fn) {
  return arr.reduce((acc, item) => {
    const key = typeof fn === "function" ? fn(item) : item[fn];
    (acc[key] = acc[key] || []).push(item);
    return acc;
  }, {});
}


/***********************************************************
 * 4. chunk / mapAsync / mapWithChunksAsync
 ***********************************************************/

/**
 * chunk()
 * Time Complexity: O(n)
 * Space Complexity: O(n)
 */
function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * mapAsync()
 * Time Complexity: O(n) – resolves n promises concurrently
 */
async function mapAsync(arr, fn) {
  return Promise.all(arr.map(fn));
}

/**
 * mapWithChunksAsync()
 * Time Complexity: O(n)
 * Perf Notes:
 * - Limits concurrency (important in rate-limited APIs)
 */
async function mapWithChunksAsync(arr, fn, chunkSize) {
  const chunks = chunk(arr, chunkSize);
  const results = [];
  for (const c of chunks) {
    const res = await Promise.all(c.map(fn));
    results.push(...res);
  }
  return results;
}


/***********************************************************
 * 5. Object Key Converters
 ***********************************************************/

/**
 * toCamelCase / toSnakeCase
 * Time Complexity: O(k) – k = string length
 */
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, c => "_" + c.toLowerCase());
}

function convertKeys(obj, convertFn) {
  if (Array.isArray(obj)) return obj.map(v => convertKeys(v, convertFn));
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [convertFn(k), convertKeys(v, convertFn)])
    );
  }
  return obj;
}


/***********************************************************
 * 6. DOM Polyfills (Browser Only)
 ***********************************************************/

Document.prototype.myGetElementsByClassName = function(className) {
  const results = [];
  function traverse(node) {
    if (node.nodeType === 1) {
      if (node.classList && node.classList.contains(className)) {
        results.push(node);
      }
      for (const child of node.children) traverse(child);
    }
  }
  traverse(this.body);
  return results;
};

Document.prototype.myGetElementsByTagName = function(tagName) {
  const results = [];
  tagName = tagName.toUpperCase();
  function traverse(node) {
    if (node.nodeType === 1) {
      if (node.tagName === tagName) results.push(node);
      for (const child of node.children) traverse(child);
    }
  }
  traverse(this.body);
  return results;
};


/***********************************************************
 * 7. Observer Pattern
 ***********************************************************/
class Subject {
  constructor() {
    this.observers = [];
  }
  subscribe(fn) {
    this.observers.push(fn);
  }
  unsubscribe(fn) {
    this.observers = this.observers.filter(obs => obs !== fn);
  }
  notify(data) {
    this.observers.forEach(fn => fn(data));
  }
}


/***********************************************************
 * 8. EXTRA INTERVIEW-FAVORITE QUESTIONS
 ***********************************************************/

/**
 * once(fn)
 * Purpose: Function runs only once, then caches result
 */
function once(fn) {
  let called = false, result;
  return function(...args) {
    if (!called) {
      called = true;
      result = fn.apply(this, args);
    }
    return result;
  };
}

/**
 * memoize(fn)
 * Purpose: Cache function results for same inputs
 */
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

/**
 * flatten(arr, depth = 1)
 * Purpose: Flattens nested arrays
 */
function flatten(arr, depth = 1) {
  if (depth === 0) return arr.slice();
  return arr.reduce((acc, val) => 
    acc.concat(Array.isArray(val) ? flatten(val, depth - 1) : val), []);
}

/**
 * deepEqual(a, b)
 * Purpose: Compare objects deeply
 */
function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== "object" || typeof b !== "object" || a == null || b == null) return false;
  const keysA = Object.keys(a), keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (let key of keysA) {
    if (!keysB.includes(key) || !deepEqual(a[key], b[key])) return false;
  }
  return true;
}

/**
 * EventEmitter
 * Classic Node.js style pub-sub implementation
 */
class EventEmitter {
  constructor() {
    this.events = {};
  }
  on(event, listener) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(listener);
  }
  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }
  emit(event, ...args) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }
}

/***********************************************************
 * USAGE EXAMPLES
 ***********************************************************/
// console.log([1,2,3].myMap(x => x*2)); // [2,4,6]
// console.log([1,2,3].myReduce((a,b)=>a+b,0)); // 6
// console.log(flatten([1,[2,[3,[4]]]], 2)); // [1,2,3,[4]]
