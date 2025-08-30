# 🚀 Interview Gold – Batch #18 (Frontend Security Deep-Dive Gold)

---

## 1. Trusted Types + Advanced XSS Defense

**Problem:**

* Even with Content Security Policy (CSP), attackers may inject unsafe HTML/JS.
* Large codebases → developers often use `innerHTML`, `document.write`, etc.

**Solution:**

* Use **Trusted Types**: browser API enforcing safe HTML sinks.
* Only allow values created via **policy functions**.

**Detailed Design:**

```html
<meta http-equiv="Content-Security-Policy" content="require-trusted-types-for 'script'">
```

* Register policy:

```js
window.trustedTypes.createPolicy("default", {
  createHTML: input => sanitize(input),  // custom sanitizer
});
```

* Now `element.innerHTML = "<img onerror=alert(1)>";` → throws error.

**Perf/Scaling Notes:**

* Minimal runtime overhead.
* Forces devs to go through sanitizer = consistent.

**Pitfalls:**

* Requires training team to migrate code.
* Breaks legacy code relying on unsafe sinks.

**Real-world Example:**

* Google enforced Trusted Types across Gmail & Drive → huge XSS reduction.

**Follow-ups:**

* Why CSP alone not enough? → Inline scripts may still sneak in.
* How do Trusted Types help at scale? → Centralized sanitization.
* How to migrate legacy codebases? → Start with `Report-Only` mode.

---

## 2. Supply Chain Security (Dependencies & NPM)

**Problem:**

* Frontend projects depend on **hundreds of npm packages**.
* Attackers inject malicious code into popular packages (e.g., `event-stream`, `ua-parser-js`).

**Solution:**

* **Audit & lock dependencies**.
* Use **integrity hashes (SRI)** for CDN scripts.
* Automated tools: npm audit, Snyk, Dependabot.

**Detailed Design:**

* Lockfile (`package-lock.json` or `yarn.lock`) → prevents drift.
* CI step:

  ```bash
  npm audit --production
  snyk test
  ```
* Subresource Integrity for CDN libs:

  ```html
  <script src="https://cdn.com/lib.js" integrity="sha384-..." crossorigin="anonymous"></script>
  ```

**Perf/Scaling Notes:**

* Auditing adds CI time, but prevents backdoors.
* Private registries (Verdaccio, GitHub Packages) reduce exposure.

**Pitfalls:**

* Ignoring “low severity” warnings → attackers use them.
* Overriding audit failures without triage.

**Real-world Example:**

* Event-stream npm package hacked, exfiltrated Bitcoin wallets.
* SolarWinds breach highlighted supply-chain risks.

**Follow-ups:**

* How do you secure npm dependencies?
* Why integrity hashes important for CDN scripts?
* What’s difference between lockfile and semver pinning?

---

## 3. Cross-Origin Isolation & COOP/COEP Headers

**Problem:**

* Modern features like **SharedArrayBuffer, high-resolution timers, WASM** require **cross-origin isolation**.
* Without it → potential **Spectre attacks**.

**Solution:**

* Enforce **COOP (Cross-Origin-Opener-Policy)** + **COEP (Cross-Origin-Embedder-Policy)** headers.

**Detailed Design:**

```http
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

* This ensures your page runs in its **own isolated process**, no shared memory with other origins.
* Enables features like OffscreenCanvas, advanced WASM.

**Perf/Scaling Notes:**

* More secure, but stricter: can’t embed resources without CORS/Corp headers.

**Pitfalls:**

* Breaks 3rd party embeds (ads, widgets).
* Requires all subresources (scripts, iframes) to be COEP-compatible.

**Real-world Example:**

* Chrome forces cross-origin isolation for apps using SharedArrayBuffer (e.g., Figma).

**Follow-ups:**

* What’s the benefit of isolation? → Prevents cross-origin data leaks.
* Why SharedArrayBuffer gated? → High-res timers aid side-channel attacks.
* How to deal with 3rd party resources? → Proxy through same-origin.

---

## 4. Sandbox & iFrame Security

**Problem:**

* Large apps often embed **3rd party content** (ads, widgets, comments).
* If iframe not sandboxed → XSS/Clickjacking risk.

**Solution:**

* Use **iframe sandboxing** + restrictive CSP.

**Detailed Design:**

```html
<iframe src="ad.html"
  sandbox="allow-scripts allow-same-origin"></iframe>
```

* Strip privileges: no popups, no top-level navigation.
* Use `postMessage` for safe comms between iframe ↔ parent.

**Perf/Scaling Notes:**

* Sandboxing isolates scripts → small perf overhead.

**Pitfalls:**

* Too permissive sandbox = useless.
* Misusing `allow-same-origin` can reintroduce risk.

**Real-world Example:**

* Facebook embeds 3rd party apps in sandboxed iframes with scoped permissions.

**Follow-ups:**

* Why use postMessage? → Safe cross-frame comms.
* What’s difference between `allow-scripts` vs `allow-same-origin`?
* How to prevent iframe clickjacking? → `X-Frame-Options: DENY`.

---

## 5. Subresource Integrity (SRI) for External Scripts

**Problem:**

* Including 3rd party CDN scripts = risk if CDN compromised.

**Solution:**

* Add **integrity attribute** to scripts → ensures file hasn’t been tampered with.

**Detailed Design:**

```html
<script src="https://cdn.com/react.min.js"
  integrity="sha384-9a8bc..." crossorigin="anonymous"></script>
```

* Browser verifies hash before executing.

**Perf/Scaling Notes:**

* Slight hash verification cost, negligible.

**Pitfalls:**

* Must update integrity hash on version change.
* Doesn’t protect against malicious but “valid” versions.

**Real-world Example:**

* Cloudflare outage led to corrupted JS served → SRI would have prevented execution.

**Follow-ups:**

* How does SRI differ from CSP? → CSP controls source, SRI verifies integrity.
* Can attackers bypass SRI? → Only if they also control hash in HTML.
* Why use crossorigin with SRI? → Needed for CORS verification.

---

## 6. Dependency Confusion & Typosquatting Attacks

**Problem:**

* Attackers publish malicious packages with similar names (`lodashs` vs `lodash`).
* Or exploit internal package name collisions → npm resolves to attacker package.

**Solution:**

* Use **scoped namespaces** (`@org/pkg`).
* Configure npm/yarn to prefer internal registry.
* Validate package signatures.

**Detailed Design:**

* `.npmrc`:

  ```
  registry=https://npm.mycompany.com
  always-auth=true
  ```

**Perf/Scaling Notes:**

* Internal registry adds some latency, but ensures control.

**Pitfalls:**

* Developers accidentally install public package instead of internal.
* Typos in imports → auto-pulls malicious package.

**Real-world Example:**

* Researcher Alex Birsan exploited dependency confusion at Apple, Microsoft, Uber → multi-million dollar bug bounties.

**Follow-ups:**

* How to prevent dependency confusion? → Private registries, lockfiles.
* What’s typosquatting? → Malicious lookalike packages.
* Why not trust npm registry blindly? → Anyone can publish.

---

## 7. Advanced Clickjacking Defense

**Problem:**

* Malicious sites may embed your site in iframe, overlay fake UI → trick users into clicks.

**Solution:**

* Block iframing with **X-Frame-Options** or **frame-ancestors CSP**.

**Detailed Design:**

```http
X-Frame-Options: DENY
Content-Security-Policy: frame-ancestors 'none'
```

* Or allow only trusted hosts:

  ```http
  Content-Security-Policy: frame-ancestors 'self' https://trusted.com
  ```

**Perf/Scaling Notes:**

* Zero perf overhead.

**Pitfalls:**

* Breaking legitimate embeds (if you want your site embedded).

**Real-world Example:**

* Banking sites block framing to prevent clickjacking attacks.

**Follow-ups:**

* Difference X-Frame-Options vs CSP frame-ancestors? → CSP is newer, more flexible.
* What’s a “UI redress attack”? → Trick user to click invisible button.
* When would you allow embedding? → Widgets, but only trusted origins.

---

## 8. Secure WebAssembly (WASM)

**Problem:**

* WASM gives near-native speed in browser, but also **expands attack surface**.
* Bugs in WASM libs can lead to memory leaks, sandbox escapes.

**Solution:**

* Run WASM inside **CSP sandboxed environment**.
* Use **cross-origin isolation** when using SharedArrayBuffer in WASM.
* Audit WASM dependencies like native libs.

**Detailed Design:**

```http
Content-Security-Policy: script-src 'self'; object-src 'none';
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

**Perf/Scaling Notes:**

* WASM is very fast (\~near C++).
* Isolation adds minimal overhead.

**Pitfalls:**

* Over-trusting WASM libs → may contain unsafe native code.
* Lack of source map/debugging makes auditing harder.

**Real-world Example:**

* Figma runs WASM (Rust → WASM) for vector editing.
* Google Earth uses WASM for 3D rendering.

**Follow-ups:**

* Why isolate WASM? → Prevent Spectre-style leaks.
* How to debug WASM security? → Use browser devtools + fuzzing.
* What’s the biggest WASM risk? → Unsafe memory handling.

---

# 📘 Key Takeaways – Batch #18

* **Trusted Types** → centralize sanitization, prevent unsafe DOM injections.
* **Supply chain security** → audit dependencies, lockfiles, SRI.
* **Cross-origin isolation** → enable WASM, SharedArrayBuffer safely.
* **Sandbox iframes** → protect against 3rd party content risks.
* **SRI** → verify script integrity.
* **Dependency confusion defense** → scoped pkgs, internal registries.
* **Clickjacking defense** → X-Frame-Options + frame-ancestors CSP.
* **WASM security** → sandbox + audit.

---

# 📑 Quick-Reference (Batch #18)

* **Trusted Types**: block unsafe sinks.
* **NPM security**: lockfiles, audits, Snyk.
* **COOP/COEP**: isolation for SharedArrayBuffer/WASM.
* **Iframes**: sandbox + postMessage.
* **SRI**: integrity hashes on CDN libs.
* **Pkg confusion**: private registry + scopes.
* **Clickjacking**: CSP frame-ancestors.
* **WASM**: isolate + audit.