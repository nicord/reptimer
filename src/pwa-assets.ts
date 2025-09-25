// PWA asset helper for cache management
export const clearOldCaches = async (): Promise<void> => {
  if ('caches' in window) {
    const cacheNames = await caches.keys()
    const oldCaches = cacheNames.filter(name => 
      name.startsWith('reptimer-') && !name.includes(Date.now().toString().substr(0, 8))
    )
    
    await Promise.all(oldCaches.map(name => caches.delete(name)))
    console.log(`Cleared ${oldCaches.length} old caches`)
  }
}

// Force reload the app to get latest version
export const reloadApp = (): void => {
  window.location.reload()
}

// Check if app is running as PWA
export const isPWA = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true ||
         document.referrer.includes('android-app://')
}

// Get app version info
export const getAppVersion = (): string => {
  return '1.0.9'
}
