import { useState } from 'react'
import type { HomepageContent } from '../types/shopify'
import FeaturedProductsEditor from './FeaturedProductsEditor'
import MediaPicker from './MediaPicker'

interface AdminContentEditorProps {
  value: HomepageContent
  onChange: (value: HomepageContent) => void
}

type EditorSection = 'announcement' | 'hero' | 'gifting' | 'craftsmanship' | 'editorial' | 'merchandising'

const SECTIONS: Array<{ id: EditorSection; label: string }> = [
  { id: 'announcement', label: 'Announcement' },
  { id: 'hero', label: 'Hero' },
  { id: 'gifting', label: 'Gifting' },
  { id: 'craftsmanship', label: 'Craftsmanship' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'merchandising', label: 'Featured products' },
]

interface TextFieldProps {
  label: string
  value: string
  maxLength: number
  onChange: (value: string) => void
  multiline?: boolean
  hint?: string
}

function TextField({ label, value, maxLength, onChange, multiline = false, hint }: TextFieldProps) {
  const controlClass = `admin-input${multiline ? ' min-h-32 resize-y' : ''}`
  return (
    <label className="block min-w-0 text-sm font-medium text-ink">
      <span>{label}</span>
      {multiline ? (
        <textarea value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} className={`${controlClass} mt-1`} />
      ) : (
        <input value={value} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} className={`${controlClass} mt-1`} />
      )}
      <span className="mt-1 flex items-start justify-between gap-3 text-xs font-normal text-muted">
        {hint && <span>{hint}</span>}
        <span className="ml-auto shrink-0">{value.length}/{maxLength}</span>
      </span>
    </label>
  )
}

function SectionIntro({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6 border-b border-border pb-5">
      <h2 className="m-0 text-xl font-medium text-ink">{title}</h2>
      <p className="mb-0 mt-1 max-w-2xl text-sm leading-6 text-muted">{description}</p>
    </div>
  )
}

export default function AdminContentEditor({ value, onChange }: AdminContentEditorProps) {
  const [active, setActive] = useState<EditorSection>('announcement')

  function update<K extends keyof HomepageContent>(section: K, changes: Partial<HomepageContent[K]>) {
    onChange({ ...value, [section]: { ...value[section], ...changes } })
  }

  return (
    <div className="min-w-0">
      <nav aria-label="Homepage editor sections" className="-mx-1 mb-5 flex gap-2 overflow-x-auto px-1 pb-2">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            type="button"
            aria-pressed={active === section.id}
            onClick={() => setActive(section.id)}
            className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium transition ${active === section.id ? 'border-ink bg-ink text-cream' : 'border-border bg-white text-ink hover:border-gold'}`}
          >
            {section.label}
          </button>
        ))}
      </nav>

      <section className="rounded-2xl border border-border bg-white p-4 sm:p-6">
        {active === 'announcement' && (
          <>
            <SectionIntro title="Announcement bar" description="Edit the single message shown above the storefront navigation." />
            <div className="space-y-5">
              <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-ink">
                <input type="checkbox" checked={value.announcement.enabled} onChange={(event) => update('announcement', { enabled: event.target.checked })} className="h-5 w-5 accent-ink" />
                Show announcement bar
              </label>
              <TextField label="Announcement text" value={value.announcement.text} maxLength={300} onChange={(text) => update('announcement', { text })} />
            </div>
          </>
        )}

        {active === 'hero' && (
          <>
            <SectionIntro title="Homepage hero" description="Update the main introduction, links, and desktop/mobile hero images." />
            <div className="grid gap-5 md:grid-cols-2">
              <TextField label="Eyebrow" value={value.hero.eyebrow} maxLength={180} onChange={(eyebrow) => update('hero', { eyebrow })} />
              <TextField label="Heading" value={value.hero.title} maxLength={280} onChange={(title) => update('hero', { title })} />
              <div className="md:col-span-2"><TextField label="Description" value={value.hero.body} maxLength={1600} multiline onChange={(body) => update('hero', { body })} /></div>
              <TextField label="Primary button" value={value.hero.primaryCtaLabel} maxLength={80} onChange={(primaryCtaLabel) => update('hero', { primaryCtaLabel })} />
              <TextField label="Primary link" value={value.hero.primaryCtaHref} maxLength={500} hint="Use a site path, #section, or HTTPS URL." onChange={(primaryCtaHref) => update('hero', { primaryCtaHref })} />
              <TextField label="Secondary link text" value={value.hero.secondaryCtaLabel} maxLength={80} onChange={(secondaryCtaLabel) => update('hero', { secondaryCtaLabel })} />
              <TextField label="Secondary link destination" value={value.hero.secondaryCtaHref} maxLength={500} hint="Use a site path, #section, or HTTPS URL." onChange={(secondaryCtaHref) => update('hero', { secondaryCtaHref })} />
              <div className="md:col-span-2"><MediaPicker label="Desktop hero image" value={value.hero.image} onChange={(image) => update('hero', { image })} /></div>
              <div className="md:col-span-2"><MediaPicker label="Phone hero image" value={value.hero.mobileImage} onChange={(mobileImage) => update('hero', { mobileImage })} /></div>
            </div>
          </>
        )}

        {active === 'gifting' && (
          <>
            <SectionIntro title="Gifting section" description="Edit the section introduction, the two calls to action, its optional image, and all three existing steps." />
            <div className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <TextField label="Eyebrow" value={value.gifting.eyebrow} maxLength={180} onChange={(eyebrow) => update('gifting', { eyebrow })} />
                <TextField label="Heading" value={value.gifting.title} maxLength={280} onChange={(title) => update('gifting', { title })} />
                <div className="md:col-span-2"><TextField label="Description" value={value.gifting.body} maxLength={1600} multiline onChange={(body) => update('gifting', { body })} /></div>
                <TextField label="Primary button" value={value.gifting.ctaLabel} maxLength={80} onChange={(ctaLabel) => update('gifting', { ctaLabel })} />
                <TextField label="Primary link" value={value.gifting.ctaHref} maxLength={500} onChange={(ctaHref) => update('gifting', { ctaHref })} />
                <TextField label="Secondary button" value={value.gifting.secondaryCtaLabel} maxLength={80} onChange={(secondaryCtaLabel) => update('gifting', { secondaryCtaLabel })} />
                <TextField label="Secondary link" value={value.gifting.secondaryCtaHref} maxLength={500} onChange={(secondaryCtaHref) => update('gifting', { secondaryCtaHref })} />
              </div>
              <MediaPicker label="Gifting section image" value={value.gifting.image} onChange={(image) => update('gifting', { image })} />
              <div className="space-y-4 border-t border-border pt-5">
                <h3 className="m-0 text-base font-medium text-ink">Gifting steps</h3>
                {value.gifting.steps.map((step, index) => (
                  <div key={index} className="grid gap-4 rounded-xl bg-cream p-3 sm:grid-cols-2 sm:p-4">
                    <TextField label={`Step ${index + 1} title`} value={step.title} maxLength={180} onChange={(title) => update('gifting', { steps: value.gifting.steps.map((item, itemIndex) => itemIndex === index ? { ...item, title } : item) })} />
                    <TextField label="Description" value={step.description} maxLength={900} multiline onChange={(description) => update('gifting', { steps: value.gifting.steps.map((item, itemIndex) => itemIndex === index ? { ...item, description } : item) })} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {active === 'craftsmanship' && (
          <>
            <SectionIntro title="Craftsmanship section" description="Edit the section introduction, optional image, and all three feature descriptions." />
            <div className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <TextField label="Eyebrow" value={value.craftsmanship.eyebrow} maxLength={180} onChange={(eyebrow) => update('craftsmanship', { eyebrow })} />
                <TextField label="Heading" value={value.craftsmanship.title} maxLength={280} onChange={(title) => update('craftsmanship', { title })} />
                <div className="md:col-span-2"><TextField label="Description" value={value.craftsmanship.body} maxLength={1600} multiline onChange={(body) => update('craftsmanship', { body })} /></div>
              </div>
              <MediaPicker label="Craftsmanship section image" value={value.craftsmanship.image} onChange={(image) => update('craftsmanship', { image })} />
              <div className="space-y-4 border-t border-border pt-5">
                <h3 className="m-0 text-base font-medium text-ink">Craftsmanship features</h3>
                {value.craftsmanship.features.map((feature, index) => (
                  <div key={index} className="grid gap-4 rounded-xl bg-cream p-3 sm:grid-cols-2 sm:p-4">
                    <TextField label={`Feature ${index + 1} title`} value={feature.title} maxLength={180} onChange={(title) => update('craftsmanship', { features: value.craftsmanship.features.map((item, itemIndex) => itemIndex === index ? { ...item, title } : item) })} />
                    <TextField label="Description" value={feature.description} maxLength={900} multiline onChange={(description) => update('craftsmanship', { features: value.craftsmanship.features.map((item, itemIndex) => itemIndex === index ? { ...item, description } : item) })} />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {active === 'editorial' && (
          <>
            <SectionIntro title="Editorial gallery" description="Edit the gallery heading and the four existing image tiles." />
            <div className="space-y-6">
              <div className="grid gap-5 md:grid-cols-2">
                <TextField label="Eyebrow" value={value.editorial.eyebrow} maxLength={180} onChange={(eyebrow) => update('editorial', { eyebrow })} />
                <TextField label="Heading" value={value.editorial.title} maxLength={280} onChange={(title) => update('editorial', { title })} />
              </div>
              {value.editorial.moments.map((moment, index) => (
                <div key={index} className="space-y-4 rounded-xl border border-border p-3 sm:p-4">
                  <h3 className="m-0 text-base font-medium text-ink">Gallery image {index + 1}</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField label="Caption" value={moment.label} maxLength={120} onChange={(label) => update('editorial', { moments: value.editorial.moments.map((item, itemIndex) => itemIndex === index ? { ...item, label } : item) })} />
                    <TextField label="Short tag" value={moment.tag} maxLength={100} onChange={(tag) => update('editorial', { moments: value.editorial.moments.map((item, itemIndex) => itemIndex === index ? { ...item, tag } : item) })} />
                  </div>
                  <MediaPicker
                    label={`Editorial image ${index + 1}`}
                    value={moment.image}
                    onChange={(image) => update('editorial', { moments: value.editorial.moments.map((item, itemIndex) => itemIndex === index ? { ...item, image } : item) })}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {active === 'merchandising' && (
          <FeaturedProductsEditor
            selectedIds={value.featuredProductIds}
            onChange={(featuredProductIds) => onChange({ ...value, featuredProductIds })}
          />
        )}
      </section>
    </div>
  )
}
