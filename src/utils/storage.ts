import { UserSettings, Routine } from '../types'

const STORAGE_KEYS = {
  USER_SETTINGS: 'reptimer_user_settings',
  CUSTOM_ROUTINES: 'reptimer_custom_routines',
  LAST_ROUTINE: 'reptimer_last_routine',
} as const

const DEFAULT_SETTINGS: UserSettings = {
  darkMode: false,
  audioEnabled: true,
  voiceEnabled: true,
}

/**
 * Get user settings from localStorage
 */
export function getUserSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...DEFAULT_SETTINGS, ...parsed }
    }
  } catch (error) {
    console.warn('Error loading user settings:', error)
  }
  return DEFAULT_SETTINGS
}

/**
 * Save user settings to localStorage
 */
export function saveUserSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(settings))
  } catch (error) {
    console.warn('Error saving user settings:', error)
  }
}

/**
 * Get the last used routine from localStorage
 */
export function getLastRoutine(): Routine | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.LAST_ROUTINE)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.warn('Error loading last routine:', error)
  }
  return null
}

/**
 * Save the last used routine to localStorage
 */
export function saveLastRoutine(routine: Routine): void {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_ROUTINE, JSON.stringify(routine))
  } catch (error) {
    console.warn('Error saving last routine:', error)
  }
}

/**
 * Get custom routines from localStorage
 */
export function getCustomRoutines(): Record<string, { name: string; routine: Routine }> {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_ROUTINES)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.warn('Error loading custom routines:', error)
  }
  return {}
}

/**
 * Save custom routines to localStorage
 */
export function saveCustomRoutines(routines: Record<string, { name: string; routine: Routine }>): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_ROUTINES, JSON.stringify(routines))
  } catch (error) {
    console.warn('Error saving custom routines:', error)
  }
}

/**
 * Add a custom routine
 */
export function addCustomRoutine(id: string, name: string, routine: Routine): void {
  const customRoutines = getCustomRoutines()
  customRoutines[id] = { name, routine }
  saveCustomRoutines(customRoutines)
}

/**
 * Remove a custom routine
 */
export function removeCustomRoutine(id: string): void {
  const customRoutines = getCustomRoutines()
  delete customRoutines[id]
  saveCustomRoutines(customRoutines)
}

/**
 * Validate a routine object
 */
export function validateRoutine(routine: unknown): routine is Routine {
  if (!Array.isArray(routine)) {
    return false
  }

  return routine.every(interval => 
    typeof interval === 'object' &&
    interval !== null &&
    typeof interval.label === 'string' &&
    interval.label.trim().length > 0 &&
    typeof interval.duration === 'number' &&
    interval.duration > 0 &&
    Number.isInteger(interval.duration) &&
    typeof interval.type === 'string' &&
    ['work', 'rest', 'warmup', 'finisher', 'cooldown'].includes(interval.type) &&
    (interval.color === undefined || (typeof interval.color === 'string' && /^#[0-9A-Fa-f]{6}$/.test(interval.color)))
  )
}

/**
 * Export a routine as JSON
 */
export function exportRoutine(routine: Routine): string {
  return JSON.stringify(routine, null, 2)
}

/**
 * Import a routine from JSON string
 */
export function importRoutine(jsonString: string): Routine {
  try {
    const parsed = JSON.parse(jsonString)
    if (validateRoutine(parsed)) {
      return parsed
    } else {
      throw new Error('Invalid routine format')
    }
  } catch (error) {
    throw new Error(`Failed to import routine: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Download a routine as a JSON file
 */
export function downloadRoutineAsFile(routine: Routine, filename: string = 'routine.json'): void {
  try {
    const json = exportRoutine(routine)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  } catch (error) {
    console.warn('Error downloading routine:', error)
  }
}

/**
 * Clear all stored data (for debugging/reset)
 */
export function clearAllData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  } catch (error) {
    console.warn('Error clearing data:', error)
  }
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}
