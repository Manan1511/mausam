import { useEffect, useRef, useState } from 'react'
import type { StorefrontMedia } from '../types/shopify'
import { AdminApiError, adminApi } from './adminApi'
import type { AdminMediaChoice, AdminPageInfo } from './adminTypes'

interface MediaPickerProps {
  label: string
  value: StorefrontMedia | null
  onChange: (media: StorefrontMedia | null) => void
}

const EMPTY_PAGE: AdminPageInfo = { hasNextPage: false, endCursor: null }

export default function MediaPicker({ label, value, onChange }: MediaPickerProps) {
  const [open, setOpen] = useState(false)
  const [files, setFiles] = useState<AdminMediaChoice[]>([])
  const [pageInfo, setPageInfo] = useState(EMPTY_PAGE)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [altText, setAltText] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const uploadingRef = useRef(false)

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    document.body.style.overflow = 'hidden'
    dialogRef.current?.querySelector<HTMLElement>('button:not(:disabled), input:not(:disabled)')?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      const dialog = dialogRef.current
      if (!dialog) return
      if (event.key === 'Escape' && !uploadingRef.current) {
        setOpen(false)
        return
      }
      if (event.key !== 'Tab') return
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [href], [tabindex]:not([tabindex="-1"])',
      )).filter((element) => element.getAttribute('aria-hidden') !== 'true')
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [open])

  async function loadFiles(reset = false) {
    setLoading(true)
    setError(null)
    setNotice(null)
    try {
      const result = await adminApi.getFiles(reset ? null : pageInfo.endCursor)
      setFiles((previous) => reset ? result.files : [...previous, ...result.files])
      setPageInfo(result.pageInfo)
    } catch (cause) {
      setError(cause instanceof AdminApiError ? cause.message : 'Images could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  function choose(file: AdminMediaChoice) {
    if (!file.url || file.fileStatus !== 'READY') return
    onChange({ id: file.id, url: file.url, altText: file.altText })
    setOpen(false)
  }

  async function upload(file: File | undefined) {
    if (!file) return
    setError(null)
    setNotice(null)
    if (file.size > 4 * 1024 * 1024) {
      setError('Choose an image smaller than 4 MB.')
      return
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type.toLowerCase())) {
      setError('Choose a JPG, PNG, WebP, or GIF image.')
      return
    }

    uploadingRef.current = true
    setUploading(true)
    try {
      const result = await adminApi.uploadFile(file, altText)
      const uploaded = result.file
      if (uploaded.url && uploaded.fileStatus === 'READY') {
        onChange({ id: uploaded.id, url: uploaded.url, altText: uploaded.altText })
        setOpen(false)
      } else {
        setNotice('Shopify is processing this image. Refresh the library in a moment, then select it once it is ready.')
        await loadFiles(true)
      }
    } catch (cause) {
      setError(cause instanceof AdminApiError ? cause.message : 'The image could not be uploaded.')
    } finally {
      uploadingRef.current = false
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <span className="block text-sm font-medium text-ink">{label}</span>
      <div className="flex flex-wrap items-center gap-3">
        {value?.url ? (
          <img src={value.url} alt={value.altText ?? ''} className="h-16 w-16 rounded-lg border border-border object-cover" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-border bg-beige text-xs text-muted">No image</div>
        )}
        <button type="button" onClick={() => { setOpen(true); void loadFiles(true) }} className="admin-secondary-button">
          Choose image
        </button>
        {value && <button type="button" onClick={() => onChange(null)} className="min-h-11 px-2 text-sm text-muted underline underline-offset-4">Remove</button>}
        <span className="w-full text-xs text-muted">Shopify Files. JPG, PNG, WebP, or GIF, up to 4 MB.</span>
      </div>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/50 p-0 sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !uploading) setOpen(false) }}>
          <section ref={dialogRef} className="admin-media-picker-panel flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-cream shadow-xl sm:rounded-2xl" role="dialog" aria-modal="true" aria-labelledby="media-picker-title">
            <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
              <div>
                <h2 id="media-picker-title" className="m-0 text-xl font-medium text-ink">Choose {label.toLowerCase()}</h2>
                <p className="mb-0 mt-1 text-sm text-muted">Select a ready image from Shopify Files or upload one.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} disabled={uploading} className="admin-secondary-button min-h-11 shrink-0 px-3" aria-label="Close image picker">Close</button>
            </header>

            <div className="flex flex-wrap items-end gap-3 border-b border-border px-5 py-4 sm:px-6">
              <label className="min-w-0 flex-1 text-sm font-medium text-ink">
                Image description
                <input value={altText} maxLength={300} onChange={(event) => setAltText(event.target.value)} className="admin-input mt-1" />
              </label>
              <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" onChange={(event) => void upload(event.target.files?.[0])} aria-label="Upload image to Shopify Files" />
              <button type="button" onClick={() => fileInput.current?.click()} disabled={uploading} className="admin-primary-button min-h-11">
                {uploading ? 'Uploading…' : 'Upload image'}
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
              {error && <p className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">{error}</p>}
              {notice && <p className="mb-4 rounded-lg border border-border bg-beige px-3 py-2 text-sm text-ink" role="status">{notice}</p>}
              <button type="button" disabled={loading || uploading} onClick={() => void loadFiles(true)} className="admin-secondary-button mb-4 min-h-11">
                {loading ? 'Refreshing images…' : 'Refresh images'}
              </button>
              {loading && <p className="py-4 text-sm text-muted" role="status">Loading Shopify Files…</p>}
              {!loading && files.length === 0 && !error && <p className="py-8 text-center text-sm text-muted">No ready images yet. Upload the first one above.</p>}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {files.map((file) => {
                  const ready = Boolean(file.url) && file.fileStatus === 'READY'
                  return (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => choose(file)}
                      disabled={!ready || uploading}
                      className="group overflow-hidden rounded-xl border border-border bg-white text-left transition hover:border-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-55"
                      aria-label={ready ? `Select ${file.altText || 'Shopify image'}` : `${file.altText || 'Shopify image'} is ${file.fileStatus.toLowerCase()}`}
                    >
                      {file.url ? <img src={file.url} alt="" loading="lazy" className="aspect-square w-full object-cover" /> : <div className="aspect-square bg-beige" />}
                      <span className="block truncate px-2.5 py-2 text-xs text-ink">{file.altText || 'Untitled image'}</span>
                      {!ready && <span className="block px-2.5 pb-2 text-xs text-muted">{file.fileStatus.toLowerCase()}</span>}
                    </button>
                  )
                })}
              </div>
              {pageInfo.hasNextPage && (
                <button type="button" disabled={loading || uploading} onClick={() => void loadFiles()} className="admin-secondary-button mx-auto mt-5 block min-h-11">
                  {loading ? 'Loading…' : 'Load more images'}
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
