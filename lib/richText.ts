import sanitizeHtml from 'sanitize-html'
import { parseContent } from '@/lib/blog'

/**
 * Blog post bodies are authored as HTML in the admin rich-text editor and
 * rendered with dangerouslySetInnerHTML, so every path into the page runs
 * through here first.
 *
 * The allowlist is deliberately narrow: only what the editor's toolbar can
 * produce. Anything else — script, style, iframe, event handlers, javascript:
 * URLs — is dropped rather than escaped, so a post can't reach outside its own
 * markup no matter how the HTML got into the row.
 *
 * Server-only: sanitize-html parses with htmlparser2 and must not be pulled
 * into the admin client bundle. Sanitising happens on write (buildBlogRow) and
 * again on render, so a row written before this existed is still safe to show.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p', 'br',
    'h2', 'h3',
    'strong', 'em', 's', 'code',
    'ul', 'ol', 'li',
    'blockquote', 'pre',
    'a', 'img',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'title'],
  },
  // No scheme means a relative URL — our own uploads are served that way, and
  // they stay allowed. `//host` is not: it inherits the page scheme and reads
  // as relative at a glance.
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs.href ?? ''
      const external = /^https?:\/\//i.test(href)
      return {
        tagName: 'a',
        attribs: external
          ? { ...attribs, target: '_blank', rel: 'nofollow noopener noreferrer' }
          : attribs,
      }
    },
  },
}

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html ?? '', OPTIONS)
}

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

/**
 * Render a post body to HTML.
 *
 * Posts written before the rich-text editor are stored in the old line-based
 * mini-format ("## " headings, "- " bullets). Those were migrated, so in
 * practice everything is HTML now — this keeps the old path working for any row
 * that wasn't, rather than showing its markup as literal text.
 *
 * The test is deliberately crude: the mini-format has no tags at all, so a
 * single block-level tag is enough to tell the two apart.
 */
export function renderRichText(raw: string): string {
  const content = raw ?? ''
  if (/<(p|h2|h3|ul|ol|blockquote|img|pre)\b/i.test(content)) {
    return sanitizeRichText(content)
  }
  return sanitizeRichText(miniFormatToHtml(content))
}

/** Convert a legacy mini-format body to the equivalent HTML. */
export function miniFormatToHtml(raw: string): string {
  return parseContent(raw)
    .map((block) => {
      if (block.type === 'heading') return `<h2>${escapeHtml(block.text)}</h2>`
      if (block.type === 'list') {
        return `<ul>${block.items.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}</ul>`
      }
      return `<p>${escapeHtml(block.text)}</p>`
    })
    .join('\n')
}
