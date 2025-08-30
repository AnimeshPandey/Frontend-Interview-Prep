# 🔎 Problem 11: LRU Cache
* Step 1 → Naive cache with eviction.
* Step 2 → Add usage tracking.
* Step 3 → Optimize to O(1) with **HashMap + Doubly Linked List**.
* Step 4 → Add delete & clear.
* Step 5 → Discuss frontend use cases & perf tradeoffs.
---

## Step 1. Interviewer starts:

*"Implement a cache with `get` and `put`. If capacity is exceeded, evict the oldest item."*

---

### ❌ Naive FIFO Cache

```js
class FIFOCache {
  constructor(limit) {
    this.limit = limit;
    this.map = new Map();
  }

  get(key) {
    return this.map.get(key);
  }

  put(key, value) {
    if (this.map.size >= this.limit) {
      // Evict first inserted
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);
    }
    this.map.set(key, value);
  }
}
```

⚠️ Problem: This is **FIFO (First-In-First-Out)**, not LRU.
LRU must evict the **least recently used** item, not just the oldest.

---

## Step 2. Interviewer says:

*"Good. Now track usage so that `get` marks an item as recently used."*

---

### ✅ Using `Map` (O(n) for eviction order)

```js
class LRUCache {
  constructor(limit) {
    this.limit = limit;
    this.map = new Map();
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const value = this.map.get(key);
    // Refresh usage by reinserting
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    else if (this.map.size >= this.limit) {
      // Evict least recently used (first item in Map)
      const oldestKey = this.map.keys().next().value;
      this.map.delete(oldestKey);
    }
    this.map.set(key, value);
  }
}
```

✔ Works, but eviction requires iterating over `Map.keys()` → **O(1) in practice but not guaranteed by spec**.

---

## Step 3. Interviewer pushes:

*"Can you make both `get` and `put` **O(1)** guaranteed?"*

👉 Answer: Use **HashMap + Doubly Linked List**.

---

### ✅ Optimal O(1) LRU Cache

```js
class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.prev = this.next = null;
  }
}

class LRUCache {
  constructor(limit) {
    this.limit = limit;
    this.map = new Map(); // key → node
    this.head = new Node(); // dummy head
    this.tail = new Node(); // dummy tail
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  _remove(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  _insert(node) {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const node = this.map.get(key);
    this._remove(node);
    this._insert(node); // move to front (MRU)
    return node.value;
  }

  put(key, value) {
    if (this.map.has(key)) {
      this._remove(this.map.get(key));
    } else if (this.map.size >= this.limit) {
      // Evict LRU (node before tail)
      const lru = this.tail.prev;
      this._remove(lru);
      this.map.delete(lru.key);
    }
    const newNode = new Node(key, value);
    this._insert(newNode);
    this.map.set(key, newNode);
  }
}
```

✔ Now both `get` and `put` are **O(1)**.

---

## Step 4. Interviewer adds:

*"Cool. Now add support for `delete(key)` and `clear()`."*

---

### ✅ Extended API

```js
delete(key) {
  if (!this.map.has(key)) return false;
  const node = this.map.get(key);
  this._remove(node);
  this.map.delete(key);
  return true;
}

clear() {
  this.map.clear();
  this.head.next = this.tail;
  this.tail.prev = this.head;
}
```

---

## Step 5. Interviewer final boss:

*"Great. How would you use LRU cache in **frontend systems**? What about performance tradeoffs?"*

---

### ✅ Real-World Usage

* **Frontend Use Cases**:

  * Image caching (keep recent images in memory).
  * API response caching (GraphQL, REST).
  * Virtualized lists (cache rendered DOM nodes).
  * CDN/browser caching uses LRU under the hood.

* **Performance Tradeoffs**:

  * Map-based version: simpler, usually fine for small caches (<1000).
  * Linked list version: O(1) guaranteed, better for large caches.
  * Memory overhead: extra linked list nodes.
  * For huge caches: consider LFU (Least Frequently Used) instead of LRU.

---

# 🎯 Final Interview Takeaways (LRU Cache)

* ✅ Step 1: FIFO naive.
* ✅ Step 2: Map-based LRU.
* ✅ Step 3: HashMap + DLL for O(1).
* ✅ Step 4: Add delete & clear.
* ✅ Step 5: Discuss frontend usage + tradeoffs.