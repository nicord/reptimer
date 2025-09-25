import { useState, useEffect } from 'react'
import TimerDisplay from './components/TimerDisplay'
import TimerControls from './components/TimerControls'
import RoutineSelector from './components/RoutineSelector'
import RoutineEditor from './components/RoutineEditor'
import ImportExportModal from './components/ImportExportModal'
import { useTimer } from './hooks/useTimer'
import { useKeyboard } from './hooks/useKeyboard'
import { useSettings } from './hooks/useSettings'
import { useFullscreen } from './hooks/useFullscreen'
import { useWakeLock } from './hooks/useWakeLock'
import { Routine } from './types'
import { week1Preset } from './utils/presets'
import { getAppVersion } from './pwa-assets'

function App() {
  const [currentRoutineName, setCurrentRoutineName] = useState<string>('')
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [importExportMode, setImportExportMode] = useState<'import' | 'export'>('import')

  // Hooks
  const { settings, updateLastRoutine, toggleAudio, toggleVoice } = useSettings()
  const { isFullscreen, toggleFullscreen } = useFullscreen()
  const { 
    isSupported: wakeLockSupported, 
    isActive: wakeLockActive, 
    requestWakeLock, 
    releaseWakeLock 
  } = useWakeLock()

  const {
    timerState,
    routine,
    currentInterval,
    nextInterval,
    currentIntervalProgress,
    totalProgress,
    reset,
    next,
    previous,
    toggle,
    setRoutine,
    testSpeech
  } = useTimer({
    audioEnabled: settings.audioEnabled,
    voiceEnabled: settings.voiceEnabled,
    onIntervalChange: (intervalIndex, timeRemaining) => {
      console.log(`Interval changed: ${intervalIndex}, time remaining: ${timeRemaining}s`)
    },
    onComplete: () => {
      console.log('Workout completed!')
      // Release wake lock when workout completes
      if (wakeLockActive) {
        releaseWakeLock()
      }
    }
  })

  // Keyboard shortcuts
  useKeyboard({
    onTogglePlay: toggle,
    onNext: next,
    onPrevious: previous,
    onFullscreen: toggleFullscreen,
    onReset: reset,
    onToggleAudio: toggleAudio,
    onToggleVoice: toggleVoice,
    onTestSpeech: testSpeech
  })

  // Auto-acquire wake lock when timer starts
  useEffect(() => {
    if (timerState.isRunning && !wakeLockActive && wakeLockSupported) {
      requestWakeLock()
    }
  }, [timerState.isRunning, wakeLockActive, wakeLockSupported, requestWakeLock])

  // Load initial routine
  useEffect(() => {
    // Load Week 1 preset as default
    setRoutine(week1Preset)
    setCurrentRoutineName('Week 1')
    updateLastRoutine(week1Preset)
  }, [setRoutine, updateLastRoutine])

  // Handle routine selection
  const handleSelectRoutine = (newRoutine: Routine, name?: string) => {
    setRoutine(newRoutine)
    setCurrentRoutineName(name || 'Custom Routine')
    updateLastRoutine(newRoutine)
  }

  // Handle create routine
  const handleCreateRoutine = () => {
    setIsEditorOpen(true)
  }

  // Handle edit routine
  const handleEditRoutine = () => {
    setIsEditorOpen(true)
  }

  // Handle save routine from editor
  const handleSaveRoutine = (newRoutine: Routine) => {
    setRoutine(newRoutine)
    setCurrentRoutineName('Custom Routine')
    updateLastRoutine(newRoutine)
  }

  // Handle import routine
  const handleImportRoutine = () => {
    setImportExportMode('import')
    setIsImportModalOpen(true)
  }

  // Handle export routine
  const handleExportRoutine = () => {
    setImportExportMode('export')
    setIsExportModalOpen(true)
  }

  // Handle routine import from modal
  const handleRoutineImport = (importedRoutine: Routine) => {
    setRoutine(importedRoutine)
    setCurrentRoutineName('Imported Routine')
    updateLastRoutine(importedRoutine)
  }

  const hasRoutine = routine.length > 0

  // Request wake lock by default when app loads with a routine
  useEffect(() => {
    if (wakeLockSupported && hasRoutine && !wakeLockActive) {
      console.log('Requesting wake lock by default for workout app')
      requestWakeLock()
    }
  }, [wakeLockSupported, hasRoutine, wakeLockActive, requestWakeLock])

  return (
    <div className={`h-full flex flex-col ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Main timer display */}
      <TimerDisplay
        timerState={timerState}
        currentInterval={currentInterval}
        nextInterval={nextInterval}
        currentIntervalProgress={currentIntervalProgress}
        totalProgress={totalProgress}
      />

      {/* Controls */}
      <TimerControls
        timerState={timerState}
        onTogglePlay={toggle}
        onReset={reset}
        onNext={next}
        onPrevious={previous}
        onToggleFullscreen={toggleFullscreen}
        onToggleWakeLock={wakeLockActive ? releaseWakeLock : requestWakeLock}
        onToggleAudio={toggleAudio}
        onToggleVoice={toggleVoice}
        isFullscreen={isFullscreen}
        wakeLockActive={wakeLockActive}
        wakeLockSupported={wakeLockSupported}
        audioEnabled={settings.audioEnabled}
        voiceEnabled={settings.voiceEnabled}
        hasRoutine={hasRoutine}
      />

      {/* Routine selector below main content */}
      {!isFullscreen && (
        <RoutineSelector
          onSelectRoutine={(routine) => handleSelectRoutine(routine)}
          onCreateRoutine={handleCreateRoutine}
          onEditRoutine={handleEditRoutine}
          onImportRoutine={handleImportRoutine}
          onExportRoutine={handleExportRoutine}
          hasRoutine={hasRoutine}
          currentRoutineName={currentRoutineName}
        />
      )}

      {/* Version display at bottom */}
      <div className="flex-shrink-0 flex justify-center items-center py-2 px-4">
        <span className="text-xs text-gray-400 select-none">
          v{getAppVersion()}
        </span>
      </div>

      {/* Modals */}
      <RoutineEditor
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={handleSaveRoutine}
        initialRoutine={routine}
        title={routine.length > 0 ? 'Edit Routine' : 'Create Routine'}
      />

      <ImportExportModal
        isOpen={isImportModalOpen || isExportModalOpen}
        onClose={() => {
          setIsImportModalOpen(false)
          setIsExportModalOpen(false)
        }}
        onImport={handleRoutineImport}
        currentRoutine={routine}
        mode={importExportMode}
      />
    </div>
  )
}


export default App
