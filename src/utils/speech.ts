export class SpeechEngine {
  private synth: SpeechSynthesis | null = null
  private isEnabled: boolean = false
  private voice: SpeechSynthesisVoice | null = null
  private rate: number = 1.0
  private pitch: number = 1.0
  private volume: number = 0.8

  constructor() {
    this.initializeSpeech()
  }

  private initializeSpeech(): void {
    if ('speechSynthesis' in window) {
      this.synth = window.speechSynthesis
      
      // Load voices when they become available
      if (this.synth.getVoices().length === 0) {
        this.synth.addEventListener('voiceschanged', this.loadVoices)
      } else {
        this.loadVoices()
      }
    } else {
      console.warn('Speech synthesis not supported in this browser')
    }
  }

  private loadVoices = (): void => {
    if (!this.synth) return

    const voices = this.synth.getVoices()
    
    // Prefer English voices, prioritize female voices for workout instructions
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
    ) || voices.find(voice => 
      voice.lang.startsWith('en')
    ) || voices[0]

    this.voice = preferredVoice || null
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    
    // Cancel any ongoing speech when disabled
    if (!enabled && this.synth) {
      this.synth.cancel()
    }
  }

  setRate(rate: number): void {
    this.rate = Math.max(0.1, Math.min(2.0, rate))
  }

  setPitch(pitch: number): void {
    this.pitch = Math.max(0, Math.min(2, pitch))
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
  }

  /**
   * Announce the start of a new interval
   */
  announceInterval(intervalLabel: string): void {
    if (!this.isEnabled || !this.synth) return

    // Clean up the label for better speech (remove special characters, etc.)
    const cleanLabel = intervalLabel
      .replace(/—/g, ',') // Replace em-dash with comma for natural pause
      .replace(/[^\w\s,.-]/g, '') // Remove special characters except basic punctuation
      .trim()

    this.speak(cleanLabel)
  }

  /**
   * Announce countdown numbers (3, 2, 1)
   */
  announceCountdown(count: number): void {
    if (!this.isEnabled || !this.synth) return

    const countWords = {
      3: 'Three',
      2: 'Two', 
      1: 'One',
    }

    const word = countWords[count as keyof typeof countWords]
    if (word) {
      this.speak(word, { rate: 0.8, priority: 'high' })
    }
  }

  /**
   * Announce workout completion
   */
  announceCompletion(): void {
    if (!this.isEnabled || !this.synth) return

    const messages = [
      'Workout complete! Great job!',
      'Excellent work! Workout finished!',
      'Amazing! You completed the workout!',
      'Fantastic! Workout done!',
    ]

    const message = messages[Math.floor(Math.random() * messages.length)]
    this.speak(message, { pitch: 1.2, rate: 0.9 })
  }

  /**
   * Announce workout pause/resume
   */
  announcePause(): void {
    if (!this.isEnabled || !this.synth) return
    this.speak('Workout paused', { rate: 0.8 })
  }

  announceResume(): void {
    if (!this.isEnabled || !this.synth) return
    this.speak('Resuming workout', { rate: 0.8 })
  }

  /**
   * Test the speech synthesis
   */
  test(): void {
    this.speak('Speech test. RepTimer is ready for your workout!')
  }

  /**
   * Core speech synthesis method
   */
  private speak(
    text: string, 
    options: { 
      rate?: number
      pitch?: number
      volume?: number
      priority?: 'low' | 'normal' | 'high'
    } = {}
  ): void {
    if (!this.synth || !this.isEnabled) return

    // Cancel lower priority speech if high priority is requested
    if (options.priority === 'high' && this.synth.speaking) {
      this.synth.cancel()
    }

    const utterance = new SpeechSynthesisUtterance(text)
    
    if (this.voice) {
      utterance.voice = this.voice
    }
    
    utterance.rate = options.rate ?? this.rate
    utterance.pitch = options.pitch ?? this.pitch
    utterance.volume = options.volume ?? this.volume

    // Error handling
    utterance.onerror = (event) => {
      console.warn('Speech synthesis error:', event.error)
    }

    // Prevent speech queue buildup
    utterance.onstart = () => {
      // Clear any pending low-priority utterances when starting high-priority
      if (options.priority === 'high') {
        setTimeout(() => {
          if (this.synth && this.synth.pending) {
            this.synth.cancel()
          }
        }, 50)
      }
    }

    try {
      this.synth.speak(utterance)
    } catch (error) {
      console.warn('Error speaking text:', error)
    }
  }

  /**
   * Stop all current and queued speech
   */
  stop(): void {
    if (this.synth) {
      this.synth.cancel()
    }
  }

  /**
   * Check if speech synthesis is available
   */
  isSupported(): boolean {
    return this.synth !== null
  }

  /**
   * Get available voices for user selection
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synth ? this.synth.getVoices() : []
  }

  /**
   * Set a specific voice
   */
  setVoice(voice: SpeechSynthesisVoice): void {
    this.voice = voice
  }

  destroy(): void {
    if (this.synth) {
      this.synth.cancel()
      this.synth.removeEventListener('voiceschanged', this.loadVoices)
    }
  }
}
