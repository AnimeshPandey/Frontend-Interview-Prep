# 🚀 Interview Gold – Batch #7 (Testing & Reliability)

---

## 1. Testing Pyramid for Frontend

**Problem:**

* Teams often debate “what tests to write” (unit vs e2e).

**Solution:**

* **Pyramid model**:

  * Unit Tests (fast, cheap, many)
  * Integration Tests (medium cost)
  * End-to-End (slow, flaky, few)

**Detailed Design:**

* **Unit tests**: Test pure functions/components in isolation.
* **Integration tests**: Test component + API mock (React Testing Library).
* **E2E tests**: Test entire flow in real browser (Cypress/Playwright).

**Performance Notes:**

* Over-reliance on E2E → slow + flaky CI.
* Unit tests should form the bulk (\~70%).

**Follow-ups:**

* Why not just E2E? → Slow, brittle.
* Why not only unit tests? → Miss integration bugs.
* How to structure CI pipeline for fast feedback? → Parallelize, run smoke E2E only on PR.

---

## 2. Unit Testing React Components

**Problem:**

* Verify small, reusable components work in isolation.

**Solution:**

* Use **Jest + React Testing Library (RTL)**.
* Focus on **behavior, not implementation details**.

**Detailed Design:**

```js
// Button.test.js
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "./Button";

test("calls onClick when clicked", () => {
  const onClick = jest.fn();
  render(<Button onClick={onClick}>Click</Button>);
  fireEvent.click(screen.getByText("Click"));
  expect(onClick).toHaveBeenCalled();
});
```

**Performance Notes:**

* Keep unit tests fast (<50ms each).
* Mock heavy deps (date, intl, lodash).

**Follow-ups:**

* Why prefer RTL over Enzyme? → RTL tests like a user (DOM).
* How to test hooks? → `@testing-library/react-hooks`.
* How to test performance (e.g., render count)? → `React.Profiler`.

---

## 3. Integration Tests with Mocked APIs

**Problem:**

* Component depends on API (fetch, GraphQL).

**Solution:**

* Use **MSW (Mock Service Worker)** to intercept fetch/XHR.
* Ensures component tested with realistic API contract.

**Detailed Design:**

```js
import { rest } from "msw";
import { setupServer } from "msw/node";
import { render, screen, waitFor } from "@testing-library/react";
import App from "./App";

const server = setupServer(
  rest.get("/api/user", (req, res, ctx) => res(ctx.json({ name: "Alice" })))
);

beforeAll(() => server.listen());
afterAll(() => server.close());

test("loads user profile", async () => {
  render(<App />);
  expect(await screen.findByText(/Alice/)).toBeInTheDocument();
});
```

**Performance Notes:**

* More realistic than Jest mocks.
* Avoids coupling test to implementation.

**Follow-ups:**

* Why MSW vs jest.mock()? → MSW simulates actual network.
* How to test GraphQL APIs? → MSW supports `graphql.query`.
* How to test error states? → Mock 500 responses.

---

## 4. End-to-End Testing with Cypress/Playwright

**Problem:**

* Unit + integration can’t catch full flows (e.g., login → checkout).

**Solution:**

* Use Cypress or Playwright for real browser automation.

**Detailed Design:**

```js
describe("Login flow", () => {
  it("logs in successfully", () => {
    cy.visit("/login");
    cy.get("input[name=email]").type("test@example.com");
    cy.get("input[name=password]").type("password123");
    cy.get("button[type=submit]").click();
    cy.url().should("include", "/dashboard");
  });
});
```

**Performance Notes:**

* Run smoke E2E suite per PR.
* Full regression suite nightly.

**Follow-ups:**

* Why do E2E tests flake? → Timing, network.
* How to reduce flakiness? → Use `cy.findByRole` instead of brittle selectors.
* How to parallelize? → Shard tests across CI runners.

---

## 5. Accessibility Testing (a11y)

**Problem:**

* Accessibility often overlooked.

**Solution:**

* Automated checks (axe-core, jest-axe).
* Manual keyboard + screen reader testing.

**Detailed Design:**

```js
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import Button from "./Button";

test("button is accessible", async () => {
  const { container } = render(<Button>Click</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

**Performance Notes:**

* Automated tools catch \~40% of issues.
* Human review still required.

**Follow-ups:**

* How to test ARIA roles? → `getByRole`.
* How to ensure keyboard navigation works? → `fireEvent.keyDown`.
* Why do we care? → Legal compliance (WCAG/ADA).

---

## 6. Visual Regression Testing

**Problem:**

* Code changes unintentionally break layout.

**Solution:**

* Use tools like Percy, Chromatic, Happo.
* Take screenshots → compare pixel diffs.

**Detailed Design:**

* Integrate with Storybook.
* Run snapshots on CI, fail if diff > threshold.

**Performance Notes:**

* Helps catch CSS breakage early.
* Must manage false positives (fonts, rendering diffs).

**Follow-ups:**

* How to handle dynamic content (timestamps)? → Mask or ignore regions.
* How to scale across multiple screen sizes? → Capture per viewport.
* When to use snapshots vs visual diffs?

---

## 7. Reliability: Error Monitoring & Logging

**Problem:**

* Bugs in prod are inevitable.

**Solution:**

* Client-side error monitoring (Sentry, LogRocket).
* Global error boundary in React.
* Track performance metrics (Web Vitals).

**Detailed Design:**

```js
window.addEventListener("error", e => {
  sendToSentry({ message: e.message, stack: e.error.stack });
});

window.addEventListener("unhandledrejection", e => {
  sendToSentry({ message: e.reason });
});
```

**Performance Notes:**

* Logging must be async (don’t block UI).
* Redact sensitive data before sending.

**Follow-ups:**

* How to capture errors in async code? → `unhandledrejection`.
* How to measure frontend performance in prod? → Web Vitals API.
* How to sample errors to avoid log flooding?

---

# 📘 Key Takeaways – Batch #7

* **Testing Pyramid**: Unit > Integration > E2E.
* **Unit**: Jest + RTL → test behavior.
* **Integration**: MSW → realistic API mocks.
* **E2E**: Cypress/Playwright → full flows, flaky but valuable.
* **Accessibility**: axe-core, keyboard tests.
* **Visual Regression**: Percy/Chromatic for CSS stability.
* **Reliability**: Sentry + error boundaries.

---

# 📑 Quick-Reference (Batch #7)

* **Unit**: fast, isolated, jest + RTL.
* **Integration**: MSW, test API + component.
* **E2E**: Cypress/Playwright, smoke tests per PR.
* **a11y**: jest-axe, manual screen reader.
* **Visual**: Percy/Chromatic snapshot diffs.
* **Monitoring**: Sentry, Web Vitals, error boundaries.
