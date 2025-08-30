# 🔎 Problem 13: Diff Algorithm for JSON
* Step 1 → Shallow diff (only top-level keys).
* Step 2 → Deep diff recursion.
* Step 3 → Distinguish add / update / remove.
* Step 4 → Optimize for large objects (short-circuit).
* Step 5 → Discuss perf, scalability, and real-world usage.

---

## Step 1. Interviewer starts:

*"Write a function that compares two JSON objects and returns changed keys at the **top level**."*

**Input**

```js
const oldObj = { a: 1, b: 2 };
const newObj = { a: 1, b: 3, c: 4 };
```

**Expected Output**

```json
{
  "changed": ["b"],
  "added": ["c"],
  "removed": []
}
```

---

### ✅ Shallow Diff

```js
function shallowDiff(oldObj, newObj) {
  const diff = { changed: [], added: [], removed: [] };

  for (let key in oldObj) {
    if (!(key in newObj)) diff.removed.push(key);
    else if (oldObj[key] !== newObj[key]) diff.changed.push(key);
  }

  for (let key in newObj) {
    if (!(key in oldObj)) diff.added.push(key);
  }

  return diff;
}

// Example
console.log(shallowDiff({ a: 1, b: 2 }, { a: 1, b: 3, c: 4 }));
// { changed: ["b"], added: ["c"], removed: [] }
```

---

## Step 2. Interviewer adds:

*"Good. But now handle **nested objects** recursively."*

---

### ✅ Deep Diff

```js
function deepDiff(oldObj, newObj) {
  const diff = {};

  for (let key in oldObj) {
    if (!(key in newObj)) {
      diff[key] = { type: "removed", oldValue: oldObj[key] };
    } else if (typeof oldObj[key] === "object" && typeof newObj[key] === "object") {
      const childDiff = deepDiff(oldObj[key], newObj[key]);
      if (Object.keys(childDiff).length > 0) diff[key] = childDiff;
    } else if (oldObj[key] !== newObj[key]) {
      diff[key] = { type: "changed", oldValue: oldObj[key], newValue: newObj[key] };
    }
  }

  for (let key in newObj) {
    if (!(key in oldObj)) {
      diff[key] = { type: "added", newValue: newObj[key] };
    }
  }

  return diff;
}

// Example
console.log(deepDiff(
  { a: 1, b: { x: 2, y: 3 } },
  { a: 1, b: { x: 5 }, c: 10 }
));
/*
{
  "b": { "x": { type: "changed", oldValue: 2, newValue: 5 }, "y": { type: "removed", oldValue: 3 } },
  "c": { type: "added", newValue: 10 }
}
*/
```

---

## Step 3. Interviewer twists:

*"Nice. But instead of this nested object structure, can you return a **flat list of patch operations** (like JSON Patch spec)?"*

---

### ✅ JSON Patch Style Diff

```js
function diffPatch(oldObj, newObj, path = "") {
  const ops = [];

  for (let key in oldObj) {
    const currentPath = path + "/" + key;
    if (!(key in newObj)) {
      ops.push({ op: "remove", path: currentPath });
    } else if (typeof oldObj[key] === "object" && typeof newObj[key] === "object") {
      ops.push(...diffPatch(oldObj[key], newObj[key], currentPath));
    } else if (oldObj[key] !== newObj[key]) {
      ops.push({ op: "replace", path: currentPath, value: newObj[key] });
    }
  }

  for (let key in newObj) {
    const currentPath = path + "/" + key;
    if (!(key in oldObj)) {
      ops.push({ op: "add", path: currentPath, value: newObj[key] });
    }
  }

  return ops;
}

// Example
console.log(diffPatch(
  { a: 1, b: { x: 2, y: 3 } },
  { a: 1, b: { x: 5 }, c: 10 }
));
/*
[
  { op: "replace", path: "/b/x", value: 5 },
  { op: "remove", path: "/b/y" },
  { op: "add", path: "/c", value: 10 }
]
*/
```

---

## Step 4. Interviewer final twist:

*"Great! But how would this scale on **large JSON objects** (e.g., 1MB Redux state)? Can we optimize?"*

---

### ✅ Performance Discussion

* **Time Complexity**: O(n) where n = total keys.

* **Space Complexity**: O(n) for patch list.

* **Optimizations**:

  * **Short-circuit**: If objects are identical by reference, skip subtree.
  * **Hashing**: Precompute hash of subtrees → if hashes match, skip recursion.
  * **Streaming diff**: For huge JSON, compute diffs incrementally.

* **Tradeoffs**:

  * Full deep diff = precise but slow.
  * Shallow diff = fast but misses nested changes.
  * Real systems balance → React’s reconciliation uses **heuristics** (keys + shallow checks).

---

## Step 5. Real-World Use Cases

* React’s Virtual DOM diffing.
* Redux DevTools (state change tracking).
* API synchronization (compute minimal `PATCH` instead of full `PUT`).
* Collaborative editors (diff + merge).

---

# 🎯 Final Interview Takeaways (JSON Diff)

* ✅ Step 1: Shallow diff (top-level).
* ✅ Step 2: Deep recursive diff.
* ✅ Step 3: Flat patch operations (`add`, `remove`, `replace`).
* ✅ Step 4: Discuss perf (short-circuit, hashing).
* ✅ Step 5: Real-world use cases (React, Redux, APIs).
