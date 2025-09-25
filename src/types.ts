export type IntervalType = 'work' | 'rest' | 'warmup' | 'finisher' | 'cooldown'

export interface Interval {
  label: string
  duration: number // seconds
  type: IntervalType
  color?: string // hex color override
}

export type Routine = Interval[]

export interface TimerState {
  isRunning: boolean
  isPaused: boolean
  currentIntervalIndex: number
  timeRemaining: number // seconds
  totalElapsed: number // seconds
  totalDuration: number // seconds
}

export interface UserSettings {
  darkMode: boolean
  audioEnabled: boolean
  voiceEnabled: boolean
  lastRoutine?: Routine
}

export interface AudioSettings {
  beepEnabled: boolean
  voiceEnabled: boolean
  volume: number
}

export const IntervalColors: Record<IntervalType, string> = {
  warmup: '#FDE68A',
  work: '#86EFAC', 
  rest: '#BAE6FD',
  finisher: '#FDA4AF',
  cooldown: '#DDD6FE',
}

export const KeyboardShortcuts = {
  SPACE: ' ',
  NEXT: 'n',
  PREVIOUS: 'b', 
  FULLSCREEN: 'f',
  MUTE: 'm',
  VOICE: 'v',
} as const
