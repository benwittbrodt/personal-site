const STRAPI_URL = import.meta.env.STRAPI_URL as string
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN as string

// --- Raw API types ---

export interface StrapiNode {
  type: string
  text?: string
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
  url?: string
  children?: StrapiNode[]
  format?: 'ordered' | 'unordered'
  level?: number
  image?: {
    url: string
    alternativeText?: string | null
    width?: number
    height?: number
  }
}

export interface StrapiMedia {
  id: number
  url: string
  alternativeText: string | null
  width: number
  height: number
  formats?: {
    thumbnail?: { url: string; width: number; height: number }
    small?: { url: string; width: number; height: number }
    medium?: { url: string; width: number; height: number }
    large?: { url: string; width: number; height: number }
  }
}

export interface StrapiRole {
  id: number
  JobTitle: string
  JobDescription: StrapiNode[]
  StartDate: string
  EndDate: string | null
}

export interface StrapiExperience {
  id: number
  Company: string
  Role: StrapiRole[]
  CompanyLogo: StrapiMedia | null
}

export interface StrapiPost {
  id: number
  documentId: string
  Title: string
  Slug: string | null
  Content: StrapiNode[] | null
  FeaturedImage: StrapiMedia | null
  PreviewText: string | null
  createdAt: string
  updatedAt: string
  publishedAt: string
}

export interface StrapiBackground {
  id: number
  documentId: string
  ProfessionalSummary: StrapiNode[]
  Experience: StrapiExperience[]
  createdAt: string
  updatedAt: string
  publishedAt: string
}

// --- Normalized types used by components ---

export interface NormalizedPost {
  slug: string
  title: string
  date: Date
  summary: string
  tags: string[]
  contentHtml: string
  documentId: string
  featuredImage: StrapiMedia | null
}

// --- Helpers ---

export function getMediaUrl(url: string): string {
  if (url.startsWith('http')) return url
  return `${STRAPI_URL}${url}`
}

// --- Fetchers ---

async function strapiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
  })
  if (!res.ok) {
    throw new Error(`Strapi ${res.status}: ${path}`)
  }
  const json = await res.json()
  return json.data as T
}

export async function getPosts(): Promise<StrapiPost[]> {
  return strapiGet<StrapiPost[]>('/api/posts?sort=publishedAt:desc&pagination[pageSize]=100&populate=FeaturedImage')
}

export async function getBackground(): Promise<StrapiBackground> {
  return strapiGet<StrapiBackground>(
    '/api/background?populate[Experience][populate]=*'
  )
}
