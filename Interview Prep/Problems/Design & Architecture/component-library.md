# 🔎 Problem #22: Designing a Component Library
* Step 1 → Basic button component.
* Step 2 → Extract design tokens.
* Step 3 → Add accessibility hooks.
* Step 4 → Add theming system.
* Step 5 → Discuss real-world scaling (tree-shaking, a11y compliance, perf).
---

## Step 1. Interviewer starts:

*"Show me how you’d design a simple `Button` component."*

---

### ✅ Basic Button

```jsx
function Button({ children, onClick }) {
  return <button onClick={onClick}>{children}</button>;
}

// Usage
<Button onClick={() => alert("Clicked!")}>Click Me</Button>
```

✔ Works, but **hardcoded styles** and **no tokens**.

---

## Step 2. Interviewer adds:

*"Now make it **theming-ready**: extract design tokens (colors, spacing, typography)."*

---

### ✅ Design Tokens

```js
// tokens.js
export const tokens = {
  colors: {
    primary: "#2563eb",
    primaryHover: "#1d4ed8",
    text: "#fff"
  },
  spacing: {
    sm: "0.5rem",
    md: "1rem"
  },
  radius: {
    md: "8px"
  }
};
```

```jsx
// Button.js
import { tokens } from "./tokens";

function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: tokens.colors.primary,
        color: tokens.colors.text,
        padding: tokens.spacing.md,
        borderRadius: tokens.radius.md
      }}
    >
      {children}
    </button>
  );
}
```

✔ Now tokens centralize style definitions.

---

## Step 3. Interviewer twists:

*"Cool. But how will you handle **accessibility (a11y)**? E.g., ARIA attributes, keyboard navigation."*

---

### ✅ Accessibility Hooks

```jsx
function useButton({ onClick, disabled }) {
  const handleKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === " ") && !disabled) {
      onClick?.(e);
    }
  };

  return {
    role: "button",
    tabIndex: disabled ? -1 : 0,
    "aria-disabled": disabled,
    onKeyDown: handleKeyDown,
    onClick: disabled ? undefined : onClick
  };
}

// Usage
function Button({ children, onClick, disabled }) {
  const props = useButton({ onClick, disabled });
  return <button {...props}>{children}</button>;
}
```

✔ Button now supports **keyboard + ARIA** out of the box.

---

## Step 4. Interviewer pushes:

*"Great. Now add a **multi-theme system** (light/dark, brand overrides)."*

---

### ✅ Multi-Theme via Context + CSS Variables

```js
// theme.js
export const themes = {
  light: {
    "--color-bg": "#2563eb",
    "--color-text": "#fff"
  },
  dark: {
    "--color-bg": "#1f2937",
    "--color-text": "#f9fafb"
  }
};
```

```jsx
const ThemeContext = React.createContext("light");

function ThemeProvider({ theme, children }) {
  React.useEffect(() => {
    const vars = themes[theme];
    for (let [k, v] of Object.entries(vars)) {
      document.documentElement.style.setProperty(k, v);
    }
  }, [theme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

function Button({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "var(--color-bg)",
        color: "var(--color-text)"
      }}
    >
      {children}
    </button>
  );
}
```

✔ Themes switch at runtime → **instant dark/light mode**.

---

## Step 5. Interviewer final boss:

*"How would this scale for **100+ components**? What about perf and DX?"*

---

### ✅ Performance & Real-World Discussion

* **Design Tokens**

  * Centralized → portable across web, mobile (Style Dictionary).
  * Stored in JSON → can sync with design tools (Figma Tokens).

* **Accessibility (a11y)**

  * Provide **hooks per pattern** (`useButton`, `useDialog`, `useMenu`).
  * Run Axe-core tests during CI.

* **Theming**

  * Use **CSS variables** → runtime switch without rerender.
  * Support **brand overrides** (multi-tenant SaaS).

* **Performance**

  * Components must be **tree-shakable**.
  * Use **atomic CSS** (Tailwind/vanilla-extract) to reduce bundle size.

* **DX (Developer Experience)**

  * Storybook for preview.
  * Docs auto-generated from props.
  * Strict TypeScript types.

* **Frontend Use Cases**

  * Design Systems (Material UI, Chakra, Radix).
  * Multi-brand SaaS apps.
  * A11y-critical apps (government, finance).

---

# 🎯 Takeaways (Component Library Design)

* ✅ Step 1: Base component.
* ✅ Step 2: Extract design tokens.
* ✅ Step 3: Add a11y hooks.
* ✅ Step 4: Theming with CSS vars.
* ✅ Step 5: Discuss scaling, DX, perf.
