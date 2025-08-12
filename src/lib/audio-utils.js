/**
 * Save audio to the user's library
 * @param {Object} audioData - The audio data to save
 * @returns {Promise<Object>} The result of the save operation
 */
export async function saveAudioToLibrary(audioData) {
    try {
      // Ensure URLs are properly formatted
      const formattedData = {
        ...audioData,
      }
  
      // Format audioUrl if it exists
      if (formattedData.audioUrl) {
        try {
          // Test if it's already a valid URL
          new URL(formattedData.audioUrl)
        } catch (e) {
          // If not a valid URL, remove it to prevent errors
          console.warn("Invalid audioUrl detected, removing from request:", formattedData.audioUrl)
          delete formattedData.audioUrl
        }
      }
  
      // Format music track URL if it exists
      if (formattedData.musicTrack) {
        if (formattedData.musicTrack.audioUrl) {
          try {
            new URL(formattedData.musicTrack.audioUrl)
          } catch (e) {
            // If not valid, try to use path instead or remove
            if (formattedData.musicTrack.path) {
              try {
                new URL(formattedData.musicTrack.path)
              } catch (pathError) {
                // If path is also invalid, use a default or empty string
                formattedData.musicTrack.path = ""
              }
            }
            // Remove invalid audioUrl
            delete formattedData.musicTrack.audioUrl
          }
        }
      }
  
      const response = await fetch("/api/audio/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      })
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Server responded with status: ${response.status}`)
      }
  
      return await response.json()
    } catch (error) {
      console.error("Error saving audio to library:", error)
      return {
        success: false,
        message: error.message || "Failed to save audio to library",
      }
    }
  }
  
  /**
   * Fetch user's audio tracks
   * @returns {Promise<Object>} The user's audio tracks
   */
  export async function getUserAudioTracks() {
    try {
      const response = await fetch("/api/audio/user")
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Server responded with status: ${response.status}`)
      }
  
      return await response.json()
    } catch (error) {
      console.error("Error fetching user audio tracks:", error)
      return {
        success: false,
        message: error.message || "Failed to fetch audio tracks",
        audios: [],
      }
    }
  }
  
  /**
   * Delete an audio track
   * @param {string} audioId - The ID of the audio to delete
   * @returns {Promise<Object>} The result of the delete operation
   */
  export async function deleteAudioTrack(audioId) {
    try {
      const response = await fetch(`/api/audio/${audioId}`, {
        method: "DELETE",
      })
  
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Server responded with status: ${response.status}`)
      }
  
      return await response.json()
    } catch (error) {
      console.error("Error deleting audio track:", error)
      return {
        success: false,
        message: error.message || "Failed to delete audio track",
      }
    }
  }
  
  