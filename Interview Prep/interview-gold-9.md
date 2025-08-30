# 🚀 Interview Gold – Batch #9 (Frontend Architecture & Large-Scale App Design)

---

## 1. Microfrontends

**Problem:**

* Large apps (e.g., Amazon, Netflix, Spotify) have multiple teams working independently.
* A single monolithic frontend becomes too big → hard to deploy, test, and scale teams.

**Solution:**

* **Microfrontends (MFEs):** Split the UI into independently developed/deployed apps.
* Each team owns a feature (cart, search, checkout).
* Integration via iframes, runtime composition, or module federation.

**Detailed Design:**

* **Approach 1:** Iframe embedding → simplest, but perf suffers.
* **Approach 2:** Build-time integration → import other apps into shell app.
* **Approach 3 (modern):** Webpack 5 **Module Federation** → load remote apps dynamically.

```js
// webpack.config.js
new ModuleFederationPlugin({
  name: "cart",
  remotes: {
    checkout: "checkoutApp@http://localhost:3002/remoteEntry.js",
  }
})
```

**Performance/Scaling Notes:**

* Enables **independent deployments** (no blocking other teams).
* But bundle duplication risk (need shared deps strategy).

**Real-World Example:**

* Spotify Web → playlists, player, profile all separate MFEs.

**Follow-ups:**

* How do you share state between MFEs? (custom events, global stores).
* How to avoid duplicate React in multiple bundles? (singleton shared modules).
* Pros vs cons of MFEs vs monolith?

---

## 2. Module Federation (Webpack 5+)

**Problem:**

* With MFEs, need a way to dynamically share code at runtime.

**Solution:**

* **Module Federation Plugin (MFP)** allows apps to expose/consume modules across builds.
* Example: host app loads “Checkout” app’s code at runtime.

**Detailed Design:**

```js
// Host (shell) app
new ModuleFederationPlugin({
  remotes: {
    checkout: "checkoutApp@http://cdn.com/checkoutRemote.js"
  }
});

// Checkout app
new ModuleFederationPlugin({
  name: "checkoutApp",
  filename: "checkoutRemote.js",
  exposes: {
    "./CheckoutPage": "./src/CheckoutPage"
  }
});
```

**Performance/Scaling Notes:**

* Avoids shipping duplicate React, lodash, etc.
* Enables **independent version upgrades**.

**Real-World Example:**

* Shopify Admin → MFEs stitched with Module Federation.

**Follow-ups:**

* How does MFP handle shared dependencies? → Marks them as singletons.
* What’s the fallback if remote app unavailable? → Show fallback UI.
* Compare Module Federation vs npm package distribution.

---

## 3. Monorepos (Nx, Turborepo)

**Problem:**

* Multiple projects/packages need to share code (UI lib, utils).
* Separate repos = dependency hell + broken version sync.

**Solution:**

* **Monorepo:** Single repo with multiple packages.
* Tools: Nx, Turborepo, Lerna.
* Benefits: shared linting, consistent dependencies, atomic commits.

**Detailed Design:**

* Packages inside `/packages/` folder (`ui`, `api`, `utils`).
* Each package has own `package.json`.
* Build with Nx/Turborepo → caches build results, runs affected tests only.

```bash
packages/
  ui/
  utils/
  app-web/
  app-mobile/
```

**Performance/Scaling Notes:**

* CI/CD faster with **build caching**.
* But repo gets huge → need selective builds (affected graph).

**Real-World Example:**

* Google’s Blaze/Bazel system (massive monorepo).
* Vercel uses Turborepo for Next.js.

**Follow-ups:**

* How do monorepos scale CI builds? → Affected-only pipelines.
* Compare monorepo vs polyrepo.
* How to enforce code boundaries between teams?

---

## 4. Feature Flags & Progressive Rollouts

**Problem:**

* Deploying features to millions of users at once is risky.
* Need safe rollouts & A/B testing.

**Solution:**

* **Feature Flags:** Wrap features in conditionals, controlled via config.
* **Progressive Rollout:** Gradually increase % of users.
* Tools: LaunchDarkly, Unleash, homegrown systems.

**Detailed Design:**

```js
function CheckoutButton() {
  if (!features.enableNewCheckout) return <OldCheckout />;
  return <NewCheckout />;
}
```

* Flags stored in config service → app polls or uses push updates.

**Performance/Scaling Notes:**

* Avoid too many flags → “flag debt.”
* Use kill switches to disable broken features instantly.

**Real-World Example:**

* Facebook rolls out features to 1%, then 10%, then 100%.

**Follow-ups:**

* How to implement flagging in SSR? → Inject flags at render.
* How to expire old flags? → Flag cleanup policy.
* Difference between build-time vs runtime flags?

---

## 5. CI/CD for Frontend

**Problem:**

* Frontend teams push code often → need reliable deploys.
* Large apps need multiple environments (dev, staging, prod).

**Solution:**

* CI/CD pipeline with tests, builds, deployments.
* Modern tools: GitHub Actions, GitLab CI, CircleCI, Vercel.

**Detailed Design:**

* **Pipeline Stages:**

  1. Run unit + integration tests.
  2. Run linting + type checks.
  3. Build app → artifact.
  4. Run smoke E2E tests.
  5. Deploy to staging → manual/auto promote to prod.

**Performance/Scaling Notes:**

* Use **caching (Nx/Turborepo)** to speed builds.
* Use **canary deploys** (deploy to subset first).

**Real-World Example:**

* Netflix: deploys multiple times/day with Spinnaker.
* Vercel: every PR auto-deployed for preview.

**Follow-ups:**

* How do you prevent shipping broken code? → CI gates + feature flags.
* Canary vs Blue-Green deployments?
* How to roll back quickly? → Immutable deploys + instant DNS switch.

---

## 6. Shared Component Libraries (Design Systems)

**Problem:**

* Different teams reinvent UI → inconsistent design, wasted effort.

**Solution:**

* **Central UI library (Design System):** Shared React components, tokens, themes.
* Tools: Storybook, Chromatic for visual tests.

**Detailed Design:**

* Packages in monorepo → versioned + published (npm, private registry).
* Theming via CSS variables or styled-components.
* Storybook for documentation.

**Performance/Scaling Notes:**

* Avoid shipping multiple versions of lib (peerDependencies).
* Bundle-size control: tree-shakeable exports.

**Real-World Example:**

* Airbnb’s DLS, Shopify Polaris, Material UI.

**Follow-ups:**

* How to enforce accessibility (a11y)? → ARIA roles, axe checks.
* How to avoid breaking changes? → SemVer + codemods.
* How do you measure adoption across teams?

---

## 7. State Management at Scale

**Problem:**

* Small apps → useState/context fine.
* Large apps → global state gets complex (auth, cache, feature flags).

**Solution:**

* Use **Redux Toolkit, Zustand, Recoil, or Jotai** for global state.
* Use **React Query/SWR** for server state.

**Detailed Design:**

* Split **UI state** (local, ephemeral) vs **Server state** (API data).
* Use React Query for caching API calls.
* Use Redux Toolkit slices for global app logic.

**Performance/Scaling Notes:**

* Context re-renders entire subtree → bad for frequently updated values.
* Libraries like Zustand optimize for minimal re-renders.

**Real-World Example:**

* Netflix uses Falcor (graph-based state).
* Facebook uses Relay for GraphQL.

**Follow-ups:**

* Difference between client vs server state?
* Why avoid putting everything in Redux?
* How do Signals (Solid.js, React Canary) improve perf vs Context?

---

# 📘 Key Takeaways – Batch #9

* **Microfrontends** → split monolith into independently deployed apps.
* **Module Federation** → runtime code sharing between teams.
* **Monorepos** → Nx/Turborepo for shared code + faster CI.
* **Feature Flags** → safe rollouts, kill switches.
* **CI/CD** → automated pipelines, canary deploys.
* **Design Systems** → consistent UI across teams.
* **State Management** → split UI vs server state, use right tools.

---

# 📑 Quick-Reference (Batch #9)

* **Microfrontends**: team autonomy, runtime composition.
* **Module Federation**: share modules across apps.
* **Monorepo**: shared code + caching.
* **Feature Flags**: rollout safely, expire flags.
* **CI/CD**: tests, canaries, auto rollback.
* **Design System**: shared components, Storybook.
* **State Management**: Redux/Zustand + React Query.