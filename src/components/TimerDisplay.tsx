import { Interval, TimerState } from '../types'
import { formatTime, getIntervalColor, getContrastingTextColor } from '../utils/format'

interface TimerDisplayProps {
  timerState: TimerState
  currentInterval: Interval | null
  nextInterval: Interval | null
  currentIntervalProgress: number
  totalProgress: number
}

export default function TimerDisplay({
  timerState,
  currentInterval,
  nextInterval,
  currentIntervalProgress,
  totalProgress
}: TimerDisplayProps) {
  const backgroundColor = currentInterval 
    ? getIntervalColor(currentInterval.type, currentInterval.color)
    : '#E5E7EB'
  
  const textColor = getContrastingTextColor(backgroundColor)
  
  // Apply warning styles when countdown is active (last 3 seconds)
  const isCountdownWarning = timerState.timeRemaining <= 3 && timerState.timeRemaining > 0 && timerState.isRunning
  
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative">
      {/* Background color indicator */}
      <div 
        className="absolute inset-0 opacity-20 transition-all duration-500"
        style={{ backgroundColor }}
      />
      
      {/* Content */}
      <div className="relative z-10 text-center w-full max-w-4xl">
        {/* Current interval info */}
        <div className="mb-4 md:mb-8">
          {currentInterval && (
            <>
              <div 
                className={`inline-block px-4 py-2 rounded-full text-sm md:text-base font-semibold mb-2 ${
                  currentInterval.type === 'warmup' ? 'interval-warmup' :
                  currentInterval.type === 'work' ? 'interval-work' :
                  currentInterval.type === 'rest' ? 'interval-rest' :
                  currentInterval.type === 'finisher' ? 'interval-finisher' :
                  'interval-cooldown'
                }`}
              >
                {currentInterval.type.toUpperCase()}
              </div>
              <h2 
                className="text-lg md:text-2xl lg:text-3xl font-bold mb-2"
                style={{ color: textColor }}
              >
                {currentInterval.label}
              </h2>
            </>
          )}
          
          {!currentInterval && !timerState.isRunning && (
            <h2 className="text-lg md:text-2xl lg:text-3xl font-bold mb-2 text-gray-600 dark:text-gray-400">
              Ready to start
            </h2>
          )}
        </div>

        {/* Timer display */}
        <div 
          className={`timer-display mb-4 md:mb-8 transition-all duration-200 ${
            isCountdownWarning ? 'countdown-warning text-red-500' : ''
          }`}
          style={{ color: isCountdownWarning ? '#EF4444' : textColor }}
          aria-live="polite"
          aria-label={`Time remaining: ${formatTime(timerState.timeRemaining)}`}
        >
          {formatTime(timerState.timeRemaining)}
        </div>

        {/* Progress bar for current interval */}
        {currentInterval && (
          <div className="mb-4 md:mb-6">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${currentIntervalProgress}%`,
                  backgroundColor: textColor
                }}
                aria-label={`Current interval progress: ${Math.round(currentIntervalProgress)}%`}
              />
            </div>
            <div className="text-xs md:text-sm mt-1 opacity-75" style={{ color: textColor }}>
              Interval {timerState.currentIntervalIndex + 1} Progress
            </div>
          </div>
        )}

        {/* Next interval preview */}
        {nextInterval && (
          <div className="mb-4 md:mb-6">
            <div className="text-sm md:text-base opacity-75" style={{ color: textColor }}>
              Next: {nextInterval.label}
            </div>
          </div>
        )}

        {/* Total workout progress */}
        <div className="w-full max-w-md mx-auto">
          <div className="progress-bar">
            <div 
              className="progress-fill bg-blue-500"
              style={{ width: `${totalProgress}%` }}
              aria-label={`Total workout progress: ${Math.round(totalProgress)}%`}
            />
          </div>
          <div className="text-xs md:text-sm mt-1 opacity-75" style={{ color: textColor }}>
            Total Progress: {Math.round(totalProgress)}%
          </div>
        </div>

        {/* Workout stats */}
        <div className="mt-4 md:mt-6 grid grid-cols-2 gap-4 text-sm md:text-base max-w-sm mx-auto">
          <div>
            <div className="font-semibold" style={{ color: textColor }}>Elapsed</div>
            <div className="opacity-75" style={{ color: textColor }}>
              {formatTime(timerState.totalElapsed)}
            </div>
          </div>
          <div>
            <div className="font-semibold" style={{ color: textColor }}>Total</div>
            <div className="opacity-75" style={{ color: textColor }}>
              {formatTime(timerState.totalDuration)}
            </div>
          </div>
        </div>

        {/* Status indicators */}
        <div className="mt-4 md:mt-6">
          {timerState.isPaused && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-sm font-medium">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
              Paused
            </div>
          )}
          
          {timerState.isRunning && !timerState.isPaused && (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 pulse-gentle"></span>
              Running
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
