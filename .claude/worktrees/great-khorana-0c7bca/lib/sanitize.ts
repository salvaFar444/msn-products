/**
 * Simple string sanitizer — strips HTML-ish characters and control chars.
 * Use before putting user input into any URL or WhatsApp message.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/[<>]/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500)
}

/** Sanitize a phone number — digits only, max 15 chars. */
export function sanitizePhone(input: string): string {
  return input.replace(/\D/g, '').slice(0, 15)
}
