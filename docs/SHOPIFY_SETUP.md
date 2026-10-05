# Shopify setup handoff

This repository is prepared for Shopify but is not connected to a store yet. Keep the site in preview mode until a Shopify development store, app credentials, and the staff allowlist are available. No credentials or email addresses are included in this document.

Shopify remains authoritative for products, variants, prices, inventory, carts, and checkout. `/admin` edits only fixed homepage content and the ordered featured-product list. It does not create products, orders, payments, or fulfillment records.

## 1. Create the Shopify app and development store

1. Create a Shopify development store for setup and end-to-end verification. Do not configure production first.
2. Create a Shopify app in the Shopify Dev Dashboard for a standalone/API-only app. This site runs outside Shopify Admin and uses Shopify's authorization-code grant with an online, per-user token.
3. Set the app URL to the deployed HTTPS origin, with no path or trailing slash, for example `https://<your-site-domain>`.
4. Add this exact allowed redirection URL to the app:

   `https://<your-site-domain>/api/admin/auth/callback`

   Replace the hostname with the exact public origin used by `SHOPIFY_APP_URL`. Do not use a wildcard or a Netlify deploy-preview URL as the production callback.
5. Install the app on the development store and configure these exact Admin API scopes:

   `read_products,write_metaobjects,write_files`

   The app requests online/per-user access. Shopify's write scope grants read access for the same resource; the server separately checks each staff member's permissions before allowing content, product, or file actions. Keep `SHOPIFY_ADMIN_SCOPES` exactly in sync with the app. The runtime rejects unexpected extra scopes.

The OAuth implementation validates the fixed shop, callback HMAC, state cookie, timestamp, verified staff email, and allowlist. Shopify's `associated_user_scope` also limits each online session to that staff member's actual permissions. See [Shopify standalone app authentication](https://shopify.dev/docs/apps/build/authentication-authorization/authenticate-standalone-apps) and [online access tokens](https://shopify.dev/docs/apps/build/authentication-authorization/access-tokens).

## 2. Configure Storefront API access

In Shopify Admin, install/open the Headless sales channel, create a storefront, and generate its private Storefront API token. Keep that token server-side in `SHOPIFY_STOREFRONT_PRIVATE_TOKEN`; it must never use a `VITE_` prefix or be committed.

Grant only the Storefront API permissions used by this implementation:

- `unauthenticated_read_product_listings` for products and collections.
- `unauthenticated_read_metaobjects` for the public homepage metaobject.
- `unauthenticated_read_checkouts` and `unauthenticated_write_checkouts` for Storefront Cart API read/write operations. Shopify maps these legacy-named scopes to `Cart`.

Headless channel API permissions are shared across the shop's storefronts; review that impact before changing them. The `/admin` product picker and save endpoint use this private token to confirm products are visible to this specific storefront, so configure it before managing featured products even while `SHOPIFY_MODE=preview`.

The metaobject definition must separately allow Storefront `PUBLIC_READ`. The private token is sent only by Netlify Functions using Shopify's `Shopify-Storefront-Private-Token` header. Buyer-originated cart requests also forward the buyer IP as Shopify requires. See [Storefront API authentication](https://shopify.dev/docs/api/storefront), [Storefront API access scopes](https://shopify.dev/docs/api/usage/access-scopes), and [Headless channel permissions](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/manage-headless-channels).

## 3. Define the homepage metaobject

Create one merchant-owned metaobject definition in Shopify Admin under Content → Metaobjects:

- Type: `mausam_homepage`
- Display name: `Mausam Homepage`
- Admin access: merchant read/write
- Storefront access: `PUBLIC_READ`
- Do not enable the publishable capability; this fixed homepage is a single active record, not a draft/publish workflow.
- Do not make image fields or JSON content required. The admin can save an initial homepage before images or featured products are selected.

Create the fields below with the exact keys and types. Set text maximum-length validations at least as high as the app limit noted here. Keys and types are part of the API contract; do not rename them without changing the code and this guide together.

| Field keys | Shopify type | App limit / notes |
| --- | --- | --- |
| `announcement_enabled` | `boolean` | true/false |
| `announcement_text` | `single_line_text_field` | 300 characters |
| `hero_eyebrow`, `hero_title`, `hero_primary_cta_label`, `hero_secondary_cta_label` | `single_line_text_field` | 180, 280, 80, 80 characters respectively |
| `hero_body` | `multi_line_text_field` | 1,600 characters |
| `hero_primary_cta_href`, `hero_secondary_cta_href` | `single_line_text_field` | 500 characters; internal `#fragment`/site path or HTTPS URL |
| `hero_image`, `hero_mobile_image` | `file_reference` | Shopify Files image; the server rejects non-image references |
| `gifting_eyebrow`, `gifting_title`, `gifting_cta_label`, `gifting_secondary_cta_label` | `single_line_text_field` | 180, 280, 80, 80 characters respectively |
| `gifting_body` | `multi_line_text_field` | 1,600 characters |
| `gifting_cta_href`, `gifting_secondary_cta_href` | `single_line_text_field` | 500 characters; internal `#fragment`/site path or HTTPS URL |
| `gifting_image` | `file_reference` | Optional Shopify Files image |
| `gifting_steps` | `json` | Exactly 3 `{ "title": string, "description": string }` objects; title max 180, description max 900 characters |
| `craftsmanship_eyebrow`, `craftsmanship_title` | `single_line_text_field` | 180 and 280 characters respectively |
| `craftsmanship_body` | `multi_line_text_field` | 1,600 characters |
| `craftsmanship_image` | `file_reference` | Optional Shopify Files image |
| `craftsmanship_features` | `json` | Exactly 3 `{ "title": string, "description": string }` objects; title max 180, description max 900 characters |
| `editorial_eyebrow`, `editorial_title` | `single_line_text_field` | 180 and 280 characters respectively |
| `editorial_moment_1_label` through `editorial_moment_4_label` | `single_line_text_field` | 120 characters each |
| `editorial_moment_1_tag` through `editorial_moment_4_tag` | `single_line_text_field` | 100 characters each |
| `editorial_moment_1_image` through `editorial_moment_4_image` | `file_reference` | Optional Shopify Files images |
| `featured_products` | `list.product_reference` | Ordered; app allows at most 20 active Shopify products |

For each editorial image index `N` from 1 to 4, create all three fields `editorial_moment_N_label`, `editorial_moment_N_tag`, and `editorial_moment_N_image`. JSON examples for the fixed arrays:

```json
[
  { "title": "Select Atelier Creations", "description": "Choose the pieces for your gift." },
  { "title": "Custom Personalization", "description": "Add a message or personalized detail." },
  { "title": "Delivered with Care", "description": "Each keepsake is packaged with care." }
]
```

The Admin API upserts the entry at the fixed handle `home` and the definition type above. No separate seed script or storefront-side write is needed. `metaobjectUpsert` sends the complete current field set; clearing an image in `/admin` clears that reference in Shopify. See [Shopify metaobjects](https://shopify.dev/docs/apps/build/metaobjects), [metaobject definition setup](https://shopify.dev/docs/apps/build/metaobjects/manage-metaobject-definitions), and [Storefront `metaobject(handle:)`](https://shopify.dev/docs/api/storefront/2026-07/queries/metaobject).

## 4. Configure Netlify environment variables

Add variables in the Netlify site's environment-variable settings. Use the same values for the deploy context being tested; do not put secrets in `netlify.toml`, source files, or browser-exposed `VITE_*` variables.

| Variable | Value |
| --- | --- |
| `SHOPIFY_MODE` | Keep `preview` until all setup and development-store checks pass; only then use `live`. |
| `SHOPIFY_API_VERSION` | `2026-07` (stable version pin checked 2026-10-05). Review Shopify's version schedule before the version's support window ends. |
| `SHOPIFY_SHOP_DOMAIN` | Exact canonical `your-store.myshopify.com` hostname; no scheme or path. |
| `SHOPIFY_APP_URL` | Exact public HTTPS origin serving the site, without a trailing slash. |
| `SHOPIFY_API_KEY` | Shopify app client ID. |
| `SHOPIFY_API_SECRET` | Shopify app client secret. Secret; never expose to the browser. |
| `SHOPIFY_ADMIN_EMAIL_ALLOWLIST` | Comma-separated Shopify-verified staff emails, once the owner supplies them. Leave blank until then; a blank allowlist denies admin access. |
| `SHOPIFY_ADMIN_SCOPES` | Exactly `read_products,write_metaobjects,write_files`. |
| `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` | Private token for the Headless storefront. Secret; server-side only. Also required for admin product-visibility checks. |
| `SHOPIFY_CHECKOUT_ALLOWED_HOSTS` | Usually blank: the configured `.myshopify.com` shop is allowed automatically. Add only verified Shopify checkout hostnames if checkout uses a separate custom domain; comma-separate hostnames without schemes or paths. |
| `VITE_SHOPIFY_MODE` | `preview` initially. Set to `live` for the same deployment only when `SHOPIFY_MODE=live`; this is a public build selector, not a credential. |

The server only enters live storefront mode when the store domain and private Storefront token are configured and `SHOPIFY_MODE=live`. The admin independently stays locked until app URL, app credentials, non-empty allowlist, and exact Admin scopes are present. Netlify Blobs stores opaque admin sessions and Shopify online tokens; do not add a browser token or client-side password.

## 5. Seed and verify on the development store

1. Deploy a preview build with `SHOPIFY_MODE=preview` and `VITE_SHOPIFY_MODE=preview`.
2. Open `/admin`. Until setup variables are complete, it should show “Shopify setup is pending” and no editable fields.
3. After configuring the development store and private Storefront token, add a verified staff email to the server-only allowlist and sign in through Shopify.
4. On the first authenticated visit, `/admin` shows the current preview copy as an initial draft. Review it, upload/choose images, choose up to 20 active products published to the Headless storefront, and press **Create homepage**. That creates the `home` metaobject entry.
5. Verify the public storefront reads the content and featured product order. Change a small piece of copy, save, reload, and verify it persisted. Clear an image and confirm it remains cleared after reload.
6. Verify Shopify Files upload/processing, active-product selection, cart create/read/update/remove, and the secure Shopify-hosted `checkoutUrl` on the development store. Confirm the checkout URL hostname is allowed. Do not place a real order as part of this setup checklist.
7. Confirm failed Shopify/API requests show an unavailable/error state and never fall back to static catalog prices in live mode.

Use `npm run dev` for frontend-only Vite preview. Use `npm run dev:netlify` when Netlify Functions are needed and the Netlify CLI is configured. On a machine without Netlify login/site context, `netlify dev --offline --no-open` serves local Functions with empty Shopify settings, so `/admin` should show setup pending and `/api/storefront/status` should report preview. Local Blobs-backed authenticated sessions still require a supported Netlify local context.

## 6. Switch and rollback

Do not switch the production site to live merely because the variables exist. First finish the development-store verification above. Then set both `SHOPIFY_MODE=live` and `VITE_SHOPIFY_MODE=live` for the intended Netlify deploy context and redeploy so the public build selector and server mode agree. Verify the deployed `/admin`, catalog, homepage content, cart, and checkout redirect before announcing readiness.

To roll back, set both mode variables back to `preview` and redeploy. The site returns to its existing preview catalog and non-purchasing preview bag; it does not create Shopify orders. Keep the Netlify variables and app credentials intact unless rotating/revoking them is separately intended. If a token is rotated, update the server variable and redeploy before deleting the old token.

## 7. Current verification boundary

As of this handoff, there is no Shopify store, app, client ID/secret, private Storefront token, or approved staff email. The code has been checked with `npm run build` and `npm run lint`; local offline Netlify functions report `configured: false` for admin and `mode: preview` for the storefront. Shopify OAuth, online staff permissions, metaobject writes/reads, file uploads, live catalog/cart behavior, and hosted checkout therefore remain unverified until a development store is configured. The API is pinned to `2026-07`, which was the latest stable version confirmed for this handoff date; Shopify API versions change quarterly. See [Shopify API versioning](https://shopify.dev/docs/api/usage/versioning).
