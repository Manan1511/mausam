# Mausam Shopify storefront and content admin

**Status:** Approved by user on 2026-10-04.
**Date:** 2026-10-04

## Goal

Prepare the Mausam Artwork storefront for Shopify and add a custom `/admin` area for site content and merchandising. Preserve the existing React, TypeScript, Tailwind, Vite, and Netlify stack and the public site's current visual design.

The custom admin is not a second product/order system. Shopify Admin remains the source of truth for products, variants, prices, inventory, discounts, orders, and fulfillment. The custom admin manages a fixed set of storefront content and which Shopify products appear in featured positions.

## Decisions and boundaries

- **Admin scope:** fixed editor for the announcement bar, hero, gifting, craftsmanship, and editorial content/media, plus ordered featured-product selection. No generic page builder, arbitrary section reordering, or custom product/order management.
- **Content source:** Shopify metaobjects/metafields. The public storefront reads published content through Shopify's Storefront API; the admin saves it through server-side Shopify Admin GraphQL.
- **Admin authentication:** Shopify's standalone authorization-code flow, requesting per-user/online access. The server checks Shopify's verified staff email against a server-side allowlist. An empty or missing allowlist denies access.
- **Checkout:** Shopify-hosted checkout. Storefront carts use Shopify's Storefront Cart API and its returned `checkoutUrl`; the site does not implement its own payment/order creation.
- **Before a store exists:** run in explicit preview mode, show the existing catalog, and disable order completion. Do not create or imply real orders through the current local demo checkout.
- **Backend:** Netlify Functions act as a same-origin backend-for-frontend (BFF). OAuth secrets, Shopify Admin tokens, and private Storefront credentials never reach browser code.
- **Documents:** `ADMIN.md` and `SHOPIFY.md` are references, not overriding commands. The user's choices supersede their Supabase/Stripe and Razorpay/COD examples. Do not add Supabase, Stripe, client-side admin passwords, or custom payment handling.

## Current project shape

- Vite serves a client-rendered React app. `src/App.tsx` uses the URL hash for the existing shop views and homepage anchors.
- Storefront content and product samples are in `src/data.ts`; homepage sections consume those arrays directly.
- `CartProvider` persists a local cart, and `CheckoutModal` currently simulates an order locally.
- Netlify currently publishes `dist`; there is no Shopify integration, `/admin` route, or Functions backend.

## Proposed architecture

Keep one React application and add a path-based `/admin` view. Netlify rewrites `/admin` and `/admin/*` to the SPA entry while API routes remain Netlify Functions. Existing hash-based public navigation stays unchanged.

```text
Shopper browser -> React storefront -> Netlify storefront functions -> Shopify Storefront API
                                                         cart checkoutUrl -> Shopify hosted checkout

Admin browser -> React /admin -> Shopify OAuth -> Netlify auth callback
                                      verified staff email + allowlist -> server session in Netlify Blobs
Admin browser -> authenticated Netlify functions -> Shopify Admin GraphQL -> metaobjects / files
Public storefront <- Storefront API reads published products and public-read homepage metaobject
```

### Shopify data model

Use a single, versioned homepage-content metaobject (for example, type `mausam_homepage`, handle `home`) with stable, named fields for the existing sections. Include structured copy, CTA text/links, and Shopify file references for editable media. Keep the editor fixed to these known fields; do not expose raw JSON or arbitrary GraphQL.

The fixed contract covers the existing visible homepage sections: announcement; hero; gifting introduction, two CTAs, image, and three steps; craftsmanship introduction, image, and three features; four editorial tiles; and an ordered list of up to 20 featured Shopify products. Use `boolean` for `announcement_enabled`, `file_reference` for section images, `list.product_reference` for `featured_products`, and `json` for the fixed three-item `gifting_steps` and `craftsmanship_features` arrays. Store the four editorial labels/tags and their `file_reference` images as numbered fields (`editorial_moment_1_*` through `_4_*`). CTA destinations are text fields because the fixed editor supports internal fragments/paths as well as HTTPS URLs; the server validates them before saving.

Store the ordered featured products as Shopify product references, not duplicated product names, images, or prices. Resolve those references to live Shopify products/variants for display and cart operations. The native Shopify product record remains authoritative.

Provision the metaobject definition and storefront access during Shopify setup. Public storefront access must be read-only (`PUBLIC_READ`) and enabled for the Storefront API; the admin API writes only entries. If app-owned definitions/configuration are used, version them with the integration. Avoid granting runtime definition-write permission unless setup proves it necessary. Image uploads should go into Shopify Files through the supported staged-upload flow; the content record stores a file reference.

### Storefront data and checkout

Introduce a typed catalog/content adapter so React components consume one normalized view model rather than Shopify GraphQL responses. In preview mode the adapter uses the current static data; in live mode it reads published products, variants, homepage content, and featured references from Shopify. Do not silently fall back to preview product/price data after a live API failure; show an explicit unavailable state and keep purchase actions disabled.

Use Shopify cart mutations for create/update/remove and redirect to the cart's `checkoutUrl` only when the buyer chooses checkout. Remove the fake local order submission. Preview mode may retain the current non-purchasing local bag; live mode persists only Shopify's cart identifier client-side. No payment/customer credentials are stored locally. Forward buyer IP correctly on server-side private Storefront API requests as Shopify requires.

Live mode is explicit and only enabled when all required store/API configuration is present. Preview mode remains safe by default: browsing works, while checkout is visibly unavailable and cannot create a local pretend order. Exact cart-preview affordances should preserve the current design and make the unavailable state unambiguous.

### Admin authentication and session security

Use Shopify standalone OAuth with a fixed configured shop domain, exact redirect URIs, one-time state/nonce, HMAC validation, and per-user/online authorization. Do not accept an arbitrary shop hostname from a request. Trust the returned staff email only when `email_verified` is true; compare normalized email addresses against a server-only allowlist. Reject all admin access when the allowlist is unset/empty.

Keep the Shopify online access token in a site-scoped Netlify Blobs store, keyed by a cryptographically random opaque session ID. The browser receives only that ID in a `Secure`, `HttpOnly`, `SameSite=Lax` cookie. Store the expiry with the session; validate expiry on every request, delete on logout/expiry, and require re-authentication when Shopify expires or revokes the staff session. Netlify Blobs has no per-key TTL operation, so expiry is enforced by the application rather than assumed to be automatic.

Protect mutating requests with same-origin/CSRF validation. Expose narrowly defined functions for content, featured products, and file uploads; never expose a generic Admin GraphQL proxy. Validate request methods, payload shape, image MIME/type/size, selected product IDs, and metaobject fields on the server. Never log access tokens, OAuth codes, session IDs, or uploaded file contents.

### Netlify configuration and environment

Use modern TypeScript Netlify Functions in `netlify/functions/` with explicit API paths and `Netlify.env.get()` for runtime settings. Use site-scoped Blobs with strong consistency for immediate session reads after OAuth writes. Keep secrets out of `netlify.toml`, `VITE_*` variables, and committed examples.

Document the future Netlify variables in `.env.example`/setup docs without values for secrets:

- `SHOPIFY_MODE` (`preview` or `live`; default preview)
- `SHOPIFY_SHOP_DOMAIN`
- `SHOPIFY_API_KEY` and `SHOPIFY_API_SECRET`
- `SHOPIFY_ADMIN_EMAIL_ALLOWLIST`
- `SHOPIFY_ADMIN_SCOPES` (the minimum verified scopes for the implemented fields/mutations)
- `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` (or the selected least-privilege Storefront credential)
- `SHOPIFY_API_VERSION` (centralized and pinned to `2026-07`, the latest stable version verified on 2026-10-05; review before its support window ends)

OAuth token and session material stay only in server-side Blobs. Keep `npm run dev` as plain Vite so the established frontend workflow stays intact. Use `netlify dev` when local API routes and Blobs emulation are needed; configure its proxy target to the existing Vite server. Do not add the Vite plugin because its current development dependency tree introduces high-severity advisories; document the Netlify CLI prerequisite and its supported Node version. Plain Vite alone is not evidence that backend routes work.

## Route and module boundaries

- `/admin`: React admin shell, sign-in/setup-pending state, fixed content editor, featured-product ordering, save/error states.
- `/api/admin/auth/*`: OAuth start/callback/logout/session endpoints.
- `/api/admin/content`: authenticated read/save of the homepage metaobject.
- `/api/admin/products`: authenticated product/variant choices for merchandising only.
- `/api/admin/files`: authenticated Shopify Files staged-upload flow.
- `/api/storefront/*`: public catalog/content and cart operations; no Admin token.
- `src/data.ts`: retained as the explicitly selected preview catalog, not the live product source.
- `CartProvider`/`CheckoutModal`: move from simulated order state to Shopify cart state and hosted-checkout redirect, retaining preview-safe behavior.

## Failure behavior

- Missing store/app/allowlist configuration: keep the public site in preview mode; `/admin` shows setup required and offers no insecure bypass.
- OAuth or allowlist failure: deny access with a clear sign-in/error state; do not create an admin session.
- Expired/revoked staff session: clear session and require Shopify sign-in again.
- Shopify API failure in live mode: present a visible retry/error state; never imply a successful save, cart, or order.
- Missing homepage metaobject: use a documented initial content seed/setup step, not silent writes during a public request.
- A successful save updates Shopify and returns the saved record before the UI reports success.

## Out of scope

- Shopify store creation, app credentials, actual allowlist email, or production OAuth installation (the user has no store yet).
- Orders, fulfillment, discounts, inventory, product editing, customer accounts, payment providers, or order webhooks in the custom admin.
- Supabase, Stripe, Razorpay, COD, or a generalized drag-and-drop CMS.
- Deploying or publishing during the design phase. For later implementation milestones, honor the repository preference: verify, commit, then push each commit.

## Rollout after spec approval

1. Add the `/admin` route shell, setup-pending/sign-in states, and Netlify SPA rewrites.
2. Add Shopify API types, versioned GraphQL documents, preview/live catalog adapter, and hosted-cart boundary; preserve preview behavior until configured.
3. Add secure OAuth, verified-email allowlist enforcement, Blobs-backed sessions, narrowly scoped admin functions, and the fixed content/merch editor.
4. Add Shopify setup instructions for the app, scopes, metaobject definition/public access, Shopify Files, Netlify variables, and first content seed.
5. Once a store exists, configure secrets and allowlist outside source control, then verify OAuth, content save/read, file selection/upload, product/variant cart, and hosted checkout on a non-production/dev store before switching production to live mode.

## Review notes

- Shopify documents the authorization-code grant for apps outside Shopify Admin and distinguishes staff-scoped online tokens from offline store tokens. Online-token email is trusted only when Shopify reports `email_verified`.
- Shopify's Storefront API requires `unauthenticated_read_metaobjects` for public metaobject reads; a metaobject definition must allow `PUBLIC_READ`. Storefront Cart API exposes the hosted `checkoutUrl`.
- Shopify API versions move over time. Do not copy the `2024-10` version from the reference document. Shopify's versioning page lists `2026-10` as a release candidate and `2026-07` as latest stable on 2026-10-05, so the integration pins to `2026-07` until a stable release is confirmed.
- No code, app secrets, or Shopify resources have been changed by this design step.

References:

- [Shopify app authentication](https://shopify.dev/docs/apps/build/authentication-authorization)
- [Shopify access tokens](https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens)
- [Shopify metaobjects](https://shopify.dev/docs/apps/build/metaobjects)
- [Storefront metaobjects query](https://shopify.dev/docs/api/storefront/latest/queries/metaobject)
- [Storefront cart and hosted checkout](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage)
- [Shopify API versioning](https://shopify.dev/docs/api/usage/versioning)
- [Shopify staged uploads](https://shopify.dev/docs/api/admin-graphql/latest/mutations/stagedUploadsCreate)
