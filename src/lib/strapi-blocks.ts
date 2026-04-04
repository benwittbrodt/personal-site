import type { StrapiNode, StrapiPost, NormalizedPost } from './strapi'

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderInline(node: StrapiNode): string {
  if (node.type === 'text') {
    let text = escapeHtml(node.text ?? '')
    if (node.bold) text = `<strong>${text}</strong>`
    if (node.italic) text = `<em>${text}</em>`
    if (node.underline) text = `<u>${text}</u>`
    if (node.strikethrough) text = `<s>${text}</s>`
    if (node.code) text = `<code>${text}</code>`
    return text
  }
  if (node.type === 'link') {
    const inner = (node.children ?? []).map(renderInline).join('')
    return `<a href="${escapeHtml(node.url ?? '#')}">${inner}</a>`
  }
  return (node.children ?? []).map(renderInline).join('')
}

function renderBlock(block: StrapiNode): string {
  switch (block.type) {
    case 'paragraph': {
      const inner = (block.children ?? []).map(renderInline).join('')
      return inner ? `<p>${inner}</p>` : ''
    }
    case 'heading': {
      const level = block.level ?? 2
      const inner = (block.children ?? []).map(renderInline).join('')
      return `<h${level}>${inner}</h${level}>`
    }
    case 'list': {
      const tag = block.format === 'ordered' ? 'ol' : 'ul'
      const items = (block.children ?? [])
        .map(item => {
          const inner = (item.children ?? []).map(renderInline).join('')
          return `<li>${inner}</li>`
        })
        .join('')
      return `<${tag}>${items}</${tag}>`
    }
    case 'quote': {
      const inner = (block.children ?? []).map(renderInline).join('')
      return `<blockquote>${inner}</blockquote>`
    }
    case 'code': {
      const inner = (block.children ?? []).map(renderInline).join('')
      return `<pre><code>${inner}</code></pre>`
    }
    case 'image': {
      if (!block.image) return ''
      const alt = escapeHtml(block.image.alternativeText ?? '')
      return `<img src="${escapeHtml(block.image.url)}" alt="${alt}" />`
    }
    default:
      return ''
  }
}

export function blocksToHtml(blocks: StrapiNode[]): string {
  return blocks.map(renderBlock).filter(Boolean).join('\n')
}

export function extractSummary(blocks: StrapiNode[] | null, maxLength = 200): string {
  if (!blocks) return ''
  for (const block of blocks) {
    if (block.type !== 'paragraph') continue
    const text = (block.children ?? [])
      .filter(c => c.type === 'text')
      .map(c => c.text ?? '')
      .join('')
      .trim()
    if (text.length > 0) {
      return text.length > maxLength ? text.slice(0, maxLength) + '…' : text
    }
  }
  return ''
}

export function normalizePost(post: StrapiPost): NormalizedPost {
  return {
    slug: post.Slug ?? String(post.id),
    title: post.Title,
    date: new Date(post.publishedAt),
    summary: post.PreviewText ?? extractSummary(post.Content),
    tags: (post.tags ?? []).map(t => ({ title: t.Title, slug: t.Slug })),
    category: post.category ? { title: post.category.Title, slug: post.category.slug } : null,
    contentHtml: post.Content ? blocksToHtml(post.Content) : '',
    documentId: post.documentId,
    featuredImage: post.FeaturedImage ?? null,
  }
}
