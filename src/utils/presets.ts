import { Routine } from '../types'

const EXERCISES = [
  'Push-ups',
  'Dumbbell Shoulder Press', 
  'Bent-over Dumbbell Row',
  'Diamond Push-ups',
  'Dumbbell Lateral Raise'
]

/**
 * Create a routine with warmup, multiple rounds of exercises, finisher, and cooldown
 */
function createRoutine(
  warmupDuration: number,
  rounds: number,
  workDuration: number,
  restDuration: number,
  finisherName: string,
  finisherDuration: number,
  cooldownDuration: number
): Routine {
  const routine: Routine = []

  // Add warmup
  routine.push({
    label: 'Warm-up',
    duration: warmupDuration,
    type: 'warmup'
  })

  // Add exercise rounds
  for (let round = 1; round <= rounds; round++) {
    EXERCISES.forEach((exercise, exerciseIndex) => {
      // Work interval
      routine.push({
        label: `${exercise} — Round ${round}`,
        duration: workDuration,
        type: 'work'
      })

      // Rest interval (except after last exercise of last round)
      const isLastExerciseOfLastRound = round === rounds && exerciseIndex === EXERCISES.length - 1
      if (!isLastExerciseOfLastRound) {
        routine.push({
          label: `Rest — Round ${round}`,
          duration: restDuration,
          type: 'rest'
        })
      }
    })
  }

  // Add finisher
  routine.push({
    label: finisherName,
    duration: finisherDuration,
    type: 'finisher'
  })

  // Add cooldown
  routine.push({
    label: 'Cool Down',
    duration: cooldownDuration,
    type: 'cooldown'
  })

  return routine
}

/**
 * Week 1 Preset
 * - Warm-up: 2:00
 * - Circuit: 2 rounds of 5 exercises  
 * - Work/Rest: 40s / 20s
 * - Finisher: 1:00 (fast push-ups)
 * - Cooldown: 2:00
 */
export const week1Preset: Routine = createRoutine(
  120, // 2:00 warmup
  2,   // 2 rounds
  40,  // 40s work
  20,  // 20s rest
  'Fast Push-ups — Finisher',
  60,  // 1:00 finisher
  120  // 2:00 cooldown
)

/**
 * Week 2 Preset
 * - Warm-up: 2:00
 * - Circuit: 3 rounds of 5 exercises
 * - Work/Rest: 40s / 20s
 * - Finisher: 1:00 (dumbbell curls fast)
 * - Cooldown: 2:00
 */
export const week2Preset: Routine = createRoutine(
  120, // 2:00 warmup
  3,   // 3 rounds
  40,  // 40s work
  20,  // 20s rest
  'Fast Dumbbell Curls — Finisher',
  60,  // 1:00 finisher
  120  // 2:00 cooldown
)

/**
 * Week 3 Preset
 * - Warm-up: 1:30
 * - Circuit: 3 rounds of 5 exercises
 * - Work/Rest: 45s / 15s
 * - Finisher: 1:00 (explosive push-ups)
 * - Cooldown: 1:30
 */
export const week3Preset: Routine = createRoutine(
  90,  // 1:30 warmup
  3,   // 3 rounds
  45,  // 45s work
  15,  // 15s rest
  'Explosive Push-ups — Finisher',
  60,  // 1:00 finisher
  90   // 1:30 cooldown
)

/**
 * Week 4 Preset
 * - Warm-up: 1:00
 * - Circuit: 4 rounds of 5 exercises
 * - Work/Rest: 45s / 15s
 * - Finisher: 1:00 (AMRAP superset: 5 shoulder press / 5 push-ups loop)
 * - Cooldown: 1:00
 */
export const week4Preset: Routine = createRoutine(
  60,  // 1:00 warmup
  4,   // 4 rounds
  45,  // 45s work
  15,  // 15s rest
  'AMRAP: 5 Shoulder Press + 5 Push-ups — Finisher',
  60,  // 1:00 finisher
  60   // 1:00 cooldown
)

/**
 * All presets with metadata
 */
export const presets = {
  week1: {
    name: 'Week 1',
    description: '2 rounds • 40s work / 20s rest',
    routine: week1Preset,
    totalDuration: week1Preset.reduce((sum, interval) => sum + interval.duration, 0)
  },
  week2: {
    name: 'Week 2', 
    description: '3 rounds • 40s work / 20s rest',
    routine: week2Preset,
    totalDuration: week2Preset.reduce((sum, interval) => sum + interval.duration, 0)
  },
  week3: {
    name: 'Week 3',
    description: '3 rounds • 45s work / 15s rest', 
    routine: week3Preset,
    totalDuration: week3Preset.reduce((sum, interval) => sum + interval.duration, 0)
  },
  week4: {
    name: 'Week 4',
    description: '4 rounds • 45s work / 15s rest',
    routine: week4Preset,
    totalDuration: week4Preset.reduce((sum, interval) => sum + interval.duration, 0)
  }
} as const

/**
 * Format duration in MM:SS format
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Get preset by key
 */
export function getPreset(key: keyof typeof presets) {
  return presets[key]
}

/**
 * Get all preset keys
 */
export function getPresetKeys(): (keyof typeof presets)[] {
  return Object.keys(presets) as (keyof typeof presets)[]
}
