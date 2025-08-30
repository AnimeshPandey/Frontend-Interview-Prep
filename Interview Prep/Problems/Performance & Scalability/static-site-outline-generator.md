# 🔎 Problem 20: Static Site Outline Generator (TOC)
* Step 1 → Extract headings from one HTML document.
* Step 2 → Generate a nested TOC (H1 → H2 → H3).
* Step 3 → Add anchor links (`<a href="#id">`).
* Step 4 → Scale to multiple docs (1k HTML files).
* Step 5 → Discuss perf tradeoffs, real-world usage.
---

## Step 1. Interviewer starts:

*"Write a function that extracts all `<h1>...<h6>` headings from an HTML string."*

---

### ✅ Extract Headings

```js
function extractHeadings(html) {
  const container = document.createElement("div");
  container.innerHTML = html;
  return [...container.querySelectorAll("h1, h2, h3, h4, h5, h6")].map(el => ({
    text: el.textContent,
    level: parseInt(el.tagName[1], 10)
  }));
}

// Example
const html = `
  <h1>Intro</h1>
  <h2>Getting Started</h2>
  <h3>Install</h3>
`;
console.log(extractHeadings(html));
/*
[
  { text: "Intro", level: 1 },
  { text: "Getting Started", level: 2 },
  { text: "Install", level: 3 }
]
*/
```

---

## Step 2. Interviewer says:

*"Good. Now nest headings into a proper tree structure (outline)."*

---

### ✅ Build Nested TOC Tree

```js
function buildTOC(headings) {
  const root = [];
  const stack = [{ children: root, level: 0 }];

  for (const h of headings) {
    while (stack.length && h.level <= stack[stack.length - 1].level) {
      stack.pop(); // go up until parent level
    }
    const node = { ...h, children: [] };
    stack[stack.length - 1].children.push(node);
    stack.push(node);
  }
  return root;
}

// Example
const headings = [
  { text: "Intro", level: 1 },
  { text: "Getting Started", level: 2 },
  { text: "Install", level: 3 }
];
console.log(buildTOC(headings));
/*
[
  {
    text: "Intro", level: 1, children: [
      {
        text: "Getting Started", level: 2, children: [
          { text: "Install", level: 3, children: [] }
        ]
      }
    ]
  }
]
*/
```

---

## Step 3. Interviewer twists:

*"Nice. Now add **links** so TOC can link to headings (`<a href="#id">`)."*

---

### ✅ Add IDs + Anchor Links

```js
function generateTOCHTML(tocTree) {
  const ul = document.createElement("ul");

  tocTree.forEach(node => {
    const li = document.createElement("li");
    const id = node.text.toLowerCase().replace(/\s+/g, "-");
    const a = document.createElement("a");
    a.href = "#" + id;
    a.textContent = node.text;

    li.appendChild(a);
    if (node.children.length) {
      li.appendChild(generateTOCHTML(node.children));
    }
    ul.appendChild(li);
  });

  return ul;
}
```

✔ Outputs a nested `<ul>` with links to sections.

---

## Step 4. Interviewer pushes:

*"Now scale this to **1,000 HTML docs**. What’s your approach?"*

---

### ✅ Scaling to Many Docs

* **Naive approach**: parse each file → build TOC → concatenate.
* **Optimizations**:

  * Parse with **streaming HTML parser** (don’t load entire string in memory).
  * Precompute headings offline at build time (Static Site Generator).
  * Cache TOC JSON → serve incrementally in SPA.

```js
async function generateSiteTOC(htmlFiles) {
  return htmlFiles.map(html => {
    const headings = extractHeadings(html);
    return buildTOC(headings);
  });
}
```

✔ For SPAs, generate per page → lazy load TOC.

---

## Step 5. Interviewer final boss:

*"How does this compare to real-world docs (Google Docs outline, MDX docs sites)? What are the tradeoffs?"*

---

### ✅ Performance & Real-World Discussion

* **Time Complexity**: O(n) per doc, where n = number of headings.
* **Scaling**: 1k docs → still fine in JS, but better to **precompute TOC** at build time.
* **Tradeoffs**:

  * Client-side generation = dynamic, but more work on user device.
  * Server-side generation = faster page load, but less dynamic.
* **Real Systems**:

  * Google Docs → real-time updates as headings are edited.
  * MDX/Next.js → generate TOC during build using Markdown AST (remark).
* **Edge Cases**:

  * Duplicate heading text → must ensure unique IDs.
  * Deep nesting (H1 → H6) → must limit to avoid giant lists.
* **Enhancements**:

  * Collapsible TOC (accordion).
  * Scroll spy (highlight active section).
  * Searchable TOC.

---

# 🎯 Final Interview Takeaways (Static Site TOC)

* ✅ Step 1: Extract headings.
* ✅ Step 2: Build nested outline tree.
* ✅ Step 3: Add anchor links.
* ✅ Step 4: Scale to 1k docs (streaming, precompute, caching).
* ✅ Step 5: Compare to real-world docs (Google Docs, MDX).
