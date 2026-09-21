/**
 * Converts an organization name into a URL-friendly slug.
 */
export function orgNameToSlug(orgName: string): string {
  if (!orgName) return ''

  return orgName
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics / accent marks
    .replace(/[^a-z0-9\s-]/g, '') // Remove non-alphanumeric characters except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and consecutive hyphens with a single hyphen
    .replace(/^-+|-+$/g, '') // Trim leading and trailing hyphens
}
