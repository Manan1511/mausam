# Shopify + Custom Admin Playbook

Reusable implementation notes for future Shopify-backed websites. Read this before changing storefront, cart, checkout, content-admin, or Shopify authentication code. Treat current source and the user's current decisions as authoritative; this file records one proven architecture and its failure history, not a universal mandate.

## How to reuse this guide

1. Inspect the repository, current deployment, existing auth/data model, and supplied design/reference documents before coding. For this implementation, also read the [approved design](docs/superpowers/specs/2026-10-04-shopify-admin-design.md), [implementation plan](docs/superpowers/plans/2026-10-04-shopify-admin.md), and [store setup guide](docs/SHOPIFY_SETUP.md).
2. Ask which content, catalog, and commerce data belongs in Shopify. Confirm whether the user wants Shopify's native admin, a custom content editor, or both.
3. Resolve conflicting reference-document instructions with the user. For this project, the user's choices overruled legacy Supabase/password/Stripe/Razorpay examples in `ADMIN.md` and `SHOPIFY.md`.
4. Check the current Shopify API version, OAuth requirements, scopes, upload flow, and Storefront behavior in official Shopify documentation. The version and links below can age.
5. Keep the project stack and visual design unless asked to change them. For this repository that means React, TypeScript, Tailwind, Vite, and Netlify.
6. Do not assume a store, credentials, allowlist, verified domain, or permission to deploy exists. Preview must remain safe until real setup is complete.

## Decisions for this implementation

- Shopify is source of truth for products, variants, prices, inventory, discounts, carts, orders, and fulfillment.
- `/admin` edits only fixed homepage copy/media and an ordered featured-product list. It is not product/order management or a generic page builder.
- Homepage content lives in one Shopify metaobject (`mausam_homepage`, handle `home`); Shopify Files stores images; product choices are Shopify product references.
- Staff authenticate with Shopify OAuth. The server requires Shopify-verified email and a server-side allowlist. The allowlist is still pending from the owner.
- Netlify Functions are the same-origin backend-for-frontend. OAuth secrets, staff tokens, and private Storefront token stay server-side.
- Storefront uses Shopify's catalog, Cart API, and Shopify-hosted checkout. No custom payment, pretend order, or local live-cart arithmetic.
- Missing or partial Shopify configuration must keep the public site in preview mode and `/admin` locked. Live errors must never fall back to preview commerce data.
- There was no Shopify store when this work shipped. Live OAuth, metaobject persistence, Files processing, cart, and checkout are explicitly unverified.

## Architecture and repository map

```text
Shopper -> React storefront -> same-origin Netlify Functions -> Storefront API
                                                   cart checkoutUrl -> Shopify checkout

Staff -> /admin -> Shopify OAuth -> allowlist/session in Netlify Blobs
Staff -> narrow admin functions -> Admin API -> metaobjects / Files
```

- `netlify/functions/_shared/shopifyEnv.ts`: server-only config, preview/live gate, API version, scopes, allowlist, checkout hosts.
- `netlify/functions/_shared/shopifyGraphql.ts`: bounded, version-pinned Admin/Storefront GraphQL transport.
- `netlify/functions/_shared/adminSession.ts`: OAuth/session validation, verified-email allowlist, CSRF/origin rules, Blobs persistence.
- `netlify/functions/admin-auth-*`, `admin-session.ts`, `admin-logout.ts`: sign-in lifecycle.
- `netlify/functions/admin-content.ts`: fixed homepage metaobject read/upsert and server-side reference validation.
- `netlify/functions/admin-products.ts`: paginated active product choices; also checks visibility to the configured Headless storefront.
- `netlify/functions/admin-files.ts`: validated staged image upload and Shopify Files listing.
- `netlify/functions/storefront-*.ts`: public mode/status, catalog, homepage, and cart operations.
- `src/admin/`: responsive admin shell, content form, product ordering, media drawer, and same-origin API client.
- `src/context/CartProvider.tsx`, `src/services/storefrontApi.ts`, `src/types/shopify.ts`: normalized preview/live data contracts and commerce state.
- `.env.example`: variable names only; never put real credentials here.
- `docs/SHOPIFY_SETUP.md`: store-specific setup, metaobject schema, Netlify variables, preview/live switch, and rollback.

Netlify rewrites for `/api/*` must precede the SPA fallback. `/admin` must mount its own app shell rather than the shopper cart/checkout provider.

## Security and data rules

- Never prefix a secret with `VITE_`, serialize it into browser state, or expose a generic Admin GraphQL proxy.
- Keep Admin operations narrow and separately validate payloads, IDs, types, schemes, file size/signature, session, OAuth state/HMAC, origin, user scopes, and allowlist.
- Missing/empty email allowlist means deny. Trust an email only when Shopify says it is verified.
- Use a fixed configured shop, exact callback URI, one-time OAuth state, secure HttpOnly session cookie, server-side token storage, expiry checks, and explicit logout.
- Do not expire/delete a staff session because of a transient network or GraphQL validation error. Clear it only when expiry/revocation is confirmed (for example, a confirmed Shopify 401).
- Admin `ACTIVE` status is not proof that a product is published to this Headless storefront. Validate candidates against Storefront visibility both when offering and saving them; surface stale references publicly instead of silently dropping them.
- Headless channel API permissions are shared across the shop's storefronts. Review the effect before changing permissions. The private Storefront token is also required by this implementation's admin product-visibility check, even while the public build remains in preview.
- Only select a Shopify File after processing completes and it has a usable image URL. Upload acceptance does not imply processing completion.
- Use Shopify's cart `checkoutUrl`; never claim an order/payment succeeded based only on client state.

Current least-scope examples are in `.env.example` and `docs/SHOPIFY_SETUP.md`. They were checked against the project implementation, not a provisioned merchant store. Recheck current Shopify scope requirements before copying them to another app.

## Recommended implementation order

1. Write down user-approved boundaries: what belongs in Shopify, what `/admin` edits, who can access it, how sign-in works, and what remains preview-only.
2. Map existing page sections to a fixed, validated content contract. Keep existing static copy/catalog only as an explicit preview source.
3. Add server-only environment parsing and separate Admin/Storefront GraphQL helpers. Fail closed on partial configuration.
4. Build Storefront status/catalog/content/cart functions. Normalize Shopify responses at the server boundary; validate again at the browser boundary. Never expose raw tokens or raw GraphQL.
5. Implement and inspect OAuth/session security before writing the editor. Keep mutations same-origin and narrowly scoped.
6. Implement fixed metaobject read/upsert, strict reference validation, active-and-published product choices, and validated staged image uploads.
7. Build `/admin` states for loading, setup-pending, signed-out, editor, saving, saved, and errors. Preserve newer edits if content changes while a save is in flight.
8. Make Files selection usable on phones: large controls, safe-area padding, bounded scroll, focus management, escape/close behavior, and clear processing/refresh states.
9. Connect public sections to the validated live contract. Keep live API failure visibly unavailable; do not quietly substitute preview copy/prices.
10. Write setup/rollback instructions before a store is provisioned. Test real OAuth, content writes, file lifecycle, catalog publication, cart, and hosted checkout on a development store before a production switch.

## Bugs, causes, and fixes encountered

| Symptom / bug | Cause | Fix / lesson for next implementation |
| --- | --- | --- |
| Vite preview did not appear on the assigned port; proxy Host headers were rejected. | Dev config relied on Vite's default port/host behavior instead of the assigned environment. | Read `process.env.PORT`, set `strictPort: true`, and explicitly allow the proxy host. Check whether the problem is path/environment-specific before changing app code. |
| HMR briefly reported a missing `seasonProducts` export during data-file edits. | The module graph saw an intermediate file state while the export was being edited. | Treat as transient until a clean restart/build confirms it; do not make unrelated data-model changes based only on stale HMR output. |
| Tailwind text-color utilities did not affect some anchor/button labels. | A global anchor reset lived outside Tailwind's layer and won the cascade. | Move the reset into `@layer base`; inspect computed styles when a utility seems ignored. |
| Netlify deploy showed ready, but page loaded source entry and browser reported a module served as `application/octet-stream`. | Repository root was uploaded/served instead of running Vite build and publishing `dist`. | Set build command to `npm run build`, publish `dist` (or upload its contents), then verify JS/CSS asset requests return 200 with expected MIME types. A ready deploy is not proof the website works. |
| Netlify published a deploy but publishing was locked. | Netlify account/site publishing state, not a code defect. | Confirm deploy vs publish status and required owner action separately; do not claim a site is live until public URL is checked. Owner manually unlocked/published this project's deploy. |
| A draft Shopify API version was assumed to be stable. | `2026-10` was a release candidate on 2026-10-05. | Pin this project to `2026-07`, the latest stable verified that date. For future work, check Shopify's official version schedule and update the pin deliberately. |
| Shopify staged upload returned a valid temporary URL that local validation rejected. | The stage URL can be on the configured shop host under `/admin/tmp/files`, not only on a cloud-storage host. | Allow that exact configured shop host and path in addition to expected storage hosts; keep host/path validation strict. Do not broaden to arbitrary URLs. |
| Admin session was cleared after a GraphQL validation/upstream issue. | Session validation treated every failure like invalid credentials. | Preserve the session through transient/network/GraphQL validation failures; clear only on confirmed expiry/revocation, such as Shopify HTTP 401. |
| Successful content save discarded edits made while the request was pending and displayed “Saved.” | The response replaced editor state with the older submitted snapshot. | Save a snapshot and revision; update baseline from the response, but replace the draft only if revision has not changed. Otherwise keep newer draft dirty. |
| An `ACTIVE` product could be featured but did not appear on this storefront. | Shopify product status and publication/visibility on a sales channel are separate. | Check each choice against the configured Headless Storefront API and recheck on save. If old references are absent from live catalog, show an explicit warning/count. |
| Admin UI could crash on malformed or unexpected JSON despite TypeScript types. | Response JSON was cast to declared types without runtime validation. | Treat network JSON as `unknown`; validate session, content, product/media choices, pagination, URLs, and upload result at the API boundary. |
| Newly uploaded image was not immediately selectable. | Shopify Files may return a processing state before image URL/status is ready. | Keep it in the library, show processing state, provide refresh, and allow selection only when `fileStatus === READY` and URL exists. |
| Staff could trigger repeated Shopify OAuth redirects by clicking sign-in several times. | Sign-in action stayed enabled while request was pending. | Track pending state and disable the button until redirect/error completes. |
| Local Netlify CLI check could not authenticate or exercise Blobs-backed sessions. | CLI lacked a linked/login context; offline mode had empty environment. | Use `netlify dev --offline --no-open` only to check safe setup-pending/preview behavior. Real sessions and Shopify calls need appropriate local context/credentials. |

### Deferred or not verified

- Server validates image MIME, signature, and size, but does not fully decode every image format. Shopify remains final media processor; actual upload lifecycle needs a development store check.
- Authenticated admin, keyboard/focus behavior across real mobile browsers, Shopify metaobject schema compatibility, image processing, catalog visibility, cart, and checkout were not end-to-end tested because no store/credentials existed.
- The approved implementation plan did not authorize adding/running test suites. Build/lint and scoped inspection were used for that task; follow the next user's explicit verification request for future work.
- Offline checks only confirmed `/api/admin/session` returned `{authenticated:false, configured:false}` and `/api/storefront/status` returned preview/setup-required. They do not verify live behavior.

## Current project's setup snapshot

As of 2026-10-05, this repository is pushed to `main` and has no Shopify store, app credentials, private Storefront token, or approved admin email. Keep both `SHOPIFY_MODE` and `VITE_SHOPIFY_MODE` at `preview` until the development-store setup and end-to-end checklist in [docs/SHOPIFY_SETUP.md](docs/SHOPIFY_SETUP.md) pass. API version `2026-07` is a dated snapshot, not a promise it remains latest.

When committing in this repository, fetch and inspect remote divergence first; after a verified commit, push immediately to `origin main` per the user's standing instruction. Do not force-push or rewrite shared history.

## Official references

- [Shopify API versioning](https://shopify.dev/docs/api/usage/versioning)
- [Shopify standalone app authentication](https://shopify.dev/docs/apps/build/authentication-authorization/authenticate-standalone-apps)
- [Shopify access scopes](https://shopify.dev/docs/api/usage/access-scopes)
- [Headless channel management and shared permissions](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/manage-headless-channels)
- [Shopify metaobjects](https://shopify.dev/docs/apps/build/metaobjects)
- [Shopify staged uploads](https://shopify.dev/docs/api/admin-graphql/2026-07/mutations/stagedUploadsCreate)
- [Shopify file creation](https://shopify.dev/docs/api/admin-graphql/2026-07/mutations/fileCreate)
- [Shopify Storefront API Cart](https://shopify.dev/docs/api/storefront/2026-07/objects/Cart)
