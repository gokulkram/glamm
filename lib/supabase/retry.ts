/**
 * Retrying PostgREST reads that failed to authenticate.
 *
 * Our API keys are the `sb_secret_` / `sb_publishable_` kind, so the JWT that
 * PostgREST actually checks is minted upstream, not here — and now and then it
 * refuses one: PGRST303 is an `iat` in the future, PGRST301 one that already
 * expired. Neither says anything about the query, and both clear on a second
 * attempt.
 *
 * This matters because every reader in lib/ degrades on error rather than
 * failing: products come back empty, settings and testimonials fall back to
 * their shipped defaults. A blip therefore doesn't surface as an error — it
 * surfaces as an empty storefront or as content the admin didn't choose, and
 * sticks until the next revalidate.
 */

const TRANSIENT_AUTH_CODES = ['PGRST301', 'PGRST303']

export const isTransientAuth = (e: { code?: string } | null | undefined) =>
  Boolean(e?.code && TRANSIENT_AUTH_CODES.includes(e.code))

const AUTH_RETRY_DELAY_MS = 250

const pause = () => new Promise((resolve) => setTimeout(resolve, AUTH_RETRY_DELAY_MS))

/**
 * For reads that throw the PostgREST error. `label` names the caller in the log
 * so a retry is traceable to the read that needed it.
 */
export async function withAuthRetry<T>(label: string, read: () => Promise<T>): Promise<T> {
  try {
    return await read()
  } catch (e) {
    if (!isTransientAuth(e as { code?: string } | null)) throw e
    console.warn(`${label}: failed to authenticate, retrying once:`, e)
    await pause()
    return read()
  }
}

/**
 * For reads that hand back PostgREST's `{ data, error }` instead of throwing.
 * `run` has to build the query afresh each call — a supabase query builder is
 * single-use, so handing the same one back would just re-resolve the first
 * (failed) result.
 */
export async function retryQuery<T extends { error: { code?: string } | null }>(
  label: string,
  run: () => PromiseLike<T>,
): Promise<T> {
  const first = await run()
  if (!isTransientAuth(first.error)) return first
  console.warn(`${label}: failed to authenticate, retrying once:`, first.error)
  await pause()
  return run()
}
