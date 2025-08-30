# 🔎 Problem 1: Build a Virtual DOM (mini React)
* Step 1 → Start simple (render only).
* Step 2 → Add updates.
* Step 3 → Add diff/patch.
* Step 4 → Add keyed diff optimization.
* Step 5 → Interviewer pushes perf/security discussions.

---

## Step 1. Interviewer starts:

*"Implement a function that takes a simple Virtual DOM tree and renders it into a real DOM tree."*

**Input Virtual DOM:**

```js
const vdom = {
  type: "div",
  props: { id: "container" },
  children: [
    { type: "h1", props: {}, children: ["Hello"] },
    { type: "p", props: {}, children: ["World"] }
  ]
};
```

**Expected DOM:**

```html
<div id="container">
  <h1>Hello</h1>
  <p>World</p>
</div>
```

---

### ✅ Initial Render Function

```js
function createElement(vnode) {
  // Handle text nodes
  if (typeof vnode === "string") {
    return document.createTextNode(vnode);
  }

  // Create element
  const el = document.createElement(vnode.type);

  // Apply props
  for (const [key, value] of Object.entries(vnode.props || {})) {
    el.setAttribute(key, value);
  }

  // Append children
  vnode.children.forEach(child => el.appendChild(createElement(child)));

  return el;
}

// Usage
document.body.appendChild(createElement(vdom));
```

---

## Step 2. Interviewer adds:

*"Great. Now support updating the DOM when the Virtual DOM changes."*

**New Virtual DOM:**

```js
const vdom2 = {
  type: "div",
  props: { id: "container" },
  children: [
    { type: "h1", props: {}, children: ["Hi"] },
    { type: "p", props: {}, children: ["Everyone"] }
  ]
};
```

Expected: Only text nodes should update, not re-create entire DOM.

---

### ✅ Add Diff + Patch

```js
function updateElement(parent, newVNode, oldVNode, index = 0) {
  const existing = parent.childNodes[index];

  // Case 1: No old node → append new
  if (!oldVNode) {
    parent.appendChild(createElement(newVNode));
  }
  // Case 2: No new node → remove old
  else if (!newVNode) {
    parent.removeChild(existing);
  }
  // Case 3: Node type changed → replace
  else if (typeof newVNode !== typeof oldVNode ||
           (typeof newVNode === "string" && newVNode !== oldVNode) ||
           newVNode.type !== oldVNode.type) {
    parent.replaceChild(createElement(newVNode), existing);
  }
  // Case 4: Same type → update props + recurse children
  else if (newVNode.type) {
    // Update attributes
    const newProps = newVNode.props || {};
    const oldProps = oldVNode.props || {};

    for (const [k, v] of Object.entries(newProps)) {
      if (oldProps[k] !== v) existing.setAttribute(k, v);
    }
    for (const k in oldProps) {
      if (!(k in newProps)) existing.removeAttribute(k);
    }

    // Diff children
    const maxLen = Math.max(newVNode.children.length, oldVNode.children.length);
    for (let i = 0; i < maxLen; i++) {
      updateElement(existing, newVNode.children[i], oldVNode.children[i], i);
    }
  }
}
```

---

## Step 3. Interviewer pushes:

*"But in real React, lists are common. Can you optimize updates when elements move around?"*

Example:

```js
Old: <ul><li>A</li><li>B</li><li>C</li></ul>  
New: <ul><li>B</li><li>C</li><li>A</li></ul>  
```

A naive diff would re-render all `<li>`. React uses **keys** to optimize.

---

### ✅ Add Keyed Diff

```js
function updateChildren(parent, newChildren, oldChildren) {
  const keyed = {};
  oldChildren.forEach((c, i) => {
    if (c.key) keyed[c.key] = { vnode: c, index: i };
  });

  let lastIndex = 0;
  newChildren.forEach((newVNode, i) => {
    const oldMatch = newVNode.key ? keyed[newVNode.key] : null;

    if (oldMatch) {
      updateElement(parent, newVNode, oldMatch.vnode, oldMatch.index);
      if (oldMatch.index < lastIndex) {
        // Move DOM node
        parent.insertBefore(parent.childNodes[oldMatch.index], parent.childNodes[i]);
      }
      lastIndex = Math.max(lastIndex, oldMatch.index);
    } else {
      updateElement(parent, newVNode, null, i);
    }
  });

  // Remove extra old children
  oldChildren.slice(newChildren.length).forEach((c, i) => {
    updateElement(parent, null, c, newChildren.length + i);
  });
}
```

---

## Step 4. Interviewer twists:

*"What about performance on very large trees (10k nodes)? How would you optimize further?"*

---

### ✅ Performance Discussion

* **Batch updates**: Instead of applying each diff immediately, collect changes → batch apply (React Fiber).
* **requestIdleCallback**: Spread work across multiple frames to avoid blocking UI.
* **Windowing/virtualization**: Don’t render off-screen elements (React Virtualized).
* **Static subtrees**: Skip diffing when subtree unchanged (React `PureComponent`, `memo`).

---

## Step 5. Final Boss Twist:

*"What about security? If VDOM text comes from user input, what prevents XSS?"*

---

### ✅ Security Considerations

* Escape text nodes (`<script>` should render as text, not run).
* Whitelist attributes (block `onerror`, `onclick`).
* Sanitize input before inserting into DOM.

---

# 🎯 Final Interview Takeaways (Virtual DOM)

* ✅ Start simple (render from JSON → DOM).
* ✅ Add diff + patch.
* ✅ Add keyed diff for list reordering.
* ✅ Discuss performance (batching, Fiber, virtualization).
* ✅ Mention security (XSS sanitization).