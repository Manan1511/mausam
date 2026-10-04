import { adminErrorResponse, containsControlCharacters, readCursor } from './_shared/adminHttp.js'
import { hasStaffScope, requireAdminSession, requireSameOrigin } from './_shared/adminSession.js'
import { HttpError, jsonResponse, methodNotAllowed } from './_shared/http.js'
import { getShopifyRuntimeConfig } from './_shared/shopifyEnv.js'
import { shopifyAdminGraphql } from './_shared/shopifyGraphql.js'

const MAX_IMAGE_BYTES = 4 * 1024 * 1024
const MAX_MULTIPART_BYTES = 5 * 1024 * 1024
const PAGE_SIZE = 50

interface FileChoiceResponse {
  files: {
    nodes: Array<{
      id: string
      alt: string | null
      fileStatus: string
      __typename: string
      image?: { url: string; altText: string | null } | null
    }>
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
  }
}

interface StagedUploadResponse {
  stagedUploadsCreate: {
    stagedTargets: Array<{
      url: string
      resourceUrl: string
      parameters: Array<{ name: string; value: string }>
    }> | null
    userErrors: Array<{ field: string[] | null; message: string }>
  }
}

interface FileCreateResponse {
  fileCreate: {
    files: Array<{
      id: string
      fileStatus: string
      alt: string | null
      __typename: string
      image?: { url: string; altText: string | null } | null
    }> | null
    userErrors: Array<{ field: string[] | null; message: string }>
  }
}

const FILES_QUERY = `
  query AdminImageChoices($after: String) {
    files(first: ${PAGE_SIZE}, after: $after) {
      nodes {
        id
        alt
        fileStatus
        __typename
        ... on MediaImage { image { url altText } }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`

const STAGED_UPLOADS_MUTATION = `
  mutation CreateHomepageImageUpload($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets { url resourceUrl parameters { name value } }
      userErrors { field message }
    }
  }
`

const FILE_CREATE_MUTATION = `
  mutation CreateHomepageImage($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files {
        id
        fileStatus
        alt
        __typename
        ... on MediaImage { image { url altText } }
      }
      userErrors { field message }
    }
  }
`

function safeFilename(value: string): string {
  const leaf = value.replaceAll('\\', '/').split('/').at(-1) ?? ''
  const filename = leaf.trim().replace(/[^A-Za-z0-9._ -]/g, '-').replace(/\s+/g, '-')
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,119}\.(?:jpe?g|png|webp|gif)$/i.test(filename)) {
    throw new HttpError('Choose a JPG, PNG, WebP, or GIF image with a valid filename.', 400)
  }
  return filename
}

function supportedMime(mime: string, filename: string): boolean {
  const extension = filename.split('.').at(-1)?.toLowerCase()
  const supported: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
    'image/gif': ['gif'],
  }
  return Boolean(supported[mime]?.includes(extension ?? ''))
}

function hasImageSignature(bytes: Uint8Array, mime: string): boolean {
  if (mime === 'image/jpeg') return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  if (mime === 'image/png') return bytes.length >= 8 && [137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte)
  if (mime === 'image/webp') return bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
  if (mime === 'image/gif') {
    const header = String.fromCharCode(...bytes.slice(0, 6))
    return header === 'GIF87a' || header === 'GIF89a'
  }
  return false
}

function validStageUrl(value: string): URL | null {
  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase()
    const trustedUploadHost = host === 'storage.googleapis.com' ||
      host.endsWith('.storage.googleapis.com') ||
      host === 's3.amazonaws.com' ||
      host.endsWith('.s3.amazonaws.com')
    return url.protocol === 'https:' && !url.username && !url.password && trustedUploadHost ? url : null
  } catch {
    return null
  }
}

function validResourceUrl(value: string, shopDomain: string): string | null {
  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase()
    const trustedResourceHost = host === shopDomain ||
      host === 'storage.googleapis.com' ||
      host.endsWith('.storage.googleapis.com') ||
      host === 's3.amazonaws.com' ||
      host.endsWith('.s3.amazonaws.com') ||
      host === 'cdn.shopify.com' ||
      host.endsWith('.shopify.com') ||
      host.endsWith('.shopifycdn.net')
    return url.protocol === 'https:' && !url.username && !url.password && trustedResourceHost ? url.href : null
  } catch {
    return null
  }
}

async function uploadImage(request: Request, token: string, shopDomain: string): Promise<Response> {
  const contentLength = Number(request.headers.get('content-length'))
  if (Number.isFinite(contentLength) && contentLength > MAX_MULTIPART_BYTES) {
    await request.body?.cancel()
    throw new HttpError('The image upload is too large. Maximum image size is 4 MB.', 413)
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    throw new HttpError('Choose an image file to upload.', 400)
  }
  const file = form.get('file')
  if (!(file instanceof File)) throw new HttpError('Choose an image file to upload.', 400)
  if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
    throw new HttpError('Image size must be between 1 byte and 4 MB.', 413)
  }

  const filename = safeFilename(file.name)
  const mime = file.type.toLowerCase()
  if (!supportedMime(mime, filename)) throw new HttpError('Only JPG, PNG, WebP, and GIF images are accepted.', 415)
  const imageBytes = new Uint8Array(await file.arrayBuffer())
  if (!hasImageSignature(imageBytes, mime)) throw new HttpError('The uploaded file does not match its image type.', 415)

  const altValue = form.get('altText')
  const altText = typeof altValue === 'string' ? altValue.trim() : ''
  if (altText.length > 300 || containsControlCharacters(altText)) {
    throw new HttpError('Image description must be 300 characters or fewer.', 400)
  }

  const staged = await shopifyAdminGraphql<StagedUploadResponse>(token, STAGED_UPLOADS_MUTATION, {
    input: [{ filename, fileSize: String(file.size), mimeType: mime, httpMethod: 'POST', resource: 'IMAGE' }],
  })
  const stagedPayload = staged.stagedUploadsCreate
  const target = stagedPayload.stagedTargets?.[0]
  const uploadUrl = target ? validStageUrl(target.url) : null
  const resourceUrl = target ? validResourceUrl(target.resourceUrl, shopDomain) : null
  if (stagedPayload.userErrors.length || !target || !uploadUrl || !resourceUrl || !target.parameters?.length) {
    throw new HttpError('Shopify could not prepare the image upload.', 502)
  }

  const uploadForm = new FormData()
  for (const parameter of target.parameters) {
    if (!parameter.name || parameter.name.length > 100 || parameter.value.length > 8192) {
      throw new HttpError('Shopify returned an invalid upload target.', 502)
    }
    uploadForm.append(parameter.name, parameter.value)
  }
  uploadForm.append('file', new Blob([imageBytes], { type: mime }), filename)

  let uploadResponse: Response
  try {
    uploadResponse = await fetch(uploadUrl.href, {
      method: 'POST',
      body: uploadForm,
      redirect: 'error',
      signal: AbortSignal.timeout(20_000),
    })
  } catch {
    throw new HttpError('Shopify image upload failed. Please try again.', 502)
  }
  if (!uploadResponse.ok) {
    await uploadResponse.body?.cancel()
    throw new HttpError('Shopify image upload failed. Please try again.', 502)
  }
  await uploadResponse.body?.cancel()

  const created = await shopifyAdminGraphql<FileCreateResponse>(token, FILE_CREATE_MUTATION, {
    files: [{ alt: altText, contentType: 'IMAGE', originalSource: resourceUrl, filename }],
  })
  if (created.fileCreate.userErrors.length || !created.fileCreate.files?.length) {
    throw new HttpError('Shopify received the upload but could not add it to Files.', 422)
  }
  const image = created.fileCreate.files[0]
  if (image.__typename !== 'MediaImage' || !/^gid:\/\/shopify\/MediaImage\/[A-Za-z0-9-]+$/.test(image.id)) {
    throw new HttpError('Shopify did not create a usable image.', 502)
  }
  return jsonResponse({
    file: {
      id: image.id,
      altText: image.image?.altText ?? image.alt,
      url: image.image?.url ?? null,
      fileStatus: image.fileStatus,
    },
  }, 201)
}

export default {
  fetch: async (request: Request) => {
    if (request.method !== 'GET' && request.method !== 'POST') return methodNotAllowed('GET, POST')
    if (request.method === 'POST') {
      const originError = requireSameOrigin(request)
      if (originError) return originError
    }

    const session = await requireAdminSession(request)
    if (session instanceof Response) return session
    const scope = request.method === 'GET' ? 'read_files' : 'write_files'
    if (!hasStaffScope(session, scope)) {
      return jsonResponse({ error: 'Your Shopify staff account cannot manage images.' }, 403)
    }

    try {
      if (request.method === 'POST') {
        const config = getShopifyRuntimeConfig()
        if (!config.shopDomain) return jsonResponse({ error: 'Shopify is not configured.' }, 503)
        return await uploadImage(request, session.token, config.shopDomain)
      }

      const cursor = readCursor(new URL(request.url).searchParams.get('after'))
      const result = await shopifyAdminGraphql<FileChoiceResponse>(session.token, FILES_QUERY, { after: cursor })
      const files = result.files.nodes.flatMap((file) => {
        if (
          file.__typename !== 'MediaImage' ||
          !/^gid:\/\/shopify\/MediaImage\/[A-Za-z0-9-]+$/.test(file.id) ||
          !file.image?.url
        ) return []
        try {
          const url = new URL(file.image.url)
          if (url.protocol !== 'https:' || !(url.hostname === 'cdn.shopify.com' || url.hostname.endsWith('.shopify.com') || url.hostname.endsWith('.shopifycdn.net'))) return []
          return [{ id: file.id, altText: file.image.altText ?? file.alt, url: url.href, fileStatus: file.fileStatus }]
        } catch {
          return []
        }
      })
      return jsonResponse({ files, pageInfo: result.files.pageInfo })
    } catch (error) {
      return adminErrorResponse(error)
    }
  },
}
