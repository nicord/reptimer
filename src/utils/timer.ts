import { Routine, TimerState } from '../types'

export class TimerEngine {
  private startTime: number = 0
  private pausedTime: number = 0
  private pauseStartTime: number = 0
  private animationFrameId: number | null = null
  private onTick: (state: TimerState) => void
  private onIntervalChange: (intervalIndex: number) => void
  private onComplete: () => void

  public routine: Routine = [] // Make routine public so callbacks can access it
  private currentIntervalIndex: number = 0
  private isRunning: boolean = false
  private isPaused: boolean = false

  constructor(
    onTick: (state: TimerState) => void,
    onIntervalChange: (intervalIndex: number) => void,
    onComplete: () => void
  ) {
    this.onTick = onTick
    this.onIntervalChange = onIntervalChange
    this.onComplete = onComplete
  }

  setRoutine(routine: Routine): void {
    this.routine = routine
    this.reset()
    // Update state immediately to show correct initial time
    this.updateState()
  }

  start(): void {
    if (this.routine.length === 0) return
    
    if (this.isPaused) {
      // Resume from pause
      this.pausedTime += Date.now() - this.pauseStartTime
      this.isPaused = false
    } else {
      // Fresh start
      this.startTime = Date.now()
      this.pausedTime = 0
    }
    
    this.isRunning = true
    this.tick()
  }

  pause(): void {
    if (!this.isRunning) return
    
    this.isPaused = true
    this.isRunning = false
    this.pauseStartTime = Date.now()
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    
    // Update state immediately to reflect pause
    this.updateState()
  }

  reset(): void {
    this.isRunning = false
    this.isPaused = false
    this.currentIntervalIndex = 0
    this.startTime = 0
    this.pausedTime = 0
    this.pauseStartTime = 0
    
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    
    // Update state to reflect reset state
    this.updateState()
  }

  nextInterval(): void {
    if (this.currentIntervalIndex < this.routine.length - 1) {
      this.currentIntervalIndex++
      this.adjustTimerForNewInterval()
      this.onIntervalChange(this.currentIntervalIndex)
    }
  }

  previousInterval(): void {
    if (this.currentIntervalIndex > 0) {
      this.currentIntervalIndex--
      this.adjustTimerForNewInterval()
      this.onIntervalChange(this.currentIntervalIndex)
    }
  }

  getCurrentInterval() {
    return this.routine.length > 0 ? this.routine[this.currentIntervalIndex] : null
  }

  getNextInterval() {
    const nextIndex = this.currentIntervalIndex + 1
    return nextIndex < this.routine.length ? this.routine[nextIndex] : null
  }

  private adjustTimerForNewInterval(): void {
    // Calculate elapsed time for intervals before current one
    const elapsedForPreviousIntervals = this.routine
      .slice(0, this.currentIntervalIndex)
      .reduce((sum, interval) => sum + interval.duration * 1000, 0)
    
    // Adjust start time to account for the new position
    this.startTime = Date.now() - elapsedForPreviousIntervals
    this.pausedTime = 0
    
    this.updateState()
  }

  private tick = (): void => {
    if (!this.isRunning) return

    const now = Date.now()
    const totalElapsed = now - this.startTime - this.pausedTime
    
    // Calculate which interval we should be in and remaining time
    let elapsedMs = 0
    let intervalIndex = 0
    
    for (let i = 0; i < this.routine.length; i++) {
      const intervalDurationMs = this.routine[i].duration * 1000
      if (totalElapsed < elapsedMs + intervalDurationMs) {
        intervalIndex = i
        break
      }
      elapsedMs += intervalDurationMs
      intervalIndex = i + 1
    }

    // Check if we moved to a new interval
    if (intervalIndex !== this.currentIntervalIndex && intervalIndex < this.routine.length) {
      this.currentIntervalIndex = intervalIndex
      this.onIntervalChange(intervalIndex)
    }

    // Check if workout is complete
    if (intervalIndex >= this.routine.length) {
      this.isRunning = false
      this.onComplete()
      return
    }

    this.updateState()
    this.animationFrameId = requestAnimationFrame(this.tick)
  }

  private updateState(): void {
    const now = Date.now()
    const totalElapsed = this.isRunning 
      ? now - this.startTime - this.pausedTime
      : this.isPaused 
        ? this.pauseStartTime - this.startTime - this.pausedTime
        : 0
    
    // Calculate elapsed time for current interval
    const elapsedForPreviousIntervals = this.routine
      .slice(0, this.currentIntervalIndex)
      .reduce((sum, interval) => sum + interval.duration * 1000, 0)
    
    const currentIntervalElapsed = Math.max(0, totalElapsed - elapsedForPreviousIntervals)
    const currentInterval = this.getCurrentInterval()
    const currentIntervalDurationMs = currentInterval ? currentInterval.duration * 1000 : 0
    
    const timeRemainingMs = Math.max(0, currentIntervalDurationMs - currentIntervalElapsed)
    const totalDurationMs = this.routine.reduce((sum, interval) => sum + interval.duration * 1000, 0)

    const state: TimerState = {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      currentIntervalIndex: this.currentIntervalIndex,
      timeRemaining: Math.ceil(timeRemainingMs / 1000),
      totalElapsed: Math.floor(totalElapsed / 1000),
      totalDuration: Math.floor(totalDurationMs / 1000),
    }

    this.onTick(state)
  }

  destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
    }
  }
}
