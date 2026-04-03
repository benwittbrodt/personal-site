import type { NormalizedPost } from '@/lib/strapi'

export function sortPostsByDateDesc(a: NormalizedPost, b: NormalizedPost) {
  return b.date.getTime() - a.date.getTime()
}
