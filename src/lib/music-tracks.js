// This file exports music track utilities

// Helper function to format duration
export function formatDuration(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00"
  
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }
  
  // Helper function to get audio duration
  export function getAudioDuration(audioPath) {
    return new Promise((resolve, reject) => {
      try {
        const audio = new Audio(audioPath)
  
        audio.addEventListener("loadedmetadata", () => {
          resolve(audio.duration)
        })
  
        audio.addEventListener("error", (err) => {
          reject(new Error(`Failed to load audio: ${err.message || "Unknown error"}`))
        })
      } catch (error) {
        reject(error)
      }
    })
  }
  
  // Function to check if audio can be played
  export function canPlayAudio(audioPath) {
    return new Promise((resolve) => {
      try {
        const audio = new Audio()
  
        // Set up event listeners
        audio.addEventListener("canplaythrough", () => {
          resolve(true)
        })
  
        audio.addEventListener("error", () => {
          resolve(false)
        })
  
        // Try to load the audio
        audio.src = audioPath
      } catch (error) {
        resolve(false)
      }
    })
  }
  
  