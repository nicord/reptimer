import { useState, useCallback } from 'react'
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { Interval, IntervalType, Routine } from '../types'
import { getIntervalColor, isValidHexColor, parseTimeString, formatDuration } from '../utils/format'

interface RoutineEditorProps {
  isOpen: boolean
  onClose: () => void
  onSave: (routine: Routine) => void
  initialRoutine?: Routine
  title?: string
}

export default function RoutineEditor({
  isOpen,
  onClose,
  onSave,
  initialRoutine = [],
  title = 'Edit Routine'
}: RoutineEditorProps) {
  const [routine, setRoutine] = useState<Routine>(initialRoutine)
  const [errors, setErrors] = useState<Record<number, string>>({})

  // Add new interval
  const addInterval = useCallback(() => {
    const newInterval: Interval = {
      label: 'New Interval',
      duration: 30,
      type: 'work'
    }
    setRoutine(prev => [...prev, newInterval])
  }, [])

  // Remove interval
  const removeInterval = useCallback((index: number) => {
    setRoutine(prev => prev.filter((_, i) => i !== index))
    setErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[index]
      return newErrors
    })
  }, [])

  // Move interval up
  const moveIntervalUp = useCallback((index: number) => {
    if (index === 0) return
    setRoutine(prev => {
      const newRoutine = [...prev]
      ;[newRoutine[index - 1], newRoutine[index]] = [newRoutine[index], newRoutine[index - 1]]
      return newRoutine
    })
  }, [])

  // Move interval down
  const moveIntervalDown = useCallback((index: number) => {
    setRoutine(prev => {
      if (index === prev.length - 1) return prev
      const newRoutine = [...prev]
      ;[newRoutine[index], newRoutine[index + 1]] = [newRoutine[index + 1], newRoutine[index]]
      return newRoutine
    })
  }, [])

  // Duplicate interval
  const duplicateInterval = useCallback((index: number) => {
    const intervalToDuplicate = routine[index]
    const duplicatedInterval = {
      ...intervalToDuplicate,
      label: `${intervalToDuplicate.label} (Copy)`
    }
    setRoutine(prev => [
      ...prev.slice(0, index + 1),
      duplicatedInterval,
      ...prev.slice(index + 1)
    ])
  }, [routine])

  // Update interval property
  const updateInterval = useCallback((index: number, field: keyof Interval, value: any) => {
    setRoutine(prev => prev.map((interval, i) => 
      i === index ? { ...interval, [field]: value } : interval
    ))

    // Clear error when field is updated
    if (errors[index]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[index]
        return newErrors
      })
    }
  }, [errors])

  // Validate routine
  const validateRoutine = useCallback((): boolean => {
    const newErrors: Record<number, string> = {}
    
    routine.forEach((interval, index) => {
      if (!interval.label.trim()) {
        newErrors[index] = 'Label is required'
      } else if (interval.duration <= 0 || !Number.isInteger(interval.duration)) {
        newErrors[index] = 'Duration must be a positive integer'
      } else if (interval.color && !isValidHexColor(interval.color)) {
        newErrors[index] = 'Invalid color format (use #RRGGBB)'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [routine])

  // Handle save
  const handleSave = useCallback(() => {
    if (validateRoutine()) {
      onSave(routine)
      onClose()
    }
  }, [routine, validateRoutine, onSave, onClose])

  // Handle duration input change
  const handleDurationChange = useCallback((index: number, value: string) => {
    try {
      const seconds = parseTimeString(value)
      updateInterval(index, 'duration', seconds)
    } catch (error) {
      // Keep the string value for display but don't update the routine
      setErrors(prev => ({
        ...prev,
        [index]: 'Invalid time format (use SS or MM:SS)'
      }))
    }
  }, [updateInterval])

  const totalDuration = routine.reduce((sum, interval) => sum + interval.duration, 0)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4 text-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
            {/* Stats */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Total Intervals:</span>{' '}
                  <span className="text-blue-600 dark:text-blue-400">{routine.length}</span>
                </div>
                <div>
                  <span className="font-medium">Total Duration:</span>{' '}
                  <span className="text-green-600 dark:text-green-400">{formatDuration(totalDuration)}</span>
                </div>
                <div className="md:col-span-1 col-span-2">
                  <span className="font-medium">Types:</span>{' '}
                  {Array.from(new Set(routine.map(i => i.type))).join(', ')}
                </div>
              </div>
            </div>

            {/* Intervals */}
            <div className="space-y-3">
              {routine.map((interval, index) => (
                <div 
                  key={index}
                  className={`p-4 border rounded-lg ${
                    errors[index] ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                    {/* Order controls */}
                    <div className="md:col-span-1 flex md:flex-col gap-1">
                      <button
                        onClick={() => moveIntervalUp(index)}
                        disabled={index === 0}
                        className="btn btn-secondary btn-icon text-xs disabled:opacity-30"
                        title="Move up"
                      >
                        <ChevronUpIcon className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => moveIntervalDown(index)}
                        disabled={index === routine.length - 1}
                        className="btn btn-secondary btn-icon text-xs disabled:opacity-30"
                        title="Move down"
                      >
                        <ChevronDownIcon className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Label */}
                    <div className="md:col-span-4">
                      <label className="block text-xs font-medium mb-1">Label</label>
                      <input
                        type="text"
                        value={interval.label}
                        onChange={(e) => updateInterval(index, 'label', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700"
                        placeholder="Interval name"
                      />
                    </div>

                    {/* Duration */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium mb-1">Duration</label>
                      <input
                        type="text"
                        defaultValue={interval.duration.toString()}
                        onChange={(e) => handleDurationChange(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700"
                        placeholder="30 or 1:30"
                      />
                    </div>

                    {/* Type */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium mb-1">Type</label>
                      <select
                        value={interval.type}
                        onChange={(e) => updateInterval(index, 'type', e.target.value as IntervalType)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700"
                      >
                        <option value="warmup">Warmup</option>
                        <option value="work">Work</option>
                        <option value="rest">Rest</option>
                        <option value="finisher">Finisher</option>
                        <option value="cooldown">Cooldown</option>
                      </select>
                    </div>

                    {/* Color */}
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium mb-1">Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={interval.color || getIntervalColor(interval.type)}
                          onChange={(e) => updateInterval(index, 'color', e.target.value)}
                          className="w-8 h-8 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                        />
                        <button
                          onClick={() => updateInterval(index, 'color', undefined)}
                          className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Reset to default"
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-1 flex md:flex-col gap-1">
                      <button
                        onClick={() => duplicateInterval(index)}
                        className="btn btn-secondary btn-icon text-xs"
                        title="Duplicate"
                      >
                        <DocumentDuplicateIcon className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeInterval(index)}
                        className="btn btn-danger btn-icon text-xs"
                        title="Delete"
                      >
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Error message */}
                  {errors[index] && (
                    <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                      {errors[index]}
                    </div>
                  )}
                </div>
              ))}

              {/* Add interval button */}
              <button
                onClick={addInterval}
                className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
              >
                <div className="flex items-center justify-center text-gray-600 dark:text-gray-400">
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add Interval
                </div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary"
            >
              <CheckIcon className="w-4 h-4 mr-2" />
              Save Routine
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
