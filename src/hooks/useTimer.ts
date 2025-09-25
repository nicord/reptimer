import { useState, useEffect, useCallback, useRef } from 'react'
import { TimerEngine } from '../utils/timer'
import { AudioEngine } from '../utils/audio'
import { SpeechEngine } from '../utils/speech'
import { TimerState, Routine } from '../types'

interface UseTimerOptions {
  onIntervalChange?: (intervalIndex: number, timeRemaining: number) => void
  onComplete?: () => void
  audioEnabled?: boolean
  voiceEnabled?: boolean
}

export function useTimer(options: UseTimerOptions = {}) {
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    currentIntervalIndex: 0,
    timeRemaining: 0,
    totalElapsed: 0,
    totalDuration: 0,
  })

  const [routine, setRoutine] = useState<Routine>([])
  const [lastCountdownSecond, setLastCountdownSecond] = useState<number>(-1)
  const [hasStartedBefore, setHasStartedBefore] = useState<boolean>(false)

  const timerRef = useRef<TimerEngine | null>(null)
  const audioRef = useRef<AudioEngine | null>(null)
  const speechRef = useRef<SpeechEngine | null>(null)

  // Initialize engines once
  useEffect(() => {
    audioRef.current = new AudioEngine()
    speechRef.current = new SpeechEngine()

    const handleTick = (state: TimerState) => {
      setTimerState(state)
      
      // Handle countdown beeps and announcements
      if (state.timeRemaining <= 3 && state.timeRemaining > 0 && state.isRunning) {
        if (lastCountdownSecond !== state.timeRemaining) {
          setLastCountdownSecond(state.timeRemaining)
          audioRef.current?.playCountdownBeep(state.timeRemaining)
          speechRef.current?.announceCountdown(state.timeRemaining)
        }
      } else if (state.timeRemaining > 3) {
        setLastCountdownSecond(-1)
      }
    }

    const handleIntervalChange = (intervalIndex: number) => {
      const currentRoutine = timerRef.current?.routine || routine
      const currentInterval = currentRoutine[intervalIndex]
      const timeRemaining = currentInterval?.duration || 0
      
      // Play interval change beep
      audioRef.current?.playBeep()
      
      // Announce new interval
      if (currentInterval) {
        speechRef.current?.announceInterval(currentInterval.label)
      }
      
      // Reset countdown tracking
      setLastCountdownSecond(-1)
      
      // Call external handler
      optionsRef.current.onIntervalChange?.(intervalIndex, timeRemaining)
    }

    const handleComplete = () => {
      audioRef.current?.playCelebration()
      speechRef.current?.announceCompletion()
      optionsRef.current.onComplete?.()
    }

    timerRef.current = new TimerEngine(handleTick, handleIntervalChange, handleComplete)

    return () => {
      timerRef.current?.destroy()
      audioRef.current?.destroy()
      speechRef.current?.destroy()
    }
  }, []) // Remove dependencies to initialize only once

  // Update audio and speech settings
  useEffect(() => {
    audioRef.current?.setEnabled(options.audioEnabled ?? true)
    speechRef.current?.setEnabled(options.voiceEnabled ?? true)
  }, [options.audioEnabled, options.voiceEnabled])

  // Store current options in ref for callback access
  const optionsRef = useRef(options)
  useEffect(() => {
    optionsRef.current = options
  }, [options])

  // Load routine into timer
  useEffect(() => {
    if (timerRef.current && routine.length > 0) {
      timerRef.current.setRoutine(routine)
    }
  }, [routine])

  const start = useCallback(() => {
    if (routine.length === 0) return
    timerRef.current?.start()
    
    if (!hasStartedBefore) {
      speechRef.current?.announceStart()
      setHasStartedBefore(true)
    } else {
      speechRef.current?.announceResume()
    }
  }, [routine, hasStartedBefore])

  const pause = useCallback(() => {
    timerRef.current?.pause()
    speechRef.current?.announcePause()
  }, [])

  const reset = useCallback(() => {
    timerRef.current?.reset()
    setLastCountdownSecond(-1)
    setHasStartedBefore(false)
  }, [])

  const next = useCallback(() => {
    timerRef.current?.nextInterval()
  }, [])

  const previous = useCallback(() => {
    timerRef.current?.previousInterval()
  }, [])

  const toggle = useCallback(() => {
    if (timerState.isRunning) {
      pause()
    } else {
      start()
    }
  }, [timerState.isRunning, start, pause])

  const getCurrentInterval = useCallback(() => {
    return timerRef.current?.getCurrentInterval() || null
  }, [])

  const getNextInterval = useCallback(() => {
    return timerRef.current?.getNextInterval() || null
  }, [])

  const setTimerRoutine = useCallback((newRoutine: Routine) => {
    setRoutine(newRoutine)
    setLastCountdownSecond(-1)
    setHasStartedBefore(false)
  }, [])

  const testAudio = useCallback(() => {
    audioRef.current?.testSound()
  }, [])

  const testSpeech = useCallback(() => {
    speechRef.current?.test()
  }, [])

  const refreshVoices = useCallback(() => {
    speechRef.current?.refreshVoices()
  }, [])

  const getFemaleVoices = useCallback(() => {
    return speechRef.current?.getFemaleVoices() || []
  }, [])

  const getAvailableVoices = useCallback(() => {
    return speechRef.current?.getAvailableVoices() || []
  }, [])

  const setVoice = useCallback((voice: SpeechSynthesisVoice) => {
    speechRef.current?.setVoice(voice)
  }, [])

  return {
    // State
    timerState,
    routine,
    currentInterval: getCurrentInterval(),
    nextInterval: getNextInterval(),
    
    // Actions
    start,
    pause,
    reset,
    next,
    previous,
    toggle,
    setRoutine: setTimerRoutine,
    
    // Testing
    testAudio,
    testSpeech,
    
    // Voice control
    refreshVoices,
    getFemaleVoices,
    getAvailableVoices,
    setVoice,
    
    // Progress calculations
    currentIntervalProgress: timerState.timeRemaining > 0 && getCurrentInterval() 
      ? ((getCurrentInterval()!.duration - timerState.timeRemaining) / getCurrentInterval()!.duration) * 100
      : 0,
    totalProgress: timerState.totalDuration > 0 
      ? (timerState.totalElapsed / timerState.totalDuration) * 100 
      : 0,
  }
}
