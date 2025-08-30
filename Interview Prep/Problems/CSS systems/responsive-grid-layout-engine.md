# 🔎 Problem 22: Responsive Grid Layout Engine
* Step 1 → Simple fixed grid (rows × cols).
* Step 2 → Add responsive sizing (fractions, minmax).
* Step 3 → Handle spanning (item spanning multiple rows/cols).
* Step 4 → Add auto-placement.
* Step 5 → Discuss **browser-level optimizations** & perf tradeoffs.
---

## Step 1. Interviewer starts:

*"Implement a grid layout engine: given a container width & number of columns, return item positions."*

---

### ✅ Basic Fixed Grid

```js
function computeGrid(items, containerWidth, colCount, rowHeight) {
  const colWidth = containerWidth / colCount;
  return items.map((item, i) => {
    const row = Math.floor(i / colCount);
    const col = i % colCount;
    return {
      ...item,
      x: col * colWidth,
      y: row * rowHeight,
      width: colWidth,
      height: rowHeight
    };
  });
}

// Example
const layout = computeGrid([{ id: 1 }, { id: 2 }, { id: 3 }], 600, 3, 200);
console.log(layout);
/*
[
  {id:1, x:0, y:0, width:200, height:200},
  {id:2, x:200, y:0, width:200, height:200},
  {id:3, x:400, y:0, width:200, height:200}
]
*/
```

✔ Works like `grid-template-columns: repeat(3, 1fr);`.

---

## Step 2. Interviewer adds:

*"Good. Now support **fractions (fr) and minmax()** like CSS Grid."*

---

### ✅ Support Fractions + Minmax

```js
function parseTrackSize(size, containerWidth) {
  if (typeof size === "string" && size.endsWith("fr")) {
    const fr = parseFloat(size);
    return (containerWidth / fr); // naive → split evenly later
  } else if (typeof size === "string" && size.startsWith("minmax")) {
    const [min, max] = size.match(/\d+/g).map(Number);
    return Math.max(min, Math.min(containerWidth, max));
  } else {
    return parseFloat(size); // px
  }
}

function computeGridWithTracks(items, containerWidth, colDefs, rowHeight) {
  const totalFr = colDefs.filter(c => c.endsWith?.("fr"))
                         .reduce((sum, c) => sum + parseFloat(c), 0);

  const usedPx = colDefs.filter(c => !c.endsWith?.("fr"))
                        .reduce((sum, c) => sum + parseFloat(c), 0);

  const frSize = (containerWidth - usedPx) / totalFr;

  const colWidths = colDefs.map(def => {
    if (def.endsWith?.("fr")) return parseFloat(def) * frSize;
    return parseFloat(def);
  });

  return items.map((item, i) => {
    const row = Math.floor(i / colDefs.length);
    const col = i % colDefs.length;
    const x = colWidths.slice(0, col).reduce((a, b) => a + b, 0);
    return {
      ...item,
      x,
      y: row * rowHeight,
      width: colWidths[col],
      height: rowHeight
    };
  });
}

// Example
const layout = computeGridWithTracks(
  [{ id: 1 }, { id: 2 }, { id: 3 }],
  600,
  ["1fr", "2fr", "100"],
  200
);
console.log(layout);
```

✔ Simulates CSS `grid-template-columns: 1fr 2fr 100px`.

---

## Step 3. Interviewer twists:

*"Now support items that **span multiple rows/columns**."*

---

### ✅ Spanning Support

```js
function computeGridWithSpan(items, containerWidth, colDefs, rowHeight) {
  const layout = computeGridWithTracks(items, containerWidth, colDefs, rowHeight);

  return layout.map(item => {
    const spanCols = item.colSpan || 1;
    const spanRows = item.rowSpan || 1;

    const col = layout.indexOf(item) % colDefs.length;
    const startX = layout[item.id - 1]?.x ?? 0; // simplistic lookup

    return {
      ...item,
      width: layout[item.id - 1].width * spanCols,
      height: rowHeight * spanRows,
      x: startX,
      y: Math.floor((item.id - 1) / colDefs.length) * rowHeight
    };
  });
}

// Example
const layout2 = computeGridWithSpan(
  [{ id: 1 }, { id: 2, colSpan: 2 }, { id: 3 }],
  600,
  ["1fr", "1fr", "1fr"],
  200
);
console.log(layout2);
/*
id 1: spans 1 col
id 2: spans 2 cols (400px wide)
id 3: normal
*/
```

✔ Supports spanning like `grid-column: span 2;`.

---

## Step 4. Interviewer final twist:

*"Good. But what if items are fewer or don’t fit neatly? Support **auto-placement**."*

---

### ✅ Auto-Placement

```js
function autoPlace(items, containerWidth, colDefs, rowHeight) {
  const colWidths = computeGridWithTracks([], containerWidth, colDefs, rowHeight)
                      .map(c => c.width);

  const layout = [];
  let currentRow = 0, currentCol = 0;

  items.forEach(item => {
    if (currentCol >= colDefs.length) {
      currentCol = 0;
      currentRow++;
    }
    const x = colWidths.slice(0, currentCol).reduce((a, b) => a + b, 0);
    layout.push({
      ...item,
      x,
      y: currentRow * rowHeight,
      width: colWidths[currentCol],
      height: rowHeight
    });
    currentCol++;
  });

  return layout;
}
```

✔ Fills grid like CSS `grid-auto-flow: row;`.

---

## Step 5. Interviewer final boss:

*"How does this compare to real browsers? What about performance tradeoffs?"*

---

### ✅ Performance & Real-World Discussion

* **Our simulation**:

  * O(n × m) where n = items, m = tracks.
  * Works for simple cases, but no implicit grid lines, alignment, or gaps.

* **CSS Grid spec (real browsers)**:

  * Handles **min-content, max-content, auto-fill, auto-fit**.
  * Uses **layout algorithms**: track sizing → placement → alignment.
  * Optimized in C++ inside browser engines.

* **Tradeoffs**:

  * JS implementation = flexible, but heavy for 10k items.
  * Browsers optimize via **layout trees** and **incremental updates**.
  * For large datasets, use **virtualized grid rendering** (React Window, Grid).

* **Frontend Use Cases**:

  * Dashboard builders (Notion, Figma, Miro).
  * Drag-and-drop grid systems.
  * Dynamic responsive layouts (e.g., Shopify theme editors).

---

# 🎯 Final Interview Takeaways (Responsive Grid Engine)

* ✅ Step 1: Fixed grid (rows × cols).
* ✅ Step 2: Fractions + minmax().
* ✅ Step 3: Spanning rows/cols.
* ✅ Step 4: Auto-placement.
* ✅ Step 5: Discuss real CSS Grid spec, performance, virtualization.