# Next.js Expert Revision Handbook

## Part 1: Fundamentals & Core Concepts

---

## 1. What is Next.js?

**Definition:**
Next.js is a **React framework** that provides built-in features like **server-side rendering (SSR)**, **static site generation (SSG)**, **incremental static regeneration (ISR)**, **API routes**, and optimized bundling. It enables both **client-side and server-side React apps** with performance and scalability in mind.

### ✅ Key Points

* Built on **React + Node.js** runtime.
* Provides **hybrid rendering**: choose SSR, SSG, CSR, or ISR **per page/route**.
* Optimized for **performance, SEO, and DX** (Developer Experience).
* Vercel is the company behind Next.js — tightly integrated with deployment/CDN workflows.

### ⚠️ Gotchas

* Misusing rendering strategies (e.g., SSR everywhere) can **slow down performance**.
* Certain Node APIs aren’t available in **Edge runtime**.
* **App Router** (Next 13+) fundamentally changes architecture — not all libraries are compatible yet.

### 📋 Example

```js
// pages/index.js (Pages Router)
export default function Home() {
  return <h1>Hello, Next.js!</h1>
}
```

```js
// app/page.js (App Router - Next.js 13+)
export default function Page() {
  return <h1>Hello from the App Router!</h1>
}
```

### 🎯 Interview One-Liner

> “Next.js is a full-stack React framework that gives you SSR, SSG, ISR, routing, and API routes out of the box — allowing you to pick the right rendering strategy per page for performance and SEO.”

---

## 2. File-Based Routing

**Definition:**
Next.js uses a **file system-based router** — each file in `pages/` (or `app/` in Next 13+) automatically becomes a route.

### ✅ Key Points

* No need for `react-router`.
* Nested folders = nested routes.
* Dynamic routes with `[param].js`.
* Catch-all routes with `[...slug].js`.
* App Router adds **layouts, nested routes, and parallel routes**.

### ⚠️ Gotchas

* File-based routing can feel restrictive compared to declarative routing.
* Nested layouts in App Router require explicit `layout.js` files.
* Mixing Pages Router and App Router is possible, but can complicate mental models.

### 📋 Example

```js
// pages/blog/[id].js
export default function BlogPost({ params }) {
  return <h1>Post {params.id}</h1>
}
```

```js
// app/blog/[id]/page.js
export default function BlogPost({ params }) {
  return <h1>Post {params.id}</h1>
}
```

### 🎯 Interview One-Liner

> “Next.js routing is file-based: files = routes. Dynamic segments use `[param]`. The App Router adds nested layouts and parallel routing.”

---

## 3. Pages Router vs App Router

**Definition:**
Next.js has **two router paradigms**:

* **Pages Router (`pages/`)** → Stable, classic, SSR/SSG/ISR APIs.
* **App Router (`app/`)** → Introduced in Next 13, built on **React Server Components (RSC)**, offers layouts, streaming, and better DX.

### ✅ Key Points

* App Router supports **server vs client components**.
* Layouts allow **persistent UI across routes** (e.g., navbars).
* Data fetching unified with async components & `fetch`.
* Pages Router will remain supported but new features go to App Router.

### ⚠️ Gotchas

* Not all npm libraries support RSC yet (must be marked `"use client"`).
* Migration from Pages → App Router can be non-trivial.
* Mixing both is allowed, but **not recommended long-term**.

### 📋 Example

```js
// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
```

### 🎯 Interview One-Liner

> “The Pages Router is stable and uses classic SSR/SSG APIs, while the App Router leverages React Server Components for layouts, streaming, and new data-fetching primitives.”

---

## 4. Server vs Client Components

**Definition:**
Next.js App Router splits React components into **Server Components** (default) and **Client Components** (explicit).

### ✅ Key Points

* **Server Components**:

  * Default, rendered on server.
  * Can fetch data directly from DB or API.
  * No bundle size impact on client.
* **Client Components**:

  * Explicit via `"use client"`.
  * Needed for interactivity (state, effects, event handlers).

### ⚠️ Gotchas

* Forgetting `"use client"` → hooks like `useState` and `useEffect` will break.
* Overusing Client Components bloats bundle size.
* Passing props between Server → Client must be **serializable** (no functions, no complex classes).

### 📋 Example

```js
// app/dashboard/page.js (Server Component)
export default async function Dashboard() {
  const data = await fetch("https://api.example.com/data").then(r => r.json());
  return <Chart data={data} />; // Chart can be client component
}
```

```js
// app/dashboard/Chart.js
"use client";
import { useState } from "react";

export default function Chart({ data }) {
  const [selected, setSelected] = useState(null);
  return <div onClick={() => setSelected(1)}>Chart goes here</div>;
}
```

### 🎯 Interview One-Liner

> “In the App Router, components are Server by default. You add `"use client"` for interactive components. Server Components reduce bundle size and can fetch data directly.”

---

Great choice 🙌 — the **edge cases & advanced interview-style questions** are exactly what sets apart a **senior/staff-level candidate**. Let’s go deeper into **Next.js Fundamentals & Core Concepts (Part 1 expanded)**.

---

## 5. Rendering Strategies in Practice

**Definition:**
Next.js allows **per-route rendering choices**: CSR, SSR, SSG, ISR.

### ✅ Key Points

* **CSR (Client-Side Rendering)** → normal React SPA, JS fetches data after hydration.
* **SSR (Server-Side Rendering)** → HTML rendered at request time on the server.
* **SSG (Static Site Generation)** → HTML prebuilt at build time.
* **ISR (Incremental Static Regeneration)** → static pages revalidated after intervals.

### ⚠️ Gotchas

* **SSR everywhere is slow** → TTFB (time to first byte) increases.
* **SSG large sites** → long build times unless using ISR.
* **ISR with dynamic params** → may serve stale content if revalidation not handled carefully.
* **CSR-only pages** → bad SEO unless you pre-render shells.

### 📋 Example (ISR)

```js
// app/posts/page.js
export default async function PostsPage() {
  const res = await fetch("https://api.example.com/posts", { next: { revalidate: 60 } });
  const posts = await res.json();
  return <PostsList posts={posts} />;
}
```

### 🎯 Interview One-Liner

> “Next.js supports CSR, SSR, SSG, and ISR. You pick per-route depending on SEO, freshness, and performance needs.”

---

## 6. The Role of Middleware

**Definition:**
Middleware in Next.js runs **before a request is completed**, allowing **auth, redirects, rewrites, logging, AB testing** at the edge.

### ✅ Key Points

* Written in `middleware.js`.
* Runs on **Edge runtime** (faster, limited Node APIs).
* Can rewrite, redirect, or block requests.
* Runs on every route unless scoped with matcher.

### ⚠️ Gotchas

* Runs on **all requests** (including assets) unless filtered.
* Limited Node APIs → no filesystem, no long-running DB connections.
* Too many rewrites in middleware can hurt cache/CDN performance.

### 📋 Example

```js
// middleware.js
import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("auth");
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"], // run only on dashboard routes
};
```

### 🎯 Interview One-Liner

> “Middleware runs before requests at the edge. It’s best for auth, redirects, and rewrites, but you can’t use full Node APIs there.”

---

## 7. Static Assets & Public Folder

**Definition:**
Files in the `public/` directory are served **as-is** at the site root.

### ✅ Key Points

* `public/favicon.ico` → `/favicon.ico`.
* Assets in `public/` bypass Webpack bundling (unoptimized).
* For images, prefer `next/image` instead of `public`.

### ⚠️ Gotchas

* Using large raw assets in `public/` → no optimization, hurts performance.
* Paths must be **absolute from root** (`/myfile.png` not `./myfile.png`).

### 📋 Example

```js
<img src="/logo.png" alt="Logo" />
```

### 🎯 Interview One-Liner

> “`public/` serves static assets at the root, bypassing bundling. For images, prefer `next/image` to get optimization benefits.”

---

## 8. Environment Variables in Next.js

**Definition:**
Next.js distinguishes **server-only** vs **client-exposed** environment variables.

### ✅ Key Points

* `.env.local`, `.env.development`, `.env.production`.
* Prefix with `NEXT_PUBLIC_` to expose to the client.
* Server-only vars available in Node runtime only.
* In App Router, you can safely use env vars directly in Server Components.

### ⚠️ Gotchas

* Forgetting `NEXT_PUBLIC_` → env var won’t be available in client bundle.
* Accidentally exposing secrets by adding `NEXT_PUBLIC_` where not needed.
* Env vars are **baked at build time** — redeploy required unless using runtime config.

### 📋 Example

```env
NEXT_PUBLIC_API_URL=https://api.example.com
SECRET_KEY=my-secret
```

```js
// server code
console.log(process.env.SECRET_KEY);

// client code
console.log(process.env.NEXT_PUBLIC_API_URL);
```

### 🎯 Interview One-Liner

> “Env vars without `NEXT_PUBLIC_` are server-only. Client needs explicit prefix. Env vars are baked at build time.”

---

## 9. Common Interview Traps (Next.js Fundamentals)

### ❓ Q: *What happens if you fetch data in a Client Component instead of a Server Component?*

**A:** Data fetching happens in the browser (CSR), bundle size grows, SEO suffers. Use Server Components when possible.

---

### ❓ Q: *Why would you choose ISR over SSR?*

**A:** ISR gives you static performance with periodic revalidation. SSR always regenerates HTML, slower at scale.

---

### ❓ Q: *Can you use `fs` (filesystem) in Next.js?*

**A:** Only in the **Node runtime** (SSR or build time). Not in Edge runtime or Client Components.

---

### ❓ Q: *Difference between `Link` in Next.js and `<a>` tag?*

**A:** `next/link` enables client-side navigation, prefetching, and avoids full reloads. `<a>` triggers full page reload.

---

### ❓ Q: *How does Next.js improve SEO compared to CRA?*

**A:** CRA renders client-side only → blank HTML until hydration. Next.js pre-renders HTML (SSR/SSG) → crawlers see real content.

---

## 10. Mixing Pages Router and App Router

**Definition:**
Next.js allows having **both `pages/` and `app/`** in the same project (for gradual migration).

### ✅ Key Points

* Routes in `app/` take precedence over `pages/`.
* Shared components (like `_app.js`, `_document.js`) don’t affect `app/`.
* API routes still live in `pages/api/` (App Router doesn’t replace them yet).

### ⚠️ Gotchas

* Conflicts when `pages/` and `app/` define the same route → `app/` wins.
* Different data-fetching APIs (`getServerSideProps` vs async Server Components).
* Middleware must be re-tested → subtle differences in App Router.
* Gradual migration can introduce inconsistent DX (some routes “old style”, some “new style”).

### 🎯 Interview One-Liner

> “You can mix Pages and App Router, but App takes precedence. The main risk is inconsistent data-fetching models across routes.”

---

## 11. Replacing `getServerSideProps` and `getStaticProps`

**Definition:**
In Pages Router, data-fetching is explicit with **`getServerSideProps`**, **`getStaticProps`**, and **`getStaticPaths`**.
In App Router, these are replaced by **async Server Components** and the `fetch` API with `cache`/`revalidate` options.

### ⚠️ Migration Pitfalls

* **No direct equivalent**:

  * `getServerSideProps` → move logic into an **async Server Component**.
  * `getStaticProps` + `getStaticPaths` → move to `fetch` with `{ cache: 'force-cache' }` + dynamic routes.
* ISR changes:

  * Pages → `revalidate` in `getStaticProps`.
  * App → `{ next: { revalidate: N } }` in `fetch`.
* You lose automatic `props` injection → now you must handle it manually.

### 📋 Example

```js
// Pages Router
export async function getServerSideProps() {
  const data = await fetch("https://api.example.com/posts").then(r => r.json());
  return { props: { data } };
}

// App Router
export default async function Page() {
  const res = await fetch("https://api.example.com/posts", { cache: "no-store" });
  const data = await res.json();
  return <Posts data={data} />;
}
```

### 🎯 Interview One-Liner

> “In App Router, `getServerSideProps` and `getStaticProps` disappear. You move logic into Server Components and control caching via fetch options.”

---

## 12. Replacing `_app.js` and `_document.js`

**Definition:**
In Pages Router:

* `_app.js` → wraps every page (global providers, layouts).
* `_document.js` → custom HTML shell (meta tags, lang).

In App Router:

* Replaced by **`app/layout.js`** and `app/head.js`.

### ⚠️ Migration Pitfalls

* Providers must move into **RootLayout**.
* Scripts/meta must move into `app/head.js` or `<head>` in layout.
* Order of execution is different: `RootLayout` is persistent, `_app.js` was re-rendered.

### 📋 Example

```js
// Pages Router _app.js
export default function App({ Component, pageProps }) {
  return (
    <Provider>
      <Component {...pageProps} />
    </Provider>
  );
}

// App Router app/layout.js
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
```

### 🎯 Interview One-Liner

> “In App Router, `_app.js` and `_document.js` are replaced by `layout.js` and `head.js`. Layouts persist, `_app.js` was re-mounted.”

---

## 13. Client-Side Navigation (`next/link`) Differences

**Definition:**
Navigation is slightly different in Pages vs App Router.

### ✅ Key Points

* Both use `next/link`.
* In App Router, `next/link` integrates with **React Server Components streaming**.
* Prefetching is smarter → can fetch both HTML and data payloads.

### ⚠️ Migration Pitfalls

* `legacyBehavior` prop needed in Pages sometimes; not in App.
* If you used custom `useRouter` methods heavily (Pages), you must now use **`usePathname`, `useSearchParams`, `useRouter` (new App version)**.

### 📋 Example

```js
// Pages Router
import { useRouter } from "next/router";
const router = useRouter();
router.push("/dashboard");

// App Router
import { useRouter } from "next/navigation";
const router = useRouter();
router.push("/dashboard");
```

### 🎯 Interview One-Liner

> “Navigation APIs differ — App Router uses `next/navigation`. Prefetching integrates with streaming for faster transitions.”

---

## 14. API Routes vs Server Actions

**Definition:**

* Pages Router → API routes in `pages/api/*.js`.
* App Router → You can still use API routes, but **Server Actions** are preferred for colocated mutations.

### ⚠️ Migration Pitfalls

* Server Actions only work in **Server Components**.
* Must enable experimental flag (`serverActions: true`).
* Not a full replacement for REST/GraphQL APIs (yet).

### 📋 Example

```js
// App Router Server Action
"use server";
export async function addPost(data) {
  await db.post.create({ data });
}
```

### 🎯 Interview One-Liner

> “API routes still work, but App Router introduces Server Actions for colocated mutations. They reduce API boilerplate but aren’t full replacements yet.”

---

## 15. Edge vs Node Runtime Differences

**Definition:**
Pages Router defaults to Node runtime.
App Router supports both Node **and Edge runtimes** (configurable).

### ⚠️ Migration Pitfalls

* Libraries using `fs`, `net`, `crypto` may break in Edge.
* Cookies/session handling works differently.
* DB connections (e.g., Prisma) may need pooling workarounds.

### 📋 Example

```js
export const runtime = "edge"; // opt into Edge runtime
```

### 🎯 Interview One-Liner

> “App Router can run on Edge. Great for latency, but Node APIs and DB drivers may break.”

---

## 🔥 Staff-Level Discussion Triggers

* **When would you keep using Pages Router in production?**

  > If you rely on `getServerSideProps`, legacy libraries incompatible with RSC, or need stability.

* **How to migrate incrementally from Pages → App?**

  > Start with new routes in `app/`, keep old ones in `pages/`. Move providers into RootLayout gradually.

* **What breaks when moving from `_app.js` to `layout.js`?**

  > Global providers, custom head tags, and script injection must be restructured.

---

## 16. Default Behavior

**Definition:**
In the App Router, **all components are Server Components by default**, unless explicitly marked with `"use client"`.

### ✅ Key Points

* Server Components: rendered on the server, no JS in the client bundle.
* Client Components: interactive, must use `"use client"`.
* Can **nest** Client Components inside Server Components, but not vice versa.

### ⚠️ Gotchas

* Forgetting `"use client"` → hooks like `useState`, `useEffect`, `useContext` fail.
* Client Components increase bundle size → avoid marking entire trees `"use client"`.

### 🎯 Interview One-Liner

> “In the App Router, everything is a Server Component unless you say `"use client"`. Hooks only work in Client Components.”

---

## 17. Props Passing & Serialization

**Definition:**
Server Components can pass **serializable props** down to Client Components.

### ✅ Key Points

* Allowed: primitives, arrays, plain objects, JSON-safe values.
* Forbidden: functions, class instances, Symbols, non-serializable data.
* This restriction ensures hydration consistency.

### ⚠️ Gotchas

* Passing a function (e.g., `onClick`) → ❌ serialization error.
* Passing DB client instance → ❌ breaks.
* Must restructure → pass **data, not behavior**.

### 📋 Example

```js
// ❌ Bad
<Chart onHover={(id) => console.log(id)} />

// ✅ Good
<Chart data={data} />
```

### 🎯 Interview One-Liner

> “Props between Server and Client must be serializable — no functions, no class instances. Pass data, not behavior.”

---

## 18. Third-Party Library Compatibility

**Definition:**
Many npm packages assume a **browser runtime** (DOM, window, localStorage). These must run in Client Components.

### ⚠️ Gotchas

* Libraries using `window` or `document` will break in Server Components.
* Heavy UI kits (Material UI, Chakra, React Query) → require `"use client"`.
* You may wrap them in Client Components and expose minimal props.

### 📋 Example

```js
// Client-only wrapper
"use client";
import { Button } from "@mui/material";

export default function ClientButton(props) {
  return <Button {...props} />;
}
```

### 🎯 Interview One-Liner

> “If a library depends on DOM or browser APIs, wrap it in a Client Component. Don’t mark your whole app `"use client"` just for one lib.”

---

## 19. Server-Only Operations

**Definition:**
Server Components can run **server-side code** that never ships to client.

### ✅ Key Points

* Can fetch data from DB directly (`prisma`, `mongoose`, SQL clients).
* Can read from filesystem (`fs`).
* Secure: secrets never leak to client.

### ⚠️ Gotchas

* Works only in **Node runtime**, not Edge (many DB drivers fail in Edge).
* If you accidentally make it a Client Component → secrets could leak.

### 📋 Example

```js
// app/dashboard/page.js
import db from "@/lib/db";

export default async function Dashboard() {
  const users = await db.user.findMany();
  return <UsersList users={users} />;
}
```

### 🎯 Interview One-Liner

> “Server Components can access DB and filesystem directly, but if you mistakenly make them client-side, you risk exposing secrets.”

---

## 20. Client Hooks Limitations

**Definition:**
React hooks only work in Client Components.

### ⚠️ Gotchas

* `useState`, `useEffect`, `useLayoutEffect`, `useRef`, `useContext` → Client only.
* `useParams`, `useRouter`, `useSearchParams` (Next.js hooks) → Client only.
* Using them in Server Component → runtime error.

### 📋 Example

```js
// ❌ Invalid
export default function ServerComp() {
  const [count, setCount] = useState(0); // Error
  return <p>{count}</p>;
}

// ✅ Valid
"use client";
export default function ClientComp() {
  const [count, setCount] = useState(0);
  return <p>{count}</p>;
}
```

### 🎯 Interview One-Liner

> “All React stateful hooks only work in Client Components. Server Components are stateless, pure, async functions.”

---

## 21. Performance Trade-offs

**Definition:**
Choosing Server vs Client has **bundle size and performance implications**.

### ✅ Key Points

* Server Components → zero client bundle cost, ideal for static content.
* Client Components → interactive but add bundle weight.
* Nesting deep Client Components increases hydration cost.

### ⚠️ Gotchas

* Overusing Client Components → performance degrades (hydration bottleneck).
* Overusing Server Components → too many round trips to server, no interactivity.

### 🎯 Interview One-Liner

> “Server Components shrink bundle size; Client Components give interactivity. Optimal apps minimize Client Components at the edges.”

---

## 22. Streaming & Suspense

**Definition:**
Server Components enable **React 18 streaming**: send HTML in chunks as data loads.

### ✅ Key Points

* `<Suspense>` boundaries allow partial rendering.
* Improves TTFB and perceived performance.
* Streaming works only with Server Components.

### ⚠️ Gotchas

* Wrapping too many Suspense boundaries → waterfall effect.
* Must design fallback UI carefully (loading skeletons).

### 📋 Example

```js
import { Suspense } from "react";
import Posts from "./Posts";

export default function Page() {
  return (
    <Suspense fallback={<p>Loading posts...</p>}>
      <Posts /> {/* Server Component */}
    </Suspense>
  );
}
```

### 🎯 Interview One-Liner

> “Server Components + Suspense allow streaming — pages load progressively instead of waiting for all data.”

---

## 23. Staff-Level Discussion Questions

* **Q: Why can’t Server Components hold React state?**
  A: They’re pure async functions, rendered once per request. State is meaningless there.

* **Q: Can Server Components include event handlers?**
  A: No. Event handlers require browser JS, so only Client Components can use them.

* **Q: Why do Client Components bloat the bundle?**
  A: They’re compiled into browser JS. Server Components are stripped after rendering.

* **Q: What if you accidentally fetch data inside a Client Component?**
  A: That data-fetching shifts to the browser (CSR), losing SEO/TTFB benefits.

* **Q: Can you share context between Server and Client Components?**
  A: Yes, but context providers must be in Client Components. Server Components can consume them by being rendered inside.

---

## 24. Middleware Fundamentals

**Definition:**
Middleware runs **before a request is completed**, allowing **rewrites, redirects, headers, logging, and authentication** at the **edge network** (close to the user).

### ✅ Key Points

* Lives in `middleware.js` or `middleware.ts`.
* Executes on **Edge runtime** (ultra-low latency, limited APIs).
* Can:

  * Redirect to login
  * Rewrite paths (A/B testing, i18n)
  * Add custom headers (security, cache control)

### ⚠️ Gotchas

* Runs on **every request** (including assets) unless filtered by `matcher`.
* **Cold starts** are minimal, but still exist (few ms).
* Edge runtime = **no Node APIs** (e.g., `fs`, `crypto.randomBytes`).
* Can cause cache fragmentation if misused with rewrites.

### 📋 Example

```js
// middleware.js
import { NextResponse } from "next/server";

export function middleware(req) {
  const isLoggedIn = req.cookies.get("auth_token");
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"], // only run on dashboard
};
```

### 🎯 Interview One-Liner

> “Middleware runs at the edge before requests finish. It’s best for auth, redirects, and rewrites — but limited Node APIs and cache risks apply.”

---

## 25. Edge Runtime vs Node Runtime

**Definition:**
Next.js lets you choose between **Node.js runtime** and **Edge runtime** per route.

### ✅ Key Points

* **Node runtime**: full Node APIs (`fs`, `crypto`, DB drivers).
* **Edge runtime**: faster, global distribution, limited APIs.
* Select with:

  ```js
  export const runtime = "edge";
  ```

### ⚠️ Gotchas

* **DB drivers break** in Edge (Prisma, MongoDB drivers need pooling). Use HTTP-based APIs instead (e.g., Prisma Data Proxy, PlanetScale).
* **Crypto differences**: Web Crypto only in Edge (`crypto.subtle`).
* **Streaming**: Edge excels at React 18 streaming + Suspense.
* **Session handling**: Some JWT/session libs rely on Node APIs → need Edge-safe alternatives.

### 📋 Example

```js
// app/page.js
export const runtime = "edge"; // run on Edge
```

### 🎯 Interview One-Liner

> “Node runtime supports all Node APIs but only runs in a region. Edge runtime is faster, global, but limited to Web APIs.”

---

## 26. Use Cases for Middleware + Edge Runtime

### ✅ Good Use Cases

* **Auth gating** → redirect unauthenticated users at the edge.
* **i18n routing** → detect `Accept-Language`, rewrite to `/fr/*`.
* **Feature flags / A/B testing** → split traffic at the edge.
* **Bot detection / rate limiting** → block malicious traffic before server load.

### ⚠️ Bad Use Cases

* **Heavy computation** (ML inference, crypto ops).
* **Direct DB queries** with drivers.
* **Long-running requests** (time-limited in Edge).

### 🎯 Interview One-Liner

> “Use Edge for light, global logic like auth, rewrites, or A/B testing. Avoid heavy compute and DB drivers.”

---

## 27. Performance Considerations

### ✅ Key Points

* Middleware runs **before caching** → can increase latency if misused.
* Too many rewrites → break CDN caching.
* Edge runtime eliminates **region lock-in** → users hit closest POP.

### ⚠️ Gotchas

* Overusing Middleware → every request takes a performance hit.
* Misconfigured matcher → even static assets trigger logic.
* Cache mismatch: rewriting `/` → `/landing` may bypass static cache.

### 🎯 Interview One-Liner

> “Middleware executes before caching. Too many rewrites ruin cache efficiency, hurting performance instead of helping.”

---

## 28. Staff-Level Trade-off Questions

### ❓ Q: *When would you choose Node runtime over Edge runtime?*

**A:** When you need Node APIs (e.g., DB drivers, filesystem) or long-running tasks.

### ❓ Q: *How would you implement auth with Edge middleware?*

**A:** Use JWTs in cookies. Middleware checks `req.cookies`, redirects if missing. Avoid DB lookups in Edge.

### ❓ Q: *How does Edge runtime impact caching?*

**A:** Middleware runs before cache. If you rewrite/redirect dynamically, you risk cache fragmentation.

### ❓ Q: *How do you make Prisma or MongoDB work on Edge?*

**A:** Use HTTP-based proxies (Prisma Data Proxy, Atlas Data API) since TCP pooling isn’t available.

---

# ✅ Summary (Part 1: Fundamentals)

You should now be confident in:

* Core Next.js rendering strategies (CSR, SSR, SSG, ISR).
* File-based routing (dynamic, catch-all).
* Pages Router vs App Router.
* Server vs Client Components.
* Middleware at the Edge.
* Static assets handling (`public/`, `next/image`).
* Environment variables (`NEXT_PUBLIC_` vs server-only).
* Common interview traps (data fetching in client comps, ISR vs SSR, SEO benefits).
* Mixing Pages + App Router (App takes precedence).
* `getServerSideProps` / `getStaticProps` replaced by async Server Components + fetch.
* `_app.js` / `_document.js` replaced by `layout.js` + `head.js`.
* Navigation APIs changed (`next/router` vs `next/navigation`).
* API routes remain, but Server Actions emerge in App Router.
* Edge runtime opens new perf gains but breaks Node APIs.
* Server Components are default, can access DB, FS, secrets, and shrink bundle size.
* Client Components are explicit (`"use client"`), required for hooks, interactivity, DOM APIs.
* Props must be serializable.
* Wrapping third-party DOM libs requires client wrappers.
* Streaming + Suspense make Server Components powerful, but fallback UI must be designed carefully.
* Interview-ready answers about **state, event handlers, bundle size, data-fetching trade-offs**.
* Rendering strategies (CSR, SSR, SSG, ISR).
* File-based routing with Pages vs App Router.
* Server vs Client Components (serialization, hooks, bundle trade-offs).
* Migration pitfalls (`getServerSideProps` → fetch, `_app.js` → layout.js).
* Middleware → pre-request auth, rewrites, i18n at the edge.
* Edge runtime → low-latency global logic, but no Node APIs.
* Staff-level trade-offs → cache efficiency, DB driver limitations, global vs regional execution.

---

## Part 2: Data Fetching Strategies

---

## 1. Pages Router Data Fetching (`getStaticProps`, `getServerSideProps`, `getStaticPaths`)

**Definition:**
In the Pages Router (`pages/`), data fetching is done through special functions that run **only on the server**.

### ✅ Key Points

* `getStaticProps` → Runs at **build time**, generates static HTML.
* `getServerSideProps` → Runs **on every request**, returns fresh HTML.
* `getStaticPaths` → Used with `getStaticProps` for **dynamic routes** (pre-build a list of pages).
* Props returned are serialized and injected into the component.

### ⚠️ Gotchas

* `getStaticProps` → build time grows with number of pages. ISR needed for large sites.
* `getServerSideProps` → hurts performance if used everywhere; each request hits server.
* `getStaticPaths` → must return all paths unless using `fallback`. Wrong `fallback` config = 404 or blank pages.

### 📋 Example

```js
// pages/posts/[id].js
export async function getStaticPaths() {
  const posts = await fetch("https://api.example.com/posts").then(r => r.json());
  return {
    paths: posts.map(p => ({ params: { id: p.id.toString() } })),
    fallback: "blocking", // or true / false
  };
}

export async function getStaticProps({ params }) {
  const post = await fetch(`https://api.example.com/posts/${params.id}`).then(r => r.json());
  return { props: { post }, revalidate: 60 }; // ISR
}

export default function Post({ post }) {
  return <h1>{post.title}</h1>;
}
```

### 🎯 Interview One-Liner

> “Pages Router uses `getStaticProps` (build-time), `getServerSideProps` (request-time), and `getStaticPaths` (dynamic SSG). They’re serialized into props and can leverage ISR.”

---

## 2. App Router Data Fetching (`fetch`, `cache`, `revalidate`)

**Definition:**
In the App Router (`app/`), data fetching is unified under the **async component model** — no more special functions.

### ✅ Key Points

* Data is fetched directly in **Server Components**.
* `fetch` is enhanced with caching:

  * `cache: "force-cache"` → SSG (static).
  * `cache: "no-store"` → SSR (always fresh).
  * `{ next: { revalidate: N } }` → ISR.
* Async/await in components makes data-fetching **composable**.

### ⚠️ Gotchas

* Must run fetches in **Server Components**. If done in Client Components, it becomes CSR → SEO loss.
* Forgetting cache/revalidate options leads to **unintended caching**.
* Passing fetched data to Client Components must be **serializable**.

### 📋 Example

```js
// app/posts/page.js
export default async function PostsPage() {
  const res = await fetch("https://api.example.com/posts", {
    next: { revalidate: 60 }, // ISR
  });
  const posts = await res.json();
  return <PostsList posts={posts} />;
}
```

### 🎯 Interview One-Liner

> “App Router removes `getServerSideProps` & co. You fetch directly in Server Components and control caching with `fetch` options.”

---

## 3. ISR (Incremental Static Regeneration) vs SSR

**Definition:**
ISR regenerates static pages **on demand** after a timeout, while SSR regenerates **on every request**.

### ✅ Key Points

* ISR uses **stale-while-revalidate** → cached page served instantly, then background revalidation.
* SSR blocks request until new HTML is generated.
* ISR scales better for large sites (lower server load).

### ⚠️ Gotchas

* ISR requires CDN/CDN-edge cache support (works seamlessly on Vercel).
* May serve **stale content** briefly until revalidation.
* For highly dynamic data (stocks, sports scores), SSR is safer.

### 🎯 Interview One-Liner

> “ISR = stale-while-revalidate; SSR = always fresh but slower. ISR is ideal for content-heavy sites, SSR for dynamic data.”

---

## 4. Parallel vs Sequential Data Fetching

**Definition:**
In the App Router, multiple `await fetch()` calls can be run in **parallel** for performance.

### ✅ Key Points

* Sequential fetching = waterfalls = slow.
* Parallelize with `Promise.all` or by calling `fetch` without immediate `await`.
* Next.js deduplicates identical `fetch` calls (automatic caching).

### ⚠️ Gotchas

* Forgetting to parallelize multiple requests can tank TTFB.
* Deduplication only applies when requests are identical (same URL + options).

### 📋 Example

```js
// ❌ Sequential
const a = await fetch("/api/a").then(r => r.json());
const b = await fetch("/api/b").then(r => r.json());

// ✅ Parallel
const [a, b] = await Promise.all([
  fetch("/api/a").then(r => r.json()),
  fetch("/api/b").then(r => r.json()),
]);
```

### 🎯 Interview One-Liner

> “Always parallelize multiple fetches. Next.js deduplicates identical fetch calls automatically.”

---

## 5. Streaming & Suspense

**Definition:**
Next.js supports **React 18 streaming**: HTML can be sent to the client in chunks while data loads.

### ✅ Key Points

* `<Suspense>` defines a boundary → fallback UI shown until child resolves.
* Improves **TTFB** and **perceived performance**.
* Streaming only works in **Server Components**.

### ⚠️ Gotchas

* Too many Suspense boundaries = waterfall effect.
* Poorly designed fallbacks (e.g., spinners everywhere) hurt UX.

### 📋 Example

```js
import { Suspense } from "react";

async function Posts() {
  const res = await fetch("https://api.example.com/posts");
  const posts = await res.json();
  return <ul>{posts.map(p => <li key={p.id}>{p.title}</li>)}</ul>;
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading posts...</p>}>
      <Posts />
    </Suspense>
  );
}
```

### 🎯 Interview One-Liner

> “Streaming + Suspense lets pages render progressively. Users see content faster instead of waiting for all data.”

---

## 6. Staff-Level Interview Traps

* **Q: What’s the difference between ISR in Pages Router vs App Router?**
  A: Pages → `revalidate` inside `getStaticProps`.
  App → `fetch` with `{ next: { revalidate: N } }`.

* **Q: If you fetch data in a Client Component, what happens?**
  A: It becomes CSR-only, hurting SEO and performance.

* **Q: How does Next.js handle caching for identical fetches?**
  A: It deduplicates them automatically in the same request cycle.

* **Q: How would you fetch DB data directly in App Router?**
  A: Use a Server Component. For Edge runtime, use an HTTP proxy since DB drivers often fail.

* **Q: When do you avoid ISR?**
  A: For data that must always be fresh (payments, live auctions).

---

# ✅ Summary (Part 2: Data Fetching Strategies)

You now deeply understand:

* **Pages Router** → `getStaticProps`, `getServerSideProps`, `getStaticPaths`.
* **App Router** → async fetch in Server Components with cache/revalidate options.
* **ISR vs SSR trade-offs**.
* **Parallel data fetching** (deduplication, avoiding waterfalls).
* **Streaming + Suspense** for progressive rendering.
* **Staff-level traps**: fetching in Client Components, DB in Edge runtime, stale ISR risks.

---

## Part 3: Routing & Navigation

---

## 1. Nested Layouts & Shared UI

**Definition:**
The App Router introduces **nested layouts** that persist across routes, replacing `_app.js` patterns from Pages Router.

### ✅ Key Points

* Each folder in `app/` can have its own `layout.js`.
* Layouts are **persistent** → don’t unmount on navigation.
* Great for sidebars, dashboards, headers.

### ⚠️ Gotchas

* Persisted layouts keep state (good for UX, bad for memory leaks).
* Must manually reset state if re-entering a layout where fresh data is expected.

### 📋 Example

```
app/
 ├─ dashboard/
 │   ├─ layout.js   // Sidebar layout
 │   ├─ page.js     // Dashboard home
 │   └─ settings/
 │       └─ page.js // Shares sidebar layout
```

### 🎯 Interview One-Liner

> “Layouts in App Router persist between navigations. Perfect for dashboards, but can hold stale state if not reset properly.”

---

## 2. Dynamic & Catch-All Routes

**Definition:**
Next.js supports `[param]`, `[...param]`, and `[[...param]]` for dynamic routes.

### ✅ Key Points

* `[id]` → matches `/posts/123`.
* `[...slug]` → catch-all, matches `/a/b/c`.
* `[[...slug]]` → optional catch-all, matches `/`, `/a`, `/a/b`.

### ⚠️ Gotchas

* In App Router, params come from `generateStaticParams` (SSG) or `params` object in Server Component.
* Forgetting `generateStaticParams` with `dynamicParams: false` → build-time error.

### 📋 Example

```js
// app/posts/[id]/page.js
export default async function Post({ params }) {
  return <h1>Post ID: {params.id}</h1>;
}
```

### 🎯 Interview One-Liner

> “Dynamic routes work with `[id]`, `[...slug]`, and `[[...slug]]`. In App Router, you fetch params via the Server Component props.”

---

## 3. Parallel & Intercepting Routes

**Definition:**
App Router introduces **parallel routes (`@folder`)** and **intercepting routes (`(..)`)**.

### ✅ Key Points

* Parallel routes let you render multiple UI segments side by side (e.g., tabs).
* Intercepting routes allow rendering a route in the context of another (like modals).

### ⚠️ Gotchas

* Parallel routes require **named slots** (`@modal`, `@feed`).
* Intercepting (`(..)`) can confuse back/forward navigation if not designed carefully.

### 📋 Example (modal intercept)

```
app/
 ├─ feed/
 │   └─ page.js
 ├─ photo/
 │   └─ [id]/
 │       └─ page.js
 └─ feed/
     └─ photo/
         └─ [id]/
             └─ page.js  // intercepts into feed as modal
```

### 🎯 Interview One-Liner

> “Parallel routes let you render multiple sections, intercepting routes let you overlay one route in the context of another (like a modal).”

---

## 4. Navigation Hooks

**Definition:**
Client navigation uses different APIs in Pages Router vs App Router.

### ✅ Key Points

* Pages Router: `useRouter` from `next/router`.
* App Router: `useRouter`, `usePathname`, `useSearchParams` from `next/navigation`.
* Navigation is **client-side** by default, but can prefetch with `<Link>`.

### ⚠️ Gotchas

* `useRouter` API is **different** between Pages and App Router.
* Search params in App Router are **URLSearchParams**, not plain objects.

### 📋 Example

```js
"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function DashboardNav() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <button onClick={() => router.push(`${pathname}?tab=analytics`)}>
      Go Analytics
    </button>
  );
}
```

### 🎯 Interview One-Liner

> “App Router uses `next/navigation` hooks (`useRouter`, `usePathname`, `useSearchParams`). They differ from Pages Router’s API, especially for query params.”

---

## 5. Middleware-Powered Routing

**Definition:**
Middleware can control routing globally before rendering.

### ✅ Key Points

* Useful for **auth gating, i18n, A/B testing**.
* Runs on **every request** unless scoped with `matcher`.
* Works at **edge runtime**.

### ⚠️ Gotchas

* Overusing rewrites → cache misses, perf regression.
* Middleware cannot access request body (only headers/cookies).

### 🎯 Interview One-Liner

> “Middleware handles global routing concerns like auth or i18n before rendering, but can hurt cache efficiency if overused.”

---

# ✅ Summary (Part 3: Routing & Navigation)

You’re now fluent in:

* Nested layouts (persistent UI, risk of stale state).
* Dynamic/catch-all routes (`[id]`, `[...slug]`, `[[...slug]]`).
* Parallel & intercepting routes for advanced UX (tabs, modals).
* Navigation APIs (`next/navigation` vs `next/router`).
* Middleware for global routing rules.

---

## Part 4: Rendering Models

---

## 1. SSR vs CSR vs SSG vs ISR

**Definition:**
Next.js supports multiple rendering models per route.

### ✅ Key Points

* **SSR**: HTML generated on request → fresh, but slower.
* **CSR**: JS bundle hydrates empty shell → fast builds, poor SEO.
* **SSG**: Pre-render at build → fast & cacheable.
* **ISR**: Stale-while-revalidate hybrid → cached + background rebuild.

### ⚠️ Gotchas

* SSR bottlenecks if DB/API latency is high.
* ISR may serve stale content briefly.
* CSR hurts SEO unless paired with prerendering.

### 🎯 Interview One-Liner

> “Next.js can render per route as SSR, CSR, SSG, or ISR. The choice depends on freshness vs performance trade-offs.”

---

## 2. Hybrid Rendering

**Definition:**
Different routes (or segments) can use different rendering strategies.

### ✅ Key Points

* `/blog` → SSG with ISR.
* `/dashboard` → SSR.
* `/about` → static SSG.
* Hybrid is the **default in large apps**.

### ⚠️ Gotchas

* Inconsistent caching → users see different freshness across routes.
* Harder to debug — need to trace per-route rendering.

### 🎯 Interview One-Liner

> “Next.js lets you mix rendering strategies per route — ideal for large apps with both static and dynamic needs.”

---

## 3. Streaming React Server Components

**Definition:**
With App Router + React 18, Next.js supports **streaming HTML in chunks**.

### ✅ Key Points

* Improves **TTFB** and interactivity.
* `<Suspense>` boundaries define streaming chunks.
* Works best with Server Components.

### ⚠️ Gotchas

* Too many boundaries = waterfalls.
* SEO crawlers may choke if content comes too late.

### 🎯 Interview One-Liner

> “Streaming sends HTML progressively with Suspense, letting users see content faster.”

---

## 4. Partial vs Full Hydration

**Definition:**
Hydration = attaching event listeners to server-rendered HTML.

### ✅ Key Points

* **Full hydration**: entire page re-hydrated (React default).
* **Partial hydration**: only Client Components hydrate.
* App Router enables **partial hydration by default**.

### ⚠️ Gotchas

* Marking too many components `"use client"` negates the benefit (bundle bloat).
* Debugging hydration mismatches is tricky (`Text content does not match`).

### 🎯 Interview One-Liner

> “Next.js App Router enables partial hydration — only Client Components hydrate. This reduces JS bundle size and speeds up boot.”

---

## 5. Edge vs Node Rendering

**Definition:**
Pages can render in **Node runtime** or **Edge runtime**.

### ✅ Key Points

* Edge runtime runs closer to users (lower latency).
* Node runtime allows DB drivers, `fs`, and other APIs.
* Choose per route with `export const runtime = "edge" | "node"`.

### ⚠️ Gotchas

* Edge runtime doesn’t support all Node APIs.
* DB pooling issues → need HTTP APIs (e.g., Prisma Data Proxy).
* Cold starts minimal at edge but still exist.

### 🎯 Interview One-Liner

> “Node runtime gives full APIs, Edge runtime gives global low-latency rendering. You trade power for speed.”

---

## Part 4 (Expanded): Rendering Models — Advanced Edge Cases

---

### 6. Hydration Mismatches

**Definition:**
A mismatch happens when HTML from the server doesn’t match what React expects on the client.

### ✅ Key Points

* Caused by **non-deterministic rendering** (random values, time-based output).
* React warns: *“Text content does not match server-rendered HTML”*.
* Dangerous because the client may re-render unexpectedly.

### ⚠️ Gotchas

* Using `Date.now()`, `Math.random()` in Server Components → mismatch on hydration.
* Locale-dependent rendering (dates, currency) → mismatch if server vs client locales differ.

### 📋 Example

```js
export default function Page() {
  return <p>Rendered at: {Date.now()}</p>; // ❌ mismatch
}
```

### 🎯 Interview One-Liner

> “Hydration mismatches happen when server and client HTML differ. Avoid non-deterministic values during SSR.”

---

### 7. SEO Trade-offs

**Definition:**
Rendering choice directly affects SEO and crawlability.

### ✅ Key Points

* SSR/SSG/ISR → fully rendered HTML → best for SEO.
* CSR → empty shell + JS hydration → weak SEO (bots may not run JS).
* Streaming + Suspense → SEO-safe if critical content appears early.

### ⚠️ Gotchas

* Overusing Suspense with spinners → Googlebot might index empty placeholders.
* ISR serving stale content → search engines may see outdated pages.

### 🎯 Interview One-Liner

> “For SEO, prefer SSR/SSG/ISR. CSR alone is poor. Ensure Suspense fallbacks don’t block critical SEO content.”

---

### 8. Caching Pitfalls

**Definition:**
Next.js relies heavily on caching for performance. Misconfigured caches cause subtle bugs.

### ✅ Key Points

* `fetch` in App Router caches by default (`force-cache`).
* Adding `no-store` ensures fresh data, but disables caching → perf hit.
* ISR uses CDN-level cache with background regeneration.

### ⚠️ Gotchas

* Forgetting to disable cache for user-specific data (e.g., dashboards) → users see each other’s data.
* Setting `revalidate` too low (e.g., 1s) → hammers backend.
* Middleware rewrites can bypass cache entirely.

### 🎯 Interview One-Liner

> “Caching in Next.js is powerful but risky: static by default, opt-out with `no-store`. Misuse can leak data or overload the backend.”

---

# ✅ Summary (Part 4 Expanded)

You’re now fluent in advanced rendering traps:

* **Hydration mismatches** → avoid non-deterministic rendering.
* **SEO trade-offs** → SSR/SSG/ISR > CSR, watch Suspense fallbacks.
* **Caching pitfalls** → wrong config leaks data or breaks performance.

---

## Part 5: Performance & Web Vitals

---

## 1. Web Vitals in Next.js

**Definition:**
Google’s Web Vitals measure real-user experience.

### ✅ Core Metrics

* **LCP (Largest Contentful Paint):** load speed (<2.5s).
* **FID (First Input Delay) → replaced by INP (Interaction to Next Paint):** responsiveness.
* **CLS (Cumulative Layout Shift):** visual stability.

### ✅ Next.js Built-ins

* `next/image` improves LCP.
* Prefetching links improves INP.
* Font optimization reduces CLS.

### 🎯 Interview One-Liner

> “Next.js helps optimize Web Vitals with Image, Font, and Link prefetching. LCP, INP, and CLS are the key metrics.”

---

## 2. Code Splitting & Bundle Analysis

**Definition:**
Next.js automatically splits code by route, but you can optimize further.

### ✅ Key Points

* Use `next/dynamic` for lazy loading.
* Analyze with `next-bundle-analyzer`.
* Remove unused imports to help tree-shaking.

### ⚠️ Gotchas

* Dynamic imports in Client Components add network requests.
* Over-splitting can cause many small bundles → HTTP overhead.

### 📋 Example

```js
import dynamic from "next/dynamic";
const HeavyChart = dynamic(() => import("./Chart"), { ssr: false });
```

### 🎯 Interview One-Liner

> “Next.js auto-splits by route, but you should dynamic-import heavy components and monitor with `bundle-analyzer`.”

---

## 3. Prefetching & Caching

**Definition:**
Next.js prefetches routes linked with `<Link>` by default.

### ✅ Key Points

* Prefetch = download JS + data for linked routes in viewport.
* `prefetch={false}` disables it (for rare routes).
* Built-in fetch caching → deduplication.

### ⚠️ Gotchas

* Prefetching too aggressively = wasted bandwidth.
* On slow networks, can hurt instead of help.

### 🎯 Interview One-Liner

> “Next.js prefetches linked routes by default for instant nav, but disable it when links are rare or expensive.”

---

## 4. Image & Font Optimization

**Definition:**
Next.js provides optimized handling for images & fonts.

### ✅ Images (`next/image`)

* Responsive, lazy-loaded by default.
* Optimized formats (WebP/AVIF).
* CDN caching.

### ⚠️ Gotchas

* Misusing `fill` prop → layout shifts.
* Serving huge uncompressed images → kills LCP.

### ✅ Fonts (`next/font`)

* Automatic subset generation.
* CSS-inlined → no Flash of Invisible Text (FOIT).
* Works with Google Fonts and custom fonts.

### ⚠️ Gotchas

* Using external font links → FOIT/CLS.
* Don’t load 10 weights you don’t use.

### 🎯 Interview One-Liner

> “Use `next/image` for responsive, cached images, and `next/font` for optimized fonts without CLS/FOIT.”

---

## 5. Async Scheduling (`requestIdleCallback`)

**Definition:**
Defer non-critical work until the browser is idle.

### ✅ Key Points

* Use for analytics, logging, low-priority tasks.
* Prevents blocking main thread.
* Polyfill for unsupported browsers.

### 📋 Example

```js
if (typeof window !== "undefined") {
  requestIdleCallback(() => {
    console.log("Low-priority task running");
  });
}
```

### 🎯 Interview One-Liner

> “Use `requestIdleCallback` for non-critical work like analytics — keeps main thread free for user interactions.”

---

# ✅ Summary (Part 5: Performance & Web Vitals)

You now know how to:

* Optimize **Web Vitals (LCP, INP, CLS)** with built-ins.
* Use **code splitting & bundle analysis** effectively.
* Balance **prefetching & caching**.
* Optimize **images & fonts** with Next.js tools.
* Use **async scheduling** for low-priority tasks.

---

## Part 5 (Expanded): Performance & Web Vitals — Advanced Optimization Cases

---

### 6. Bundle Optimization Case Studies

#### Case A: Heavy Charts in Dashboards

* Libraries like **Chart.js**, **Recharts**, **D3** can add **200–500 KB** to bundle.
* **Fix:**

  * Use `dynamic(() => import("chart-lib"), { ssr: false })`.
  * Load charts only when visible (`react-intersection-observer`).
  * Consider **pre-rendering static charts as SVG** for SEO.

⚠️ Pitfall: importing Chart.js globally → charts render everywhere, not just dashboard.

---

#### Case B: Maps Integration

* Libraries like **Leaflet**, **Mapbox GL** are very heavy (400 KB+).
* **Fix:**

  * Lazy-load maps only when needed (`dynamic` import).
  * Use static map images (Mapbox Static API) for non-interactive cases.

⚠️ Pitfall: Using SSR for maps → hydration mismatch (map tiles differ between server & client).

---

#### Case C: Dashboards with Data Tables

* Libraries like **AG Grid**, **TanStack Table** can bloat bundle.
* **Fix:**

  * Split into client-only components (`"use client"` + dynamic import).
  * Virtualize rows with libraries like **react-window**.

⚠️ Pitfall: Rendering thousands of rows without virtualization kills INP.

---

### 🎯 Interview One-Liner

> “For charts, maps, and tables, lazy-load heavy libs with `next/dynamic` and use virtualization or static fallbacks. Don’t SSR heavy interactive components.”

---

# ✅ Final Summary (Part 5 Expanded)

You now deeply understand:

* Core Web Vitals (LCP, INP, CLS).
* Code splitting & bundle analysis.
* Prefetching & caching trade-offs.
* Image & font optimization.
* Async scheduling (`requestIdleCallback`).
* **Case studies**: charts, maps, and data tables → lazy load + virtualization + static fallbacks.

---

## Part 6: State Management & Data Layer Integration

---

## 1. Context API in Next.js

**Definition:**
Context provides global state across the React tree.

### ✅ Key Points

* Use for **lightweight global state** (auth, theme, locale).
* In App Router, wrap in `layout.js` to persist across pages.
* Works with both Server + Client Components (but provider must be `"use client"`).

### ⚠️ Gotchas

* Overusing context = **re-renders everywhere**.
* Large objects in context → hydration overhead.

### 📋 Example

```js
"use client";
import { createContext, useState } from "react";

export const ThemeContext = createContext();

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

### 🎯 Interview One-Liner

> “Context is great for small global state, but avoid storing large/fast-changing data — it causes full tree re-renders.”

---

## 2. React Query / SWR Integration

**Definition:**
React Query and SWR provide advanced data-fetching + caching.

### ✅ Key Points

* **SWR** (by Vercel) → stale-while-revalidate, lightweight.
* **React Query** → more full-featured (mutations, retries, pagination).
* Combine with Next.js Server Components → Server fetches + Client caching.

### ⚠️ Gotchas

* Double-fetch risk: Server fetch + Client fetch overlap if not coordinated.
* SWR defaults to client-side fetching → not SEO-safe unless paired with SSR.

### 📋 Example (SWR)

```js
"use client";
import useSWR from "swr";

const fetcher = url => fetch(url).then(r => r.json());

export default function Profile() {
  const { data, error } = useSWR("/api/user", fetcher);
  if (error) return <p>Error</p>;
  if (!data) return <p>Loading...</p>;
  return <h1>Hello {data.name}</h1>;
}
```

### 🎯 Interview One-Liner

> “SWR and React Query are great for client caching. Use them with Server Components carefully to avoid double-fetching.”

---

## 3. Server Actions for Mutations

**Definition:**
Server Actions (App Router feature) let you **mutate data on the server directly from forms or buttons**.

### ✅ Key Points

* Marked with `"use server"`.
* Works like an RPC call → no need for API route.
* Automatically serializes inputs & outputs.

### ⚠️ Gotchas

* Only available in App Router.
* Must run in Server Component or form action.
* Limited to serializable inputs/outputs.

### 📋 Example

```js
// app/actions.js
"use server";

export async function addTodo(todo) {
  await db.todo.create({ data: { text: todo } });
}

// app/page.js
import { addTodo } from "./actions";

export default function Page() {
  return (
    <form action={addTodo}>
      <input name="todo" />
      <button type="submit">Add</button>
    </form>
  );
}
```

### 🎯 Interview One-Liner

> “Server Actions let you mutate server data directly without API routes — but only in App Router and with serializable inputs.”

---

## 4. Optimistic UI & Cache Invalidation

**Definition:**
Optimistic UI = updating the UI immediately before server confirmation.

### ✅ Key Points

* Improves perceived performance.
* Often paired with SWR/React Query for rollback on error.
* Next.js App Router doesn’t provide it natively → handled in Client Components.

### ⚠️ Gotchas

* Risk of showing wrong data if request fails.
* Must sync client + server state after rollback.

### 📋 Example

```js
"use client";
import useSWRMutation from "swr/mutation";

function Todos() {
  const { trigger } = useSWRMutation("/api/todos", addTodo);
  return (
    <button
      onClick={() => {
        // optimistic update
        trigger("new todo", { optimisticData: [...todos, "new todo"] });
      }}
    >
      Add Todo
    </button>
  );
}
```

### 🎯 Interview One-Liner

> “Optimistic UI shows changes instantly, then rolls back if mutation fails. It improves UX but risks temporary inconsistencies.”

---

## 5. Handling Stale Data in Hybrid Rendering

**Definition:**
Stale data occurs when static/ISR data doesn’t match live client updates.

### ✅ Key Points

* Common when combining ISR (static) with client-side mutations.
* Fix with **revalidation tags** (`revalidateTag`, `revalidatePath`).
* Trigger revalidation after mutation to keep ISR fresh.

### ⚠️ Gotchas

* Forgetting revalidation = UI shows outdated state.
* Over-triggering revalidation = hammering backend/CDN.

### 📋 Example

```js
"use server";
import { revalidatePath } from "next/cache";

export async function addTodo() {
  await db.todo.create({ text: "new task" });
  revalidatePath("/todos"); // refresh ISR cache
}
```

### 🎯 Interview One-Liner

> “Stale data happens when ISR collides with mutations. Use `revalidatePath` or `revalidateTag` to keep caches consistent.”

---

# ✅ Summary (Part 6: State Management & Data Layer Integration)

You’re now expert-level on:

* **Context API** for lightweight state.
* **SWR / React Query** for client caching.
* **Server Actions** for direct mutations (App Router only).
* **Optimistic UI** patterns for fast UX.
* **Stale data handling** with revalidation in ISR.

---

## Part 7: Styling & UI Integration

---

## 1. CSS Modules vs Global CSS

**Definition:**
Next.js supports **scoped CSS Modules** and **global CSS imports**.

### ✅ Key Points

* CSS Modules → `Component.module.css` → locally scoped classes.
* Global CSS → imported in `layout.js` or `_app.js` (must be at root).
* Scoped styles prevent class name collisions.

### ⚠️ Gotchas

* Importing global CSS inside non-root files = build error.
* CSS Modules still generate runtime class maps — slight overhead.

### 📋 Example

```css
/* button.module.css */
.primary {
  background: blue;
}
```

```js
import styles from "./button.module.css";
export default function Button() {
  return <button className={styles.primary}>Click</button>;
}
```

### 🎯 Interview One-Liner

> “Use CSS Modules for scoped styles, Global CSS only at root. Scoped avoids collisions, but large CSS files still bloat builds.”

---

## 2. Tailwind CSS in Next.js

**Definition:**
Utility-first CSS framework with JIT compilation.

### ✅ Key Points

* Officially supported with Next.js plugin.
* JIT compiles only used classes → smaller CSS.
* Pairs well with `dark:` variants for theming.

### ⚠️ Gotchas

* Overusing utilities = unreadable JSX.
* Purge misconfig = bloated CSS or missing classes.

### 📋 Example

```js
export default function Card() {
  return (
    <div className="p-4 bg-white dark:bg-black rounded-lg shadow-md">
      Hello
    </div>
  );
}
```

### 🎯 Interview One-Liner

> “Tailwind integrates seamlessly with Next.js via JIT, giving small builds. Just beware of utility soup.”

---

## 3. CSS-in-JS in SSR Context

**Definition:**
Libraries like **Styled Components**, **Emotion**, **Stitches** generate CSS at runtime.

### ✅ Key Points

* Next.js needs a **custom Babel config** or plugin for SSR.
* Styled Components + App Router requires `next.config.js` setup with SWC transform.
* Good for dynamic theming and design systems.

### ⚠️ Gotchas

* Runtime overhead vs static CSS.
* Slower than Tailwind/Modules if overused.

### 📋 Example (Styled Components)

```js
"use client";
import styled from "styled-components";

const Button = styled.button`
  background: blue;
  color: white;
`;

export default Button;
```

### 🎯 Interview One-Liner

> “CSS-in-JS works in Next.js but needs SSR setup. Great for theming, but comes with runtime cost.”

---

## 4. Next.js Fonts & Image Optimization

**Fonts:**

* `next/font` handles Google Fonts & local fonts.
* Subsetting = only load used characters.
* Prevents FOIT/CLS.

**Images:**

* `next/image` optimizes by default → responsive, lazy, CDN cached.
* Supports AVIF/WebP out of the box.

⚠️ Pitfalls:

* Forgetting width/height in `<Image>` = layout shift.
* Importing too many font weights.

---

## 5. Dark Mode & Theming

**Definition:**
Themes can be toggled with CSS vars or libraries like `next-themes`.

### ✅ Key Points

* Dark mode detection: `prefers-color-scheme`.
* Persist preference with localStorage/cookies.
* Use CSS vars for scalable theming.

### 🎯 Interview One-Liner

> “For theming, prefer CSS vars or `next-themes` with Tailwind. Persist user preference to avoid flicker.”

---

# ✅ Summary (Part 7: Styling & UI Integration)

You now know:

* CSS Modules vs Global CSS trade-offs.
* Tailwind setup and pitfalls.
* CSS-in-JS with SSR considerations.
* Fonts (`next/font`) + images (`next/image`).
* Dark mode and theming patterns.

---

## Part 8: Authentication & Security

---

## 1. NextAuth.js Deep Dive

**Definition:**
NextAuth.js is the de facto standard for authentication in Next.js.

### ✅ Key Points

* Supports **OAuth, JWT, credentials**.
* In App Router → server-side session via `getServerSession`.
* Middleware can enforce auth at the edge.

### ⚠️ Gotchas

* Session handling differs: App Router vs Pages Router.
* JWT storage must use secure cookies.
* Misconfigured providers → leaking tokens.

### 📋 Example

```js
// app/api/auth/[...nextauth]/route.js
import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";

export const authOptions = {
  providers: [GitHubProvider({ clientId: "...", clientSecret: "..." })],
};
export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### 🎯 Interview One-Liner

> “NextAuth handles sessions, OAuth, JWTs, and integrates with App Router via API routes and `getServerSession`.”

---

## 2. Role-Based Access Control (RBAC / ABAC)

**Definition:**
Controlling access based on roles or attributes.

### ✅ Key Points

* Use middleware to check roles before rendering pages.
* Roles stored in session/JWT claims.
* ABAC (attribute-based) = finer-grained, e.g. `region=EU`.

### ⚠️ Gotchas

* Middleware only has access to request headers/cookies, not DB.
* DB lookups in middleware = slow at edge runtime.

### 🎯 Interview One-Liner

> “RBAC/ABAC in Next.js is enforced via middleware + session claims. Keep checks lightweight at edge.”

---

## 3. Protecting API Routes & Server Actions

**Definition:**
Auth must extend to API routes and server actions, not just pages.

### ✅ Key Points

* API routes → check session with `getServerSession`.
* Server actions → must manually enforce auth inside action.
* Middleware can block unauthenticated users globally.

### 📋 Example

```js
// app/actions.js
"use server";
import { getServerSession } from "next-auth";

export async function secureAction() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");
}
```

### 🎯 Interview One-Liner

> “Protect API routes and server actions by checking session server-side. Never trust client props.”

---

## 4. CSRF Protection

**Definition:**
Cross-Site Request Forgery (CSRF) = forcing authenticated requests from another site.

### ✅ Next.js Mitigation

* Use **SameSite=strict cookies** by default.
* NextAuth provides built-in CSRF tokens for forms.
* Use POST for mutations, not GET.

### 🎯 Interview One-Liner

> “CSRF is mitigated with SameSite cookies + CSRF tokens. NextAuth handles this automatically.”

---

## 5. XSS & Secure Cookies

**Definition:**
Cross-Site Scripting (XSS) = injected JS runs in victim browser.

### ✅ Next.js Mitigation

* Use React’s auto-escaping for props.
* Use `dangerouslySetInnerHTML` only with sanitized input.
* Cookies should be `HttpOnly`, `Secure`, `SameSite=strict`.

### ⚠️ Gotchas

* Injecting user HTML directly = XSS risk.
* Edge runtime doesn’t support Node sanitization libs → must sanitize earlier.

### 🎯 Interview One-Liner

> “React auto-escapes by default, but unsafe HTML can trigger XSS. Always sanitize input and secure cookies.”

---

# ✅ Summary (Part 8: Authentication & Security)

You now know how to:

* Implement auth with **NextAuth.js**.
* Apply **RBAC/ABAC** via middleware.
* Secure **API routes & Server Actions**.
* Mitigate **CSRF with SameSite & tokens**.
* Prevent **XSS & cookie leaks** with React + secure headers.

---

## Part 9: Testing & Debugging

---

## 1. Unit & Integration Testing

**Definition:**
Next.js apps rely on **Jest** or **Vitest** for unit tests and **React Testing Library** for integration tests.

### ✅ Key Points

* Use **Jest/Vitest** for isolated logic (utilities, hooks).
* Use **React Testing Library** to test components in DOM-like environment.
* Mock Next.js APIs (`useRouter`, `next/navigation`, `Image`, `Link`).

### ⚠️ Gotchas

* Next.js APIs change between Pages vs App Router (mock carefully).
* `next/image` must be mocked in tests (or use `jest-next-dynamic`).

### 📋 Example (mocking useRouter)

```js
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
```

### 🎯 Interview One-Liner

> “Unit test hooks with Jest/Vitest, integration test components with React Testing Library, and mock Next.js APIs like router or Image.”

---

## 2. E2E Testing with Playwright / Cypress

**Definition:**
E2E simulates real user flows in browser.

### ✅ Key Points

* Playwright is officially recommended by Vercel.
* Runs against local Next.js server or deployed environment.
* Good for auth, navigation, and form flows.

### ⚠️ Gotchas

* E2E tests are slow → don’t overuse.
* Flaky if network requests not mocked.

### 📋 Example (Playwright)

```js
import { test, expect } from "@playwright/test";

test("navigates to dashboard", async ({ page }) => {
  await page.goto("/");
  await page.click("text=Dashboard");
  await expect(page).toHaveURL("/dashboard");
});
```

### 🎯 Interview One-Liner

> “Use Playwright for real browser E2E tests. Great for auth and navigation, but keep suite lean to avoid flakiness.”

---

## 3. Debugging in Next.js

### ✅ Tools

* **`console.log` in Server Components** → logs in terminal (not browser).
* **React DevTools** → inspect Client Components.
* **Next.js debug logs**: `DEBUG=next:*` env var.
* **Bundle analyzer** for performance debugging.

### ⚠️ Gotchas

* Server logs vs client logs → must check both.
* Streaming responses make stack traces harder to follow.

### 🎯 Interview One-Liner

> “Debug server-side issues in terminal, client issues in DevTools. Use DEBUG=next:\* and bundle analyzers for infra-level debugging.”

---

## 4. Common Interview Scenarios

* **Q:** How do you test Server Components?
  **A:** They’re async functions → test outputs, not interactions. Use integration tests.

* **Q:** How do you debug hydration mismatches?
  **A:** Log server vs client output, avoid non-deterministic code.

* **Q:** How do you test auth flows?
  **A:** Mock session in unit tests, run real auth in Playwright E2E.

---

# ✅ Summary (Part 9: Testing & Debugging)

You now know:

* Unit/integration testing with Jest/Vitest + RTL.
* E2E testing with Playwright (preferred).
* Debugging in App Router (server logs, debug flags, DevTools).
* Common traps: hydration mismatches, mocking Next.js APIs.

---

## Part 10: Deployment & Infrastructure

---

## 1. Deployment Platforms

**Definition:**
Next.js can deploy on **Vercel**, Node servers, or serverless providers.

### ✅ Vercel (first-class support)

* Automatic ISR, edge rendering, image optimization.
* Git-based deploys.

### ✅ Other Providers

* AWS Lambda, Cloudflare Workers, Netlify, Render.
* Some features (ISR, streaming) may need custom setup.

### 🎯 Interview One-Liner

> “Vercel is the reference platform. Other providers work but may lack full ISR/edge integration.”

---

## 2. Serverless vs Edge

**Definition:**
Next.js routes can run in serverless (Node runtime) or edge runtime.

### ✅ Key Points

* **Serverless (Node runtime):** full Node APIs, DB drivers, long execution.
* **Edge runtime:** ultra-low latency, limited APIs, global distribution.

### ⚠️ Gotchas

* DB connections in serverless → pooling issues (cold starts).
* Edge runtime doesn’t support Node libraries.

### 🎯 Interview One-Liner

> “Choose serverless for complex logic, edge for low-latency global rendering. Database drivers usually don’t work at edge.”

---

## 3. ISR in Production

**Definition:**
ISR requires cache invalidation + revalidation in production.

### ✅ Key Points

* Vercel manages ISR automatically.
* On custom infra, you must handle CDN purge + regeneration.
* App Router adds `revalidatePath` and `revalidateTag` for cache control.

### ⚠️ Gotchas

* Forgetting revalidation → stale data persists.
* Revalidating too often overloads backend.

### 🎯 Interview One-Liner

> “ISR works automatically on Vercel. Elsewhere, you must wire up cache invalidation and revalidation manually.”

---

## 4. Environment Variables & Secrets

**Definition:**
Next.js supports `.env.local`, `.env.development`, `.env.production`.

### ✅ Key Points

* Accessible via `process.env`.
* Only variables prefixed with `NEXT_PUBLIC_` are exposed to client.
* Vercel dashboard manages secrets securely.

### ⚠️ Gotchas

* Forgetting `NEXT_PUBLIC_` leaks secrets into client.
* Accidentally hardcoding secrets → security breach.

### 🎯 Interview One-Liner

> “Env vars are server-only unless prefixed with NEXT\_PUBLIC\_. Never hardcode secrets.”

---

## 5. CI/CD & Observability

### ✅ CI/CD Pipelines

* Use GitHub Actions / GitLab CI for build + test + deploy.
* Run lint, type-check, unit tests before deploy.

### ✅ Observability

* Use Vercel Analytics or custom monitoring (Datadog, NewRelic).
* Log both server + edge separately.
* Track Web Vitals via `next/script` injected analytics.

### ⚠️ Gotchas

* Server logs not available in static builds.
* Edge runtime logs may not integrate with standard loggers.

### 🎯 Interview One-Liner

> “Set up CI/CD with lint, type, tests. Monitor both serverless and edge logs separately, and capture Web Vitals.”

---

# ✅ Summary (Part 10: Deployment & Infrastructure)

You now know:

* Deployment options (Vercel vs custom).
* Serverless vs edge runtime trade-offs.
* ISR in production (auto on Vercel, manual elsewhere).
* Secrets management with `.env` and NEXT\_PUBLIC.
* CI/CD + observability strategies.

---

## Part 11: Advanced Architecture Patterns

---

## 1. Monorepos with Turborepo

**Definition:**
Monorepo architecture manages multiple apps/packages in one repo.

### ✅ Key Points

* **Turborepo** (from Vercel) optimizes builds with caching + parallelization.
* Share **UI libraries, types, config** across Next.js + backend.
* Supports **incremental builds** → only changed packages rebuild.

### ⚠️ Gotchas

* Tooling setup (ESLint, Prettier, Jest) must be centralized.
* Dependency hoisting issues with Yarn/PNPM.
* Requires **clear module boundaries** to avoid spaghetti.

### 📋 Example

```
/apps
  /web    (Next.js frontend)
  /api    (Express backend)
/packages
  /ui     (shared components)
  /config (shared tsconfig, eslint)
```

### 🎯 Interview One-Liner

> “Monorepos with Turborepo enable shared UI/libs and incremental builds, but require strict boundaries to avoid dependency chaos.”

---

## 2. Micro-Frontends with Module Federation

**Definition:**
Large-scale apps can split into independently deployed micro-frontends.

### ✅ Key Points

* Next.js supports **Webpack Module Federation**.
* Teams own independent apps, stitched together at runtime.
* Good for **multi-team ownership** at enterprise scale.

### ⚠️ Gotchas

* Increased bundle size (shared deps must be carefully handled).
* Routing & state management across MFEs is tricky.
* SEO may suffer if MFEs load too slowly.

### 🎯 Interview One-Liner

> “Micro-frontends let teams ship independently, but need careful handling of shared deps and routing to avoid UX fragmentation.”

---

## 3. Multi-Tenant Applications

**Definition:**
Single Next.js app serving multiple tenants/brands.

### ✅ Key Points

* Achieved via **dynamic routing + theming**.
* Tenant data resolved in middleware (`matcher: ["/:tenant/*"]`).
* Theming via CSS vars or Tailwind config per tenant.

### ⚠️ Gotchas

* Caching → risk of leaking tenant data if ISR not configured correctly.
* Large tenant count → risk of bloated build output.

### 📋 Example

```js
// middleware.js
export function middleware(req) {
  const { pathname } = req.nextUrl;
  const tenant = pathname.split("/")[1];
  req.nextUrl.searchParams.set("tenant", tenant);
  return NextResponse.rewrite(req.nextUrl);
}
```

### 🎯 Interview One-Liner

> “Multi-tenant Next.js apps rely on middleware for routing and CSS vars for theming. The main challenge is cache isolation per tenant.”

---

## 4. Edge-First Architectures

**Definition:**
Running business logic and rendering at the edge for global low-latency apps.

### ✅ Key Points

* Use **Edge Middleware** + **Edge Runtime pages**.
* Great for **personalization (A/B tests, geolocation, auth gating)**.
* Database integration usually via HTTP APIs (Prisma Data Proxy, PlanetScale, Supabase).

### ⚠️ Gotchas

* Limited runtime APIs (no Node `fs`, no large native modules).
* Cold starts are small but still exist.
* Must coordinate cache invalidation across multiple POPs.

### 🎯 Interview One-Liner

> “Edge-first Next.js apps run globally distributed code, ideal for personalization. Tradeoff: limited runtime APIs and DB access.”

---

## 5. Best Practices for Enterprise Architecture

* **Keep SSR paths lean** → don’t overload with DB queries.
* **Use ISR with revalidation** for most content-heavy routes.
* **Segment runtime**: Node for DB-heavy routes, Edge for personalization.
* **Adopt monorepo** for shared components + infra.
* **Add observability early** → distributed tracing across serverless + edge.

---

# ✅ Summary (Part 11: Advanced Architecture Patterns)

You now know:

* **Monorepos with Turborepo** for shared libraries + incremental builds.
* **Micro-frontends** with Module Federation for team scaling.
* **Multi-tenant apps** with middleware + theming.
* **Edge-first architectures** for personalization.
* Enterprise best practices (SSR lean, ISR for content, observability).

---

## Part 12: Enterprise Case Studies

---

## Case Study 1: News Platform

**Scenario:**
Global news site with millions of articles, must balance SEO + real-time updates.

### ✅ Solution

* **SSG + ISR** for articles (`revalidate: 60`).
* **Edge Middleware** for geolocation-based personalization.
* **Monorepo** to share UI across editorial tools + consumer site.

### 🎯 Interview One-Liner

> “We use ISR for fresh content, Edge for personalization, and monorepo for shared editorial tools.”

---

## Case Study 2: SaaS Dashboard

**Scenario:**
Multi-tenant SaaS dashboard with real-time analytics.

### ✅ Solution

* **Multi-tenant routing** via middleware.
* **Client-side SWR/React Query** for live data.
* **Server Actions** for mutations with optimistic UI.
* **RBAC middleware** for access control.

### 🎯 Interview One-Liner

> “We combine middleware tenant routing with SWR caching, server actions for mutations, and RBAC checks for secure multi-tenant dashboards.”

---

## Case Study 3: E-Commerce Store

**Scenario:**
E-commerce platform with SEO-critical product pages + cart functionality.

### ✅ Solution

* **SSG + ISR** for product pages.
* **SSR** for cart & checkout (user-specific).
* **Edge runtime** for personalized recommendations.
* **next/image** for optimized product images.

### 🎯 Interview One-Liner

> “Product pages are ISR for SEO, cart/checkout SSR for freshness, and recommendations run at the edge for personalization.”

---

## Case Study 4: Enterprise Intranet

**Scenario:**
Internal tool with authenticated employees, role-based access, and large tables.

### ✅ Solution

* **NextAuth** for SSO.
* **RBAC enforcement** via middleware.
* **Virtualized tables** with react-window.
* **Server-only rendering** (no need for SEO).

### 🎯 Interview One-Liner

> “Enterprise intranet uses SSO with NextAuth, RBAC middleware, and virtualized tables to handle large datasets efficiently.”

---

# ✅ Summary (Part 12: Enterprise Case Studies)

You can now apply all patterns in real-world scenarios:

* News → ISR + Edge personalization.
* SaaS → Multi-tenant + SWR + Server Actions.
* E-commerce → ISR for products, SSR for cart, Edge for personalization.
* Enterprise intranet → SSO + RBAC + virtualization.

---