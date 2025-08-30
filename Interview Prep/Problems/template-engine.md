# 🔎 Problem 1: Build a Templating Engine

---

## Step 1. Interviewer starts:

*"Write a simple templating engine that supports variable substitution."*

**Example Input:**

```txt
Hello {{name}}, welcome!
```

**Context:**

```js
{ name: "Alice" }
```

**Expected Output:**

```txt
Hello Alice, welcome!
```

---

### ✅ Initial Solution

```js
function renderTemplate(template, context) {
  return template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    key = key.trim();
    return key in context ? context[key] : "";
  });
}

console.log(renderTemplate("Hello {{name}}!", { name: "Alice" }));
// Hello Alice!
```

**Complexity:**

* O(n) where n = template length.

**Interviewer Expectation:**

* Show regex use.
* Handle missing variables gracefully.

---

## Step 2. Interviewer adds:

*"Great. Now add support for conditionals like `{% if isAdmin %}Welcome Admin{% endif %}`."*

**Example Input:**

```txt
Hello {{name}}! 
{% if isAdmin %}Welcome Admin{% endif %}
```

**Context:**

```js
{ name: "Alice", isAdmin: true }
```

**Expected Output:**

```txt
Hello Alice! 
Welcome Admin
```

---

### ✅ Extended Solution

```js
function renderTemplate(template, context) {
  // Handle conditionals
  template = template.replace(/\{% if (.*?) %\}([\s\S]*?)\{% endif %\}/g, (_, condition, content) => {
    return context[condition.trim()] ? content : "";
  });

  // Handle variables
  template = template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    key = key.trim();
    return key in context ? context[key] : "";
  });

  return template;
}
```

**Complexity:**

* Still O(n) parsing + substitutions.

**Interviewer Expectation:**

* Regex handling of blocks.
* Think about **nested ifs** (might fail now).

---

## Step 3. Interviewer twists:

*"What if I want to support loops? Like `{% for item in items %}{{item}}{% endfor %}`."*

**Example Input:**

```txt
Shopping List:
{% for item in items %}- {{item}}{% endfor %}
```

**Context:**

```js
{ items: ["Milk", "Eggs", "Bread"] }
```

**Expected Output:**

```txt
Shopping List:
- Milk
- Eggs
- Bread
```

---

### ✅ Add Loop Support

```js
function renderTemplate(template, context) {
  // Handle loops
  template = template.replace(/\{% for (\w+) in (\w+) %\}([\s\S]*?)\{% endfor %\}/g,
    (_, varName, arrName, content) => {
      const arr = context[arrName];
      if (!Array.isArray(arr)) return "";
      return arr.map(item => {
        const scoped = { ...context, [varName]: item };
        return renderTemplate(content, scoped);
      }).join("");
    }
  );

  // Handle conditionals
  template = template.replace(/\{% if (.*?) %\}([\s\S]*?)\{% endif %\}/g, (_, condition, content) => {
    return context[condition.trim()] ? content : "";
  });

  // Handle variables
  template = template.replace(/\{\{(.*?)\}\}/g, (_, key) => {
    key = key.trim();
    return key in context ? context[key] : "";
  });

  return template;
}
```

**Interviewer Expectation:**

* Handle recursion for nested templates.
* Correctly substitute loop vars.

---

## Step 4. Interviewer pushes harder:

*"How would you handle nested conditionals and loops? What about invalid templates?"*

**Discussion Points:**

* Build a **parser/AST** instead of regex.
* Steps: tokenize → parse → evaluate.
* Tradeoff: more robust but more complex.

---

### ✅ Pseudo-AST Approach (High-Level)

1. Tokenize template:

   * Variables → `{{ name }}`
   * Blocks → `{% if ... %}`, `{% for ... %}`.
2. Build AST nodes:

   ```json
   { "type": "If", "condition": "isAdmin", "body": [...] }
   ```
3. Evaluate AST with context.

**Why this matters:**

* Regex = quick hack.
* AST = scalable, handles nesting properly.
* Real-world templating engines (Mustache, Handlebars) → AST based.

---

## Step 5. Interviewer final twist:

*"How do you prevent XSS if template variables come from untrusted sources?"*

**Answer:**

* Escape HTML special chars (`<`, `>`, `"`, `&`).
* Example: `<script>` should become `&lt;script&gt;`.

```js
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
```

---

## 🎯 Final Interview Takeaways (Templating Engine)

* ✅ Start simple → substitution with regex.
* ✅ Add conditionals + loops incrementally.
* ✅ Mention recursion for nesting.
* ✅ Suggest AST for robustness.
* ✅ Highlight **XSS prevention** (shows security awareness).
