# 🎯 Rapid-Fire Q\&A – Microfrontends + Module Federation

---

## 🟢 Fundamentals

**Q1. What are microfrontends?**

* Splitting a large frontend into independently developed & deployed apps.
* Each app = a **vertical slice** (UI + logic).
* Inspired by **microservices architecture**.

---

**Q2. Why microfrontends?**

* ✅ Independent deploys (no full rebuild).
* ✅ Team autonomy & parallel work.
* ✅ Scale org across 100+ engineers.
* ❌ More runtime complexity, governance needed.

---

**Q3. Compare microfrontends vs monorepos.**

* Monorepo = **one codebase** with shared libs, consistency, slower builds.
* MFE = **independent repos/apps**, fast deploys, harder consistency.

---

**Q4. When would you choose monorepo over MFE?**

* Smaller teams (<50).
* Consistency is more important than autonomy.
* CI/CD infra can handle big builds.

---

**Q5. When would you choose MFE over monorepo?**

* 100s of engineers.
* Multiple product lines with **separate release cycles**.
* High velocity needed (daily deploys per team).

---

## ⚙️ Module Federation (Webpack 5)

**Q6. What is Module Federation?**

* Webpack 5 feature → apps expose modules (`remoteEntry.js`) and consume them at runtime.
* Enables **runtime integration** vs build-time bundling.

---

**Q7. How does Module Federation solve MFE pain points?**

* Dynamic loading → host app doesn’t need rebuild.
* Shared dependencies → avoids React duplication.
* Supports SSR → usable in Next.js.

---

**Q8. What are “remotes” and “hosts”?**

* **Remote**: app exposing components (`remoteEntry.js`).
* **Host**: app importing those components dynamically.

---

**Q9. How does dependency sharing work in MF?**

* Declared in `shared: ["react", "react-dom"]`.
* Webpack ensures **singleton instances**.

---

**Q10. Can MFEs use different React versions?**

* Possible, but not recommended (bundle duplication + bugs).
* Best to enforce shared versions via governance.

---

## 🖼️ Architecture & Patterns

**Q11. What’s a shell app in MFE?**

* Container app handling **routing, layout, global state**.
* Loads microfrontends as needed.

---

**Q12. How do you handle routing across MFEs?**

* Shell manages global router.
* Each MFE manages **local routes** within its boundary.

---

**Q13. How do you share a design system across MFEs?**

* Expose DS components as a shared remote.
* Or publish DS as a versioned npm package.

---

**Q14. What are runtime integration risks?**

* Bundle bloat (dup deps).
* Version mismatches.
* Network latency (extra requests for remotes).

---

**Q15. How do you mitigate perf overhead in MFEs?**

* Preload critical remotes.
* Use shared deps.
* Cache remoteEntry.js via CDN.

---

## 🔒 Governance & Consistency

**Q16. How do you enforce consistency across MFEs?**

* Design tokens & DS enforcement.
* Lint rules + CI checks.
* Org-wide governance group.

---

**Q17. What’s the biggest risk of MFE adoption?**

* UX inconsistency if teams diverge.
* Infra complexity (routing, auth duplication).

---

**Q18. How do you handle authentication in MFEs?**

* Central auth service.
* Share token via cookie/secure storage.
* Avoid duplicating auth logic per MFE.

---

## 🛠️ Alternatives & Tradeoffs

**Q19. How do MFEs compare to iFrames?**

* iFrames = isolation, but ❌ UX (scrollbars, slow, poor SEO).
* MFEs = seamless integration, shared context possible.

---

**Q20. How do MFEs compare to Web Components?**

* Web Components = framework-agnostic → good glue.
* MFEs = runtime orchestration + routing → full solution.
* Can be combined: WC inside MFE.

---

**Q21. Do you still need a monorepo with MFEs?**

* Sometimes yes → for shared infra/tools.
* But MFEs often live in independent repos.

---

**Q22. How would you migrate a monolith to MFEs?**

1. Carve out a vertical (e.g., Checkout).
2. Build as remote app.
3. Expose via Module Federation.
4. Gradually replace monolith modules.

---

## 📊 Impact & Real-World

**Q23. Who uses MFEs at scale?**

* Spotify (web player).
* Zalando (fashion e-commerce).
* Shopify Hydrogen (storefronts).
* IKEA (runtime MFE shell).

---

**Q24. What’s the main metric for MFE success?**

* Release velocity (deploys/day).
* Reduced conflicts across teams.
* Faster onboarding for new engineers.

---

# 📘 Cheat-Sheet Style Notes for Sketching in Interviews

**Architecture Sketch (Host + MFEs):**

```
          HOST SHELL (Router, Layout)
              │
    ┌─────────┼──────────┐
    │         │          │
 Cart MFE   Search MFE   Checkout MFE
 (remote)   (remote)     (remote)
```

* **Host Shell** = glue (routing, auth, global DS).
* **MFEs** = independent apps, deployed separately.
* **Shared** = React, DS, utilities.

---

# 📑 Key Takeaways for You

* **Know both sides**: MFE vs Monorepo → tradeoff expert.
* **Be precise with Module Federation terms** (host, remote, shared).
* **Always give real-world examples** (Spotify, Zalando).
* **Show governance awareness** → staff-level signal.
* **Be ready for migration questions** (monolith → MFE).
