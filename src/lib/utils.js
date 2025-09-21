import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function normalizeText(value) {
  if (value == null) {
    return ''
  }

  const stringValue = value.toString()
  const normalizedValue = typeof stringValue.normalize === 'function'
    ? stringValue.normalize('NFD')
    : stringValue

  return normalizedValue
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}
