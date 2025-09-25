export class AudioEngine {
  private audioContext: AudioContext | null = null
  private isEnabled: boolean = true
  private volume: number = 0.5

  constructor() {
    this.initializeAudioContext()
  }

  private async initializeAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Handle autoplay policy - resume context on user interaction
      if (this.audioContext.state === 'suspended') {
        document.addEventListener('click', this.resumeAudioContext, { once: true })
        document.addEventListener('keydown', this.resumeAudioContext, { once: true })
        document.addEventListener('touchstart', this.resumeAudioContext, { once: true })
      }
    } catch (error) {
      console.warn('Web Audio API not supported:', error)
    }
  }

  private resumeAudioContext = async (): Promise<void> => {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
  }

  /**
   * Play a short beep sound for interval transitions
   */
  playBeep(frequency: number = 800, duration: number = 200): void {
    if (!this.isEnabled || !this.audioContext) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000)

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + duration / 1000)
    } catch (error) {
      console.warn('Error playing beep:', error)
    }
  }

  /**
   * Play countdown beeps (3-2-1) with descending pitch
   */
  playCountdownBeep(count: number): void {
    const frequencies = {
      3: 600,
      2: 500,
      1: 400,
    }
    
    const frequency = frequencies[count as keyof typeof frequencies] || 800
    this.playBeep(frequency, 150)
  }

  /**
   * Play a celebratory sound for workout completion
   */
  playCelebration(): void {
    if (!this.isEnabled || !this.audioContext) return

    // Play a series of ascending beeps
    const frequencies = [523, 659, 784, 1047] // C5, E5, G5, C6
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playBeep(freq, 300)
      }, index * 100)
    })
  }

  /**
   * Play a subtle tick sound during work intervals (optional)
   */
  playTick(): void {
    if (!this.isEnabled || !this.audioContext) return
    
    this.playBeep(1200, 50)
  }

  /**
   * Generate a tone for testing purposes
   */
  testSound(): void {
    this.playBeep(800, 500)
  }

  destroy(): void {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }
}
