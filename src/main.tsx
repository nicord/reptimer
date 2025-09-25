import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register service worker with update prompts
const updateSW = registerSW({
  onNeedRefresh() {
    console.log('New content available, refreshing...')
    // Show a toast/notification to user about update
    if (confirm('New app version available! Click OK to refresh and get the latest features.')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline')
    // Show a toast/notification about offline capability
  },
  onRegisterError(error: any) {
    console.log('SW registration error', error)
  },
  onRegistered(registration: ServiceWorkerRegistration | undefined) {
    console.log('SW registered: ', registration)
    
    // Check for updates only on page focus/visibility change
    if (registration) {
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          console.log('Page became visible, checking for updates...')
          registration.update()
        }
      }
      
      // Check for updates when page becomes visible (user returns to app)
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
