# 🔎 Problem 23: Bundler Dependency Graph
* Step 1 → Represent modules + imports.
* Step 2 → Build dependency graph.
* Step 3 → Traverse graph in build order (topological sort).
* Step 4 → Detect circular dependencies.
* Step 5 → Discuss real-world bundlers (tree-shaking, dynamic imports).
---

## Step 1. Interviewer starts:

*"Represent modules and their imports in JS."*

---

### ✅ Module Representation

```js
const modules = {
  "index.js": ["utils.js", "api.js"],
  "utils.js": ["helpers.js"],
  "api.js": ["utils.js"],
  "helpers.js": []
};
```

✔ Each file maps to the list of files it imports.

---

## Step 2. Interviewer says:

*"Now build a **graph** from this representation."*

---

### ✅ Graph Build

```js
function buildGraph(modules) {
  const graph = {};
  for (let [file, deps] of Object.entries(modules)) {
    graph[file] = deps;
  }
  return graph;
}

const graph = buildGraph(modules);
console.log(graph);
/*
{
  index.js: ["utils.js", "api.js"],
  utils.js: ["helpers.js"],
  api.js: ["utils.js"],
  helpers.js: []
}
*/
```

✔ Graph built.

---

## Step 3. Interviewer twists:

*"Now output modules in **build order** so that dependencies are resolved first."*

👉 This is **topological sort**.

---

### ✅ Topological Sort

```js
function topoSort(graph) {
  const visited = new Set();
  const result = [];

  function dfs(node) {
    if (visited.has(node)) return;
    visited.add(node);
    for (let dep of graph[node]) dfs(dep);
    result.push(node);
  }

  Object.keys(graph).forEach(dfs);
  return result.reverse(); // dependencies first
}

console.log(topoSort(graph));
// ["helpers.js", "utils.js", "api.js", "index.js"]
```

✔ Ensures dependencies load before dependents.

---

## Step 4. Interviewer adds:

*"What if there are **circular dependencies** (A → B → A)? Detect them."*

---

### ✅ Detect Cycles

```js
function detectCycles(graph) {
  const visited = new Set();
  const stack = new Set();
  const cycles = [];

  function dfs(node, path = []) {
    if (stack.has(node)) {
      cycles.push([...path, node]);
      return;
    }
    if (visited.has(node)) return;

    visited.add(node);
    stack.add(node);

    for (let dep of graph[node]) {
      dfs(dep, [...path, node]);
    }

    stack.delete(node);
  }

  Object.keys(graph).forEach(node => dfs(node));
  return cycles;
}

// Example with cycle
const graphWithCycle = {
  "a.js": ["b.js"],
  "b.js": ["a.js"]
};
console.log(detectCycles(graphWithCycle));
// [["a.js","b.js","a.js"]]
```

✔ Reports circular deps.

---

## Step 5. Interviewer final boss:

*"Great. How does this compare to **real bundlers** like Webpack or Rollup? What optimizations are needed?"*

---

### ✅ Performance & Real-World Discussion

* **Our implementation**:

  * Graph = adjacency list.
  * Topological sort = O(V + E).
  * Cycle detection = O(V + E).

* **Real bundlers (Webpack, Rollup, Vite, ESBuild)**:

  * Support **ESM, CommonJS, dynamic imports**.
  * Build AST → resolve imports → dependency graph.
  * Detect **circular deps** but don’t fail (partial eval instead).
  * Optimize with **tree-shaking** (remove unused exports).
  * Handle **code splitting**: multiple entrypoints → chunk graph.

* **Tradeoffs**:

  * Full static analysis (fast, predictable) vs dynamic require (harder).
  * Memory usage with 10k+ modules (bundlers must cache results).
  * Incremental builds = cache graph, only re-run changed nodes.

* **Frontend Use Cases**:

  * Build systems (Webpack, Vite).
  * Dependency visualizers.
  * Detecting circular imports in large codebases.

---

# 🎯 Final Interview Takeaways (Dependency Graph)

* ✅ Step 1: Represent modules + imports.
* ✅ Step 2: Build graph.
* ✅ Step 3: Topological sort for build order.
* ✅ Step 4: Detect circular dependencies.
* ✅ Step 5: Discuss real bundlers (AST parsing, tree-shaking, splitting).
