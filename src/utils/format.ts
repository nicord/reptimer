/**
 * Format seconds into MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(Math.abs(seconds) / 60)
  const secs = Math.abs(seconds) % 60
  const sign = seconds < 0 ? '-' : ''
  return `${sign}${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format seconds into a more readable duration (e.g., "2m 30s", "45s")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`
  }
  
  const mins = Math.floor(seconds / 60)
  const remainingSecs = seconds % 60
  
  if (remainingSecs === 0) {
    return `${mins}m`
  }
  
  return `${mins}m ${remainingSecs}s`
}

/**
 * Format progress as a percentage (0-100)
 */
export function formatProgress(current: number, total: number): number {
  if (total === 0) return 0
  return Math.max(0, Math.min(100, (current / total) * 100))
}

/**
 * Get a readable description of time remaining
 */
export function getTimeDescription(seconds: number): string {
  if (seconds <= 0) return 'Time\'s up!'
  if (seconds === 1) return '1 second'
  if (seconds < 60) return `${seconds} seconds`
  
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  
  if (secs === 0) {
    return mins === 1 ? '1 minute' : `${mins} minutes`
  }
  
  const minText = mins === 1 ? '1 minute' : `${mins} minutes`
  const secText = secs === 1 ? '1 second' : `${secs} seconds`
  
  return `${minText} ${secText}`
}

/**
 * Parse time string (MM:SS or SS) into seconds
 */
export function parseTimeString(timeString: string): number {
  const trimmed = timeString.trim()
  
  // Handle MM:SS format
  if (trimmed.includes(':')) {
    const parts = trimmed.split(':')
    if (parts.length !== 2) throw new Error('Invalid time format')
    
    const mins = parseInt(parts[0], 10)
    const secs = parseInt(parts[1], 10)
    
    if (isNaN(mins) || isNaN(secs) || mins < 0 || secs < 0 || secs >= 60) {
      throw new Error('Invalid time values')
    }
    
    return mins * 60 + secs
  }
  
  // Handle seconds only
  const seconds = parseInt(trimmed, 10)
  if (isNaN(seconds) || seconds < 0) {
    throw new Error('Invalid seconds value')
  }
  
  return seconds
}

/**
 * Get interval type color with fallback
 */
export function getIntervalColor(type: string, customColor?: string): string {
  if (customColor) return customColor
  
  const colors: Record<string, string> = {
    warmup: '#FDE68A',
    work: '#86EFAC', 
    rest: '#BAE6FD',
    finisher: '#FDA4AF',
    cooldown: '#DDD6FE',
  }
  
  return colors[type] || '#E5E7EB'
}

/**
 * Convert hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * Get contrasting text color (black or white) for a background color
 */
export function getContrastingTextColor(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor)
  if (!rgb) return '#000000'
  
  // Calculate relative luminance
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

/**
 * Validate hex color format
 */
export function isValidHexColor(hex: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(hex)
}

/**
 * Generate a random hex color
 */
export function generateRandomColor(): string {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Debounce function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = window.setTimeout(() => func(...args), wait)
  }
}

/**
 * Check if device supports touch
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

/**
 * Check if device is mobile (rough heuristic)
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}
