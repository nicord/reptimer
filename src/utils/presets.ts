import { Routine, WorkoutData, WorkoutPreset, Interval } from '../types'
import workoutsData from '../data/workouts.json'

/**
 * Convert a structured workout preset to a flat routine format
 */
function convertToRoutine(preset: WorkoutPreset): Routine {
  const routine: Interval[] = []
  
  for (const item of preset.routine) {
    if (item.type === 'individual') {
      routine.push({
        label: item.step.label,
        duration: item.step.duration,
        type: item.step.type
      })
    } else if (item.type === 'repeat') {
      for (let round = 1; round <= item.repetitions; round++) {
        for (const step of item.steps) {
          // Add round number to work exercises, but not to rest intervals
          const label = step.type === 'work' 
            ? `${step.label} — Round ${round}`
            : step.type === 'rest'
            ? `Rest — Round ${round}`
            : step.label
          
          routine.push({
            label,
            duration: step.duration,
            type: step.type
          })
        }
      }
    }
  }
  
  return routine
}

// Cast the imported data to the correct type
const typedWorkoutsData = workoutsData as WorkoutData

/**
 * Week 1 Preset
 * - Warm-up: 2:00
 * - Circuit: 2 rounds of 5 exercises  
 * - Work/Rest: 40s / 20s
 * - Finisher: 1:00 (fast push-ups)
 * - Cooldown: 2:00
 */
export const week1Preset: Routine = convertToRoutine(typedWorkoutsData.week1)

/**
 * Week 2 Preset
 * - Warm-up: 2:00
 * - Circuit: 3 rounds of 5 exercises
 * - Work/Rest: 40s / 20s
 * - Finisher: 1:00 (dumbbell curls fast)
 * - Cooldown: 2:00
 */
export const week2Preset: Routine = convertToRoutine(typedWorkoutsData.week2)

/**
 * Week 3 Preset
 * - Warm-up: 1:30
 * - Circuit: 3 rounds of 5 exercises
 * - Work/Rest: 45s / 15s
 * - Finisher: 1:00 (explosive push-ups)
 * - Cooldown: 1:30
 */
export const week3Preset: Routine = convertToRoutine(typedWorkoutsData.week3)

/**
 * Week 4 Preset
 * - Warm-up: 1:00
 * - Circuit: 4 rounds of 5 exercises
 * - Work/Rest: 45s / 15s
 * - Finisher: 1:00 (AMRAP superset: 5 shoulder press / 5 push-ups loop)
 * - Cooldown: 1:00
 */
export const week4Preset: Routine = convertToRoutine(typedWorkoutsData.week4)

/**
 * All presets with metadata from JSON
 */
export const presets = {
  week1: {
    name: typedWorkoutsData.week1.metadata.name,
    description: typedWorkoutsData.week1.metadata.description,
    routine: week1Preset,
    totalDuration: week1Preset.reduce((sum, interval) => sum + interval.duration, 0)
  },
  week2: {
    name: typedWorkoutsData.week2.metadata.name,
    description: typedWorkoutsData.week2.metadata.description,
    routine: week2Preset,
    totalDuration: week2Preset.reduce((sum, interval) => sum + interval.duration, 0)
  },
  week3: {
    name: typedWorkoutsData.week3.metadata.name,
    description: typedWorkoutsData.week3.metadata.description,
    routine: week3Preset,
    totalDuration: week3Preset.reduce((sum, interval) => sum + interval.duration, 0)
  },
  week4: {
    name: typedWorkoutsData.week4.metadata.name,
    description: typedWorkoutsData.week4.metadata.description,
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

/**
 * Get the raw workout data (useful for accessing metadata and structured format)
 */
export function getWorkoutData(): WorkoutData {
  return typedWorkoutsData
}

/**
 * Convert any workout preset to a routine
 */
export function convertWorkoutToRoutine(preset: WorkoutPreset): Routine {
  return convertToRoutine(preset)
}