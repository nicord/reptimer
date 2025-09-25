import { useState } from 'react'
import { 
  ClockIcon, 
  PlayIcon, 
  PlusIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { Routine } from '../types'
import { presets, getPresetKeys, formatDuration } from '../utils/presets'

interface RoutineSelectorProps {
  onSelectRoutine: (routine: Routine, name?: string) => void
  onCreateRoutine: () => void
  onEditRoutine: () => void
  onImportRoutine: () => void
  onExportRoutine: () => void
  hasRoutine: boolean
  currentRoutineName?: string
}

export default function RoutineSelector({
  onSelectRoutine,
  onCreateRoutine,
  onEditRoutine,
  onImportRoutine,
  onExportRoutine,
  hasRoutine,
  currentRoutineName
}: RoutineSelectorProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  const handlePresetSelect = (presetKey: string) => {
    const preset = presets[presetKey as keyof typeof presets]
    setSelectedPreset(presetKey)
    onSelectRoutine(preset.routine, preset.name)
  }

  const presetKeys = getPresetKeys()

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Preset Selection */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-3 text-gray-900">
              4-Week Progression Program
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {presetKeys.map((key) => {
                const preset = presets[key]
                const isSelected = selectedPreset === key
                
                return (
                  <button
                    key={key}
                    onClick={() => handlePresetSelect(key)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">
                        {preset.name}
                      </span>
                      {isSelected && (
                        <PlayIcon className="w-4 h-4 text-blue-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mb-1">
                      {preset.description}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      {formatDuration(preset.totalDuration)}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Custom Routine Actions */}
          <div className="lg:ml-6">
            <h4 className="text-sm font-medium mb-3 text-gray-700 lg:text-right">
              Custom Routines
            </h4>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <button
                onClick={onCreateRoutine}
                className="btn btn-secondary text-xs"
                title="Create new routine"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Create
              </button>
              
              <button
                onClick={onEditRoutine}
                disabled={!hasRoutine}
                className="btn btn-secondary text-xs disabled:opacity-50"
                title="Edit current routine"
              >
                <PencilIcon className="w-4 h-4 mr-1" />
                Edit
              </button>
              
              <button
                onClick={onImportRoutine}
                className="btn btn-secondary text-xs"
                title="Import routine from JSON"
              >
                <DocumentArrowUpIcon className="w-4 h-4 mr-1" />
                Import
              </button>
              
              <button
                onClick={onExportRoutine}
                disabled={!hasRoutine}
                className="btn btn-secondary text-xs disabled:opacity-50"
                title="Export routine as JSON"
              >
                <DocumentArrowDownIcon className="w-4 h-4 mr-1" />
                Export
              </button>
            </div>
            
            {/* Current routine indicator */}
            {hasRoutine && currentRoutineName && (
              <div className="mt-2 text-xs text-gray-600 lg:text-right">
                Current: {currentRoutineName}
              </div>
            )}
          </div>
        </div>

        {/* Quick stats */}
        {hasRoutine && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-center">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Routine loaded and ready
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
