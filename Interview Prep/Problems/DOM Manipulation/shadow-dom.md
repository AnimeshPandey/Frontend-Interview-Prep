# 🔎 Problem 5: Shadow DOM Simulation (Manual Scoping)
* Step 1 → Scope CSS selectors to a container.
* Step 2 → Handle classes, IDs, tags.
* Step 3 → Handle combinators.
* Step 4 → Handle `:host`-like selectors.
* Step 5 → Discuss real-world tradeoffs (perf, browser vs polyfill).

---

## Step 1. Interviewer starts:

*"Implement a function that takes a CSS string and a `scopeId`, and prefixes all selectors with that ID to simulate style scoping."*

**Input**

```css
h1 { color: red; }
p { font-size: 14px; }
```

**Scope ID:** `#my-scope`

**Expected Output**

```css
#my-scope h1 { color: red; }
#my-scope p { font-size: 14px; }
```

---

### ✅ Basic Prefixing

```js
function scopeCSS(css, scopeId) {
  return css.replace(/(^|\})([^{}]+)\{/g, (match, before, selector) => {
    const scoped = selector
      .split(",")
      .map(s => `${scopeId} ${s.trim()}`)
      .join(", ");
    return `${before}${scoped} {`;
  });
}

// Example
console.log(scopeCSS("h1 { color:red; } p { font-size:14px; }", "#my-scope"));
```

---

## Step 2. Interviewer adds:

*"Good. Now support **class selectors, IDs, tags, multiple selectors in one rule**."*

**Input**

```css
h1, .title, #main { color: blue; }
```

**Expected Output**

```css
#my-scope h1, #my-scope .title, #my-scope #main { color: blue; }
```

✅ Already handled in our split/join logic — so we’d just demonstrate that.

---

## Step 3. Interviewer twists:

*"What about **combinators** (`div > p`, `ul li`, `a + b`)?
We need to preserve structure but still prefix correctly."*

**Input**

```css
div > p { margin: 0; }
```

**Expected Output**

```css
#my-scope div > p { margin: 0; }
```

---

### ✅ Handle Combinators Safely

We only scope the **leftmost selector** in a chain:

```js
function scopeCSS(css, scopeId) {
  return css.replace(/(^|\})([^{}]+)\{/g, (match, before, selector) => {
    const scoped = selector
      .split(",")
      .map(s => {
        s = s.trim();
        return s.startsWith(scopeId) ? s : `${scopeId} ${s}`;
      })
      .join(", ");
    return `${before}${scoped} {`;
  });
}
```

This ensures combinators like `>` `+` `~` are untouched, but prefixed at the beginning.

---

## Step 4. Interviewer final twist:

*"Nice. But the **real Shadow DOM has `:host`** to reference the component root.
Can you support that?"*

**Input**

```css
:host { display: block; }
:host(.active) { border: 1px solid red; }
```

**Scope ID = `#my-scope`**

**Expected Output**

```css
#my-scope { display: block; }
#my-scope.active { border: 1px solid red; }
```

---

### ✅ Handle \:host

```js
function scopeCSS(css, scopeId) {
  return css
    // Handle :host first
    .replace(/:host(\([^)]+\))?/g, (match, cond) => {
      return cond ? `${scopeId}${cond}` : scopeId;
    })
    // Then scope everything else
    .replace(/(^|\})([^{}]+)\{/g, (match, before, selector) => {
      const scoped = selector
        .split(",")
        .map(s => (s.includes(scopeId) ? s : `${scopeId} ${s.trim()}`))
        .join(", ");
      return `${before}${scoped} {`;
    });
}
```

---

## Step 5. Interviewer: Performance & Real-World

*"How would this perform on a **large stylesheet (10k+ rules)**?
How does this compare to the browser’s real Shadow DOM?"*

---

### ✅ Performance & Real-World Considerations

* **Our regex approach**:

  * O(n) where n = CSS length.
  * Fine for small/medium CSS.
  * Costly for **very large stylesheets** (lots of regex parsing).
* **Browsers’ real Shadow DOM**:

  * Implemented at C++ engine level → way faster.
  * Uses **style encapsulation** instead of string rewriting.
* **Polyfills (ShadyCSS)**:

  * Do exactly this string transformation.
  * Add overhead on load time (parse + rewrite rules).
* **Optimizations**:

  * Parse CSS into AST (PostCSS style).
  * Only scope rules for shadowed components.
  * Cache transformed rules.

---

# 🎯 Final Interview Takeaways (Shadow DOM Simulation)

* ✅ Step 1: Prefix selectors with scope ID.
* ✅ Step 2: Support multiple selectors, classes, IDs.
* ✅ Step 3: Handle combinators (`>`, `+`, `~`, whitespace).
* ✅ Step 4: Support `:host` → scope root.
* ✅ Step 5: Discuss **perf tradeoffs** vs real Shadow DOM & ShadyCSS.