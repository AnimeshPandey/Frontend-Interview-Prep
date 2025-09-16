I’ll cover these pattern groups:
- Arrays & two-pointers / sliding windows
- Stacks & monotonic stacks
- Queues & deques (including BFS)
- Linked lists (patterns & cycle detection)
- Trees (DFS/BFS, recursion → iterative)
- Graphs (representations, BFS, DFS, topo sort, SCC notes)
- Heaps / Priority Queue (implementation + use-cases)
- Trie / Prefix tree
- Union-Find (Disjoint Set Union)
- Greedy patterns
- Dynamic programming + memoization (using `Map` / `WeakMap`)
- Misc: caching, memo, weak collections, complexity tips, interview advice

I’ll keep each pattern compact: core idea, when to use, an idiomatic JS snippet, and complexity. Ready? Here we go.

# Arrays — basic building block
When: sorting, sliding windows, two-pointer, frequency counters.  
Key JS tools: `Array`, `Map` for frequency, `Set` for uniqueness, typed arrays for performance when numbers only.

Example: Two-sum (use `Map` for O(n)):
```js
// return indices of two numbers summing to target
function twoSum(nums, target) {
  const idx = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (idx.has(need)) return [idx.get(need), i];
    idx.set(nums[i], i);
  }
  return null;
}
```
Time: O(n), Space: O(n).

Sliding window (max sum of length k):
```js
function maxWindowSum(nums, k) {
  let sum = 0, best = -Infinity;
  for (let i = 0; i < nums.length; i++) {
    sum += nums[i];
    if (i >= k) sum -= nums[i - k];
    if (i >= k - 1) best = Math.max(best, sum);
  }
  return best;
}
```
Time O(n), Space O(1).

# Stacks & monotonic stacks
Use `Array` as stack (`push`/`pop`). Monotonic stacks solve next-greater, largest-rectangle-in-histogram.

Next greater element:
```js
function nextGreater(nums) {
  const res = new Array(nums.length).fill(-1);
  const st = []; // store indices, decreasing stack
  for (let i = 0; i < nums.length; i++) {
    while (st.length && nums[i] > nums[st[st.length - 1]]) {
      res[st.pop()] = nums[i];
    }
    st.push(i);
  }
  return res;
}
```
Time O(n).

Largest rectangle in histogram (classic monotonic stack). Interviewers expect the pattern.

# Queues & Deques
Use `Array` push/shift for queue (shift is O(n) — avoid for heavy use). Implement Deque with `DoublyLinkedList` or simple circular buffer, or use `Array` when sizes small.

Efficient queue (linked list):
```js
class ListNode {
  constructor(val){ this.val = val; this.next = null; }
}
class Queue {
  constructor(){ this.head = null; this.tail = null; this.size = 0; }
  enqueue(v) {
    const n = new ListNode(v);
    if (!this.tail) this.head = this.tail = n;
    else { this.tail.next = n; this.tail = n; }
    this.size++;
  }
  dequeue() {
    if (!this.head) return null;
    const v = this.head.val;
    this.head = this.head.next;
    if (!this.head) this.tail = null;
    this.size--;
    return v;
  }
}
```
Use for BFS on large inputs to avoid `shift()` cost.

BFS example (graph):
```js
function bfsAdj(adj, start) {
  const q = [start];
  const seen = new Set([start]);
  while (q.length) {
    const u = q.shift(); // fine for small inputs; for big use linked queue above
    for (const v of adj.get(u) || []) {
      if (!seen.has(v)) { seen.add(v); q.push(v); }
    }
  }
}
```

# Linked Lists
Patterns: reverse list, detect cycle (Floyd or visited set), merge lists, remove nth from end (two-pointer).

Detect cycle — Floyd:
```js
function hasCycle(head) {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}
```
Using `WeakSet` to track visited nodes (when nodes are objects and you want GC-safe visited):
```js
function hasCycleWeak(head) {
  const seen = new WeakSet();
  let node = head;
  while (node) {
    if (seen.has(node)) return true;
    seen.add(node);
    node = node.next;
  }
  return false;
}
```
Use `WeakSet` if lists are object-node and you prefer not to keep nodes alive via `Set`.

# Trees
Binary tree DFS / BFS patterns; recursion vs iterative stack.

Inorder iterative:
```js
function inorder(root) {
  const res = [];
  const st = [];
  let node = root;
  while (node || st.length) {
    while (node) { st.push(node); node = node.left; }
    node = st.pop();
    res.push(node.val);
    node = node.right;
  }
  return res;
}
```
BFS level order using queue.

# Graphs — representation & traversals
Represent graphs as adjacency list with `Map`:
```js
// Map<node, Array<neighbor>>
const graph = new Map();
graph.set('A', ['B','C']);
```
Or `Map<number, number[]>` for numeric nodes.

BFS and DFS (iterative & recursive), detect cycles, shortest path (unweighted: BFS; weighted: Dijkstra with heap).

DFS iterative (stack):
```js
function dfsIter(start, adj) {
  const visited = new Set();
  const st = [start];
  while (st.length) {
    const u = st.pop();
    if (visited.has(u)) continue;
    visited.add(u);
    for (const v of adj.get(u) || []) st.push(v);
  }
}
```

Topological sort (Kahn’s / DFS):
```js
function topoSort(nodes, adj) {
  const indeg = new Map();
  nodes.forEach(n => indeg.set(n, 0));
  for (const [u, nbrs] of adj) for (const v of nbrs) indeg.set(v, indeg.get(v) + 1);
  const q = [];
  for (const [n,d] of indeg) if (d === 0) q.push(n);
  const order = [];
  while (q.length) {
    const u = q.shift();
    order.push(u);
    for (const v of adj.get(u) || []) {
      indeg.set(v, indeg.get(v) - 1);
      if (indeg.get(v) === 0) q.push(v);
    }
  }
  return order.length === nodes.length ? order : null; // null => cycle exists
}
```

SCC (Tarjan / Kosaraju) — implement Tarjan in interviews if asked.

Use `WeakMap` for per-node memoization when graph nodes are object references and you want caches GC-safe:
```js
const memo = new WeakMap();
// memo.set(node, value);
```

# Heaps / Priority Queue
JS has no native heap. Interviewers expect you to implement a binary heap (min-heap / max-heap). Provide a compact class.

MinHeap implementation (compact, zero-indexed):
```js
class MinHeap {
  constructor() { this.a = []; }
  size() { return this.a.length; }
  peek() { return this.a[0] ?? null; }
  push(val) {
    this.a.push(val);
    this._siftUp(this.a.length - 1);
  }
  pop() {
    if (!this.a.length) return null;
    const top = this.a[0];
    const last = this.a.pop();
    if (this.a.length) { this.a[0] = last; this._siftDown(0); }
    return top;
  }
  _siftUp(i) {
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);
      if (this.a[p] <= this.a[i]) break;
      [this.a[p], this.a[i]] = [this.a[i], this.a[p]];
      i = p;
    }
  }
  _siftDown(i) {
    const n = this.a.length;
    while (true) {
      let l = 2 * i + 1, r = l + 1, smallest = i;
      if (l < n && this.a[l] < this.a[smallest]) smallest = l;
      if (r < n && this.a[r] < this.a[smallest]) smallest = r;
      if (smallest === i) break;
      [this.a[i], this.a[smallest]] = [this.a[smallest], this.a[i]];
      i = smallest;
    }
  }
}
```
Use cases: Dijkstra (with improvements), merge k sorted lists, sliding-window median (with two heaps), top K elements.

Time: push/pop O(log n).

# Trie (Prefix Tree)
Great for prefix queries, autocomplete, longest common prefix, word search.

Simple trie:
```js
class TrieNode {
  constructor() { this.children = new Map(); this.end = false; }
}
class Trie {
  constructor() { this.root = new TrieNode(); }
  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch);
    }
    node.end = true;
  }
  search(word) {
    let node = this.root;
    for (const ch of word) {
      node = node.children.get(ch);
      if (!node) return false;
    }
    return node.end;
  }
  startsWith(prefix) {
    let node = this.root;
    for (const ch of prefix) {
      node = node.children.get(ch);
      if (!node) return false;
    }
    return true;
  }
}
```
Space can be large but very fast for prefix ops.

# Union-Find (Disjoint Set Union, DSU)
Use for connectivity, cycle in undirected graph, Kruskal MST.
```js
class DSU {
  constructor(n) { this.p = Array.from({length:n}, (_,i)=>i); this.r = Array(n).fill(0); }
  find(x) { if (this.p[x] !== x) this.p[x] = this.find(this.p[x]); return this.p[x]; }
  union(a,b) {
    a = this.find(a); b = this.find(b);
    if (a === b) return false;
    if (this.r[a] < this.r[b]) [a,b] = [b,a];
    this.p[b] = a;
    if (this.r[a] === this.r[b]) this.r[a]++;
    return true;
  }
}
```
Typical complexity: amortized inverse-Ackermann ≈ constant.

# Greedy patterns
Greedy works when local optimum leads to global optimum; typical problems: interval scheduling (sort by end time), coin change with canonical coin systems, task scheduling.

Interval scheduling (maximum non-overlapping intervals):
```js
function maxNonOverlap(intervals) {
  intervals.sort((a,b) => a[1] - b[1]); // sort by end
  let end = -Infinity, count = 0;
  for (const [s,e] of intervals) {
    if (s >= end) { count++; end = e; }
  }
  return count;
}
```

# Dynamic Programming & Memoization
Use arrays for tabulation; `Map`/`Object` for memo keyed by state string; `WeakMap` when state is an object and you want GC-safe memo.

Example: DFS with memo on object nodes (WeakMap):
```js
function solve(node) {
  const memo = new WeakMap();
  function dfs(n) {
    if (!n) return 0;
    if (memo.has(n)) return memo.get(n);
    const ans = dfs(n.left) + dfs(n.right) + n.val;
    memo.set(n, ans);
    return ans;
  }
  return dfs(node);
}
```
When states are composite primitives (i, j), prefer `Map` with key `${i},${j}` to avoid collisions.

# Caching & Weak Collections
- Use `WeakMap` to attach metadata to objects (private fields, memo for DOM nodes).
- Use `WeakSet` to mark objects visited in traversals without preventing GC (DOM nodes, temporary graphs).
- Do NOT use `WeakMap` when you need iteration, size, or persistence beyond keys’ lifetimes.

Examples recap:
- `WeakMap` — expensive layout cache keyed by DOM node, private per-instance storage.
- `WeakSet` — visited nodes for DOM traversal, once-only event binding.

# Common interview problems & which data-structure pattern to pick
I’ll list the problem → best pattern(s) → short note.

1. **BFS shortest path (unweighted graph)** → queue + `Set` visited.
2. **DFS (path existence / backtracking)** → recursion / stack; visited `Set` for graphs.
3. **Topological sort** → Kahn’s (queue + indegree Map) or DFS + stack.
4. **Detect cycle directed** → DFS with colors (0/1/2) using `Map` (if nodes not numeric).
5. **Detect cycle undirected** → DFS/BFS + parent check or DSU for edges.
6. **Dijkstra / shortest path weighted** → adjacency map + min-heap.
7. **Kth largest** → min-heap of size K.
8. **Merge k sorted lists** → min-heap.
9. **LRU cache** → `Map` + Doubly Linked List (Map stores node pointers). `Map` preserves insertion order (ES6) — you can implement simple LRU by deleting & re-`set` in `Map`.
   ```js
   class LRU {
     constructor(cap) { this.cap = cap; this.map = new Map(); }
     get(k) {
       if (!this.map.has(k)) return -1;
       const v = this.map.get(k);
       this.map.delete(k);
       this.map.set(k, v);
       return v;
     }
     put(k,v) {
       if (this.map.has(k)) this.map.delete(k);
       this.map.set(k, v);
       if (this.map.size > this.cap) {
         const firstKey = this.map.keys().next().value;
         this.map.delete(firstKey);
       }
     }
   }
   ```
10. **Word search / prefix queries** → Trie.
11. **Union / connect queries** → DSU.
12. **Sliding window maximum** → deque (monotonic queue).
13. **Median of data stream** → two heaps (max-heap + min-heap).
14. **Clone graph** → BFS/DFS + `Map` keyed by original node -> clone (if nodes are objects). Use `WeakMap` if you want the clone mapping to be GC-able with originals (rare in pure algorithms).
15. **Cycle detection in linked list** → Floyd or `WeakSet` visited.

# Performance & Big-O cheat sheet (common ops)
- `Map`: get/set/delete/has ≈ O(1) average. Iterable.
- `Set`: add/delete/has ≈ O(1). Iterable.
- `WeakMap` / `WeakSet`: get/set/delete/has ≈ O(1), but not iterable and keys must be objects.
- Arrays: random access O(1), push/pop O(1), shift/unshift O(n).
- Heap push/pop O(log n).
- Trie insert/search O(L) where L length of word.

# Implementation pitfalls & interview tips
- Avoid `Array.shift()` in heavy queues — explain complexity and offer linked-list queue or maintain head index (circular buffer) instead.
- For memo keys that are pairs/tuples, use `Map` with composite key like `key = i + ',' + j` or nested `Map` (`Map<i, Map<j, value>>`) to avoid string creation in performance-critical code.
- If interviewer asks about memory leaks with caches tied to DOM / objects, propose `WeakMap` to avoid leaks — show the code.
- When using `Map` for LRU, use `map.delete(k); map.set(k,v);` to move entry to recent.
- When nodes are objects (DOM, custom linked list nodes), prefer `WeakMap`/`WeakSet` for metadata/visited if you don’t need iteration.
- If asked for concurrency/threading concerns in browser context: JS is single-threaded event-loop; web workers are isolated. That’s usually out-of-scope for pure DSA.

# Example: Turn a LeetCode-style problem into patterns
Problem: “Given binary tree, find maximum path sum.” Patterns: tree DP, post-order recursion, use `Map` only if memoizing nodes (not necessary here). Show concise solution:
```js
function maxPathSum(root) {
  let best = -Infinity;
  function dfs(node) {
    if (!node) return 0;
    const left = Math.max(0, dfs(node.left));
    const right = Math.max(0, dfs(node.right));
    best = Math.max(best, node.val + left + right);
    return node.val + Math.max(left, right);
  }
  dfs(root);
  return best;
}
```

# When to implement custom structures in JS
- **Heap**: when priority operations required.
- **Deque**: monotonic queue for sliding window maximum — a linked-list deque or array with head/tail indices.
- **Linked list**: when interview explicitly asks, or when queue must be O(1) for both ends without reindexing.
- **Trie / DSU**: implement from scratch — interviewers expect it.

# Quick reference — when to use which advanced JS structure
- `Map` — keyed lookups where keys may be non-string, need iteration, or need insertion order (LRU).
- `Set` — uniqueness, membership tests, fast deletion.
- `WeakMap` — attach metadata/cache to objects (DOM nodes) without leaking memory; no iteration.
- `WeakSet` — mark visited/seen for objects, GC-safe.
- Custom `Heap` — priority tasks (top-k, Dijkstra).
- `Trie` — prefix problems.
- `DSU` — connectivity / union queries.

# Final mini-checklist for front-end interviews
1. For graph/tree traversals: know BFS (queue) and DFS (stack/recursion) cold.
2. For caching in apps: explain `Map` vs `WeakMap` tradeoffs and show sample code.
3. For median / top-k / scheduling: implement a heap.
4. For sliding window maxima: implement deque monotonic queue.
5. For LRU: Map + delete+set or Doubly Linked List + Map (explain why O(1)).
6. For problems with object nodes (DOM), mention `WeakMap`/`WeakSet` to avoid memory leaks.
7. Explain time & space complexities and edge cases (nulls, empty, single node).

---
