/**
 * String utility functions
 * Centralized string manipulation to eliminate duplication
 */

/**
 * Get initials from email or name
 * @param input - Email address or full name
 * @returns Two-letter initials in uppercase
 */
export function getInitials(input?: string): string {
  if (!input) return 'U'

  // If it's an email, take first 2 characters
  if (input.includes('@')) {
    return input.substring(0, 2).toUpperCase()
  }

  // If it's a name with spaces, take first letter of each word
  const parts = input.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }

  // Otherwise take first 2 characters
  return input.substring(0, 2).toUpperCase()
}

/**
 * Truncate text to a specified length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substring(0, length) + '...'
}

/**
 * Capitalize first letter of string
 */
export function capitalize(text: string): string {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Convert snake_case to Title Case
 */
export function snakeToTitle(text: string): string {
  return text
    .split('_')
    .map((word) => capitalize(word))
    .join(' ')
}

/**
 * Generate a unique ID
 */
export function generateId(prefix?: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`
}
