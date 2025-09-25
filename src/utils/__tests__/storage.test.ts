import { describe, it, expect, beforeEach } from 'vitest'
import { 
  validateRoutine, 
  exportRoutine, 
  importRoutine,
  getUserSettings,
  saveUserSettings,
  getLastRoutine,
  saveLastRoutine
} from '../storage'
import { Routine, UserSettings } from '../../types'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('Storage Utils', () => {
  beforeEach(() => {
    localStorageMock.clear()
  })

  describe('validateRoutine', () => {
    it('should validate a correct routine', () => {
      const validRoutine: Routine = [
        { label: 'Warmup', duration: 60, type: 'warmup' },
        { label: 'Work', duration: 30, type: 'work', color: '#FF0000' },
        { label: 'Rest', duration: 15, type: 'rest' }
      ]

      expect(validateRoutine(validRoutine)).toBe(true)
    })

    it('should reject non-array input', () => {
      expect(validateRoutine({})).toBe(false)
      expect(validateRoutine(null)).toBe(false)
      expect(validateRoutine('string')).toBe(false)
      expect(validateRoutine(123)).toBe(false)
    })

    it('should reject routine with invalid interval types', () => {
      const invalidRoutine = [
        { label: 'Test', duration: 30, type: 'invalid_type' }
      ]

      expect(validateRoutine(invalidRoutine)).toBe(false)
    })

    it('should reject routine with missing required fields', () => {
      const missingLabel = [
        { duration: 30, type: 'work' }
      ]
      expect(validateRoutine(missingLabel)).toBe(false)

      const missingDuration = [
        { label: 'Test', type: 'work' }
      ]
      expect(validateRoutine(missingDuration)).toBe(false)

      const missingType = [
        { label: 'Test', duration: 30 }
      ]
      expect(validateRoutine(missingType)).toBe(false)
    })

    it('should reject routine with invalid duration values', () => {
      const zeroDuration = [
        { label: 'Test', duration: 0, type: 'work' }
      ]
      expect(validateRoutine(zeroDuration)).toBe(false)

      const negativeDuration = [
        { label: 'Test', duration: -5, type: 'work' }
      ]
      expect(validateRoutine(negativeDuration)).toBe(false)

      const floatDuration = [
        { label: 'Test', duration: 30.5, type: 'work' }
      ]
      expect(validateRoutine(floatDuration)).toBe(false)
    })

    it('should reject routine with empty label', () => {
      const emptyLabel = [
        { label: '', duration: 30, type: 'work' }
      ]
      expect(validateRoutine(emptyLabel)).toBe(false)

      const whitespaceLabel = [
        { label: '   ', duration: 30, type: 'work' }
      ]
      expect(validateRoutine(whitespaceLabel)).toBe(false)
    })

    it('should reject routine with invalid color format', () => {
      const invalidColor = [
        { label: 'Test', duration: 30, type: 'work', color: 'red' }
      ]
      expect(validateRoutine(invalidColor)).toBe(false)

      const invalidHex = [
        { label: 'Test', duration: 30, type: 'work', color: '#ZZZ' }
      ]
      expect(validateRoutine(invalidHex)).toBe(false)
    })

    it('should accept routine with valid optional color', () => {
      const validColor = [
        { label: 'Test', duration: 30, type: 'work', color: '#FF0000' }
      ]
      expect(validateRoutine(validColor)).toBe(true)

      const noColor = [
        { label: 'Test', duration: 30, type: 'work' }
      ]
      expect(validateRoutine(noColor)).toBe(true)
    })

    it('should validate empty routine', () => {
      expect(validateRoutine([])).toBe(true)
    })
  })

  describe('exportRoutine', () => {
    it('should export routine as formatted JSON', () => {
      const routine: Routine = [
        { label: 'Test', duration: 30, type: 'work' }
      ]

      const exported = exportRoutine(routine)
      const parsed = JSON.parse(exported)

      expect(parsed).toEqual(routine)
      expect(exported).toContain('\n') // Should be formatted
    })
  })

  describe('importRoutine', () => {
    it('should import valid JSON routine', () => {
      const routine: Routine = [
        { label: 'Test', duration: 30, type: 'work' }
      ]
      const json = JSON.stringify(routine)

      const imported = importRoutine(json)
      expect(imported).toEqual(routine)
    })

    it('should throw error for invalid JSON', () => {
      expect(() => importRoutine('invalid json')).toThrow()
    })

    it('should throw error for valid JSON but invalid routine', () => {
      const invalidRoutine = JSON.stringify({ not: 'a routine' })
      expect(() => importRoutine(invalidRoutine)).toThrow('Invalid routine format')
    })
  })

  describe('User Settings', () => {
    it('should return default settings when none exist', () => {
      const settings = getUserSettings()
      
      expect(settings).toEqual({
        darkMode: false,
        audioEnabled: true,
        voiceEnabled: true
      })
    })

    it('should save and retrieve user settings', () => {
      const customSettings: UserSettings = {
        darkMode: true,
        audioEnabled: false,
        voiceEnabled: false
      }

      saveUserSettings(customSettings)
      const retrieved = getUserSettings()

      expect(retrieved).toEqual(customSettings)
    })

    it('should merge saved settings with defaults', () => {
      // Save incomplete settings
      localStorage.setItem('reptimer_user_settings', JSON.stringify({
        darkMode: true
        // missing audioEnabled and voiceEnabled
      }))

      const settings = getUserSettings()

      expect(settings).toEqual({
        darkMode: true,
        audioEnabled: true, // default
        voiceEnabled: true  // default
      })
    })

    it('should handle corrupted settings gracefully', () => {
      localStorage.setItem('reptimer_user_settings', 'corrupted json')

      const settings = getUserSettings()

      expect(settings).toEqual({
        darkMode: false,
        audioEnabled: true,
        voiceEnabled: true
      })
    })
  })

  describe('Last Routine', () => {
    it('should return null when no last routine exists', () => {
      const lastRoutine = getLastRoutine()
      expect(lastRoutine).toBeNull()
    })

    it('should save and retrieve last routine', () => {
      const routine: Routine = [
        { label: 'Test', duration: 30, type: 'work' }
      ]

      saveLastRoutine(routine)
      const retrieved = getLastRoutine()

      expect(retrieved).toEqual(routine)
    })

    it('should handle corrupted last routine gracefully', () => {
      localStorage.setItem('reptimer_last_routine', 'corrupted json')

      const lastRoutine = getLastRoutine()
      expect(lastRoutine).toBeNull()
    })
  })
})
