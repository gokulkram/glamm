/**
 * Formats a US phone number as it is typed: (555) 123-4567.
 *
 * Checkout collects US addresses only (State/ZIP, US shipping rates), so US
 * grouping is the right default. A number typed with a leading `+` is left
 * exactly as entered — an international customer's number should never be
 * silently reshaped into a US pattern.
 *
 * Stored values keep the punctuation. `telHref` in components/admin/ContactLinks
 * strips everything but digits and `+`, so formatted numbers still dial.
 */
export function formatUsPhone(input: string): string {
  if (input.trim().startsWith('+')) return input

  let digits = input.replace(/\D/g, '')
  // A leading 1 is the country code, not part of the 10-digit number.
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1)
  digits = digits.slice(0, 10)

  if (!digits) return ''
  if (digits.length <= 3) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}
