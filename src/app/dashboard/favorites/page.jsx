"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/AuthContext"
import AudioPlayer from "@/components/create/AudioPlayer"

export default function FavoritesPage() {
  const { user } = useAuth()
  const [favoriteAudios, setFavoriteAudios] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentAudio, setCurrentAudio] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioError, setAudioError] = useState(false)

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/user/favorites")
      const data = await response.json()

      if (data.success) {
        setFavoriteAudios(data.audios)
      } else {
        console.error("Error fetching favorites:", data.message)
      }
    } catch (error) {
      console.error("Error fetching favorites:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlay = (audio) => {
    try {
      setAudioError(false)

      // If clicking the currently playing track
      if (currentAudio && currentAudio.id === audio.id) {
        setIsPlaying(!isPlaying)
      } else {
        // If switching to a different track
        setCurrentAudio(audio)
        setIsPlaying(true)
      }
    } catch (error) {
      console.error("Audio control error:", error)
      setAudioError(true)
      setIsPlaying(false)
    }
  }

  const handleDownload = (audio) => {
    // Create a temporary anchor element
    const link = document.createElement("a")
    link.href = audio.audioUrl
    link.download = `${audio.name}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleRemoveFavorite = async (audio) => {
    try {
      const response = await fetch(`/api/user/favorites/${audio.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (data.success) {
        setFavoriteAudios((prev) => prev.filter((fav) => fav.id !== audio.id))
      }
    } catch (error) {
      console.error("Error removing favorite:", error)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Favorites</h1>
      </div>

      {audioError && (
        <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4 text-red-200">
          Audio playback is not available in the preview. This would work in the actual application.
        </div>
      )}

      {currentAudio && (
        <div className="glass-card p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">Now Playing</h3>
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-medium">{currentAudio.name}</h4>
              <p className="text-sm text-gray-400">Created on {formatDate(currentAudio.createdAt)}</p>
            </div>
          </div>

          <AudioPlayer
            audioUrl={currentAudio.audioUrl}
            onError={() => setAudioError(true)}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            showAffirmations={true}
            affirmationsVolume={0.3}
          />
        </div>
      )}

      <div className="glass-card p-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <svg
              className="animate-spin h-8 w-8 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
        ) : favoriteAudios.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">You haven't favorited any audio tracks yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Created</th>
                  <th className="text-left py-3 px-4">Voice</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {favoriteAudios.map((audio) => (
                  <tr key={audio.id} className="border-b border-gray-700">
                    <td className="py-3 px-4">{audio.name}</td>
                    <td className="py-3 px-4">{formatDate(audio.createdAt)}</td>
                    <td className="py-3 px-4">
                      {audio.voiceType.split("-").slice(-1)[0]} ({audio.voiceLanguage})
                    </td>
                    <td className="py-3 px-4 flex space-x-2">
                      <button
                        onClick={() => handlePlay(audio)}
                        className="p-2 bg-primary/20 hover:bg-primary/30 rounded-full"
                        aria-label={isPlaying && currentAudio?.id === audio.id ? "Pause" : "Play"}
                      >
                        {isPlaying && currentAudio?.id === audio.id ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-primary"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-primary"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>

                      <button
                        onClick={() => handleDownload(audio)}
                        className="p-2 bg-primary/20 hover:bg-primary/30 rounded-full"
                        aria-label="Download"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-primary"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>

                      <button
                        onClick={() => handleRemoveFavorite(audio)}
                        className="p-2 bg-red-600/20 hover:bg-red-600/30 rounded-full"
                        aria-label="Remove from favorites"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-red-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

