// * **Tradeoffs** in React rendering strategies.
// * **Scalable component & state design.**
// * **Performance optimization.**
// * **Real-world features** (virtualized lists, design systems, etc.).


// // ## 1. Design a Virtualized List (Infinite Table)

/**
 * Virtualized List
 *
 * What does it do?
 * - Renders only visible rows in a large list/table
 * - Improves performance for 10k+ items
 *
 * Why asked?
 * - Facebook/LinkedIn use this everywhere
 * - Tests DOM perf knowledge
 */
function VirtualizedList({ items, rowHeight, height }) {
  const [scrollTop, setScrollTop] = React.useState(0);
  const totalHeight = items.length * rowHeight;
  const startIndex = Math.floor(scrollTop / rowHeight);
  const endIndex = Math.min(items.length - 1, Math.floor((scrollTop + height) / rowHeight));

  const visibleItems = items.slice(startIndex, endIndex + 1);

  return (
    <div
      style={{ height, overflow: "auto" }}
      onScroll={e => setScrollTop(e.target.scrollTop)}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleItems.map((item, i) => (
          <div
            key={startIndex + i}
            style={{
              position: "absolute",
              top: (startIndex + i) * rowHeight,
              height: rowHeight
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Follow-up Questions:
 * - How does this improve performance? (less DOM nodes)
 * - How to handle dynamic row heights?
 * - How does React Virtualized / React Window solve this?
 */



// // ## 2. Explain React Reconciliation & Keys

/**
 * What is reconciliation?
 * - React compares old vs new virtual DOM
 * - Uses keys to optimize list diffs
 *
 * Interview Twist:
 * - Why does using array index as key cause bugs?
 *   → Because React reuses DOM nodes incorrectly when list changes
 *
 * Example:
 * - Keys tell React which element is "the same" across renders
 *
 * Follow-up:
 * - How does React Fiber improve reconciliation?
 *   → Splits rendering into chunks, prioritizes updates
 */



// // ## 3. State Management: Local vs Global

/**
 * Common Question: "When do you lift state up, vs use Context, vs Redux?"
 *
 * - Local (useState/useReducer): component-specific state
 * - Context: pass data down tree (theme, auth, config)
 * - Redux/Zustand/MobX: app-wide state, cross-component sync
 *
 * Senior Answer:
 * - Use smallest scope possible (avoid unnecessary re-renders)
 * - Context ≠ global state (bad perf for frequently changing values)
 * - Redux/Zustand better for frequently updated global state
 *
 * Follow-up:
 * - How to optimize Context re-renders? → Split context, selectors, memo
 * - How do Signals differ from Context?
 */




// ## 4. Suspense + Concurrent Rendering


/**
 * React Suspense
 *
 * What does it do?
 * - Lets components "suspend" while fetching data
 * - Shows fallback UI in meantime
 *
 * Why asked?
 * - React 18+ interviews test Suspense/Concurrent features
 *
 * Example:
 */
const resource = fetchData();

function Profile() {
  const user = resource.read(); // throws promise if pending
  return <div>{user.name}</div>;
}

/**
 * Follow-up Questions:
 * - How does Suspense differ from useEffect?
 * - Why is Suspense better than loading states everywhere?
 * - How does concurrent rendering improve UX? (time slicing, interruptible rendering)
 */




// ## 5. Component Library Design (Design System)


/**
 * Question: "How would you design a Button component for a design system?"
 *
 * Key points:
 * - API surface: props (variant, size, disabled)
 * - Accessibility: role="button", keyboard support
 * - Theming: CSS variables or Tailwind utility classes
 * - Composition: allow leftIcon, rightIcon, children
 *
 * Example:
 */
function Button({ variant="primary", size="md", disabled, children, ...rest }) {
  const base = "rounded px-4 py-2 font-medium";
  const variants = {
    primary: "bg-blue-600 text-white",
    secondary: "bg-gray-200 text-black"
  };
  const sizes = { sm: "text-sm", md: "text-base", lg: "text-lg" };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}

/**
 * Follow-up Questions:
 * - How to make components themeable? (context, CSS vars, styled-components)
 * - How to enforce accessibility (a11y)? (aria-* attributes, keyboard events)
 * - How would you test this component?
 */




// ## 6. Optimize React Rendering


/**
 * Common Interview Twist: "How do you prevent unnecessary re-renders?"
 *
 * Techniques:
 * - React.memo → memoize component output
 * - useMemo → cache expensive computations
 * - useCallback → stable function references
 * - Split contexts → reduce provider re-renders
 *
 * Example:
 */
const Expensive = React.memo(function Expensive({ val }) {
  console.log("Expensive re-render");
  return <div>{val}</div>;
});

function Parent({ value }) {
  const computed = React.useMemo(() => heavyCompute(value), [value]);
  return <Expensive val={computed} />;
}

/**
 * Follow-up Questions:
 * - When is premature memoization harmful?
 * - How to detect wasted renders? (React Profiler)
 * - How to optimize large lists? (virtualization, windowing)
 */




// ## 7. Error Boundaries


/**
 * Error Boundaries
 *
 * What do they do?
 * - Catch React render errors and show fallback UI
 *
 * Why asked?
 * - Senior-level: error handling strategy
 *
 * Example:
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }
  render() {
    if (this.state.hasError) return <h1>Something went wrong.</h1>;
    return this.props.children;
  }
}

/**
 * Follow-up Questions:
 * - Why are hooks not allowed in Error Boundaries?
 * - What errors are NOT caught by error boundaries?
 *   (async, event handlers, SSR)
 */



// # 📘 Key Takeaways – Batch #4

// * **Virtualized List** → perf scaling (big lists)
// * **Reconciliation & Keys** → React diffing, Fiber
// * **State Management Tradeoffs** → local vs context vs Redux
// * **Suspense** → async rendering & concurrent features
// * **Component Library Design** → props, a11y, theming
// * **Optimize Rendering** → memo, useMemo, useCallback, Profiler
// * **Error Boundaries** → fault tolerance

// 

// # 📑 Quick-Reference (Batch #4)

// * **Virtualized list** → render visible only, improve perf.
// * **Keys** → identity for reconciliation, don’t use index.
// * **State** → local < context < Redux.
// * **Suspense** → async rendering with fallback.
// * **Design System** → props, theme, a11y.
// * **Perf** → memoization, split context, virtualization.
// * **Error Boundaries** → catch render errors, fallback UI.

