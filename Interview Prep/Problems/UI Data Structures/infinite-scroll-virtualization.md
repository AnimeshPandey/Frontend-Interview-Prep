# 🔎 Problem 15: Infinite Scroll Virtualization
* Step 1 → Naive infinite scroll (append all items).
* Step 2 → Optimize by rendering only visible items (windowing).
* Step 3 → Add dynamic scroll handling (on scroll event).
* Step 4 → Handle variable row heights.
* Step 5 → Discuss scalability, React comparison, perf tradeoffs.
---

## Step 1. Interviewer starts:

*"Implement infinite scroll that loads more items as the user scrolls down."*

---

### ❌ Naive Approach

```js
function naiveInfiniteScroll(container, fetchMore) {
  container.addEventListener("scroll", async () => {
    if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
      const items = await fetchMore();
      items.forEach(item => {
        const div = document.createElement("div");
        div.textContent = item;
        container.appendChild(div);
      });
    }
  });
}
```

⚠️ Problem: If list has **10,000 items**, DOM = huge → slow render, laggy scroll.

---

## Step 2. Interviewer adds:

*"Good start. But instead of rendering all items, only render those **visible in the viewport**."*

👉 Solution: **Windowing (Virtualization)**

---

### ✅ Virtualized Rendering

```js
class VirtualList {
  constructor({ container, itemHeight, total, renderItem }) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.total = total;
    this.renderItem = renderItem;

    // Placeholder to preserve scroll height
    this.container.style.position = "relative";
    this.container.style.overflowY = "auto";
    this.container.style.height = "400px";

    this.spacer = document.createElement("div");
    this.spacer.style.height = this.total * this.itemHeight + "px";
    this.container.appendChild(this.spacer);

    this.viewport = document.createElement("div");
    this.viewport.style.position = "absolute";
    this.container.appendChild(this.viewport);

    this.container.addEventListener("scroll", () => this.render());
    this.render();
  }

  render() {
    const scrollTop = this.container.scrollTop;
    const startIdx = Math.floor(scrollTop / this.itemHeight);
    const visibleCount = Math.ceil(this.container.clientHeight / this.itemHeight);

    this.viewport.innerHTML = ""; // clear visible region
    this.viewport.style.top = startIdx * this.itemHeight + "px";

    for (let i = 0; i < visibleCount; i++) {
      const idx = startIdx + i;
      if (idx >= this.total) break;
      const el = this.renderItem(idx);
      el.style.height = this.itemHeight + "px";
      this.viewport.appendChild(el);
    }
  }
}

// Usage
const container = document.getElementById("list");
new VirtualList({
  container,
  itemHeight: 30,
  total: 10000,
  renderItem: i => {
    const div = document.createElement("div");
    div.textContent = "Item " + i;
    return div;
  }
});
```

✔ Now only \~20 elements in DOM, no matter if list = 10k.

---

## Step 3. Interviewer twists:

*"Great. But what about **variable row heights**? Items might not all be 30px."*

---

### ✅ Handle Variable Heights

* Maintain a **cumulative heights array**.
* Use **binary search** to find which index corresponds to current `scrollTop`.

```js
class VariableHeightVirtualList {
  constructor({ container, total, renderItem, getItemHeight }) {
    this.container = container;
    this.total = total;
    this.renderItem = renderItem;
    this.getItemHeight = getItemHeight;

    this.heights = new Array(total).fill(0).map((_, i) => getItemHeight(i));
    this.positions = this.heights.reduce((acc, h, i) => {
      acc.push((acc[i - 1] || 0) + h);
      return acc;
    }, []);

    this.container.addEventListener("scroll", () => this.render());
    this.render();
  }

  findIndex(scrollTop) {
    // Binary search for index
    let low = 0, high = this.positions.length - 1;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (this.positions[mid] < scrollTop) low = mid + 1;
      else high = mid;
    }
    return low;
  }

  render() {
    const scrollTop = this.container.scrollTop;
    const startIdx = this.findIndex(scrollTop);
    const viewportHeight = this.container.clientHeight;

    let offsetTop = this.positions[startIdx - 1] || 0;
    let y = offsetTop;

    this.container.innerHTML = "";
    let i = startIdx;
    while (i < this.total && y < scrollTop + viewportHeight) {
      const el = this.renderItem(i);
      el.style.position = "absolute";
      el.style.top = y + "px";
      this.container.appendChild(el);
      y += this.heights[i];
      i++;
    }

    this.container.style.position = "relative";
    this.container.style.height = this.positions[this.positions.length - 1] + "px";
  }
}
```

✔ Supports variable heights with **binary search** lookup.

---

## Step 4. Interviewer final boss:

*"How does this scale with **100k items**? What about smooth scrolling and async fetching?"*

---

### ✅ Performance & Real-World Discussion

* **Complexity**:

  * Fixed height → O(1) lookup.
  * Variable height → O(log n) lookup via binary search.
* **Smooth Scrolling**:

  * Use `requestAnimationFrame` to batch re-renders.
  * Avoid `innerHTML = ""` (creates GC churn) → reuse DOM nodes (recycling).
* **Async Loading**:

  * Fetch more items when near bottom (infinite scroll).
  * Combine with virtualization = both **lazy load + lazy render**.
* **Frontend Libraries**:

  * React Virtualized, React Window → production-ready solutions.
* **Tradeoffs**:

  * Virtualization saves memory but can break `Ctrl+F` (browser search).
  * Accessibility → ARIA roles may be needed.

---

# 🎯 Final Interview Takeaways (Infinite Scroll Virtualization)

* ✅ Step 1: Naive infinite scroll.
* ✅ Step 2: Virtualization (render only visible items).
* ✅ Step 3: Handle variable heights with binary search.
* ✅ Step 4: Discuss scaling, smooth scrolling, async fetching.
* ✅ Step 5: Mention libraries (React Window, React Virtualized) & tradeoffs.