# 🔎 Problem 21: CSS Cascade Simulator
* Step 1 → Apply simple rules by order.
* Step 2 → Add **specificity calculation** (id > class > tag).
* Step 3 → Handle **inline styles** (highest priority).
* Step 4 → Add **inheritance** (e.g., `font-family`).
* Step 5 → Discuss **browser optimizations & tradeoffs**.

---

## Step 1. Interviewer starts:

*"Implement a function that applies CSS rules to an element and returns final computed styles. Start with order-based rules only."*

---

### ✅ Simple Cascade (Last Rule Wins)

```js
function applyCSS(rules, element) {
  const styles = {};

  for (const rule of rules) {
    if (element.matches(rule.selector)) {
      Object.assign(styles, rule.declarations);
    }
  }
  return styles;
}

// Example
const rules = [
  { selector: "p", declarations: { color: "red" } },
  { selector: ".highlight", declarations: { color: "blue" } }
];

const el = document.createElement("p");
el.className = "highlight";
console.log(applyCSS(rules, el));
// { color: "blue" } (last wins)
```

✔ Works, but **ignores specificity**.

---

## Step 2. Interviewer adds:

*"Good. But rules should follow **specificity** (id > class > tag). Implement specificity calculation."*

---

### ✅ Add Specificity

```js
function computeSpecificity(selector) {
  const idCount = (selector.match(/#/g) || []).length;
  const classCount = (selector.match(/\./g) || []).length;
  const tagCount = (selector.match(/^[a-z]+/gi) || []).length;
  return [idCount, classCount, tagCount]; // higher = stronger
}

function compareSpecificity(a, b) {
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return 0; // equal
}

function applyCSS(rules, element) {
  let applied = [];

  rules.forEach((rule, idx) => {
    if (element.matches(rule.selector)) {
      applied.push({ specificity: computeSpecificity(rule.selector), idx, declarations: rule.declarations });
    }
  });

  applied.sort((a, b) =>
    compareSpecificity(a.specificity, b.specificity) || a.idx - b.idx
  );

  return Object.assign({}, ...applied.map(r => r.declarations));
}

// Example
const rules = [
  { selector: "p", declarations: { color: "red" } },
  { selector: ".highlight", declarations: { color: "blue" } },
  { selector: "#main", declarations: { color: "green" } }
];

const el = document.createElement("p");
el.id = "main";
el.className = "highlight";
console.log(applyCSS(rules, el));
// { color: "green" } (id > class > tag)
```

✔ Correctly applies specificity.

---

## Step 3. Interviewer twists:

*"What about **inline styles** (`style=""`)? They should override everything."*

---

### ✅ Handle Inline Styles

```js
function applyCSS(rules, element) {
  let applied = [];

  rules.forEach((rule, idx) => {
    if (element.matches(rule.selector)) {
      applied.push({ specificity: computeSpecificity(rule.selector), idx, declarations: rule.declarations });
    }
  });

  applied.sort((a, b) =>
    compareSpecificity(a.specificity, b.specificity) || a.idx - b.idx
  );

  let finalStyles = Object.assign({}, ...applied.map(r => r.declarations));

  // Inline styles override
  if (element.getAttribute("style")) {
    const inlineStyles = {};
    element.getAttribute("style").split(";").forEach(pair => {
      const [key, value] = pair.split(":").map(s => s.trim());
      if (key) inlineStyles[key] = value;
    });
    Object.assign(finalStyles, inlineStyles);
  }

  return finalStyles;
}
```

✔ Inline wins all.

---

## Step 4. Interviewer final twist:

*"Great. Now add **inheritance**. Some CSS properties (like `font-family`, `color`) should inherit from parent if not set."*

---

### ✅ Inheritance Support

```js
const inheritableProps = ["color", "font-family", "line-height"];

function applyCSSRecursive(rules, element) {
  let styles = applyCSS(rules, element);

  if (element.parentElement) {
    const parentStyles = applyCSSRecursive(rules, element.parentElement);
    for (let prop of inheritableProps) {
      if (!(prop in styles)) styles[prop] = parentStyles[prop];
    }
  }

  return styles;
}
```

✔ Inherits values from parent.

---

## Step 5. Interviewer final boss:

*"How does this compare to browsers? What are performance tradeoffs?"*

---

### ✅ Performance & Real-World Discussion

* **Our simulator**:

  * O(n) rule matching per element.
  * Inefficient for large stylesheets (10k rules × 1k elements).

* **Browsers**:

  * Precompile selectors into **selector engines** (fast matching).
  * Maintain **CSSOM** (CSS Object Model).
  * Use **style recalculation + invalidation** instead of recomputing from scratch.
  * Cache specificity results.

* **Tradeoffs**:

  * Correct but slow in JS.
  * Browsers optimize heavily with C++ selector engines.

* **Frontend Use Cases**:

  * CSS-in-JS libraries simulate cascade rules (emotion, styled-components).
  * Style debugging tools (Chrome DevTools).

---

# 🎯 Final Interview Takeaways (CSS Cascade Simulator)

* ✅ Step 1: Apply rules by order.
* ✅ Step 2: Add specificity calculation.
* ✅ Step 3: Inline overrides everything.
* ✅ Step 4: Add inheritance from parents.
* ✅ Step 5: Discuss scaling, CSSOM, real browsers.