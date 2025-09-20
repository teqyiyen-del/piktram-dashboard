import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | null) {
  if (!date) return ''
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(date))
}

export function formatDateTime(date: string | null) {
  if (!date) return ''
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export function getInitials(fullName?: string | null) {
  if (!fullName) return 'K'
  const parts = fullName.split(' ')
  const initials = parts.slice(0, 2).map((p) => p.charAt(0).toUpperCase())
  return initials.join('') || 'K'
}
