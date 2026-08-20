import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * A homepage testimonial. `headline` is the bold line on the card (a sentence,
 * not a person's name) and `initial` is the letter in the avatar circle — the
 * card supplies the stars and the "Verified Buyer" byline itself.
 */
export type Testimonial = {
  id: number
  headline: string
  quote: string
  initial: string
  /** Stars drawn on the card, 1-5. Also what the homepage badge averages. */
  rating: number
  is_active: boolean
  sort_order: number
}

/** What the badge above the carousel shows: the average of the stars, and how many. */
export type TestimonialSummary = { average: number; count: number }

/**
 * The quotes the homepage shipped with. Used verbatim as the fallback while
 * supabase/testimonials.sql hasn't been run — an empty carousel under the
 * "4.9/5 from 5,000+ reviews" badge would look broken, so the storefront keeps
 * showing these until the table exists (they are also its seed rows).
 */
export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  ['Best hair I’ve ever bought!', 'Soft, full, and zero shedding. I’m obsessed.', 'B'],
  ['My man thought it was my real hair.', 'And honestly… I didn’t correct him.', 'M'],
  ['Installed it twice and it still looks new.', 'Quality is crazy good.', 'I'],
  ['I got compliments before I even sat down.', 'This hair is THAT girl.', 'C'],
  ['Shipping was fast and the hair is gorgeous.', '10/10 experience.', 'S'],
  ['I’m a stylist and I recommend this brand now.', 'Clients love it every time.', 'R'],
  ['The curls stayed popping all week.', 'No frizz, no drama.', 'T'],
  ['I was scared to try a new brand… now I’m loyal.', 'Glamm Hair won me over.', 'L'],
  ['Feels like butter, looks like luxury.', 'I’m not buying hair anywhere else.', 'F'],
  ['I don’t usually leave reviews but WOW.', 'This hair gave what it needed to give.', 'W'],
].map(([headline, quote, initial], i) => ({
  id: -(i + 1), // negative: these rows aren't in the database
  headline,
  quote,
  initial,
  rating: 5,
  is_active: true,
  sort_order: i + 1,
}))

const COLUMNS = 'id, headline, quote, initial, rating, is_active, sort_order'

// Same list without `rating`, for reading before testimonials-rating.sql is run.
const COLUMNS_NO_RATING = 'id, headline, quote, initial, is_active, sort_order'

// The column isn't there: 42703 is Postgres (reads), PGRST204 is PostgREST
// failing to find it in its schema cache (writes).
const UNDEFINED_COLUMN = '42703'
const MISSING_COLUMN_CODES = [UNDEFINED_COLUMN, 'PGRST204']

const isMissingColumn = (e: { code?: string } | null) =>
  Boolean(e?.code && MISSING_COLUMN_CODES.includes(e.code))

export const DEFAULT_RATING = 5

// Postgres undefined_table / PostgREST "table not in the schema cache" — i.e.
// supabase/testimonials.sql hasn't been run yet.
const MISSING_TABLE_CODES = ['42P01', 'PGRST205']

const MAX_HEADLINE = 120
const MAX_QUOTE = 400

/**
 * Read testimonials in the admin's order. The `id` tiebreak has to match
 * TESTIMONIAL_ORDER in lib/admin/reposition.ts — drag-to-reorder derives
 * positions from this order, so any read that could come back two ways would
 * make a drop land somewhere the admin didn't aim.
 */
async function readTestimonials(activeOnly: boolean): Promise<Testimonial[]> {
  const sb = supabaseAdmin()
  const build = (columns: string) => {
    let q = sb.from('testimonials').select(columns)
    if (activeOnly) q = q.eq('is_active', true)
    return q.order('sort_order', { ascending: true }).order('id', { ascending: true })
  }

  const { data, error } = await build(COLUMNS)
  if (!error) return (data as unknown as Testimonial[]) ?? []
  if (error.code !== UNDEFINED_COLUMN) throw error

  // testimonials-rating.sql hasn't been run — every card keeps the five stars
  // the carousel drew before ratings existed.
  const legacy = await build(COLUMNS_NO_RATING)
  if (legacy.error) throw legacy.error
  return ((legacy.data as unknown as Omit<Testimonial, 'rating'>[]) ?? []).map((t) => ({
    ...t,
    rating: DEFAULT_RATING,
  }))
}

/**
 * The badge above the carousel. Averaged over exactly the testimonials passed
 * in — the homepage passes the visible ones, so hiding a card moves the badge
 * with it. One decimal, the way a rating is normally quoted.
 */
export function summarise(testimonials: Testimonial[]): TestimonialSummary {
  if (testimonials.length === 0) return { average: 0, count: 0 }
  const total = testimonials.reduce((sum, t) => sum + t.rating, 0)
  return {
    average: Math.round((total / testimonials.length) * 10) / 10,
    count: testimonials.length,
  }
}

/** Active testimonials for the homepage carousel, in the admin's order. */
export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const rows = await readTestimonials(true)
    // A missing table throws; an empty table means the admin hid or deleted
    // every one, which is a choice worth honouring — don't resurrect the seed.
    return rows
  } catch (e) {
    // Logged so a broken connection doesn't look like "the SQL isn't run yet" —
    // both end up showing the seed quotes.
    console.error('getTestimonials failed, falling back to the shipped quotes:', e)
    return DEFAULT_TESTIMONIALS
  }
}

/** Every testimonial, active or not (admin list). */
export async function getAllTestimonials(): Promise<Testimonial[]> {
  try {
    return await readTestimonials(false)
  } catch (e) {
    console.error('getAllTestimonials failed:', e)
    return []
  }
}

/**
 * `warning` means the row was written but something in it couldn't be — today
 * only the rating, when testimonials-rating.sql hasn't been run. The edit
 * still lands; the admin is told what didn't stick.
 */
type Result = { ok: true; warning?: string } | { ok: false; error: string }

function clean(input: { headline?: string; quote?: string; initial?: string; rating?: number }) {
  const headline = String(input.headline ?? '').trim().slice(0, MAX_HEADLINE)
  const quote = String(input.quote ?? '').trim().slice(0, MAX_QUOTE)
  // Default the avatar letter to the first letter of the headline.
  const initial = (String(input.initial ?? '').trim() || headline).slice(0, 1).toUpperCase()
  const asked = Math.round(Number(input.rating))
  const rating = Number.isFinite(asked) ? Math.min(Math.max(asked, 1), 5) : DEFAULT_RATING
  return { headline, quote, initial, rating }
}

const MISSING_TABLE = 'Testimonials cannot be saved until supabase/testimonials.sql has been run'

const MISSING_RATING =
  'Star ratings cannot be saved until supabase/testimonials-rating.sql has been run'

/** Only point at a SQL file when the database actually says something is missing. */
function writeError(e: { code?: string } | null, fallback: string): string {
  if (!e?.code) return fallback
  if (MISSING_TABLE_CODES.includes(e.code)) return MISSING_TABLE
  if (isMissingColumn(e)) return MISSING_RATING
  return fallback
}

/** Add a testimonial to the end of the list. */
export async function createTestimonial(input: {
  headline: string
  quote: string
  initial?: string
  rating?: number
}): Promise<Result> {
  const { headline, quote, initial, rating } = clean(input)
  if (!headline) return { ok: false, error: 'A headline is required' }
  if (!quote) return { ok: false, error: 'A quote is required' }
  try {
    const sb = supabaseAdmin()
    // Append rather than land at the top: sort_order defaults to 0, which
    // would outrank every curated row.
    const { data: last } = await sb
      .from('testimonials')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()
    const sort_order = (last?.sort_order ?? 0) + 1

    const row = { headline, quote, initial, sort_order }
    const { error } = await sb.from('testimonials').insert({ ...row, rating })
    if (!error) return { ok: true }

    console.error('createTestimonial failed:', error)
    if (!isMissingColumn(error)) {
      return { ok: false, error: writeError(error, 'Could not add the testimonial') }
    }

    // No rating column yet — add the quote anyway rather than blocking on it.
    const retry = await sb.from('testimonials').insert(row)
    if (retry.error) {
      console.error('createTestimonial retry failed:', retry.error)
      return { ok: false, error: writeError(retry.error, 'Could not add the testimonial') }
    }
    return { ok: true, warning: MISSING_RATING }
  } catch {
    return { ok: false, error: 'Could not add the testimonial' }
  }
}

/** Edit a testimonial, or show/hide it. Only the given fields are written. */
export async function updateTestimonial(
  id: number,
  input: { headline?: string; quote?: string; initial?: string; rating?: number; is_active?: boolean },
): Promise<Result> {
  const patch: Record<string, unknown> = {}

  if (
    input.headline !== undefined ||
    input.quote !== undefined ||
    input.initial !== undefined ||
    input.rating !== undefined
  ) {
    const { headline, quote, initial, rating } = clean(input)
    if (input.headline !== undefined) {
      if (!headline) return { ok: false, error: 'A headline is required' }
      patch.headline = headline
    }
    if (input.quote !== undefined) {
      if (!quote) return { ok: false, error: 'A quote is required' }
      patch.quote = quote
    }
    if (input.initial !== undefined) patch.initial = initial
    if (input.rating !== undefined) patch.rating = rating
  }
  if (input.is_active !== undefined) patch.is_active = Boolean(input.is_active)

  if (Object.keys(patch).length === 0) return { ok: false, error: 'Nothing to update' }

  try {
    const sb = supabaseAdmin()
    const { error } = await sb.from('testimonials').update(patch).eq('id', id)
    if (!error) return { ok: true }

    console.error('updateTestimonial failed:', error)
    if (!isMissingColumn(error) || patch.rating === undefined) {
      return { ok: false, error: writeError(error, 'Could not save the testimonial') }
    }

    // No rating column yet. Save everything else — an edit that also retypes
    // the quote shouldn't be lost to a migration that hasn't been pasted.
    const { rating: _unsaved, ...rest } = patch
    if (Object.keys(rest).length === 0) return { ok: false, error: MISSING_RATING }

    const retry = await sb.from('testimonials').update(rest).eq('id', id)
    if (retry.error) {
      console.error('updateTestimonial retry failed:', retry.error)
      return { ok: false, error: writeError(retry.error, 'Could not save the testimonial') }
    }
    return { ok: true, warning: MISSING_RATING }
  } catch {
    return { ok: false, error: 'Could not save the testimonial' }
  }
}

export async function deleteTestimonial(id: number): Promise<Result> {
  try {
    const sb = supabaseAdmin()
    const { error } = await sb.from('testimonials').delete().eq('id', id)
    if (error) {
      console.error('deleteTestimonial failed:', error)
      return { ok: false, error: 'Could not delete the testimonial' }
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not delete the testimonial' }
  }
}
