/**
 * 1. Implement a Simple XSS Sanitizer
 * sanitizeHTML()
 *
 * What does it do?
 * - Prevents Cross-Site Scripting (XSS) by stripping dangerous tags/attributes
 * - Example: "<img src=x onerror=alert(1)>" → "<img src=x>"
 *
 * Why asked?
 * - Security critical for user-generated content
 * - Shows awareness of DOM injection attacks
 *
 * Time Complexity: O(n) where n = length of HTML string
 * Space Complexity: O(n)
 */
function sanitizeHTML(input) {
  const div = document.createElement("div");
  div.textContent = input; // encode all HTML entities
  return div.innerHTML;
}

/**
 * Follow-up Questions:
 * - Why not just use innerHTML directly? → unsafe, executes scripts
 * - How do real libraries (DOMPurify, sanitize-html) work?
 * - What are the tradeoffs of stripping vs escaping?
 */




/**
 * 2. Implement CSRF Token Attacher for API Calls
 * withCSRF()
 *
 * What does it do?
 * - Wraps fetch to automatically attach CSRF token from cookie/localStorage
 *
 * Why asked?
 * - Protects against Cross-Site Request Forgery
 * - Common in frontend middleware/interceptors
 */
function withCSRF(fetchFn, getToken) {
  return (url, options = {}) => {
    const token = getToken(); // e.g. read from cookie/localStorage
    options.headers = { ...options.headers, "X-CSRF-Token": token };
    return fetchFn(url, options);
  };
}

// Usage:
const secureFetch = withCSRF(fetch, () => localStorage.getItem("csrfToken"));

/**
 * Follow-up Questions:
 * - Difference between CSRF and XSS?
 * - How does SameSite cookie attribute help against CSRF?
 * - How to handle token refresh?
 */


/**
 * 3. CORS Preflight Request Explainer
 * Explain CORS (Cross-Origin Resource Sharing)
 *
 * What is CORS?
 * - Browser security model restricting cross-origin requests
 * - Requires server to set Access-Control-Allow-Origin
 *
 * Common Interview Twist:
 * - Why does a simple GET work, but POST JSON triggers OPTIONS preflight?
 *   → Non-simple requests (custom headers, JSON) require preflight
 *
 * Senior-Level Answer:
 * - Browser sends OPTIONS preflight → server must respond with headers
 * - Without correct headers, browser blocks (but server may still reply)
 */



/**
 * 4. Implement Content Security Policy (CSP) Helper
 * CSP Meta Tag Inserter
 *
 * What does it do?
 * - Adds a Content-Security-Policy meta to block inline scripts
 *
 * Why asked?
 * - Tests awareness of modern frontend security
 */
function addCSP() {
  const meta = document.createElement("meta");
  meta.httpEquiv = "Content-Security-Policy";
  meta.content = "default-src 'self'; script-src 'self'; object-src 'none'";
  document.head.appendChild(meta);
}

/**
 * Follow-up Questions:
 * - What’s the role of CSP in preventing XSS?
 * - How to allow external scripts safely? (nonce, hash)
 * - Downsides? → May block legitimate inline scripts
 */



/**
 * 5. Explain JWT Storage Security
 * Interview Favorite: Where should you store JWTs? localStorage vs cookies?
 *
 * - localStorage:
 *   + Survives reload, easy to use
 *   - Vulnerable to XSS (JS can steal tokens)
 *
 * - HttpOnly Secure Cookie:
 *   + Protected from JS access
 *   + Works automatically with same-origin requests
 *   - Vulnerable to CSRF (needs SameSite or CSRF token)
 *
 * Senior Answer:
 * - Best practice: HttpOnly + Secure cookie, with SameSite=strict or CSRF token
 */


/**
 * 6. Secure Password Input Handling
 * Interview Twist: How to handle password fields securely in frontend?
 *
 * - Always use <input type="password">
 * - Avoid storing raw passwords in memory longer than necessary
 * - Never log password values
 * - Use TLS/HTTPS → prevents MITM
 * - Use bcrypt/argon2 hashing on server (never in frontend)
 *
 * Follow-up:
 * - How to prevent autocomplete storing passwords?
 *   → Use autocomplete="new-password" or autocomplete="off"
 */




/**
 * 7. Prevent Clickjacking (X-Frame-Options)
 * What is Clickjacking?
 * - Malicious site loads your site in an <iframe>
 * - Tricks user into clicking invisible buttons
 *
 * Frontend Defense:
 * - Detect if site is in iframe and break out
 */
if (window.top !== window.self) {
  window.top.location = window.location;
}

/**
 * Server-Side Header:
 * - X-Frame-Options: DENY or SAMEORIGIN
 * - CSP: frame-ancestors 'none'
 *
 * Follow-up:
 * - Why server-side headers are stronger than JS defense?
 * - How to allow embedding in specific partners only?
 */



// # 📘 Key Takeaways – Batch #3 (Security)

// * **XSS Sanitizer** → escape/strip unsafe HTML
// * **CSRF Token wrapper** → attach anti-CSRF headers
// * **CORS** → explain preflight & headers
// * **CSP Helper** → enforce script safety
// * **JWT Storage** → HttpOnly Secure cookies vs localStorage
// * **Password Handling** → TLS, avoid persistence/logging
// * **Clickjacking Prevention** → X-Frame-Options / CSP

// ---

// # 📑 Quick-Reference (Batch #3)

// * **XSS**: Escape HTML, use DOMPurify.
// * **CSRF**: Use tokens, SameSite cookies.
// * **CORS**: Preflight for non-simple requests.
// * **CSP**: default-src 'self', nonce/hash for scripts.
// * **JWT**: Store in HttpOnly + Secure cookie.
// * **Passwords**: Never store/log, autocomplete off.
// * **Clickjacking**: X-Frame-Options, frame-ancestors.
