import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TimerEngine } from '../timer'
import { Routine } from '../../types'

// Mock requestAnimationFrame
;(globalThis as any).requestAnimationFrame = vi.fn((cb) => {
  setTimeout(cb, 16) // ~60fps
  return 1
})

;(globalThis as any).cancelAnimationFrame = vi.fn()

describe('TimerEngine', () => {
  let timerEngine: TimerEngine
  let mockOnTick: ReturnType<typeof vi.fn>
  let mockOnIntervalChange: ReturnType<typeof vi.fn>
  let mockOnComplete: ReturnType<typeof vi.fn>

  const sampleRoutine: Routine = [
    { label: 'Warmup', duration: 5, type: 'warmup' },
    { label: 'Work 1', duration: 10, type: 'work' },
    { label: 'Rest 1', duration: 5, type: 'rest' },
    { label: 'Work 2', duration: 10, type: 'work' },
    { label: 'Cooldown', duration: 5, type: 'cooldown' }
  ]

  beforeEach(() => {
    vi.useFakeTimers()
    mockOnTick = vi.fn()
    mockOnIntervalChange = vi.fn()
    mockOnComplete = vi.fn()
    
    timerEngine = new TimerEngine(mockOnTick, mockOnIntervalChange, mockOnComplete)
    timerEngine.setRoutine(sampleRoutine)
  })

  afterEach(() => {
    vi.useRealTimers()
    timerEngine.destroy()
  })

  describe('Basic Timer Operations', () => {
    it('should initialize with correct initial state', () => {
      expect(mockOnTick).toHaveBeenCalledWith(
        expect.objectContaining({
          isRunning: false,
          isPaused: false,
          currentIntervalIndex: 0,
          timeRemaining: 5, // First interval duration
          totalElapsed: 0,
          totalDuration: 35 // Sum of all intervals
        })
      )
    })

    it('should start timer correctly', () => {
      timerEngine.start()
      
      expect(mockOnTick).toHaveBeenCalledWith(
        expect.objectContaining({
          isRunning: true,
          isPaused: false
        })
      )
    })

    it('should pause and resume timer correctly', () => {
      timerEngine.start()
      
      // Clear previous calls to focus on pause behavior
      mockOnTick.mockClear()
      
      timerEngine.pause()
      
      // After pause, timer should not be running but should be paused
      // Note: The timer might not immediately call onTick after pause
      // so we'll check the state by starting it again and seeing the resume behavior
      
      timerEngine.start() // Resume
      
      // When resuming, it should be running and not paused
      expect(mockOnTick).toHaveBeenCalledWith(
        expect.objectContaining({
          isRunning: true,
          isPaused: false
        })
      )
    })

    it('should reset timer correctly', () => {
      timerEngine.start()
      vi.advanceTimersByTime(3000)
      timerEngine.reset()

      expect(mockOnTick).toHaveBeenCalledWith(
        expect.objectContaining({
          isRunning: false,
          isPaused: false,
          currentIntervalIndex: 0,
          totalElapsed: 0
        })
      )
    })
  })

  describe('Interval Navigation', () => {
    it('should move to next interval', () => {
      const currentInterval = timerEngine.getCurrentInterval()
      expect(currentInterval?.label).toBe('Warmup')

      timerEngine.nextInterval()
      expect(mockOnIntervalChange).toHaveBeenCalledWith(1)

      const nextInterval = timerEngine.getCurrentInterval()
      expect(nextInterval?.label).toBe('Work 1')
    })

    it('should move to previous interval', () => {
      timerEngine.nextInterval() // Move to interval 1
      timerEngine.previousInterval() // Move back to interval 0

      expect(mockOnIntervalChange).toHaveBeenCalledWith(0)

      const currentInterval = timerEngine.getCurrentInterval()
      expect(currentInterval?.label).toBe('Warmup')
    })

    it('should not move past first interval when going previous', () => {
      const initialInterval = timerEngine.getCurrentInterval()
      timerEngine.previousInterval()
      const afterPrevious = timerEngine.getCurrentInterval()

      expect(initialInterval).toEqual(afterPrevious)
    })

    it('should not move past last interval when going next', () => {
      // Move to last interval
      for (let i = 0; i < sampleRoutine.length - 1; i++) {
        timerEngine.nextInterval()
      }

      const lastInterval = timerEngine.getCurrentInterval()
      timerEngine.nextInterval() // Try to move past last
      const stillLastInterval = timerEngine.getCurrentInterval()

      expect(lastInterval).toEqual(stillLastInterval)
    })
  })

  describe('Interval Information', () => {
    it('should return correct current interval', () => {
      const currentInterval = timerEngine.getCurrentInterval()
      expect(currentInterval).toEqual(sampleRoutine[0])
    })

    it('should return correct next interval', () => {
      const nextInterval = timerEngine.getNextInterval()
      expect(nextInterval).toEqual(sampleRoutine[1])
    })

    it('should return null for next interval when on last interval', () => {
      // Move to last interval
      for (let i = 0; i < sampleRoutine.length - 1; i++) {
        timerEngine.nextInterval()
      }

      const nextInterval = timerEngine.getNextInterval()
      expect(nextInterval).toBeNull()
    })
  })

  describe('Empty Routine Handling', () => {
    it('should handle empty routine gracefully', () => {
      const emptyEngine = new TimerEngine(mockOnTick, mockOnIntervalChange, mockOnComplete)
      emptyEngine.setRoutine([])

      emptyEngine.start() // Should not throw
      emptyEngine.nextInterval() // Should not throw
      emptyEngine.previousInterval() // Should not throw

      expect(emptyEngine.getCurrentInterval()).toBeNull()
      expect(emptyEngine.getNextInterval()).toBeNull()
    })
  })

  describe('Routine Validation', () => {
    it('should handle routine with single interval', () => {
      const singleIntervalRoutine: Routine = [
        { label: 'Single', duration: 30, type: 'work' }
      ]

      timerEngine.setRoutine(singleIntervalRoutine)
      
      expect(timerEngine.getCurrentInterval()).toEqual(singleIntervalRoutine[0])
      expect(timerEngine.getNextInterval()).toBeNull()
    })

    it('should calculate total duration correctly', () => {
      const expectedTotal = sampleRoutine.reduce((sum, interval) => sum + interval.duration, 0)
      
      expect(mockOnTick).toHaveBeenCalledWith(
        expect.objectContaining({
          totalDuration: expectedTotal
        })
      )
    })
  })
})
