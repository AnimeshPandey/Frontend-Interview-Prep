# 🔎 Problem 4: Markdown → HTML Converter
* Step 1 → Handle basic headings & paragraphs.
* Step 2 → Add bold/italic inline formatting.
* Step 3 → Add lists.
* Step 4 → Handle nesting (lists inside lists, bold inside headings).
* Step 5 → Discuss performance & scalability.

---

## Step 1. Interviewer starts:

*"Write a simple function that converts `# Heading` into `<h1>` and plain text into `<p>`."*

**Example Input**

```md
# Hello
This is a paragraph.
```

**Expected Output**

```html
<h1>Hello</h1>
<p>This is a paragraph.</p>
```

---

### ✅ Basic Headings & Paragraphs

```js
function markdownToHTML(markdown) {
  const lines = markdown.split("\n");
  const html = lines.map(line => {
    if (line.startsWith("# ")) {
      return `<h1>${line.slice(2)}</h1>`;
    } else if (line.trim()) {
      return `<p>${line}</p>`;
    }
    return "";
  });
  return html.join("\n");
}
```

---

## Step 2. Interviewer adds:

*"Good. Now support inline formatting for **bold** (`**text**`) and *italic* (`*text*`)."*

---

### ✅ Inline Bold & Italic

```js
function parseInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") // bold
    .replace(/\*(.+?)\*/g, "<em>$1</em>"); // italic
}

function markdownToHTML(markdown) {
  const lines = markdown.split("\n");
  const html = lines.map(line => {
    if (line.startsWith("# ")) {
      return `<h1>${parseInline(line.slice(2))}</h1>`;
    } else if (line.trim()) {
      return `<p>${parseInline(line)}</p>`;
    }
    return "";
  });
  return html.join("\n");
}
```

**Example Input**

```md
# Title
This is **bold** and *italic*.
```

**Output**

```html
<h1>Title</h1>
<p>This is <strong>bold</strong> and <em>italic</em>.</p>
```

---

## Step 3. Interviewer twists:

*"Nice. Add support for unordered lists (`- item`) and ordered lists (`1. item`)."*

---

### ✅ Add Lists

```js
function markdownToHTML(markdown) {
  const lines = markdown.split("\n");
  let html = "";
  let inList = false;

  for (let line of lines) {
    if (/^# /.test(line)) {
      html += `<h1>${parseInline(line.slice(2))}</h1>`;
    } else if (/^\d+\.\s+/.test(line)) { // ordered list
      if (!inList) { html += "<ol>"; inList = "ol"; }
      html += `<li>${parseInline(line.replace(/^\d+\.\s+/, ""))}</li>`;
    } else if (/^-\s+/.test(line)) { // unordered list
      if (!inList) { html += "<ul>"; inList = "ul"; }
      html += `<li>${parseInline(line.replace(/^-+\s+/, ""))}</li>`;
    } else {
      if (inList) { html += inList === "ol" ? "</ol>" : "</ul>"; inList = false; }
      if (line.trim()) html += `<p>${parseInline(line)}</p>`;
    }
  }
  if (inList) html += inList === "ol" ? "</ol>" : "</ul>";
  return html;
}
```

**Input**

```md
# Shopping List
- Milk
- Eggs
1. First
2. Second
```

**Output**

```html
<h1>Shopping List</h1>
<ul>
  <li>Milk</li>
  <li>Eggs</li>
</ul>
<ol>
  <li>First</li>
  <li>Second</li>
</ol>
```

---

## Step 4. Interviewer pushes:

*"Can you handle **nesting**? Example: bold inside a heading, or a list inside another list."*

---

### ✅ Handle Nesting

For **inline nesting**, we already did (bold/italic inside headings).
For **nested lists**, we’d need **recursive parsing**:

```js
function parseList(lines, index, ordered) {
  let html = ordered ? "<ol>" : "<ul>";
  while (index < lines.length) {
    const line = lines[index];
    if ((ordered && /^\d+\.\s+/.test(line)) || (!ordered && /^-\s+/.test(line))) {
      html += `<li>${parseInline(line.replace(/^\d+\.|-/, "").trim())}`;
      // Look ahead for nested list
      if (lines[index + 1] && /^\s+-/.test(lines[index + 1])) {
        const [nested, newIndex] = parseList(lines, index + 1, false);
        html += nested;
        index = newIndex;
      }
      html += "</li>";
    } else break;
    index++;
  }
  html += ordered ? "</ol>" : "</ul>";
  return [html, index];
}
```

---

## Step 5. Interviewer final boss:

*"Cool. What about performance on **large docs (10k lines of Markdown)**? How does your solution scale compared to real libraries like marked.js?"*

---

### ✅ Performance Discussion

* Current regex approach = O(n \* m) where n = lines, m = regex complexity.
* **Optimizations:**

  * Tokenize once into tokens (`HEADING`, `LIST_ITEM`, `TEXT`).
  * Build AST → then generate HTML in single pass.
  * Streaming parse (line by line, lazy evaluation).
* Real-world libraries (marked.js, markdown-it):

  * Tokenizer + parser phases.
  * Extensions/plugins for GFM (tables, code blocks).

**Security Note:**

* Always sanitize output HTML (to prevent malicious Markdown injection).
* Example: `[Click me](javascript:alert(1))`.

---

# 🎯 Final Interview Takeaways (Markdown → HTML Converter)

* ✅ Step 1: Headings + paragraphs.
* ✅ Step 2: Inline bold/italic.
* ✅ Step 3: Lists (ordered/unordered).
* ✅ Step 4: Nesting (inline + recursive lists).
* ✅ Step 5: Discuss AST-based parsing for performance/scalability.
* ⚡ Bonus: Security (escape HTML, prevent script injection).
