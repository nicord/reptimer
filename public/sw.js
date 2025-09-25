// RepTimer Service Worker
const CACHE_NAME = 'reptimer-v1'
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

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return
  }

  // Skip non-HTTP requests
  if (!event.request.url.startsWith('http')) {
    return
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse
        }

        // Otherwise, fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Don't cache non-successful responses
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse
            }

            // Clone the response for caching
            const responseToCache = networkResponse.clone()

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })

            return networkResponse
          })
          .catch((error) => {
            console.log('Fetch failed, serving offline page if available:', error)
            
            // For navigation requests, try to serve the main page from cache
            if (event.request.destination === 'document') {
              return caches.match('/')
            }
            
            throw error
          })
      })
  )
})

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
