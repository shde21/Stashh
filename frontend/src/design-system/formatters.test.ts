import { describe, expect, it } from 'vitest'
import {
  daysLeft,
  formatCompactINR,
  formatDate,
  formatINR,
  formatPercent,
  formatQuants,
} from './formatters'

describe('formatters', () => {
  describe('formatINR', () => {
    it('formats Indian numbering with rupee symbol', () => {
      expect(formatINR(1234567)).toBe('₹12,34,567')
      expect(formatINR(0)).toBe('₹0')
      expect(formatINR(50000)).toBe('₹50,000')
      expect(formatINR(10000000)).toBe('₹1,00,00,000')
    })

    it('handles null/undefined gracefully', () => {
      expect(formatINR(null)).toBe('—')
      expect(formatINR(undefined)).toBe('—')
    })
  })

  describe('formatCompactINR', () => {
    it('formats crores, lakhs, and thousands clearly', () => {
      expect(formatCompactINR(15000000)).toBe('₹1.50 Cr')
      expect(formatCompactINR(10000000)).toBe('₹1 Cr')
      expect(formatCompactINR(4500000)).toBe('₹45 L')
      expect(formatCompactINR(250000)).toBe('₹2.50 L')
      expect(formatCompactINR(50000)).toBe('₹50 k')
      expect(formatCompactINR(500)).toBe('₹500')
    })

    it('formats negative numbers correctly', () => {
      expect(formatCompactINR(-15000000)).toBe('-₹1.50 Cr')
      expect(formatCompactINR(-250000)).toBe('-₹2.50 L')
    })
  })

  describe('formatPercent', () => {
    it('formats signed percentages', () => {
      expect(formatPercent(12.5)).toBe('+12.5%')
      expect(formatPercent(-4.2)).toBe('-4.2%')
      expect(formatPercent(0)).toBe('0%')
      expect(formatPercent(25, false)).toBe('25%')
    })
  })

  describe('formatDate', () => {
    it('formats dates consistently', () => {
      const date = new Date(2026, 9, 24)
      expect(formatDate(date)).toContain('2026')
      expect(formatDate('invalid')).toBe('—')
      expect(formatDate(null)).toBe('—')
    })
  })

  describe('daysLeft', () => {
    it('calculates days left until closing date', () => {
      const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      expect(daysLeft(future)).toBeGreaterThanOrEqual(4)
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000)
      expect(daysLeft(past)).toBe(0)
      expect(daysLeft(null)).toBeNull()
    })
  })

  describe('formatQuants', () => {
    it('formats quants with Indian number format', () => {
      expect(formatQuants(250)).toBe('250')
      expect(formatQuants(1250.5)).toBe('1,250.5')
      expect(formatQuants(0)).toBe('0')
    })
  })
})
