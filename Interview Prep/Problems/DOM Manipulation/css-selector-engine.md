# 🔎 Problem 2: CSS Selector Engine (mini querySelectorAll)
* Step 1 → Basic tag matching.
* Step 2 → Add `#id` and `.class`.
* Step 3 → Add attribute selectors.
* Step 4 → Add combinators (`div p`, `div > p`).
* Step 5 → Discuss performance & scaling.

---

## Step 1. Interviewer starts:

*"Implement a function that finds all elements by tag name (like `getElementsByTagName`)."*

**Example Input**

```html
<div><p>Hi</p><p>Hello</p></div>
```

```js
cssSelect("p", document.body);
```

**Expected Output:** Array of `<p>` elements.

---

### ✅ Initial Tag Selector

```js
function cssSelect(selector, root = document) {
  const result = [];

  function traverse(node) {
    if (node.nodeType !== 1) return; // skip text/comments
    if (node.tagName.toLowerCase() === selector.toLowerCase()) {
      result.push(node);
    }
    for (const child of node.children) {
      traverse(child);
    }
  }

  traverse(root);
  return result;
}
```

---

## Step 2. Interviewer adds:

*"Now add support for `#id` and `.class` selectors."*

**Examples**

```js
cssSelect("#main", document);   // [element with id=main]
cssSelect(".item", document);   // [elements with class=item]
```

---

### ✅ Add ID and Class Matching

```js
function match(node, selector) {
  if (selector.startsWith("#")) {
    return node.id === selector.slice(1);
  }
  if (selector.startsWith(".")) {
    return node.classList.contains(selector.slice(1));
  }
  return node.tagName.toLowerCase() === selector.toLowerCase();
}

function cssSelect(selector, root = document) {
  const result = [];

  function traverse(node) {
    if (node.nodeType !== 1) return;
    if (match(node, selector)) result.push(node);
    for (const child of node.children) traverse(child);
  }

  traverse(root);
  return result;
}
```

---

## Step 3. Interviewer adds:

*"Good. Now support **attribute selectors**, like `[data-id="123"]` or `[disabled]`."*

---

### ✅ Add Attribute Support

```js
function match(node, selector) {
  if (selector.startsWith("#")) {
    return node.id === selector.slice(1);
  }
  if (selector.startsWith(".")) {
    return node.classList.contains(selector.slice(1));
  }
  if (selector.startsWith("[")) {
    const attrMatch = selector.match(/\[(\w+)(?:="([^"]*)")?\]/);
    if (!attrMatch) return false;
    const [, attr, value] = attrMatch;
    if (value) return node.getAttribute(attr) === value;
    return node.hasAttribute(attr);
  }
  return node.tagName.toLowerCase() === selector.toLowerCase();
}
```

---

## Step 4. Interviewer twists:

\*"Nice! Now add **combinator selectors**:

* `div p` (descendant)
* `div > p` (direct child)
* `div + p` (adjacent sibling)
* `div ~ p` (general sibling)."\*

---

### ✅ Add Combinators (Simplified)

```js
function cssSelect(selector, root = document) {
  const parts = selector.split(/\s+(?=[>+~]?\s*)/); // naive split by spaces
  let currentSet = [root];

  for (const part of parts) {
    const nextSet = [];
    for (const node of currentSet) {
      nextSet.push(...findMatches(node, part));
    }
    currentSet = nextSet;
  }
  return currentSet;
}

function findMatches(root, part) {
  const result = [];
  const directChild = part.startsWith(">");
  const adjSibling = part.startsWith("+");
  const genSibling = part.startsWith("~");

  const clean = part.replace(/^[>+~]\s*/, "");

  if (directChild) {
    for (const child of root.children) {
      if (match(child, clean)) result.push(child);
    }
  } else if (adjSibling || genSibling) {
    let sibling = root.nextElementSibling;
    while (sibling) {
      if (match(sibling, clean)) result.push(sibling);
      if (adjSibling) break;
      sibling = sibling.nextElementSibling;
    }
  } else {
    // descendant
    function traverse(node) {
      if (node.nodeType !== 1) return;
      if (match(node, clean)) result.push(node);
      for (const child of node.children) traverse(child);
    }
    traverse(root);
  }

  return result;
}
```

---

## Step 5. Interviewer final boss:

*"Great, but what about **performance**? How would your engine behave on a DOM with 100k nodes? How does the real browser optimize querySelectorAll?"*

---

### ✅ Performance Discussion

* **Naive traversal** = O(n) per selector (fine for small DOMs).
* **Browsers optimize heavily**:

  * Right-to-left matching (start from last part of selector, walk upward).
  * Indexing IDs and classes in hash maps.
  * Attribute selectors → hash-based lookup.
* **For large DOMs**:

  * Pre-index nodes by tag, class, id.
  * Use lazy generators instead of arrays.
  * Cache results if selector repeats.

---

# 🎯 Final Interview Takeaways (CSS Selector Engine)

* ✅ Start small: tag selectors.
* ✅ Add id/class.
* ✅ Add attributes.
* ✅ Add combinators.
* ✅ Discuss perf (right-to-left matching, caching, indexing).
* ⚡ Bonus: mention pseudo-selectors (`:nth-child`, `:hover`) but mark as out of scope.
