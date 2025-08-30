# 🔎 Problem #23: Multi-Tenant Theming System
* Step 1 → Define brand tokens.
* Step 2 → Apply themes with CSS variables.
* Step 3 → Add runtime switching per tenant.
* Step 4 → Handle overrides (per-customer customization).
* Step 5 → Discuss **scalability, perf, tradeoffs**.
---

## Step 1. Interviewer starts:

*"Suppose you have two tenants: **Acme Inc.** and **Beta Corp.**. Each needs different colors. Show me how you'd define tokens."*

---

### ✅ Tenant Tokens

```js
const tenantThemes = {
  acme: {
    "--color-bg": "#2563eb",
    "--color-text": "#ffffff",
    "--color-primary": "#1d4ed8"
  },
  beta: {
    "--color-bg": "#f59e0b",
    "--color-text": "#111827",
    "--color-primary": "#b45309"
  }
};
```

✔ Defines **tenant-specific design tokens**.

---

## Step 2. Interviewer adds:

*"Now apply these as CSS variables, so components can use them without knowing the brand."*

---

### ✅ Apply CSS Variables

```js
function applyTenantTheme(tenant) {
  const theme = tenantThemes[tenant];
  for (let [key, value] of Object.entries(theme)) {
    document.documentElement.style.setProperty(key, value);
  }
}

// Example
applyTenantTheme("acme");
```

```jsx
function Button({ children }) {
  return (
    <button
      style={{
        background: "var(--color-primary)",
        color: "var(--color-text)"
      }}
    >
      {children}
    </button>
  );
}
```

✔ Components remain **brand-agnostic**.

---

## Step 3. Interviewer twists:

*"What if a user switches tenant at runtime (multi-login)? How do you support **dynamic runtime switching**?"*

---

### ✅ Runtime Switching

```jsx
function TenantProvider({ tenant, children }) {
  React.useEffect(() => {
    applyTenantTheme(tenant);
  }, [tenant]);

  return <>{children}</>;
}

// Usage
<TenantProvider tenant="beta">
  <App />
</TenantProvider>
```

✔ Switch themes instantly → no page reload.

---

## Step 4. Interviewer pushes:

*"Now allow **per-customer overrides** (e.g., Acme wants custom button radius)."*

---

### ✅ Support Overrides

```js
function applyTenantTheme(tenant, overrides = {}) {
  const theme = { ...tenantThemes[tenant], ...overrides };
  for (let [key, value] of Object.entries(theme)) {
    document.documentElement.style.setProperty(key, value);
  }
}

// Example: Acme override
applyTenantTheme("acme", { "--radius-button": "12px" });
```

✔ Overrides let customers tweak **branding without breaking defaults**.

---

## Step 5. Interviewer final boss:

*"How does this scale for **100 tenants**, each with brand overrides? What about performance?"*

---

### ✅ Performance & Real-World Discussion

* **Performance**

  * CSS variables → O(1) application (just update root vars).
  * Much cheaper than swapping stylesheets.
  * Avoid inline styles → they prevent caching.

* **Scalability**

  * Store tenant themes in JSON (CMS, DB).
  * Load tenant config at login.
  * Cache resolved theme in `localStorage` or CDN.

* **Tradeoffs**

  * CSS variable system is fast but global → risk of collisions. → Use prefixes (`--acme-color-bg`).
  * Alternative = CSS-in-JS (scoped but heavier).
  * For 100 tenants on one page → need **scoped themes per tenant container** instead of global root.

* **Frontend Use Cases**

  * SaaS apps with **white-labeling**.
  * Multi-brand e-commerce platforms.
  * Multi-tenant dashboards (e.g., Shopify, HubSpot).

---

# 🎯 Takeaways (Multi-Tenant Theming)

* ✅ Step 1: Tenant tokens.
* ✅ Step 2: Apply with CSS vars.
* ✅ Step 3: Runtime switching.
* ✅ Step 4: Overrides.
* ✅ Step 5: Discuss perf (100 tenants, scoped themes).
