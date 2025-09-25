import { useEffect, useState } from 'react'

interface AccessibilitySettings {
  highContrast: boolean
  reducedMotion: boolean
  screenReaderAnnouncements: boolean
}

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    reducedMotion: false,
    screenReaderAnnouncements: true,
  })

  // Detect user's system preferences
  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    // Check for high contrast preference
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches

    setSettings(prev => ({
      ...prev,
      reducedMotion: prefersReducedMotion,
      highContrast: prefersHighContrast,
    }))

    // Listen for changes in user preferences
    const motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const contrastMediaQuery = window.matchMedia('(prefers-contrast: high)')

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, reducedMotion: e.matches }))
    }

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setSettings(prev => ({ ...prev, highContrast: e.matches }))
    }

    motionMediaQuery.addEventListener('change', handleMotionChange)
    contrastMediaQuery.addEventListener('change', handleContrastChange)

    return () => {
      motionMediaQuery.removeEventListener('change', handleMotionChange)
      contrastMediaQuery.removeEventListener('change', handleContrastChange)
    }
  }, [])

  // Apply accessibility settings to document
  useEffect(() => {
    const html = document.documentElement
    
    if (settings.highContrast) {
      html.classList.add('high-contrast')
    } else {
      html.classList.remove('high-contrast')
    }

    if (settings.reducedMotion) {
      html.classList.add('reduce-motion')
    } else {
      html.classList.remove('reduce-motion')
    }
  }, [settings])

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K, 
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  // Announce messages to screen readers
  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!settings.screenReaderAnnouncements) return

    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message

    document.body.appendChild(announcement)

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  // Focus management for modal dialogs
  const trapFocus = (element: HTMLElement) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    element.addEventListener('keydown', handleTab)
    firstElement?.focus()

    return () => {
      element.removeEventListener('keydown', handleTab)
    }
  }

  // Skip links for keyboard navigation
  const addSkipLinks = () => {
    const skipLinks = document.getElementById('skip-links')
    if (skipLinks) return

    const skipLinksContainer = document.createElement('div')
    skipLinksContainer.id = 'skip-links'
    skipLinksContainer.className = 'fixed top-0 left-0 z-50'
    
    const skipToMain = document.createElement('a')
    skipToMain.href = '#main-content'
    skipToMain.className = 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white px-4 py-2 z-50'
    skipToMain.textContent = 'Skip to main content'
    
    const skipToNav = document.createElement('a')
    skipToNav.href = '#navigation'
    skipToNav.className = 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-20 bg-blue-600 text-white px-4 py-2 z-50'
    skipToNav.textContent = 'Skip to navigation'

    skipLinksContainer.appendChild(skipToMain)
    skipLinksContainer.appendChild(skipToNav)
    document.body.insertBefore(skipLinksContainer, document.body.firstChild)
  }

  // Check if element is visible to screen readers
  const isVisibleToScreenReader = (element: HTMLElement): boolean => {
    const style = window.getComputedStyle(element)
    return !(
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      element.hasAttribute('aria-hidden') ||
      element.getAttribute('aria-hidden') === 'true'
    )
  }

  return {
    settings,
    updateSetting,
    announceToScreenReader,
    trapFocus,
    addSkipLinks,
    isVisibleToScreenReader,
  }
}
