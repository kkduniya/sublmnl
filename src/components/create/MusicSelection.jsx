"use client"

import { useState, useEffect } from "react"

export default function MusicSelection({ formData, updateFormData, onNext, onBack }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [audioElement, setAudioElement] = useState(null)
  const [audioError, setAudioError] = useState(false)
  const [selectedTrackId, setSelectedTrackId] = useState(formData.musicTrack?.id || null)

  const musicTracks = [
    {
      id: "calm-waves",
      name: "Calm Waves",
      category: "Relaxation",
      duration: "4:32",
      imageUrl: "https://placehold.co/80x80",
      // In a real app, this would be a real audio file
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
    {
      id: "deep-focus",
      name: "Deep Focus",
      category: "Productivity",
      duration: "3:45",
      imageUrl: "https://placehold.co/80x80",
      // In a real app, this would be a real audio file
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    },
    {
      id: "dream-state",
      name: "Dream State",
      category: "Sleep",
      duration: "5:15",
      imageUrl: "https://placehold.co/80x80",
      // In a real app, this would be a real audio file
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    },
    {
      id: "energy-boost",
      name: "Energy Boost",
      category: "Motivation",
      duration: "3:21",
      imageUrl: "https://placehold.co/80x80",
      // In a real app, this would be a real audio file
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    },
  ]

  // Clean up audio on component unmount
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause()
        audioElement.src = ""
      }
    }
  }, [audioElement])

  const handlePlayTrack = (track) => {
    try {
      setAudioError(false)

      // If we already have an audio element
      if (audioElement) {
        // If clicking the currently playing track
        if (currentTrack && currentTrack.id === track.id) {
          if (isPlaying) {
            audioElement.pause()
            setIsPlaying(false)
          } else {
            audioElement.play().catch((err) => {
              console.error("Audio play error:", err)
              setAudioError(true)
              setIsPlaying(false)
            })
            setIsPlaying(true)
          }
        } else {
          // If switching to a different track
          audioElement.pause()
          audioElement.src = track.audioUrl
          audioElement.load() // Important to reload the audio with the new source
          audioElement.play().catch((err) => {
            console.error("Audio play error:", err)
            setAudioError(true)
            setIsPlaying(false)
          })
          setIsPlaying(true)
          setCurrentTrack(track)
        }
      } else {
        // First time playing any track
        const audio = new Audio(track.audioUrl)

        audio.addEventListener("error", (e) => {
          // Using a safer error logging approach
          console.log("Audio playback error:", e.message || "Unknown error")
          setAudioError(true)
          setIsPlaying(false)
        })

        audio.addEventListener("ended", () => {
          setIsPlaying(false)
        })

        setAudioElement(audio)

        // Start playing
        audio.play().catch((err) => {
          console.error("Audio play error:", err)
          setAudioError(true)
          setIsPlaying(false)
        })

        setIsPlaying(true)
        setCurrentTrack(track)
      }
    } catch (error) {
      console.error("Audio error:", error)
      setAudioError(true)
      setIsPlaying(false)
    }
  }

  const handleSelectTrack = (track) => {
    setSelectedTrackId(track.id)
    updateFormData({ musicTrack: track })
  }

  const handleContinue = () => {
    if (!formData.musicTrack) {
      alert("Please select a music track")
      return
    }

    onNext()
  }

  return (
    <div className="glass-card p-6">
      <h2 className="text-xl font-semibold mb-4">Select Your Music</h2>
      <p className="text-gray-300 mb-6">
        Choose a track that resonates with you. Your affirmations will be embedded in this music.
      </p>

      {audioError && (
        <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4 text-red-200">
          Audio playback is not available in the preview. This would work in the actual application.
        </div>
      )}

      <div className="space-y-4 mb-8">
        {musicTracks.map((track) => (
          <div
            key={track.id}
            className={`glass-card p-4 flex items-center cursor-pointer transition-colors ${
              selectedTrackId === track.id ? "border-2 border-primary" : "border border-gray-700"
            }`}
            onClick={() => handleSelectTrack(track)}
          >
            <div className="flex-shrink-0 w-20 h-20 bg-gray-800 rounded-md overflow-hidden mr-4">
              <img src={track.imageUrl || "/placeholder.svg"} alt={track.name} className="w-full h-full object-cover" />
            </div>

            <div className="flex-grow">
              <h3 className="font-medium">{track.name}</h3>
              <p className="text-gray-400 text-sm">
                {track.category} • {track.duration}
              </p>
            </div>

            <button
              className="ml-4 w-10 h-10 rounded-full bg-primary/20 hover:bg-primary/30 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation()
                handlePlayTrack(track)
              }}
            >
              {isPlaying && currentTrack && currentTrack.id === track.id ? (
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
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button className="btn-secondary" onClick={onBack}>
          Back
        </button>
        <button className="btn-primary" onClick={handleContinue}>
          Create My Audio
        </button>
      </div>
    </div>
  )
}

