import { useState, useEffect, useCallback } from 'react'
import { UserSettings, Routine } from '../types'
import { 
  getUserSettings, 
  saveUserSettings, 
  getLastRoutine, 
  saveLastRoutine 
} from '../utils/storage'

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(() => getUserSettings())
  const [lastRoutine, setLastRoutine] = useState<Routine | null>(() => getLastRoutine())

  // Save settings to localStorage whenever they change
  useEffect(() => {
    saveUserSettings(settings)
  }, [settings])

  // Save last routine to localStorage whenever it changes  
  useEffect(() => {
    if (lastRoutine) {
      saveLastRoutine(lastRoutine)
    }
  }, [lastRoutine])

  // Force light mode - ensure dark mode is never applied
  useEffect(() => {
    document.documentElement.classList.remove('dark')
  }, [])

  const updateSetting = useCallback(<K extends keyof UserSettings>(
    key: K, 
    value: UserSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  const toggleDarkMode = useCallback(() => {
    updateSetting('darkMode', !settings.darkMode)
  }, [settings.darkMode, updateSetting])

  const toggleAudio = useCallback(() => {
    updateSetting('audioEnabled', !settings.audioEnabled)
  }, [settings.audioEnabled, updateSetting])

  const toggleVoice = useCallback(() => {
    updateSetting('voiceEnabled', !settings.voiceEnabled)
  }, [settings.voiceEnabled, updateSetting])

  const updateLastRoutine = useCallback((routine: Routine) => {
    setLastRoutine(routine)
  }, [])

  const resetSettings = useCallback(() => {
    const defaultSettings: UserSettings = {
      darkMode: false,
      audioEnabled: true,
      voiceEnabled: true,
    }
    setSettings(defaultSettings)
  }, [])

  return {
    settings,
    lastRoutine,
    updateSetting,
    toggleDarkMode,
    toggleAudio,
    toggleVoice,
    updateLastRoutine,
    resetSettings,
  }
}
