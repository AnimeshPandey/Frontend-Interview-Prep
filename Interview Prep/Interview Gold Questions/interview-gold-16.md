# 🚀 Interview Gold – Batch #16 (Team-Scale Frontend Engineering Gold)

---

## 1. Code Reviews & Governance

**Problem:**

* Large teams → inconsistent code quality.
* Without process: style drift, bugs sneak in, reviews become bottlenecks.

**Solution:**

* Structured **Code Review (CR) culture** + automation.

**Detailed Design:**

* **Automate trivial checks** → linting, formatting, type checks in CI.
* **Human review focus** → architecture, readability, maintainability.
* **Templates** for PRs:

  ```md
  ## What’s Changed?
  - Added checkout button
  ## Screenshots
  - Before / After
  ## Risk & Rollback Plan
  - Feature flag: enable/disable
  ```
* **Reviewer rotation**: avoid single point of failure.
* **Merge rules**: 2 approvals + CI pass.

**Performance/Scaling Notes:**

* Automating \~80% of nitpicks speeds CR.
* Standard PR sizes (<400 lines) → faster reviews.

**Pitfalls:**

* Overly strict rules slow teams.
* Drive-by reviews (LGTM without context) → low value.

**Real-world Example:**

* Google requires **2 reviewers** + tests for all CLs.
* Airbnb: PR template + screenshots mandatory.

**Follow-ups:**

* What should humans review vs bots?
* How do you avoid CR bottlenecks?
* How to enforce quality without killing velocity?

---

## 2. Linting & Formatting at Scale

**Problem:**

* In big repos, everyone has their own coding style.
* Inconsistent code = merge conflicts, readability issues.

**Solution:**

* Enforce **lint + format** in CI + pre-commit hooks.
* Tools: ESLint, Prettier, Stylelint.

**Detailed Design:**

* ESLint config with rules (Airbnb, Google, custom).
* Prettier for auto-formatting.
* Husky + lint-staged for **pre-commit hooks**:

  ```json
  {
    "lint-staged": {
      "*.js": ["eslint --fix", "prettier --write"]
    }
  }
  ```

**Performance/Scaling Notes:**

* Enforced style = fewer merge conflicts.
* Devs focus on logic, not tabs vs spaces.

**Pitfalls:**

* Too many custom rules → frustration.
* Must be consistent across IDEs → enforce via `.editorconfig`.

**Real-world Example:**

* Facebook uses Prettier on all repos → “no bikeshedding on formatting.”

**Follow-ups:**

* Why Prettier + ESLint, not just one?
* How to enforce style across IDEs?
* How to speed linting in monorepos? (answer: `eslint --cache`, Nx affected files).

---

## 3. Type Systems (TypeScript)

**Problem:**

* Large JS codebases → runtime errors, hard to refactor.
* E.g., renaming function arg breaks code silently.

**Solution:**

* Adopt **TypeScript (TS)** → compile-time safety, IDE autocompletion.

**Detailed Design:**

* Use `tsconfig.json` with strict rules:

  ```json
  {
    "strict": true,
    "noImplicitAny": true,
    "forceConsistentCasingInFileNames": true
  }
  ```
* Gradual migration: JS → JSDoc types → TS.
* Shared type packages in monorepo.

**Performance/Scaling Notes:**

* Safer refactoring (rename → refactor across 1000 files).
* Build times can slow → use `tsc --build` with incremental builds.

**Pitfalls:**

* Overly complex types slow down devs.
* Build performance issues in very large repos.

**Real-world Example:**

* Slack migrated to TS incrementally → big reduction in runtime errors.

**Follow-ups:**

* How do you migrate large JS repo to TS?
* What’s the cost of types at scale?
* When do you use `any`? (almost never, only for boundary cases).

---

## 4. Testing Strategies (Unit, Integration, E2E)

**Problem:**

* Large teams → regressions sneak in.
* If only manual QA → slow, flaky releases.

**Solution:**

* Balanced **testing pyramid**:

  * Unit: small, fast (\~70%).
  * Integration: medium (\~20%).
  * E2E: slow, flaky (\~10%).

**Detailed Design:**

* Unit: Jest + React Testing Library.
* Integration: Test data flows across modules.
* E2E: Cypress, Playwright.
* Snapshot testing for UI.
* Contract tests for APIs (consumer-driven contracts).

**Performance/Scaling Notes:**

* Run unit tests on every PR.
* Run full E2E suite nightly or on staging deploy.

**Pitfalls:**

* Too many E2E → flaky, slow pipeline.
* Overusing snapshot tests → meaningless diffs.

**Real-world Example:**

* Netflix: automated E2E for checkout flows.
* Google: thousands of unit tests per PR, E2E only on merges.

**Follow-ups:**

* Why not 100% E2E? → Too slow, too flaky.
* Why snapshot tests controversial? → Catch trivial diffs, not logic bugs.
* How to test feature flags? → Toggle both states in E2E.

---

## 5. Accessibility (a11y) at Scale

**Problem:**

* Accessibility often ignored until late.
* Hard to retrofit in large apps.

**Solution:**

* **Bake a11y into dev workflow.**
* Tools: axe-core, eslint-plugin-jsx-a11y.

**Detailed Design:**

* Automated linting:

  ```jsx
  <img src="foo.jpg" />   // error: missing alt
  ```
* Manual testing: keyboard nav, screen readers.
* CI integration with `cypress-axe`.
* Accessibility baked into design system (shared components already a11y-ready).

**Performance/Scaling Notes:**

* Accessible apps load faster (semantic HTML better for SEO).
* Better UX for all users (keyboard shortcuts).

**Pitfalls:**

* Only testing with mouse → miss a11y bugs.
* “Alt=""” misuse.

**Real-world Example:**

* BBC has strict a11y pipeline → automated + manual checks.

**Follow-ups:**

* How do you enforce a11y at scale?
* How to balance automated vs manual testing?
* Why is semantic HTML both perf + a11y win?

---

## 6. Design System Governance

**Problem:**

* Different teams build their own buttons, modals → inconsistent UX.
* Maintenance hell (10 different versions of the same component).

**Solution:**

* Centralized **design system (DS)** + governance model.

**Detailed Design:**

* DS = shared library of UI components (npm package).
* Token-driven design (colors, spacing, typography).
* Governance:

  * DS team maintains core.
  * Feature teams contribute via RFC process.
* Documentation via Storybook + Chromatic.

**Performance/Scaling Notes:**

* Shared components → less bundle size duplication.
* Faster onboarding: devs don’t reinvent UI.

**Pitfalls:**

* DS team = bottleneck if not scalable.
* Breaking changes ripple across apps.

**Real-world Example:**

* Shopify Polaris, Airbnb DLS, Material UI.

**Follow-ups:**

* How do you avoid DS team being bottleneck?
* How do you measure DS adoption?
* How to evolve DS without breaking apps?

---

## 7. Developer Experience (DX) Tooling

**Problem:**

* In big teams, slow builds/tests → kills productivity.
* Bad DX → slower velocity, higher attrition.

**Solution:**

* Invest in **DX tooling**: fast builds, hot reload, CI pipelines.

**Detailed Design:**

* Use **Turborepo/Nx** → incremental builds.
* CI caching (GitHub Actions cache, Bazel).
* Storybook for isolated component dev.
* VS Code extensions for lint/format.
* PR previews (Vercel, Netlify).

**Performance/Scaling Notes:**

* Every 1s saved per dev = huge cumulative productivity at 100+ engineers.

**Pitfalls:**

* Too much tooling → complexity.
* Not maintaining DX infra → rot.

**Real-world Example:**

* Vercel deploy previews for every PR → faster feedback.
* Google Blaze (Bazel) → massive repo build caching.

**Follow-ups:**

* Why DX matters to business outcomes?
* How do you avoid DX bottlenecks?
* What’s the ROI of investing in DX?

---

# 📘 Key Takeaways – Batch #16

* **Code reviews** → automate nitpicks, focus on logic.
* **Lint/format** → enforce consistency at scale.
* **TypeScript** → safer refactors, compile-time checks.
* **Testing** → pyramid: unit > integration > E2E.
* **Accessibility** → built-in via lint + design system.
* **Design system** → centralized components, governed process.
* **DX tooling** → faster builds/tests, happier devs.

---

# 📑 Quick-Reference (Batch #16)

* **Code reviews**: humans = logic, bots = style.
* **Lint/format**: ESLint + Prettier + hooks.
* **Types**: strict TS, gradual adoption.
* **Tests**: 70/20/10 pyramid.
* **A11y**: axe-core + jsx-a11y lint.
* **Design system**: tokens + Storybook.
* **DX**: Turborepo/Nx, Vercel previews.