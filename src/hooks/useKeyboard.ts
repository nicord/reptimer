import { useEffect, useCallback } from 'react'
import { KeyboardShortcuts } from '../types'

interface KeyboardHandlers {
  onTogglePlay?: () => void
  onNext?: () => void
  onPrevious?: () => void
  onFullscreen?: () => void
  onReset?: () => void
  onToggleAudio?: () => void
  onToggleVoice?: () => void
  onTestSpeech?: () => void
}

interface UseKeyboardOptions {
  enabled?: boolean
  preventDefaultOnHandled?: boolean
}

export function useKeyboard(
  handlers: KeyboardHandlers,
  options: UseKeyboardOptions = {}
) {
  const { enabled = true, preventDefaultOnHandled = true } = options

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    // Don't handle shortcuts when user is typing in an input
    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return
    }

    const key = event.key.toLowerCase()
    let handled = false

    switch (key) {
      case KeyboardShortcuts.SPACE:
        handlers.onTogglePlay?.()
        handled = true
        break
      
      case KeyboardShortcuts.NEXT:
        handlers.onNext?.()
        handled = true
        break
      
      case KeyboardShortcuts.PREVIOUS:
        handlers.onPrevious?.()
        handled = true
        break
      
      case KeyboardShortcuts.FULLSCREEN:
        handlers.onFullscreen?.()
        handled = true
        break
      
      case 'r':
        if (event.ctrlKey || event.metaKey) {
          // Don't interfere with browser refresh
          return
        }
        handlers.onReset?.()
        handled = true
        break
      
      case KeyboardShortcuts.MUTE:
        handlers.onToggleAudio?.()
        handled = true
        break
      
      case KeyboardShortcuts.VOICE:
        handlers.onToggleVoice?.()
        handled = true
        break
      
      case 't':
        handlers.onTestSpeech?.()
        handled = true
        break
    }

    if (handled && preventDefaultOnHandled) {
      event.preventDefault()
      event.stopPropagation()
    }
  }, [enabled, handlers, preventDefaultOnHandled])

  useEffect(() => {
    if (!enabled) return

    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [enabled, handleKeyDown])

  return {
    // Keyboard shortcuts info for display
    shortcuts: {
      'Space': 'Play/Pause',
      'N': 'Next interval',
      'B': 'Previous interval', 
      'F': 'Fullscreen',
      'R': 'Reset timer',
      'M': 'Toggle audio',
      'V': 'Toggle voice',
      'T': 'Test speech',
    }
  }
}
