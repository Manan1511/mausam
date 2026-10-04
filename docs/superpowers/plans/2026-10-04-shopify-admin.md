# Shopify Storefront and Content Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a responsive `/admin` for Shopify-backed storefront content/merchandising and prepare the existing React store for Shopify catalog, cart, and hosted checkout.

**Architecture:** Preserve the Vite/React/Tailwind frontend and Netlify hosting. Netlify Functions form a same-origin BFF for Shopify Storefront and Admin GraphQL; staff OAuth, verified-email allowlisting, and server-side sessions protect content writes. Explicit preview mode preserves the static catalog without simulating orders until a Shopify store is configured.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Vite 8, Netlify Functions, Netlify Blobs, Shopify Admin GraphQL API, Shopify Storefront GraphQL API.

**Spec:** `docs/superpowers/specs/2026-10-04-shopify-admin-design.md`

## Global Constraints

- Preserve the existing React, TypeScript, Tailwind, Vite, and Netlify stack and public visual design.
- Keep Shopify products, variants, prices, inventory, discounts, orders, and fulfillment authoritative in native Shopify Admin.
- Admin edits only fixed storefront content/media and ordered featured-product references.
- Shopify Admin tokens, OAuth secrets, and private Storefront credentials remain server-side; use `Netlify.env.get()` in functions.
- Missing store/app/allowlist configuration defaults safely to preview; preview cannot submit an order.
- Pin Shopify GraphQL API requests to `2026-10`; use a compatible Node runtime for Netlify tooling.
- Live checkout uses Shopify Storefront Cart API `checkoutUrl`; no custom payment/order simulation.
- Admin authorization requires Shopify-verified email plus a server-only allowlist; absent/empty allowlist denies access.
- Public metaobject access is read-only. Never expose a generic Admin GraphQL proxy.
- Do not add Supabase, Stripe, Razorpay, COD, client-side admin passwords, or a generic drag-and-drop page builder.
- Do not add or run test suites unless the user asks to test/verify. Use build/lint and scoped code inspection for implementation verification; do not claim live Shopify behavior is verified without a configured store.
- After each verified implementation commit, push it to the active feature branch as requested by the user; inspect remote divergence before pushing.

## Review Focus

These inputs need explicit verification because no Shopify store exists for end-to-end checks:

1. Missing or partial Shopify environment: storefront remains in preview; `/admin` shows setup required; no checkout or admin bypass.
2. Invalid OAuth callback (state, HMAC, shop, or unverified email): no session is created and no Admin API call is made.
3. Empty allowlist, expired/revoked staff token, or unknown session ID: deny access and clear/expire the session.
4. Invalid content, product reference, or image upload: reject safely; never report a save that Shopify rejected.
5. Live catalog/cart/API failure: show a visible unavailable state; never fall back to preview prices or simulate order success.

## File Map

- `netlify/functions/_shared/shopifyEnv.ts`: server-only configuration parsing and safe preview/live mode selection.
- `netlify/functions/_shared/shopifyGraphql.ts`: internal Admin/Storefront GraphQL transport with version, timeout, and error handling.
- `netlify/functions/_shared/adminSession.ts`: session cookies, Blobs persistence, expiry, CSRF/origin checks, and allowlist validation.
- `netlify/functions/`: narrowly scoped OAuth, admin CMS/media/product-choice, and public storefront/cart endpoints.
- `src/types/shopify.ts`: normalized product, variant, cart, and homepage-content contracts shared by client code.
- `src/services/storefrontApi.ts`: typed same-origin client for public catalog/content/cart endpoints.
- `src/context/CartProvider.tsx`, `src/types/cart.ts`, `src/components/CartDrawer.tsx`: preview/live cart states and hosted checkout behavior.
- `src/App.tsx` and `src/admin/`: `/admin` route, login/setup state, content editor, featured ordering, and media picker.
- `src/components/AnnouncementBar.tsx`, `Hero.tsx`, `GiftingAtelier.tsx`, `Craftsmanship.tsx`, `Editorial.tsx`, `Bestsellers.tsx`, and `ShopPage.tsx`: consume normalized content/catalog data without changing the established visual composition.
- `.env.example` and `docs/SHOPIFY_SETUP.md`: safe variable names and future store/app setup instructions; no secrets.
- `netlify.toml`: SPA routing for `/admin` while preserving Netlify function routes.

## Tasks

### Task 1: Shopify runtime foundation and API contracts

**Files:**
- Create: `netlify/functions/_shared/shopifyEnv.ts`
- Create: `netlify/functions/_shared/shopifyGraphql.ts`
- Create: `src/types/shopify.ts`
- Create: `src/services/storefrontApi.ts`
- Modify: `package.json`, lockfile, `netlify.toml`
- Modify: `tsconfig.json`
- Create: `tsconfig.netlify.json`
- Create: `.env.example`

**Interfaces:**
- `getShopifyRuntimeConfig(): ShopifyRuntimeConfig` reads server settings only with `Netlify.env.get()` and returns explicit `preview` or `live` mode; incomplete configuration must resolve to preview or a clear setup error, never a partially live state.
- `shopifyAdminGraphql<T>(token: string, query: string, variables?: Record<string, unknown>): Promise<T>` sends version-pinned Admin API requests; caller supplies only a server-held staff token.
- `shopifyStorefrontGraphql<T>(query: string, variables?: Record<string, unknown>, buyerIp?: string): Promise<T>` sends private Storefront requests and forwards buyer IP when provided.
- `StorefrontApi` exports typed `getCatalog()`, `getHomepageContent()`, and cart operations over same-origin `/api/storefront/*` endpoints.

- [x] Add only the required Netlify runtime/type dependencies (`@netlify/blobs`, `@netlify/functions`); keep plain Vite as `npm run dev` and configure optional `netlify dev` to proxy the Vite server plus functions without placing secrets in `netlify.toml`.
- [x] Add a referenced `tsconfig.netlify.json` so `npm run build` type-checks `netlify/functions/**/*.ts`; require Node `>=22.12.0` for the installed Netlify packages.
- [x] Implement config parsing for the spec's `SHOPIFY_*` variables; keep browser-visible config limited to preview/live status.
- [x] Implement separate internal GraphQL transports for Admin and Storefront APIs, with bounded response parsing and explicit errors.
- [x] Define normalized TypeScript product, variant, content, and cart contracts plus the client API interface.
- [x] Add a secret-free `.env.example` and `/admin` SPA rewrites in the correct order.
- [x] Pin the Admin and Storefront GraphQL endpoint version centrally to `2026-10` and set that safe default in `.env.example`.
- [x] Run `npm run build` and `npm run lint`; both exit 0.
- [x] Review the diff to confirm no secret uses a `VITE_` name and no arbitrary GraphQL endpoint is exposed.
- [ ] Commit and push this milestone.

### Task 2: Shopify catalog and cart, with safe preview mode

**Files:**
- Create: `netlify/functions/storefront-status.ts`
- Create: `netlify/functions/storefront-catalog.ts`
- Create: `netlify/functions/storefront-homepage.ts`
- Create: `netlify/functions/storefront-cart.ts`
- Modify: `src/data.ts` only as needed to map existing data to preview contracts
- Modify: `src/services/storefrontApi.ts`, `src/types/shopify.ts`
- Modify: `src/context/CartProvider.tsx`, `src/types/cart.ts`
- Modify: `src/components/ShopPage.tsx`, `src/components/Bestsellers.tsx`, `src/components/CartDrawer.tsx`, `src/components/CheckoutModal.tsx`, `src/App.tsx`

**Interfaces:**
- Storefront catalog response uses the Task 1 normalized `StoreProduct` and `StoreVariant` types; each live purchasable line carries a Shopify variant GID.
- Cart context exposes `mode`, `status`, `items`, `addItem(product, variantId, quantity?)`, `removeItem(lineId)`, `updateQuantity(lineId, quantity)`, and `checkout(): Promise<void>`; preview mode may show a local preview bag but `checkout()` cannot create an order. Live mode persists only Shopify's cart identifier.
- `POST /api/storefront/cart` accepts a validated cart operation and returns Shopify cart state; checkout response contains only a validated Shopify `checkoutUrl`.

- [ ] Query and normalize Shopify products, available variants, currency, product references, and the public-read homepage metaobject; preserve current `src/data.ts` exclusively as preview data.
- [ ] Implement public catalog/status functions. In live mode, upstream failure returns an explicit error and must not return static preview prices.
- [ ] Replace client-only live-cart arithmetic with Shopify cart create/update/remove operations; persist only the Shopify cart identifier in the browser.
- [ ] Replace the fake `CheckoutModal` order form/confirmation with an explicit preview-unavailable state and live redirect to Shopify's `checkoutUrl`.
- [ ] Update shop and featured-product actions to send variant IDs; require a choice when a Shopify product has multiple variants rather than silently choosing one.
- [ ] Run `npm run build` and `npm run lint`; expected: both exit 0. Inspect preview and live-mode branches for the five Review Focus cases relevant to this task.
- [ ] Commit and push this milestone.

### Task 3: Shopify OAuth and protected admin functions

**Files:**
- Create: `netlify/functions/_shared/adminSession.ts`
- Create: `netlify/functions/admin-auth-start.ts`
- Create: `netlify/functions/admin-auth-callback.ts`
- Create: `netlify/functions/admin-session.ts`
- Create: `netlify/functions/admin-logout.ts`
- Create: `netlify/functions/admin-content.ts`
- Create: `netlify/functions/admin-products.ts`
- Create: `netlify/functions/admin-files.ts`
- Modify: `package.json` and lockfile for `@netlify/blobs` if not already installed

**Interfaces:**
- `requireAdminSession(request: Request): Promise<AdminSession | Response>` validates opaque cookie session, persisted expiry, Shopify online-token status, verified email, and server allowlist.
- `POST /api/admin/auth/start` initiates OAuth only for the configured shop; callback validates state/HMAC and requests a per-user token.
- `GET /api/admin/session` returns only `{ authenticated, email?, configured }`; it never returns tokens.
- `/api/admin/content` supports authenticated read/save of the fixed homepage metaobject; `/api/admin/products` returns selectable Shopify products; `/api/admin/files` implements validated Shopify Files staged upload.

- [ ] Implement fixed-shop OAuth start/callback with unpredictable state, exact redirect URI, callback HMAC validation, and Shopify online-token response validation.
- [ ] Persist access token and expiry in a strong-consistency site-scoped Blobs store under an opaque random session key; set only a Secure, HttpOnly, SameSite=Lax cookie in the browser.
- [ ] Enforce the server allowlist and `email_verified === true`; empty allowlist, malformed shop, invalid state/HMAC, expired token, or unknown session fails closed.
- [ ] Add CSRF/origin checks for every mutation; define narrow fixed handlers, server-side payload validation, and safe error responses (no arbitrary Admin GraphQL proxy).
- [ ] Implement content/product/file operations using only scopes required by those exact operations; reject unapproved product references and non-image/oversized uploads.
- [ ] Run `npm run build` and `npm run lint`; expected: both exit 0. Inspect all rejection branches and confirm no credentials/session IDs are returned or logged.
- [ ] Commit and push this milestone.

### Task 4: Responsive content admin and public content rendering

**Files:**
- Create: `src/admin/AdminApp.tsx`
- Create: `src/admin/adminApi.ts`
- Create: `src/admin/AdminContentEditor.tsx`
- Create: `src/admin/FeaturedProductsEditor.tsx`
- Create: `src/admin/MediaPicker.tsx`
- Create: `src/admin/adminTypes.ts`
- Create: `src/context/StorefrontContentProvider.tsx` (or a focused hook if that matches the existing code better)
- Modify: `src/App.tsx`, `src/index.css`
- Modify: `src/components/AnnouncementBar.tsx`, `Hero.tsx`, `GiftingAtelier.tsx`, `Craftsmanship.tsx`, `Editorial.tsx`, `Bestsellers.tsx`

**Interfaces:**
- Admin UI consumes only Task 3 same-origin APIs and reflects `setup required`, `signed out`, `loading`, `saving`, `saved`, and `error` states.
- `StorefrontContentProvider` exposes validated homepage content through `StorefrontApi.getHomepageContent()` with static copy fallback only when configured preview mode is active; live mode does not silently present stale commerce values.
- Admin edit model follows the Task 1 homepage-content contract; media selection returns Shopify file references; featured selection persists ordered Shopify product references.

- [ ] Route `/admin` to the React admin shell without changing existing hash-based shop/anchor behavior; do not mount the shopper cart/checkout over the admin route.
- [ ] Add a setup-pending and Shopify sign-in view; render no editable data or client-side password fallback until authenticated.
- [ ] Build the fixed responsive editor for announcement, hero, gifting, craftsmanship, and editorial copy/media; add field validation and clear save/error feedback.
- [ ] Build phone-usable Shopify media selection/upload and ordered featured-product editing; preserve the existing public storefront's visual design.
- [ ] Connect public homepage sections and bestsellers to validated Shopify content/product references in live mode; retain current static content in preview mode.
- [ ] Run `npm run build` and `npm run lint`; expected: both exit 0. Inspect `/admin` on narrow and wide viewport widths and verify setup-required/read-only states.
- [ ] Commit and push this milestone.

### Task 5: Shopify setup handoff and release verification

**Files:**
- Create: `docs/SHOPIFY_SETUP.md`
- Modify: `.env.example`, `docs/superpowers/specs/2026-10-04-shopify-admin-design.md` if implementation decisions require a documented ruling
- Review: `netlify.toml`, all Shopify function routes, `src/App.tsx`, and current storefront/cart components

- [ ] Document creation/configuration of the Shopify app, exact redirect URLs, least-privilege Admin and Storefront scopes, homepage metaobject definition/access/seed, Shopify Files, Netlify variables, and allowlist setup; mark store credentials/email as pending rather than inventing values.
- [ ] Document the explicit preview-to-live switch and rollback; include the fact that full OAuth, CMS writes, Shopify Files, and checkout remain unverified until a Shopify development store and credentials exist.
- [ ] Run final `npm run build` and `npm run lint`; expected: both exit 0. Inspect final changed-file list and `git diff --check` output.
- [ ] Commit and push the release documentation/cleanup milestone.

---

## Plan self-review

- **Spec coverage:** storefront stack and route (Tasks 1, 4); Shopify catalog/content/cart and hosted checkout (Tasks 1, 2, 4); OAuth, allowlist, session, CSRF, and scoped Admin APIs (Task 3); media and merchandising (Tasks 3, 4); preview/failure behavior (Tasks 1, 2, 4); setup and no-store limitation (Task 5).
- **Step scan:** every implementation task ends with build/lint and scoped review before its commit; no store-dependent behavior is claimed as verified.
- **Type consistency:** Task 1 owns normalized types and client API; Task 2 consumes `StoreProduct`, `StoreVariant`, and cart contracts; Task 3 owns `AdminSession` and admin endpoints; Task 4 consumes those same endpoint/content contracts.
- **Review Focus:** five required failure classes are listed above and assigned to the tasks that own their handling; because there is no Shopify store and test execution is not authorized here, verification is build/lint plus explicit code-path inspection until the user requests broader verification.
- **Proportion:** five milestones keep the shared Shopify boundary ahead of dependent UI, while the plan records only interfaces and observable checks rather than implementation bodies.
