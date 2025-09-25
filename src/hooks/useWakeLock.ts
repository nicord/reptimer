import { useState, useEffect, useCallback, useRef } from 'react'

export function useWakeLock() {
  const [isSupported, setIsSupported] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  // Check if Wake Lock API is supported
  useEffect(() => {
    setIsSupported('wakeLock' in navigator)
  }, [])

  // Request wake lock
  const requestWakeLock = useCallback(async () => {
    if (!isSupported) return false

    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen')
      setIsActive(true)

      // Listen for wake lock release
      wakeLockRef.current.addEventListener('release', () => {
        setIsActive(false)
        wakeLockRef.current = null
      })

      console.log('Wake lock acquired')
      return true
    } catch (error) {
      console.warn('Failed to acquire wake lock:', error)
      return false
    }
  }, [isSupported])

  // Release wake lock
  const releaseWakeLock = useCallback(async () => {
    if (!wakeLockRef.current) return

    try {
      await wakeLockRef.current.release()
      wakeLockRef.current = null
      setIsActive(false)
      console.log('Wake lock released')
    } catch (error) {
      console.warn('Failed to release wake lock:', error)
    }
  }, [])

  // Toggle wake lock
  const toggleWakeLock = useCallback(async () => {
    if (isActive) {
      await releaseWakeLock()
    } else {
      await requestWakeLock()
    }
  }, [isActive, requestWakeLock, releaseWakeLock])

  // Handle visibility change - re-acquire wake lock when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isActive && !wakeLockRef.current) {
        await requestWakeLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isActive, requestWakeLock])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release()
      }
    }
  }, [])

  return {
    isSupported,
    isActive,
    requestWakeLock,
    releaseWakeLock,
    toggleWakeLock,
  }
}
