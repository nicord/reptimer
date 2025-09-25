import { describe, it, expect } from 'vitest'
import { 
  formatTime, 
  formatDuration, 
  formatProgress, 
  parseTimeString, 
  isValidHexColor,
  getContrastingTextColor,
  hexToRgb
} from '../format'

describe('Format Utils', () => {
  describe('formatTime', () => {
    it('should format seconds correctly', () => {
      expect(formatTime(0)).toBe('0:00')
      expect(formatTime(5)).toBe('0:05')
      expect(formatTime(30)).toBe('0:30')
      expect(formatTime(59)).toBe('0:59')
    })

    it('should format minutes correctly', () => {
      expect(formatTime(60)).toBe('1:00')
      expect(formatTime(90)).toBe('1:30')
      expect(formatTime(120)).toBe('2:00')
      expect(formatTime(3661)).toBe('61:01') // Over an hour
    })

    it('should handle negative numbers', () => {
      expect(formatTime(-5)).toBe('-0:05')
      expect(formatTime(-65)).toBe('-1:05')
    })
  })

  describe('formatDuration', () => {
    it('should format seconds only', () => {
      expect(formatDuration(30)).toBe('30s')
      expect(formatDuration(45)).toBe('45s')
    })

    it('should format minutes only', () => {
      expect(formatDuration(60)).toBe('1m')
      expect(formatDuration(120)).toBe('2m')
      expect(formatDuration(300)).toBe('5m')
    })

    it('should format minutes and seconds', () => {
      expect(formatDuration(90)).toBe('1m 30s')
      expect(formatDuration(125)).toBe('2m 5s')
      expect(formatDuration(3661)).toBe('61m 1s')
    })
  })

  describe('formatProgress', () => {
    it('should calculate progress percentage correctly', () => {
      expect(formatProgress(0, 100)).toBe(0)
      expect(formatProgress(25, 100)).toBe(25)
      expect(formatProgress(50, 100)).toBe(50)
      expect(formatProgress(100, 100)).toBe(100)
    })

    it('should handle edge cases', () => {
      expect(formatProgress(0, 0)).toBe(0) // Avoid division by zero
      expect(formatProgress(150, 100)).toBe(100) // Cap at 100%
      expect(formatProgress(-10, 100)).toBe(0) // Floor at 0%
    })

    it('should handle decimal precision', () => {
      expect(formatProgress(33, 100)).toBe(33)
      expect(formatProgress(1, 3)).toBeCloseTo(33.33, 1)
    })
  })

  describe('parseTimeString', () => {
    it('should parse seconds format', () => {
      expect(parseTimeString('30')).toBe(30)
      expect(parseTimeString('0')).toBe(0)
      expect(parseTimeString('120')).toBe(120)
    })

    it('should parse MM:SS format', () => {
      expect(parseTimeString('1:30')).toBe(90)
      expect(parseTimeString('0:45')).toBe(45)
      expect(parseTimeString('2:00')).toBe(120)
      expect(parseTimeString('10:05')).toBe(605)
    })

    it('should handle whitespace', () => {
      expect(parseTimeString(' 30 ')).toBe(30)
      expect(parseTimeString(' 1:30 ')).toBe(90)
    })

    it('should throw error for invalid formats', () => {
      expect(() => parseTimeString('invalid')).toThrow()
      expect(() => parseTimeString('-30')).toThrow()
      expect(() => parseTimeString('1:60')).toThrow() // Invalid seconds
      expect(() => parseTimeString('1:2:3')).toThrow() // Too many parts
      expect(() => parseTimeString('')).toThrow()
    })
  })

  describe('isValidHexColor', () => {
    it('should validate correct hex colors', () => {
      expect(isValidHexColor('#000000')).toBe(true)
      expect(isValidHexColor('#FFFFFF')).toBe(true)
      expect(isValidHexColor('#ff0000')).toBe(true)
      expect(isValidHexColor('#FF0000')).toBe(true)
      expect(isValidHexColor('#A1B2C3')).toBe(true)
    })

    it('should reject invalid hex colors', () => {
      expect(isValidHexColor('000000')).toBe(false) // Missing #
      expect(isValidHexColor('#00000')).toBe(false) // Too short
      expect(isValidHexColor('#0000000')).toBe(false) // Too long
      expect(isValidHexColor('#GGGGGG')).toBe(false) // Invalid chars
      expect(isValidHexColor('red')).toBe(false) // Color name
      expect(isValidHexColor('')).toBe(false) // Empty
    })
  })

  describe('hexToRgb', () => {
    it('should convert valid hex colors to RGB', () => {
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 })
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 })
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 })
      expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 })
      expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 })
    })

    it('should handle hex colors without #', () => {
      expect(hexToRgb('FF0000')).toEqual({ r: 255, g: 0, b: 0 })
    })

    it('should return null for invalid hex colors', () => {
      expect(hexToRgb('invalid')).toBeNull()
      expect(hexToRgb('#GGG')).toBeNull()
      expect(hexToRgb('')).toBeNull()
    })
  })

  describe('getContrastingTextColor', () => {
    it('should return black for light backgrounds', () => {
      expect(getContrastingTextColor('#FFFFFF')).toBe('#000000') // White
      expect(getContrastingTextColor('#FFFF00')).toBe('#000000') // Yellow
      expect(getContrastingTextColor('#00FFFF')).toBe('#000000') // Cyan
    })

    it('should return white for dark backgrounds', () => {
      expect(getContrastingTextColor('#000000')).toBe('#FFFFFF') // Black
      expect(getContrastingTextColor('#FF0000')).toBe('#FFFFFF') // Red
      expect(getContrastingTextColor('#0000FF')).toBe('#FFFFFF') // Blue
    })

    it('should handle invalid colors gracefully', () => {
      expect(getContrastingTextColor('invalid')).toBe('#000000')
      expect(getContrastingTextColor('')).toBe('#000000')
    })
  })
})
