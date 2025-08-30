# 🚀 Interview Gold – Batch #15 (Cross-Platform Frontend Gold)

---

## 1. Progressive Web Apps (PWA)

**Problem:**

* Native apps require app store installs, large binaries.
* Many users drop off before downloading.
* Businesses want **installable, offline-capable web apps**.

**Solution:**

* **PWA** = website with app-like features: offline, push notifications, home-screen install.
* Uses **Service Workers + Web App Manifest**.

**Detailed Design:**

* **Manifest** (`manifest.json`):

  ```json
  {
    "name": "MyApp",
    "start_url": "/",
    "display": "standalone",
    "icons": [{ "src": "/icon.png", "sizes": "192x192" }]
  }
  ```
* **Service Worker**: cache assets + handle offline.
* **Install Prompt**: browser prompts user to add to home screen.

**Performance Notes:**

* Near-native UX.
* Uses existing browser → small install size (<1MB).

**Pitfalls:**

* Limited access to hardware APIs (Bluetooth, NFC, etc.).
* iOS Safari PWA support weaker (no push until recently).

**Real-world Example:**

* Twitter Lite: PWA → 600KB install, 65% less data, 3x engagement.

**Follow-ups:**

* How does PWA differ from native app? → Runs in browser, limited APIs.
* Why does caching matter? → Speeds up offline/low network usage.
* How to debug PWA? → Chrome DevTools → Application tab.

---

## 2. React Native (Cross-Platform Mobile)

**Problem:**

* Separate native iOS & Android teams → duplicated work.
* Businesses want **one codebase** for both.

**Solution:**

* **React Native**: write UI in JS/TS → bridge calls native APIs.
* Components map to real native views (not webview).

**Detailed Design:**

```js
import { Text, View } from 'react-native';

export default function App() {
  return <View><Text>Hello Native!</Text></View>;
}
```

* Core idea: React state → native UI tree.
* Uses “bridge” to call native modules (Camera, Geolocation).

**Performance Notes:**

* Faster than Cordova/Hybrid (uses real native components).
* Slower than fully native (bridge overhead).

**Pitfalls:**

* Complex UIs (scroll-heavy, animations) may need native modules.
* Debugging across platforms tricky.

**Real-world Example:**

* Instagram uses RN for stories & some screens.
* Walmart moved 95% of code to RN.

**Follow-ups:**

* Difference between RN & PWA? → RN = native app, PWA = browser app.
* How to optimize RN perf? → Use Hermes engine, avoid bridge chattiness.
* When would you choose native instead? → Perf-critical (games, AR).

---

## 3. Electron (Cross-Platform Desktop Apps)

**Problem:**

* Teams want desktop apps (Windows, macOS, Linux).
* Writing in C++/native = expensive, duplicated effort.

**Solution:**

* **Electron**: bundle Chromium + Node.js → run web apps as desktop apps.

**Detailed Design:**

* Main process = Node runtime.
* Renderer process = Chromium (browser-like).
* Use IPC (inter-process comm) to talk between them.

```js
// main.js
const { app, BrowserWindow } = require("electron");

app.on("ready", () => {
  const win = new BrowserWindow({ width: 800, height: 600 });
  win.loadFile("index.html");
});
```

**Performance Notes:**

* Same code runs across all desktop platforms.
* Heavy: each app ships Chromium (\~150MB).

**Pitfalls:**

* Memory hog (multiple Electron apps = multiple Chromiums).
* Security risk if Node integration misused.

**Real-world Example:**

* VS Code, Slack, Discord = Electron.

**Follow-ups:**

* Why Electron heavy? → Bundles full Chromium per app.
* Alternatives? → Tauri (Rust + WebView), NeutralinoJS.
* How to secure Electron app? → Disable `nodeIntegration` in renderer.

---

## 4. Hybrid Apps (Cordova, Capacitor, Ionic)

**Problem:**

* Need **mobile apps** but want to reuse web skills.
* Early solutions = embed app in a **WebView container**.

**Solution:**

* Frameworks (Cordova, Capacitor, Ionic) → wrap web apps in WebView + plugins for native APIs.

**Detailed Design:**

* Web app runs in hidden browser view.
* JS bridges → native API calls (camera, push, GPS).

**Performance Notes:**

* Easier to build with web stack.
* Slower than React Native → all UI is WebView.

**Pitfalls:**

* Heavy animations lag.
* Native feel harder to match.

**Real-world Example:**

* Early Facebook app (before React Native) was hybrid.
* Many banking apps still hybrid.

**Follow-ups:**

* Difference hybrid vs RN? → Hybrid = WebView, RN = native components.
* When hybrid acceptable? → Internal apps, less perf critical.
* What about offline? → Needs Service Worker + local DB.

---

## 5. Shared Code Across Web/Mobile (Mono-repo Strategy)

**Problem:**

* Teams want **shared business logic** (validation, API calls) across platforms.
* Hard to maintain in separate repos.

**Solution:**

* **Mono-repo with shared packages** (Nx, Turborepo).
* Platform-specific UIs, but shared core logic.

**Detailed Design:**

```
/packages
   /api-client
   /auth
   /ui-shared
/apps
   /web (React)
   /mobile (React Native)
```

* Shared API logic imported into both apps.
* UI differs, business rules consistent.

**Performance Notes:**

* Prevents duplicated bugs.
* Better DX with one repo.

**Pitfalls:**

* Must manage platform-specific code carefully (e.g., `.web.js` vs `.native.js`).
* Dependency graph complexity.

**Real-world Example:**

* Shopify uses monorepo for web & mobile.
* Expo + Next.js share code in mono-repo.

**Follow-ups:**

* Why separate UI but share logic? → Different rendering engines.
* How to conditionally import code? → React Native’s `.native.js` file convention.
* Tools for monorepos? → Nx, Turborepo, Lerna.

---

## 6. Performance Trade-offs Across Platforms

**Problem:**

* Same codebase doesn’t always perform equally across web, mobile, desktop.

**Solution:**

* **Platform-aware optimizations**:

  * Web: optimize bundle size, lazy load.
  * Mobile: reduce bridge calls, preload data.
  * Desktop: limit Electron memory use, optimize IPC.

**Detailed Design:**

* Use **feature flags** per platform.
* Write platform-specific modules when needed.

```js
if (Platform.OS === "web") {
  import("./web-tracker");
} else {
  import("./native-tracker");
}
```

**Performance Notes:**

* Accept that 100% reuse isn’t realistic.
* Focus on **80% shared logic, 20% platform UI optimizations**.

**Pitfalls:**

* Over-abstracting → fragile, complex code.
* Not testing on real devices → perf surprises.

**Real-world Example:**

* Discord uses RN + Electron, but rewrote perf-heavy screens in native code.

**Follow-ups:**

* Why not always use RN/Electron? → Perf cost.
* How to decide rewrite in native? → Measure slowest bottlenecks.
* When is 100% shared code realistic? → Mostly internal tools.

---

## 7. Offline & Sync Strategies (Cross-Platform)

**Problem:**

* Users expect apps to **work offline** (esp. mobile).
* Data must sync once online.

**Solution:**

* **Local-first architecture**: IndexedDB/SQLite + sync layer.
* Conflict resolution via CRDTs or “last-write-wins.”

**Detailed Design:**

* Web: IndexedDB via Dexie.js.
* Mobile: SQLite (React Native SQLite).
* Background sync when online.

```js
function saveOffline(data) {
  localDB.save(data);
  if (navigator.onLine) syncWithServer();
}
```

**Performance Notes:**

* Reduces user frustration.
* Works across flaky networks.

**Pitfalls:**

* Sync conflicts → must define merge strategy.
* Storage limits differ (Web: \~50MB, Mobile: GBs).

**Real-world Example:**

* Notion syncs across devices using CRDTs.
* Google Docs offline editing.

**Follow-ups:**

* How to prevent duplicate API calls on sync? → UUID per request.
* How to merge conflicting edits? → CRDTs or user merge UI.
* Difference IndexedDB vs localStorage? → IndexedDB = structured, async, bigger.

---

# 📘 Key Takeaways – Batch #15

* **PWAs** → installable web apps, offline-first.
* **React Native** → cross-platform mobile, near-native perf.
* **Electron** → desktop apps, heavy but universal.
* **Hybrid (Cordova/Capacitor)** → WebView-based, simpler but slower.
* **Mono-repo sharing** → one repo, shared business logic.
* **Perf trade-offs** → 80% shared, 20% platform-specific.
* **Offline sync** → IndexedDB/SQLite + conflict resolution.

---

# 📑 Quick-Reference (Batch #15)

* **PWA**: Service Worker + manifest, offline, installable.
* **RN**: native components via JS bridge.
* **Electron**: Chromium + Node, heavy.
* **Hybrid**: WebView + plugins.
* **Shared Code**: Nx/Turborepo monorepo.
* **Perf**: platform-aware optimizations.
* **Offline**: local DB + sync on reconnect.