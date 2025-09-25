// RepTimer Service Worker
const CACHE_VERSION = `reptimer-v${Date.now()}`
const CACHE_NAME = CACHE_VERSION
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Note: Vite will inject additional assets during build
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets')
        return cache.addAll(STATIC_CACHE_URLS)
      })
      .then(() => {
        console.log('Service Worker installed successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Failed to cache static assets:', error)
      })
  )
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - network first, then cache
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip non-HTTP requests
  if (!event.request.url.startsWith('http')) {
    return
  }

  // Use different strategies for different types of requests
  if (event.request.destination === 'document' || 
      event.request.url.includes('.js') || 
      event.request.url.includes('.css') ||
      event.request.url.includes('index.html')) {
    // Network first for app files to ensure updates
    event.respondWith(networkFirstStrategy(event.request))
  } else {
    // Cache first for assets like images
    event.respondWith(cacheFirstStrategy(event.request))
  }
})

// Network-first strategy for app files
async function networkFirstStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    if (networkResponse && networkResponse.status === 200) {
      // Update cache with fresh content
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
      return networkResponse
    }
    
    throw new Error('Network response not ok')
  } catch (error) {
    // Network failed, try cache
    console.log('Network failed, trying cache for:', request.url)
    const cachedResponse = await caches.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // For navigation requests, serve the main page
    if (request.destination === 'document') {
      const mainPage = await caches.match('/')
      if (mainPage) {
        return mainPage
      }
    }
    
    throw error
  }
}

// Cache-first strategy for static assets
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Both cache and network failed for:', request.url)
    throw error
  }
}

// Message event - handle commands from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Periodic background sync for cache updates (if supported)
self.addEventListener('sync', (event) => {
  if (event.tag === 'cache-update') {
    event.waitUntil(updateCache())
  }
})

// Function to update cache in background
async function updateCache() {
  try {
    const cache = await caches.open(CACHE_NAME)
    const requests = await cache.keys()
    
    // Update cached resources
    await Promise.all(
      requests.map(async (request) => {
        try {
          const response = await fetch(request)
          if (response.status === 200) {
            await cache.put(request, response)
          }
        } catch (error) {
          console.log('Failed to update cached resource:', request.url, error)
        }
      })
    )
    
    console.log('Cache updated successfully')
  } catch (error) {
    console.error('Failed to update cache:', error)
  }
}
