# 🔎 Problem #21: Microfrontend Router (Stitching MFEs Together)

---

## Step 1. Interviewer starts:

*"Suppose you have 3 microfrontends (Auth, Dashboard, Profile). How would you route between them?"*

---

### ✅ Basic Router Shell

```js
class MicrofrontendRouter {
  constructor(routes) {
    this.routes = routes; // { "/auth": loadAuth, "/profile": loadProfile }
    window.addEventListener("popstate", () => this.render(location.pathname));
  }

  navigate(path) {
    history.pushState({}, "", path);
    this.render(path);
  }

  render(path) {
    const mountFn = this.routes[path];
    if (mountFn) mountFn(document.getElementById("root"));
    else document.getElementById("root").innerHTML = "404";
  }
}
```

✔ Supports client-side navigation.

---

## Step 2. Interviewer adds:

*"But these MFEs are **separately deployed bundles**. How do you load them?"*

---

### ✅ Remote Module Loading (Webpack Module Federation / dynamic import)

```js
async function loadRemote(url, scope, module) {
  await __webpack_init_sharing__("default");
  const container = window[scope];
  await container.init(__webpack_share_scopes__.default);
  const factory = await container.get(module);
  return factory();
}
```

Then in router:

```js
const router = new MicrofrontendRouter({
  "/auth": root => loadRemote("http://auth.com/remoteEntry.js", "authApp", "./App").then(App => App.mount(root)),
  "/dashboard": root => loadRemote("http://dash.com/remoteEntry.js", "dashApp", "./App").then(App => App.mount(root)),
});
```

✔ Loads MFEs **on demand**.

---

## Step 3. Interviewer twists:

*"What about **nested routes** (e.g., `/profile/settings`)?"*

---

### ✅ Nested Routes

* Router tree:

```js
{
  "/profile": {
    mount: loadProfile,
    children: {
      "/settings": loadProfileSettings
    }
  }
}
```

* Resolution = longest prefix match.

---

## Step 4. Interviewer pushes:

*"How do you handle **shared state** across MFEs (auth token)?"*

---

### ✅ Shared State Bus

* Use `postMessage`, RxJS, or an event emitter:

```js
class GlobalBus {
  constructor() { this.listeners = {}; }
  on(ev, cb) { (this.listeners[ev] ||= []).push(cb); }
  emit(ev, data) { (this.listeners[ev] || []).forEach(cb => cb(data)); }
}

window.bus = new GlobalBus();
```

✔ Auth MFE → `bus.emit("auth:login", user)`
✔ Dashboard MFE → `bus.on("auth:login", user => renderDashboard(user))`

---

## Step 5. Interviewer final boss:

*"What about **SEO, performance, and error isolation**?"*

---

### ✅ Real-World Discussion

* **SEO** → server-side router shell must serve HTML (Next.js, Remix).
* **Performance** → preload MFEs via `link rel="prefetch"`.
* **Error isolation** → if one MFE crashes, keep others alive → `iframe` or error boundaries.
* **Tradeoff** → iFrame (strong isolation, slower comms) vs Module Federation (tight coupling, faster).

---

# 🎯 Takeaways (Microfrontend Router)

* ✅ Step 1: Router shell.
* ✅ Step 2: Remote bundle loading.
* ✅ Step 3: Nested routes.
* ✅ Step 4: Shared state bus.
* ✅ Step 5: Discuss SEO, perf, error isolation.
