export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return ''

  const date = new Date(dateString)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 0) return `In ${diffDays} days`
  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`

  return date.toLocaleDateString()
}

export function getContrastColor(hexColor: string): 'light' | 'dark' {
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return luminance > 0.5 ? 'light' : 'dark'
}

export function getThemeFromCookie(): 'light' | 'dark' | 'system' {
  if (typeof document === 'undefined') return 'system'

  const cookie = document.cookie
    .split('; ')
    .find(c => c.trim().startsWith('theme='))
    ?.split('=')[1] as 'light' | 'dark' | 'system'

  return cookie || 'system'
}

export function setThemeCookie(theme: 'light' | 'dark' | 'system'): void {
  if (typeof document === 'undefined') return

  document.cookie = `theme=${theme}; path=/; max-age=31536000; SameSite=Strict`
}
