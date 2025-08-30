# 🚀 Interview Gold – Batch #11 (Security & Compliance at Scale)

---

## 1. Content Security Policy (CSP)

**Problem:**

* XSS is one of the **top OWASP risks**.
* Attackers inject `<script>` or inline `onerror=alert()` → steals cookies/session.

**Solution:**

* Use **Content Security Policy (CSP)** headers to control what resources can load/run.

**Detailed Design:**

```http
Content-Security-Policy: default-src 'self'; 
                         script-src 'self' 'nonce-abc123'; 
                         object-src 'none';
                         img-src 'self' https:;
```

* `script-src 'nonce-...'` → allows only scripts with server-issued nonce.
* Disables inline `<script>` unless whitelisted.
* `object-src 'none'` → block Flash, plugins.
* `img-src` restricted to trusted domains.

**Performance/Scaling Notes:**

* May break existing inline JS → requires refactoring.
* Strong defense against injected JS.

**Real-World Example:**

* Gmail enforces CSP + Trusted Types to block inline XSS.

**Follow-ups:**

* How do you allow Google Analytics? → Add its domain to `script-src`.
* What’s nonce vs hash? → Nonce = per-request random, Hash = static script hash.
* What does Trusted Types add? → Prevents unsafe DOM sinks (`innerHTML`).

---

## 2. OAuth 2.0 & OpenID Connect (Login Flows)

**Problem:**

* Users want to log in with Google, Facebook, or corporate SSO.
* Implementing wrong = security hole (token leakage, CSRF).

**Solution:**

* Use **OAuth 2.0 + OpenID Connect** (OIDC).
* Frontend gets **auth code** → exchanges for tokens via backend (PKCE for mobile/SPAs).

**Detailed Design:**

* **Auth Code with PKCE flow (recommended for SPAs):**

  1. App → redirect user to IdP (Google) with `code_challenge`.
  2. User authenticates.
  3. IdP redirects back with `code`.
  4. App exchanges code + `code_verifier` → gets tokens.

```js
// Example: SPA PKCE flow
const verifier = generateRandomString();
const challenge = base64URLEncode(sha256(verifier));
redirect(`https://accounts.google.com/o/oauth2/v2/auth?...&code_challenge=${challenge}`);
```

**Performance/Scaling Notes:**

* Tokens should be **short-lived access tokens** + **refresh tokens**.
* Store tokens in **HttpOnly cookies**, not localStorage (XSS risk).

**Real-World Example:**

* Slack, GitHub → PKCE-based OAuth.

**Follow-ups:**

* Why is Implicit Flow discouraged? → Token leakage via URL fragment.
* Why PKCE needed for SPAs? → Prevents code interception.
* Where do you store JWT securely? → HttpOnly Secure SameSite cookies.

---

## 3. JWT Handling (Sessions & Security)

**Problem:**

* Frontend apps need session management.
* JWTs often misused → stored insecurely.

**Solution:**

* Use **JWT (JSON Web Tokens)** for stateless sessions.
* Store in **HttpOnly Secure cookies** (not localStorage).
* Validate signature + expiry at backend.

**Detailed Design:**

```json
{
  "alg": "HS256",
  "typ": "JWT",
  "exp": 1710000000
}
```

* **Access Token (short-lived, e.g., 15m).**
* **Refresh Token (long-lived, HttpOnly cookie).**
* Rotate tokens → revoke on logout.

**Performance/Scaling Notes:**

* JWTs = stateless → fast to verify.
* Too big = heavy on every request.

**Pitfalls:**

* Don’t put sensitive info in JWT payload (base64, not encrypted).
* Expired tokens must be rejected → refresh flow required.

**Real-World Example:**

* Firebase Auth uses JWTs extensively.

**Follow-ups:**

* Why not store JWT in localStorage? → XSS theft risk.
* Why short-lived tokens? → Limits damage if stolen.
* How to revoke JWTs? → Maintain blacklist or rotate keys.

---

## 4. Cross-Site Request Forgery (CSRF) Protection

**Problem:**

* If using cookies for auth, attacker can trick user into making unwanted request.
* Example: logged-in user visits malicious site → hidden form submits purchase.

**Solution:**

* **SameSite cookies:** `Set-Cookie: auth=...; HttpOnly; Secure; SameSite=Lax`
* **CSRF Tokens:** Random token in each form/request, verified by server.

**Detailed Design:**

* Server issues token, frontend includes in headers:

```js
fetch("/transfer", {
  method: "POST",
  headers: { "X-CSRF-Token": csrfToken }
})
```

**Performance/Scaling Notes:**

* `SameSite=Lax` = safe default for most forms.
* Tokens only needed if cookies are cross-site.

**Real-World Example:**

* Django, Rails embed CSRF tokens in forms.

**Follow-ups:**

* Difference CSRF vs CORS? → CSRF = user tricked, CORS = browser block.
* Why are JWT-in-cookies vulnerable to CSRF? → Because cookies auto-attached.
* Why SameSite=Strict may harm UX? → Breaks legitimate cross-site flows (SSO).

---

## 5. Single Sign-On (SSO)

**Problem:**

* Large orgs want one login across multiple apps (Slack + Jira + GSuite).

**Solution:**

* Implement **SSO using SAML or OpenID Connect**.
* Identity Provider (IdP) issues assertions/tokens to Service Providers (SP).

**Detailed Design:**

* **SAML (XML-based, legacy)** → still used in enterprises.
* **OIDC (modern, JSON/JWT-based)** → preferred.
* Frontend apps redirect to IdP → tokens returned → app trusts identity.

**Performance/Scaling Notes:**

* Reduces password fatigue.
* Improves central control.

**Pitfalls:**

* Logout across apps tricky (single logout not always reliable).

**Real-World Example:**

* Google Workspace SSO across Gmail, Drive, Calendar.

**Follow-ups:**

* SAML vs OIDC? → OIDC simpler, SAML legacy enterprise.
* How to handle “logout everywhere”? → Token revocation.
* How to handle multiple IdPs? → Federation (Okta, Auth0).

---

## 6. GDPR & CCPA Compliance (Data Privacy)

**Problem:**

* Regulations (GDPR in EU, CCPA in California).
* Must give users control over their data.

**Solution:**

* **Consent management**: ask before tracking cookies.
* **Right to be forgotten**: allow deletion of user data.
* **Data minimization**: don’t collect unnecessary data.

**Detailed Design:**

* Cookie banner → store consent.
* Track only if consent given.
* Provide “Delete My Data” UI.

**Performance/Scaling Notes:**

* Consent checks must not block critical path.
* Logging must scrub PII before sending to analytics.

**Pitfalls:**

* Accidentally logging emails/user IDs.
* Forgetting backup copies when deleting user data.

**Real-World Example:**

* Facebook allows data export + delete.
* Google’s “Download Your Data” tool.

**Follow-ups:**

* Difference GDPR vs CCPA? → GDPR = opt-in consent; CCPA = opt-out.
* What’s PII? → Any data that can identify user (email, IP).
* How to ensure right-to-be-forgotten works? → Data purging across all systems.

---

## 7. Secure Handling of Sensitive Data (Passwords, Payment)

**Problem:**

* Users enter passwords, credit cards, personal info.
* Must not be leaked or mishandled.

**Solution:**

* **Passwords**: Always `<input type="password">`, no logs, transmit over HTTPS.
* **Payments**: Use PCI-compliant providers (Stripe, PayPal).
* **Encryption in transit**: HTTPS (TLS 1.2+).
* **Encryption at rest**: AES-256 in DB.

**Detailed Design:**

* Use tokenization for payments → card replaced by token.
* Never store raw passwords or card numbers.
* Secure headers:

  ```http
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  ```

**Performance/Scaling Notes:**

* TLS adds \~20ms handshake → negligible today.
* Security > minor latency.

**Real-World Example:**

* Stripe Elements → frontend never sees full card number.

**Follow-ups:**

* How to prevent autocomplete from saving passwords? → `autocomplete="new-password"`.
* Why never hash passwords in frontend? → Browser not trusted, server handles bcrypt/argon2.
* How to handle PCI compliance? → Outsource to Stripe/Adyen.

---

## 8. Security Headers & Best Practices

**Problem:**

* Even if app secure, default browser behavior can allow attacks.

**Solution:**

* Send security headers to harden app.

**Detailed Design:**

```http
Content-Security-Policy: default-src 'self'
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer-when-downgrade
```

* **CSP** → prevent XSS.
* **HSTS** → enforce HTTPS.
* **X-Frame-Options** → prevent clickjacking.
* **NoSniff** → prevent MIME confusion.
* **Referrer Policy** → control leakage of referrer.

**Performance/Scaling Notes:**

* Headers add almost zero cost.
* Huge impact on reducing attack surface.

**Pitfalls:**

* Overly strict CSP breaks legitimate scripts.
* Must test gradually.

**Real-World Example:**

* GitHub enforces strong CSP, HSTS preload, etc.

**Follow-ups:**

* Why X-Frame-Options needed? → Prevent clickjacking.
* Why HSTS preload important? → Even first visit is HTTPS.
* How to deploy CSP without breaking prod? → Use `Content-Security-Policy-Report-Only`.

---

# 📘 Key Takeaways – Batch #11

* **CSP**: prevent XSS via whitelisted scripts.
* **OAuth/OIDC**: secure login flows with PKCE.
* **JWT**: short-lived tokens in HttpOnly cookies.
* **CSRF**: SameSite cookies + tokens.
* **SSO**: OIDC or SAML federation.
* **GDPR/CCPA**: consent, data deletion, minimization.
* **Sensitive data**: never store raw, use HTTPS/TLS, payment tokenization.
* **Security headers**: CSP, HSTS, X-Frame, NoSniff.

---

# 📑 Quick-Reference (Batch #11)

* **CSP**: block inline JS, use nonce/hash.
* **OAuth/OIDC**: Auth Code + PKCE, no Implicit Flow.
* **JWT**: HttpOnly cookie, refresh token rotation.
* **CSRF**: SameSite + CSRF tokens.
* **SSO**: OIDC preferred, SAML legacy.
* **GDPR/CCPA**: user consent, delete/export data.
* **Passwords/Payments**: never store raw, TLS, PCI providers.
* **Headers**: CSP, HSTS, X-Frame, NoSniff.
