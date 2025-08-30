# 🔎 Problem 25: i18n Framework (Translation, Pluralization, Locale Fallback)
* Step 1 → Simple key → value translation.
* Step 2 → Add variable interpolation.
* Step 3 → Add pluralization support.
* Step 4 → Add locale fallback & caching.
* Step 5 → Discuss **scaling, ICU format, production tradeoffs**.
---

## Step 1. Interviewer starts:

*"Implement a simple translation function `t(key, locale)` that returns a string from a dictionary."*

---

### ✅ Basic Translation

```js
const translations = {
  en: { hello: "Hello", bye: "Goodbye" },
  fr: { hello: "Bonjour", bye: "Au revoir" }
};

function t(key, locale = "en") {
  return translations[locale]?.[key] || key;
}

// Example
console.log(t("hello", "en")); // "Hello"
console.log(t("hello", "fr")); // "Bonjour"
console.log(t("unknown", "en")); // "unknown"
```

✔ Works, but too basic.

---

## Step 2. Interviewer says:

*"Nice. Now add **variable interpolation** (e.g., `Hello, {name}`)."*

---

### ✅ Translation with Interpolation

```js
const translations = {
  en: { greet: "Hello, {name}" },
  fr: { greet: "Bonjour, {name}" }
};

function t(key, locale = "en", vars = {}) {
  let str = translations[locale]?.[key] || key;
  return str.replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? `{${v}}`);
}

// Example
console.log(t("greet", "en", { name: "Alice" })); // "Hello, Alice"
console.log(t("greet", "fr", { name: "Bob" }));   // "Bonjour, Bob"
```

✔ Handles dynamic values.

---

## Step 3. Interviewer twists:

\*"Good. Now support **pluralization**:

* en: `{count} item` / `{count} items`
* fr: `{count} article` / `{count} articles`."\*

---

### ✅ Pluralization Rules

```js
const translations = {
  en: {
    items: {
      one: "{count} item",
      other: "{count} items"
    }
  },
  fr: {
    items: {
      one: "{count} article",
      other: "{count} articles"
    }
  }
};

function pluralRule(locale, count) {
  // simplified: real ICU rules are more complex
  if (locale === "fr" || locale === "en") {
    return count === 1 ? "one" : "other";
  }
  return "other";
}

function t(key, locale = "en", vars = {}) {
  let entry = translations[locale]?.[key];
  if (!entry) return key;

  if (typeof entry === "object" && "count" in vars) {
    const form = pluralRule(locale, vars.count);
    let str = entry[form];
    return str.replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? `{${v}}`);
  }

  if (typeof entry === "string") {
    return entry.replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? `{${v}}`);
  }

  return key;
}

// Example
console.log(t("items", "en", { count: 1 })); // "1 item"
console.log(t("items", "en", { count: 5 })); // "5 items"
console.log(t("items", "fr", { count: 1 })); // "1 article"
console.log(t("items", "fr", { count: 5 })); // "5 articles"
```

✔ Now supports plurals.

---

## Step 4. Interviewer final twist:

*"Good. Now add **locale fallback** (e.g., `fr-CA → fr → en`) and cache translations for speed."*

---

### ✅ Locale Fallback + Caching

```js
const translations = {
  en: { hello: "Hello" },
  fr: { hello: "Bonjour" }
};

const cache = new Map();

function resolveLocale(locale) {
  const parts = locale.split("-");
  while (parts.length) {
    const loc = parts.join("-");
    if (translations[loc]) return loc;
    parts.pop();
  }
  return "en"; // default fallback
}

function t(key, locale = "en", vars = {}) {
  const cacheKey = `${locale}-${key}-${JSON.stringify(vars)}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const resolved = resolveLocale(locale);
  let str = translations[resolved]?.[key] || key;
  str = str.replace(/\{(\w+)\}/g, (_, v) => vars[v] ?? `{${v}}`);

  cache.set(cacheKey, str);
  return str;
}

// Example
console.log(t("hello", "fr-CA")); // falls back to "Bonjour"
console.log(t("hello", "es"));    // falls back to "Hello"
```

✔ Now supports **fallback chain** + caching.

---

## Step 5. Interviewer final boss:

*"How does this compare to real i18n frameworks (ICU, React Intl)? What about performance & scalability?"*

---

### ✅ Performance & Real-World Discussion

* **Our system**:

  * O(1) lookup with caching.
  * Handles basic plurals, interpolation, fallback.

* **Real frameworks (ICU, FormatJS, i18next)**:

  * Full **plural rules per locale** (Arabic has 6 forms, not 2).
  * Gendered strings: `"He invited her" vs "She invited him"`.
  * Nested translations: date/time/number formatting.
  * Remote loading of translations.

* **Tradeoffs**:

  * Simple system = lightweight, fast.
  * Full ICU support = heavier, but critical for global apps.

* **Frontend Use Cases**:

  * Large apps (Shopify, Airbnb, Facebook).
  * Multi-locale static sites.
  * Real-time locale switching.

---

# 🎯 Final Interview Takeaways (i18n Framework)

* ✅ Step 1: Key → value translation.
* ✅ Step 2: Variable interpolation.
* ✅ Step 3: Pluralization rules.
* ✅ Step 4: Locale fallback + caching.
* ✅ Step 5: Compare to ICU/i18next, discuss tradeoffs.

