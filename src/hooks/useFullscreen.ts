import { useState, useEffect, useCallback } from 'react'

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Check if fullscreen is supported
  const isSupported = useCallback(() => {
    return !!(
      document.fullscreenEnabled ||
      (document as any).webkitFullscreenEnabled ||
      (document as any).mozFullScreenEnabled ||
      (document as any).msFullscreenEnabled
    )
  }, [])

  // Enter fullscreen
  const enterFullscreen = useCallback(async () => {
    if (!isSupported()) return false

    try {
      const element = document.documentElement
      
      if (element.requestFullscreen) {
        await element.requestFullscreen()
      } else if ((element as any).webkitRequestFullscreen) {
        await (element as any).webkitRequestFullscreen()
      } else if ((element as any).mozRequestFullScreen) {
        await (element as any).mozRequestFullScreen()
      } else if ((element as any).msRequestFullscreen) {
        await (element as any).msRequestFullscreen()
      }
      
      return true
    } catch (error) {
      console.warn('Failed to enter fullscreen:', error)
      return false
    }
  }, [isSupported])

  // Exit fullscreen
  const exitFullscreen = useCallback(async () => {
    if (!isSupported()) return false

    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen()
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen()
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen()
      }
      
      return true
    } catch (error) {
      console.warn('Failed to exit fullscreen:', error)
      return false
    }
  }, [isSupported])

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    if (isFullscreen) {
      return await exitFullscreen()
    } else {
      return await enterFullscreen()
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen])

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = 
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement

      setIsFullscreen(!!fullscreenElement)
    }

    // Add event listeners for different browsers
    const events = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange'
    ]

    events.forEach(event => {
      document.addEventListener(event, handleFullscreenChange)
    })

    // Check initial state
    handleFullscreenChange()

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleFullscreenChange)
      })
    }
  }, [])

  return {
    isFullscreen,
    isSupported: isSupported(),
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  }
}
