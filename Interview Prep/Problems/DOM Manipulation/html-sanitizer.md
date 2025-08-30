# 🔎 Problem 3: HTML Sanitizer
* Step 1 → Strip unsafe tags (`<script>`, `<iframe>`).
* Step 2 → Remove unsafe attributes (`onclick`, `onerror`).
* Step 3 → Prevent protocol-based attacks (`javascript:` URLs).
* Step 4 → Add whitelist/allowlist support.
* Step 5 → Discuss **real-world scale & perf/security tradeoffs**.

---

## Step 1. Interviewer starts:

*"Write a function that takes an HTML string and removes `<script>` tags."*

**Example Input**

```html
<div>Hello</div><script>alert('XSS')</script>
```

**Expected Output**

```html
<div>Hello</div>
```

---

### ✅ Initial Script Stripping

```js
function sanitizeHTML(input) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(input, "text/html");

  // Remove all <script> tags
  doc.querySelectorAll("script").forEach(el => el.remove());

  return doc.body.innerHTML;
}
```

---

## Step 2. Interviewer adds:

*"Great. But attackers can also use inline event handlers like `<img src=x onerror=alert(1)>`.
Remove all attributes that start with `on*`."*

---

### ✅ Remove Event Handler Attributes

```js
function sanitizeHTML(input) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(input, "text/html");

  // Remove <script>
  doc.querySelectorAll("script").forEach(el => el.remove());

  // Remove inline event handlers
  doc.querySelectorAll("*").forEach(el => {
    [...el.attributes].forEach(attr => {
      if (attr.name.startsWith("on")) {
        el.removeAttribute(attr.name);
      }
    });
  });

  return doc.body.innerHTML;
}
```

---

## Step 3. Interviewer twists:

*"Nice, but what about `javascript:` links? E.g. `<a href="javascript:alert(1)">Click</a>`?"*

---

### ✅ Strip Dangerous Protocols

```js
function sanitizeHTML(input) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(input, "text/html");

  // Remove <script>
  doc.querySelectorAll("script").forEach(el => el.remove());

  // Clean attributes
  doc.querySelectorAll("*").forEach(el => {
    [...el.attributes].forEach(attr => {
      const name = attr.name;
      const value = attr.value;

      // Remove event handlers
      if (name.startsWith("on")) {
        el.removeAttribute(name);
      }

      // Remove javascript: URLs
      if (["href", "src", "xlink:href"].includes(name.toLowerCase())) {
        if (value.trim().toLowerCase().startsWith("javascript:")) {
          el.removeAttribute(name);
        }
      }
    });
  });

  return doc.body.innerHTML;
}
```

---

## Step 4. Interviewer pushes:

*"Cool. But sometimes we **need iframes** (e.g. embedding YouTube).
Can you implement an **allowlist/whitelist** of tags & attributes?"*

---

### ✅ Add Whitelist Support

```js
function sanitizeHTML(input, options = {}) {
  const allowedTags = options.allowedTags || ["b", "i", "em", "strong", "a", "p", "div", "span", "ul", "li", "ol", "h1","h2","h3","img"];
  const allowedAttrs = options.allowedAttrs || { 
    a: ["href"], 
    img: ["src", "alt"], 
    "*": ["class", "id"] 
  };

  const parser = new DOMParser();
  const doc = parser.parseFromString(input, "text/html");

  doc.querySelectorAll("*").forEach(el => {
    if (!allowedTags.includes(el.tagName.toLowerCase())) {
      el.remove();
      return;
    }

    [...el.attributes].forEach(attr => {
      const tag = el.tagName.toLowerCase();
      const attrAllowed = (allowedAttrs[tag] || []).concat(allowedAttrs["*"] || []);
      if (!attrAllowed.includes(attr.name)) {
        el.removeAttribute(attr.name);
      }

      // Block javascript: URLs
      if (["href", "src"].includes(attr.name) && attr.value.trim().toLowerCase().startsWith("javascript:")) {
        el.removeAttribute(attr.name);
      }
    });
  });

  return doc.body.innerHTML;
}
```

---

## Step 5. Interviewer final boss:

*"What about **performance and security tradeoffs**?
How would your sanitizer behave on huge HTML blobs or with malicious crafted inputs?"*

---

### ✅ Performance & Security Considerations

* **Performance**:

  * DOMParser = O(n) parsing.
  * Traversal = O(n) over all nodes.
  * For very large HTML, debounce sanitization (if user types in editor).

* **Security**:

  * Must keep up with new XSS tricks (SVG `<animate>`, `<foreignObject>`).
  * CSP (Content Security Policy) headers are complementary defense.
  * Real apps use **battle-tested libs** → DOMPurify.

* **Real-world tradeoffs**:

  * Too strict → breaks features (e.g. no iframes for embeds).
  * Too loose → risk of XSS.
  * Solution → configurable whitelist + layered defenses (CSP + sanitizer).

---

# 🎯 Final Interview Takeaways (HTML Sanitizer)

* ✅ Step 1: Strip `<script>`.
* ✅ Step 2: Strip inline `on*` attributes.
* ✅ Step 3: Prevent `javascript:` URLs.
* ✅ Step 4: Add whitelist for safe tags/attrs.
* ✅ Step 5: Discuss perf & security tradeoffs (CSP, DOMPurify, evolving XSS).
