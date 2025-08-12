/**
 * Stops any ongoing speech synthesis
 */
export function stopSpeech() {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }
  
  /**
   * Prepares an audio element for playback
   * @param {HTMLAudioElement} audioElement - The audio element to prepare
   * @returns {Promise} - A promise that resolves when the audio is ready
   */
  export function prepareAudio(audioElement) {
    return new Promise((resolve, reject) => {
      if (!audioElement) {
        reject(new Error("No audio element provided"))
        return
      }
  
      // If the audio is already loaded and ready
      if (audioElement.readyState >= 3) {
        resolve(audioElement)
        return
      }
  
      // Set up event listeners for loading
      const loadHandler = () => {
        audioElement.removeEventListener("canplay", loadHandler)
        audioElement.removeEventListener("error", errorHandler)
        resolve(audioElement)
      }
  
      const errorHandler = (error) => {
        audioElement.removeEventListener("canplay", loadHandler)
        audioElement.removeEventListener("error", errorHandler)
        reject(error)
      }
  
      audioElement.addEventListener("canplay", loadHandler)
      audioElement.addEventListener("error", errorHandler)
  
      // Try to load if not already loading
      if (audioElement.readyState === 0) {
        audioElement.load()
      }
    })
  }
  
  /**
   * Synchronizes speech with audio playback
   * @param {number} currentTime - Current time in the audio
   * @param {Function} speakFunction - Function to call to start speaking
   * @param {Function} stopSpeechFunction - Function to call to stop speaking
   * @param {boolean} isPlaying - Whether the audio is currently playing
   * @param {Array} affirmations - Array of affirmation texts
   * @param {number} currentIndex - Current index in the affirmations array
   * @param {number} repetitionInterval - Interval between repetitions in seconds
   * @param {Function} setCurrentIndex - Function to update the current index
   * @param {React.MutableRefObject} timeoutRef - Ref to store timeout ID
   */
  export function syncSpeechWithMusic(
    currentTime,
    speakFunction,
    stopSpeechFunction,
    isPlaying,
    affirmations,
    currentIndex,
    repetitionInterval,
    setCurrentIndex,
    timeoutRef,
  ) {
    if (!isPlaying || !affirmations || affirmations.length === 0) return
  
    // Stop current speech
    stopSpeechFunction()
  
    // If we're playing, restart affirmations
    if (isPlaying) {
      const timeoutId = setTimeout(() => {
        if (typeof speakFunction === "function") {
          speakFunction()
        }
      }, 100)
  
      // Store timeout ID for cleanup
      if (timeoutRef && timeoutRef.current) {
        timeoutRef.current = timeoutId
      }
  
      return () => clearTimeout(timeoutId)
    }
  }
  
  /**
   * Creates a speech synthesis utterance with the given text and settings
   * @param {string} text - The text to speak
   * @param {Object} voiceSettings - Voice settings object
   * @param {number} volume - Volume level (0-1)
   * @returns {SpeechSynthesisUtterance} - The created utterance
   */
  export function createUtterance(text, voiceSettings, volume) {
    if (!text || typeof window === "undefined" || !window.speechSynthesis) {
      return null
    }
  
    // Create a new utterance with the text
    const utterance = new SpeechSynthesisUtterance(text)
  
    // Set voice if available
    if (voiceSettings && voiceSettings.voice) {
      const voices = window.speechSynthesis.getVoices()
      const selectedVoice = voices.find((voice) => voice.name === voiceSettings.voice)
      if (selectedVoice) utterance.voice = selectedVoice
    }
  
    // Set volume
    utterance.volume = volume || 1.0
  
    // Set rate and pitch
    utterance.rate = 0.9 // Slightly slower for better clarity
    utterance.pitch = 1.0
  
    return utterance
  }
  
  /**
   * Speaks the given text with the specified settings
   * @param {string} text - The text to speak
   * @param {Object} voiceSettings - Voice settings object
   * @param {number} volume - Volume level (0-1)
   * @param {HTMLAudioElement} audioElement - The audio element that's playing
   * @param {number} delayMs - Delay before speaking in milliseconds
   */
  export function speakText(text, voiceSettings, volume, audioElement, delayMs = 0) {
    if (!text || typeof window === "undefined" || !window.speechSynthesis) {
      return
    }
  
    // Create the utterance
    const utterance = createUtterance(text, voiceSettings, volume)
  
    if (!utterance) return
  
    // Speak immediately or after delay
    if (delayMs <= 0) {
      if (window.speechSynthesis && (!audioElement || !audioElement.paused)) {
        window.speechSynthesis.speak(utterance)
      }
    } else {
      setTimeout(() => {
        if (window.speechSynthesis && (!audioElement || !audioElement.paused)) {
          window.speechSynthesis.speak(utterance)
        }
      }, delayMs)
    }
  
    return utterance
  }
  
  