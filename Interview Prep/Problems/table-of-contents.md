# 🔎 Problem 3: Generate TOC from HTML

---

## Step 1. Interviewer starts:

*"Write a function that extracts all `<h1>`…`<h6>` headings from an HTML string and returns them in a list."*

**Example Input**

```html
<h1>Intro</h1>
<h2>Background</h2>
<h3>Details</h3>
<h1>Conclusion</h1>
```

**Expected Output (flat list)**

```json
["Intro", "Background", "Details", "Conclusion"]
```

---

### ✅ Initial Solution (Flat List)

```js
function extractHeadings(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const headings = [...doc.querySelectorAll("h1,h2,h3,h4,h5,h6")];
  return headings.map(h => h.textContent.trim());
}
```

---

## Step 2. Interviewer adds:

*"Good. Now return them as a **hierarchical outline** (nested like Google Docs)."*

**Example Input**

```html
<h1>Intro</h1>
<h2>Background</h2>
<h2>Goals</h2>
<h3>Short-term</h3>
<h3>Long-term</h3>
<h1>Conclusion</h1>
```

**Expected Output (nested structure)**

```json
[
  {
    "text": "Intro",
    "level": 1,
    "children": [
      { "text": "Background", "level": 2, "children": [] },
      { "text": "Goals", "level": 2, "children": [
        { "text": "Short-term", "level": 3, "children": [] },
        { "text": "Long-term", "level": 3, "children": [] }
      ]}
    ]
  },
  { "text": "Conclusion", "level": 1, "children": [] }
]
```

---

### ✅ Hierarchical TOC Builder

```js
function generateTOC(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const headings = [...doc.querySelectorAll("h1,h2,h3,h4,h5,h6")];
  const toc = [];
  const stack = [{ level: 0, children: toc }];

  for (const h of headings) {
    const level = parseInt(h.tagName[1]); // h1 → 1
    const item = { text: h.textContent.trim(), level, children: [] };

    // Pop until we find parent with lower level
    while (stack[stack.length - 1].level >= level) stack.pop();

    stack[stack.length - 1].children.push(item);
    stack.push(item);
  }

  return toc;
}
```

---

## Step 3. Interviewer pushes:

*"Nice! Now make each entry linkable — generate anchor IDs for headings and return TOC with links."*

**Example Input**

```html
<h1 id="intro">Intro</h1>
<h2>Background</h2>
```

**Expected Output**

```json
[
  { "text": "Intro", "id": "intro", "level": 1, "children": [
      { "text": "Background", "id": "background", "level": 2, "children": [] }
  ]}
]
```

---

### ✅ Add Anchor Links

```js
function generateTOC(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const headings = [...doc.querySelectorAll("h1,h2,h3,h4,h5,h6")];
  const toc = [];
  const stack = [{ level: 0, children: toc }];

  for (const h of headings) {
    const level = parseInt(h.tagName[1]);
    const text = h.textContent.trim();
    let id = h.id || text.toLowerCase().replace(/\s+/g, "-");

    // Assign id if missing
    if (!h.id) h.id = id;

    const item = { text, id, level, children: [] };

    while (stack[stack.length - 1].level >= level) stack.pop();

    stack[stack.length - 1].children.push(item);
    stack.push(item);
  }

  return toc;
}
```

---

## Step 4. Interviewer twists:

*"Great, but in an SPA the DOM changes dynamically. How would you keep the TOC updated automatically?"*

---

### ✅ Handle SPA Updates with MutationObserver

```js
function watchTOC(container, callback) {
  function build() {
    const toc = generateTOC(container.innerHTML);
    callback(toc);
  }

  const observer = new MutationObserver(build);
  observer.observe(container, { childList: true, subtree: true });

  build(); // initial
}
```

**Usage**

```js
watchTOC(document.body, toc => {
  console.log("Updated TOC:", toc);
});
```

---

## Step 5. Final Boss Twist:

*"What about performance? Suppose the page has **thousands of headings**, or continuous updates. How do you optimize?"*

---

### ✅ Performance Considerations

* **Debounce TOC rebuilds** (use `requestIdleCallback` or debounce 300ms).
* **Incremental updates**: Instead of rebuilding from scratch, update only changed nodes.
* **Virtualize TOC rendering** if displaying thousands of entries.
* **Lazy updates**: Generate outline only for visible headings (IntersectionObserver).

---

# 🎯 Final Interview Takeaways (TOC Generator)

* ✅ Start simple: extract headings flat.
* ✅ Build hierarchy with stack.
* ✅ Add IDs + anchor links.
* ✅ Handle SPA dynamic updates (MutationObserver).
* ✅ Show **scalability awareness** (debounce, incremental updates).
* ⚡ Bonus: Talk about accessibility (aria-labels, skip links).

