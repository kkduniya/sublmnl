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
   * Prepares frequency audio element for synchronized playback
   * @param {HTMLAudioElement} frequencyAudioElement - The frequency audio element
   * @param {number} volume - Volume level (0-1)
   * @param {boolean} isMuted - Whether audio is muted
   * @returns {Promise} - A promise that resolves when frequency audio is ready
   */
  export function prepareFrequencyAudio(frequencyAudioElement, volume = 0.5, isMuted = false) {
    return new Promise((resolve, reject) => {
      if (!frequencyAudioElement) {
        reject(new Error("No frequency audio element provided"))
        return
      }

      // Set audio properties
      frequencyAudioElement.loop = true
      frequencyAudioElement.volume = isMuted ? 0 : volume

      // If the audio is already loaded and ready
      if (frequencyAudioElement.readyState >= 3) {
        resolve(frequencyAudioElement)
        return
      }

      // Set up event listeners for loading
      const loadHandler = () => {
        frequencyAudioElement.removeEventListener("canplay", loadHandler)
        frequencyAudioElement.removeEventListener("error", errorHandler)
        resolve(frequencyAudioElement)
      }

      const errorHandler = (error) => {
        frequencyAudioElement.removeEventListener("canplay", loadHandler)
        frequencyAudioElement.removeEventListener("error", errorHandler)
        reject(error)
      }

      frequencyAudioElement.addEventListener("canplay", loadHandler)
      frequencyAudioElement.addEventListener("error", errorHandler)

      // Try to load if not already loading
      if (frequencyAudioElement.readyState === 0) {
        frequencyAudioElement.load()
      }
    })
  }

  /**
   * Synchronizes frequency audio with main audio playback
   * @param {HTMLAudioElement} mainAudio - Main audio element
   * @param {HTMLAudioElement} frequencyAudio - Frequency audio element
   * @param {number} frequencyVolume - Frequency audio volume (0-1)
   * @param {boolean} isMuted - Whether audio is muted
   */
  export function syncFrequencyAudio(mainAudio, frequencyAudio, frequencyVolume = 0.5, isMuted = false) {
    if (!mainAudio || !frequencyAudio) return

    // Set frequency audio volume
    frequencyAudio.volume = isMuted ? 0 : frequencyVolume

    // Sync playback state
    if (!mainAudio.paused && mainAudio.currentTime > 0) {
      // Main audio is playing, start frequency audio
      if (frequencyAudio.paused) {
        frequencyAudio.play().catch(error => {
          console.warn("Failed to sync frequency audio:", error)
        })
      }
    } else {
      // Main audio is paused, pause frequency audio
      if (!frequencyAudio.paused) {
        frequencyAudio.pause()
      }
    }
  }

  /**
   * Updates localStorage pendingAudioSave with frequency audio data
   * @param {Object} existingData - Existing pendingAudioSave data
   * @param {string} frequencyUrl - Frequency audio URL
   * @param {number} frequencyVolume - Frequency audio volume
   * @returns {Object} - Updated data object
   */
  export function updatePendingAudioSaveWithFrequency(existingData, frequencyUrl, frequencyVolume) {
    if (!existingData || typeof existingData !== 'object') {
      return existingData
    }

    return {
      ...existingData,
      frequencyUrl: frequencyUrl || null,
      frequencyVolume: frequencyVolume || 0.5
    }
  }

  /**
   * Saves audio data with frequency information to localStorage
   * @param {Object} audioData - Audio data to save
   */
  export function savePendingAudioWithFrequency(audioData) {
    if (typeof window === "undefined" || !audioData) return

    try {
      const dataToSave = {
        ...audioData,
        frequencyUrl: audioData.frequencyUrl || null,
        frequencyVolume: audioData.frequencyVolume || 0.5,
        timestamp: Date.now()
      }
      localStorage.setItem("pendingAudioSave", JSON.stringify(dataToSave))
    } catch (error) {
      console.error("Failed to save pending audio data:", error)
    }
  }

  /**
   * Retrieves pending audio data with frequency information from localStorage
   * @returns {Object|null} - Pending audio data or null if not found
   */
  export function getPendingAudioWithFrequency() {
    if (typeof window === "undefined") return null

    try {
      const data = localStorage.getItem("pendingAudioSave")
      if (!data) return null

      const parsedData = JSON.parse(data)
      return {
        ...parsedData,
        frequencyUrl: parsedData.frequencyUrl || null,
        frequencyVolume: parsedData.frequencyVolume || 0.5
      }
    } catch (error) {
      console.error("Failed to retrieve pending audio data:", error)
      return null
    }
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
  
  