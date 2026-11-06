/**
 * Centralized formatting utilities for currency, percentages, dates, and units.
 * Strict en-IN currency rules and 1 QUANT = ₹1,000.
 */

export function formatINR(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '—'
  return `₹${Math.round(value).toLocaleString('en-IN')}`
}

export function formatCompactINR(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '—'
  const abs = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  if (abs >= 10_000_000) {
    const cr = abs / 10_000_000
    const formatted = cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(cr < 10 ? 2 : 1)
    return `${sign}₹${formatted} Cr`
  }
  if (abs >= 100_000) {
    const l = abs / 100_000
    const formatted = l % 1 === 0 ? l.toFixed(0) : l.toFixed(l < 10 ? 2 : 1)
    return `${sign}₹${formatted} L`
  }
  if (abs >= 1_000) {
    const k = abs / 1_000
    const formatted = k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)
    return `${sign}₹${formatted} k`
  }
  return `${sign}₹${abs.toLocaleString('en-IN')}`
}

export function formatPercent(value: number | null | undefined, includeSign = true): string {
  if (value == null || isNaN(value)) return '—'
  const prefix = includeSign && value > 0 ? '+' : ''
  const formatted = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)
  return `${prefix}${formatted}%`
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function daysLeft(closingDate: string | Date | null | undefined): number | null {
  if (!closingDate) return null
  const d = typeof closingDate === 'string' ? new Date(closingDate) : closingDate
  if (isNaN(d.getTime())) return null
  const diffMs = d.getTime() - Date.now()
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  return Math.max(0, days)
}

export function formatQuants(quants: number | null | undefined): string {
  if (quants == null || isNaN(quants)) return '0'
  return quants.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  })
}
