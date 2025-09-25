import { 
  PlayIcon, 
  PauseIcon, 
  StopIcon, 
  BackwardIcon, 
  ForwardIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  MicrophoneIcon,
  ChatBubbleBottomCenterTextIcon,
  SunIcon,
  MoonIcon,
  PowerIcon
} from '@heroicons/react/24/outline'
import { TimerState } from '../types'

interface TimerControlsProps {
  timerState: TimerState
  onTogglePlay: () => void
  onReset: () => void
  onNext: () => void
  onPrevious: () => void
  onToggleFullscreen: () => void
  onToggleAudio: () => void
  onToggleVoice: () => void
  onToggleDarkMode: () => void
  onToggleWakeLock?: () => void
  isFullscreen: boolean
  audioEnabled: boolean
  voiceEnabled: boolean
  darkMode: boolean
  wakeLockActive?: boolean
  wakeLockSupported?: boolean
  hasRoutine: boolean
}

export default function TimerControls({
  timerState,
  onTogglePlay,
  onReset,
  onNext, 
  onPrevious,
  onToggleFullscreen,
  onToggleAudio,
  onToggleVoice,
  onToggleDarkMode,
  onToggleWakeLock,
  isFullscreen,
  audioEnabled,
  voiceEnabled,
  darkMode,
  wakeLockActive,
  wakeLockSupported,
  hasRoutine
}: TimerControlsProps) {
  
  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Primary controls */}
        <div className="flex justify-center items-center space-x-4 mb-4">
          {/* Previous interval */}
          <button
            onClick={onPrevious}
            disabled={!hasRoutine || timerState.currentIntervalIndex === 0}
            className="btn btn-secondary btn-icon disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous interval (B)"
            title="Previous interval (B)"
          >
            <BackwardIcon className="w-5 h-5" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={onTogglePlay}
            disabled={!hasRoutine}
            className="btn btn-primary btn-lg disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={timerState.isRunning ? 'Pause (Space)' : 'Play (Space)'}
            title={timerState.isRunning ? 'Pause (Space)' : 'Play (Space)'}
          >
            {timerState.isRunning ? (
              <PauseIcon className="w-6 h-6" />
            ) : (
              <PlayIcon className="w-6 h-6" />
            )}
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            disabled={!hasRoutine}
            className="btn btn-secondary btn-icon disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Reset timer (R)"
            title="Reset timer (R)"
          >
            <StopIcon className="w-5 h-5" />
          </button>

          {/* Next interval */}
          <button
            onClick={onNext}
            disabled={!hasRoutine}
            className="btn btn-secondary btn-icon disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next interval (N)"
            title="Next interval (N)"
          >
            <ForwardIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Secondary controls */}
        <div className="flex justify-center items-center space-x-2 flex-wrap gap-2">
          {/* Audio toggle */}
          <button
            onClick={onToggleAudio}
            className={`btn btn-icon ${audioEnabled ? 'btn-primary' : 'btn-secondary'}`}
            aria-label={`${audioEnabled ? 'Mute' : 'Unmute'} audio (M)`}
            title={`${audioEnabled ? 'Mute' : 'Unmute'} audio (M)`}
          >
            {audioEnabled ? (
              <SpeakerWaveIcon className="w-4 h-4" />
            ) : (
              <SpeakerXMarkIcon className="w-4 h-4" />
            )}
          </button>

          {/* Voice toggle */}
          <button
            onClick={onToggleVoice}
            className={`btn btn-icon ${voiceEnabled ? 'btn-primary' : 'btn-secondary'}`}
            aria-label={`${voiceEnabled ? 'Disable' : 'Enable'} voice (V)`}
            title={`${voiceEnabled ? 'Disable' : 'Enable'} voice (V)`}
          >
            {voiceEnabled ? (
              <ChatBubbleBottomCenterTextIcon className="w-4 h-4" />
            ) : (
              <MicrophoneIcon className="w-4 h-4" />
            )}
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={onToggleDarkMode}
            className="btn btn-secondary btn-icon"
            aria-label={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
            title={`Switch to ${darkMode ? 'light' : 'dark'} mode`}
          >
            {darkMode ? (
              <SunIcon className="w-4 h-4" />
            ) : (
              <MoonIcon className="w-4 h-4" />
            )}
          </button>

          {/* Wake lock toggle */}
          {wakeLockSupported && (
            <button
              onClick={onToggleWakeLock}
              className={`btn btn-icon ${wakeLockActive ? 'btn-primary' : 'btn-secondary'}`}
              aria-label={`${wakeLockActive ? 'Disable' : 'Enable'} screen wake lock`}
              title={`${wakeLockActive ? 'Disable' : 'Enable'} screen wake lock`}
            >
              <PowerIcon className="w-4 h-4" />
            </button>
          )}

          {/* Fullscreen toggle */}
          <button
            onClick={onToggleFullscreen}
            className="btn btn-secondary btn-icon"
            aria-label={`${isFullscreen ? 'Exit' : 'Enter'} fullscreen (F)`}
            title={`${isFullscreen ? 'Exit' : 'Enter'} fullscreen (F)`}
          >
            {isFullscreen ? (
              <ArrowsPointingInIcon className="w-4 h-4" />
            ) : (
              <ArrowsPointingOutIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="mt-4 text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Keyboard shortcuts: Space (play/pause), N (next), B (back), F (fullscreen), M (mute), V (voice)
          </div>
        </div>

        {/* Status indicators */}
        {!hasRoutine && (
          <div className="mt-4 text-center">
            <div className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-md inline-block">
              Select a preset or create a routine to begin
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
