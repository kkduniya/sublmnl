"use client"

import { useState, useEffect, useRef } from "react"

export default function AudioPlayer({ audioUrl, onError, showAffirmations = false, affirmationsVolume = 1.0 }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [volume, setVolume] = useState(1)
  const audioRef = useRef(null)
  const progressBarRef = useRef(null)

  useEffect(() => {
    const audio = new Audio(audioUrl)
    audioRef.current = audio

    const setAudioData = () => {
      setDuration(audio.duration)
      setIsLoading(false)
    }

    const updateTimeDisplay = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleAudioEnd = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      audio.currentTime = 0
    }

    const handleAudioError = (e) => {
      console.error("Audio error:", e)
      setIsLoading(false)
      if (onError) onError(e)
    }

    // Event listeners
    audio.addEventListener("loadedmetadata", setAudioData)
    audio.addEventListener("timeupdate", updateTimeDisplay)
    audio.addEventListener("ended", handleAudioEnd)
    audio.addEventListener("error", handleAudioError)

    // Clean up
    return () => {
      audio.pause()
      audio.removeEventListener("loadedmetadata", setAudioData)
      audio.removeEventListener("timeupdate", updateTimeDisplay)
      audio.removeEventListener("ended", handleAudioEnd)
      audio.removeEventListener("error", handleAudioError)
    }
  }, [audioUrl, onError])

  useEffect(() => {
    if (audioRef.current && showAffirmations) {
      // In a real implementation, this would adjust the volume of the affirmations track
      // For now, we'll just log it
      console.log(`Affirmations volume set to: ${affirmationsVolume}`)
    }
  }, [affirmationsVolume, showAffirmations])

  const togglePlayPause = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch((err) => {
        console.error("Play error:", err)
        if (onError) onError(err)
      })
      setIsPlaying(true)
    }
  }

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return

    const seekTime = Number.parseFloat(e.target.value)
    audioRef.current.currentTime = seekTime
    setCurrentTime(seekTime)
  }

  // Update the volume control to be more clear about what it controls
  const handleVolumeChange = (e) => {
    if (!audioRef.current) return

    const newVolume = Number.parseFloat(e.target.value)
    audioRef.current.volume = newVolume
    setVolume(newVolume)
  }

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00"

    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const calculateProgressPercentage = () => {
    if (!duration) return 0
    return (currentTime / duration) * 100
  }

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-pulse flex space-x-2">
            <div className="h-2 w-2 bg-primary rounded-full"></div>
            <div className="h-2 w-2 bg-primary rounded-full"></div>
            <div className="h-2 w-2 bg-primary rounded-full"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePlayPause}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
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
                  className="h-5 w-5 text-white"
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

            <div className="flex-grow">
              <input
                ref={progressBarRef}
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #22c55e ${calculateProgressPercentage()}%, #374151 ${calculateProgressPercentage()}%)`,
                }}
                aria-label="Audio progress"
              />
            </div>

            <div className="text-sm text-gray-400 flex-shrink-0 w-20 text-right">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          {showAffirmations && (
            <div className="flex items-center space-x-3 mt-2">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-grow">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #22c55e ${volume * 100}%, #374151 ${volume * 100}%)`,
                  }}
                  aria-label="Affirmation volume"
                />
              </div>
              <div className="text-sm text-gray-400 flex-shrink-0 w-28 text-right">Affirmations Volume</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

