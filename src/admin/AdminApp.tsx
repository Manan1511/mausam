import { useCallback, useEffect, useRef, useState } from 'react'
import type { HomepageContent } from '../types/shopify'
import AdminContentEditor from './AdminContentEditor'
import { AdminApiError, adminApi } from './adminApi'
import { cloneHomepageContent, DEFAULT_HOMEPAGE_CONTENT } from './adminTypes'

type AdminScreen = 'loading' | 'setup' | 'signed-out' | 'editor' | 'unavailable'
type SaveState = 'idle' | 'saving' | 'saved' | 'error'

function authErrorFromUrl(): boolean {
  return typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('auth') === 'error'
}

function LoadingScreen() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-8" aria-label="Loading admin" role="status">
      <div className="mb-8 h-8 w-48 animate-pulse rounded-lg bg-beige" />
      <div className="mb-4 h-12 animate-pulse rounded-xl bg-beige" />
      <div className="h-80 animate-pulse rounded-2xl bg-beige" />
      <span className="sr-only">Loading Shopify admin</span>
    </div>
  )
}

function StatePanel({
  title,
  body,
  action,
  actionLabel,
  actionDisabled = false,
  notice,
}: {
  title: string
  body: string
  action?: () => void
  actionLabel?: string
  actionDisabled?: boolean
  notice?: string
}) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-8 sm:py-20">
      <section className="rounded-2xl border border-border bg-white p-5 sm:p-8">
        <div className="mb-5 h-1 w-12 bg-gold" />
        <h1 className="m-0 text-2xl font-medium text-ink sm:text-3xl">{title}</h1>
        <p className="mb-0 mt-3 text-sm leading-6 text-muted">{body}</p>
        {notice && <p className="mt-5 rounded-lg border border-border bg-beige px-3 py-2 text-sm text-ink" role="status">{notice}</p>}
        {action && actionLabel && <button type="button" onClick={action} disabled={actionDisabled} className="admin-primary-button mt-6">{actionLabel}</button>}
      </section>
    </main>
  )
}

export default function AdminApp() {
  const [screen, setScreen] = useState<AdminScreen>('loading')
  const [email, setEmail] = useState('')
  const [content, setContent] = useState<HomepageContent | null>(null)
  const [contentExists, setContentExists] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [signingIn, setSigningIn] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [baseline, setBaseline] = useState<string | null>(null)
  const contentRevision = useRef(0)

  const loadAdmin = useCallback(async (isActive: () => boolean = () => true) => {
    try {
      const current = await adminApi.getSession()
      if (!isActive()) return
      if (!current.configured) {
        setContent(null)
        setEmail('')
        setBaseline(null)
        setScreen('setup')
        return
      }
      if (!current.authenticated) {
        setContent(null)
        setEmail('')
        setBaseline(null)
        setScreen('signed-out')
        return
      }

      setEmail(current.email ?? '')
      const response = await adminApi.getContent()
      if (!isActive()) return
      const draft = response.content ? cloneHomepageContent(response.content) : cloneHomepageContent(DEFAULT_HOMEPAGE_CONTENT)
      setBaseline(response.exists && response.content ? JSON.stringify(response.content) : null)
      setContent(draft)
      setContentExists(response.exists)
      setSaveState('idle')
      setScreen('editor')
    } catch (cause) {
      if (!isActive()) return
      setLoadError(cause instanceof AdminApiError ? cause.message : 'Admin could not be loaded.')
      if (cause instanceof AdminApiError && cause.status === 401) {
        setScreen('signed-out')
      } else {
        setScreen('unavailable')
      }
    }
  }, [])

  useEffect(() => {
    let active = true
    void Promise.resolve().then(() => active ? loadAdmin(() => active) : undefined)
    return () => { active = false }
  }, [loadAdmin])

  function retryLoadAdmin() {
    setScreen('loading')
    setLoadError(null)
    setActionError(null)
    void loadAdmin()
  }

  async function signIn() {
    setSigningIn(true)
    setActionError(null)
    try {
      const authorizationUrl = await adminApi.startSignIn()
      window.location.assign(authorizationUrl)
    } catch (cause) {
      setActionError(cause instanceof AdminApiError ? cause.message : 'Shopify sign-in could not be started.')
    } finally {
      setSigningIn(false)
    }
  }

  async function save() {
    if (!content || saveState === 'saving') return
    const revisionAtSubmit = contentRevision.current
    const submittedContent = cloneHomepageContent(content)
    setSaveState('saving')
    setActionError(null)
    try {
      const saved = await adminApi.saveContent(submittedContent)
      setBaseline(JSON.stringify(saved))
      if (contentRevision.current === revisionAtSubmit) setContent(saved)
      setContentExists(true)
      setSaveState(contentRevision.current === revisionAtSubmit ? 'saved' : 'idle')
    } catch (cause) {
      setSaveState('error')
      setActionError(cause instanceof AdminApiError ? cause.message : 'Homepage content could not be saved.')
    }
  }

  async function logout() {
    setLoggingOut(true)
    setActionError(null)
    try {
      await adminApi.logout()
      setContent(null)
      setBaseline(null)
      setScreen('signed-out')
    } catch (cause) {
      setActionError(cause instanceof AdminApiError ? cause.message : 'Sign-out could not be completed.')
    } finally {
      setLoggingOut(false)
    }
  }

  const dirty = Boolean(content && (!baseline || JSON.stringify(content) !== baseline))
  const authError = authErrorFromUrl()

  return (
    <div className="admin-root min-h-[100dvh] bg-cream text-ink">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-8">
          <a href="/" className="min-w-0 text-ink no-underline">
            <span className="block truncate font-serif text-xl font-medium">Mausam Artwork</span>
            <span className="block text-xs text-muted">Storefront content</span>
          </a>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <a href="/" className="hidden min-h-11 items-center px-2 text-sm text-muted underline underline-offset-4 sm:inline-flex">View storefront</a>
            {screen === 'editor' && (
              <>
                <span className="hidden max-w-44 truncate text-sm text-muted md:inline">{email}</span>
                <button type="button" onClick={() => void logout()} disabled={loggingOut} className="admin-secondary-button min-h-11 px-3 sm:px-4">
                  {loggingOut ? 'Signing out…' : 'Sign out'}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {screen === 'loading' && <LoadingScreen />}

      {screen === 'setup' && (
        <StatePanel
          title="Shopify setup is pending"
          body="This editor is locked until the Shopify app, store domain, HTTPS app URL, staff allowlist, and required Admin API scopes are configured on Netlify. No password or client-side bypass is available."
          notice="The public storefront remains in preview mode until Shopify is ready."
        />
      )}

      {screen === 'signed-out' && (
        <StatePanel
          title="Sign in to manage the storefront"
          body="Continue with Shopify staff sign-in. Only accounts whose verified email is on the server-side allowlist can edit this content."
          notice={actionError ?? (authError ? 'Shopify could not complete sign-in. Check your access and try again.' : undefined)}
          action={() => void signIn()}
          actionDisabled={signingIn}
          actionLabel={signingIn ? 'Connecting to Shopify…' : 'Continue with Shopify'}
        />
      )}

      {screen === 'unavailable' && (
        <StatePanel
          title="Admin could not be loaded"
          body="The Shopify session or content service could not be verified. Your current sign-in has not been removed. Try again in a moment."
          notice={loadError ?? undefined}
          action={retryLoadAdmin}
          actionLabel="Try again"
        />
      )}

      {screen === 'editor' && content && (
        <>
          <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-6 sm:px-8 sm:pb-28 sm:pt-10">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="mb-1 mt-0 text-xs font-medium uppercase tracking-[0.14em] text-muted">Homepage</p>
                <h1 className="m-0 text-2xl font-medium text-ink sm:text-3xl">Content and merchandising</h1>
                <p className="mb-0 mt-2 max-w-2xl text-sm leading-6 text-muted">Edit the fixed storefront sections and choose which Shopify products appear in the featured row.</p>
              </div>
              <span className="text-sm text-muted">{contentExists ? 'Shopify content' : 'Initial content draft'}</span>
            </div>

            {!contentExists && (
              <p className="mb-5 rounded-xl border border-border bg-white px-4 py-3 text-sm leading-6 text-muted" role="status">
                The homepage record does not exist in Shopify yet. This draft is prefilled with the current preview copy. Saving it will create the first record; uploaded images and featured products are added separately.
              </p>
            )}
            {actionError && <p className="mb-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">{actionError}</p>}
            {loadError && <p className="mb-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">{loadError}</p>}
            <AdminContentEditor
              value={content}
              onChange={(next) => {
                contentRevision.current += 1
                setContent(next)
                if (saveState === 'saved' || saveState === 'error') setSaveState('idle')
                setActionError(null)
              }}
            />
          </main>

          <div className="admin-savebar fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 shadow-[0_-8px_24px_rgba(30,26,23,0.08)] backdrop-blur-sm">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
              <p className="m-0 min-w-0 text-sm text-muted" role={saveState === 'error' ? 'alert' : 'status'}>
                {saveState === 'saving' ? 'Saving to Shopify…' : saveState === 'saved' ? 'Saved to Shopify.' : saveState === 'error' ? 'Save failed. Your draft is still here.' : dirty ? 'You have unsaved changes.' : 'All changes are saved.'}
              </p>
              <button type="button" onClick={() => void save()} disabled={!dirty || saveState === 'saving'} className="admin-primary-button min-h-11 shrink-0 px-5">
                {saveState === 'saving' ? 'Saving…' : contentExists ? 'Save changes' : 'Create homepage'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
