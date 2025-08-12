"use client"

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  MoreHorizontal,
  Download,
  Heart,
  HeartOff,
} from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * @param {Object} props
 * @param {string} props.audioUrl - URL of the audio file
 * @param {string} props.title - Title of the track
 * @param {string} [props.artist] - Artist name
 * @param {string} [props.coverImage] - URL of cover image
 * @param {Function} [props.onNext] - Function to call when next button is clicked
 * @param {Function} [props.onPrevious] - Function to call when previous button is clicked
 * @param {Function} [props.onToggleFavorite] - Function to call when favorite button is clicked
 * @param {boolean} [props.isFavorite] - Whether the track is favorited
 * @param {Function} [props.onDownload] - Function to call when download button is clicked
 * @param {string[]} [props.affirmations] - Array of affirmation texts
 * @param {Function} [props.onTimeUpdate] - Function to call when time updates
 * @param {boolean} props.isPlaying - Whether audio is currently playing
 * @param {Function} props.onPlayPause - Function to call when play/pause button is clicked
 */
const AudioPlayer = forwardRef(
  (
    {
      audioUrl,
      title,
      artist = "Subliminal Audio",
      coverImage,
      onNext,
      onPrevious,
      onToggleFavorite,
      isFavorite = false,
      onDownload,
      affirmations = [],
      onTimeUpdate,
      isPlaying,
      onPlayPause,
    },
    ref,
  ) => {
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [volume, setVolume] = useState(0.7)
    const [isMuted, setIsMuted] = useState(false)
    const [isRepeat, setIsRepeat] = useState(false)
    const [isShuffle, setIsShuffle] = useState(false)
    const [currentAffirmation, setCurrentAffirmation] = useState("")

    const audioRef = useRef(null)
    const progressBarRef = useRef(null)

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      play: () => {
        if (audioRef.current) {
          audioRef.current.play()
        }
      },
      pause: () => {
        if (audioRef.current) {
          audioRef.current.pause()
        }
      },
      reset: () => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0
        }
      },
      getCurrentTime: () => currentTime,
      getDuration: () => duration,
    }))

    // Handle play/pause state changes
    useEffect(() => {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.play().catch((error) => {
            console.error("Error playing audio:", error)
          })
        } else {
          audioRef.current.pause()
        }
      }
    }, [isPlaying, audioUrl])

    // Reset audio when URL changes
    useEffect(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        if (isPlaying) {
          audioRef.current.play().catch((error) => {
            console.error("Error playing audio:", error)
          })
        }
      }
    }, [audioUrl])

    // Initialize audio
    useEffect(() => {
      const audio = audioRef.current
      if (!audio) return

      // Set up event listeners
      const setAudioData = () => {
        setDuration(audio.duration)
        setCurrentTime(audio.currentTime)
      }

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime)
        if (onTimeUpdate) {
          onTimeUpdate(audio.currentTime, audio.duration)
        }
      }

      // Events
      audio.addEventListener("loadeddata", setAudioData)
      audio.addEventListener("timeupdate", handleTimeUpdate)
      audio.addEventListener("ended", handleEnd)

      // Set initial volume
      audio.volume = volume

      // Cleanup
      return () => {
        audio.removeEventListener("loadeddata", setAudioData)
        audio.removeEventListener("timeupdate", handleTimeUpdate)
        audio.removeEventListener("ended", handleEnd)
      }
    }, [audioUrl, onTimeUpdate])

    // Handle affirmations display
    useEffect(() => {
      if (!affirmations || affirmations.length === 0) return

      const interval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * affirmations.length)
        setCurrentAffirmation(affirmations[randomIndex])
      }, 5000)

      return () => clearInterval(interval)
    }, [affirmations])

    // Handle end of track
    const handleEnd = () => {
      if (isRepeat) {
        // Replay current track
        const audio = audioRef.current
        if (audio) {
          audio.currentTime = 0
          audio.play().catch((error) => {
            console.error("Error replaying audio:", error)
          })
        }
      } else if (onNext) {
        // Play next track
        onNext()
      } else {
        onPlayPause(false)
      }
    }

    // Handle volume change
    const handleVolumeChange = (value) => {
      const newVolume = value[0]
      setVolume(newVolume)

      if (audioRef.current) {
        audioRef.current.volume = newVolume
        setIsMuted(newVolume === 0)
      }
    }

    // Toggle mute
    const toggleMute = () => {
      if (audioRef.current) {
        if (isMuted) {
          audioRef.current.volume = volume
          setIsMuted(false)
        } else {
          audioRef.current.volume = 0
          setIsMuted(true)
        }
      }
    }

    // Handle seeking
    const handleSeek = (value) => {
      const seekTime = value[0]
      setCurrentTime(seekTime)

      if (audioRef.current) {
        audioRef.current.currentTime = seekTime
      }
    }

    // Format time (seconds to MM:SS)
    const formatTime = (time) => {
      if (isNaN(time)) return "00:00"

      const minutes = Math.floor(time / 60)
      const seconds = Math.floor(time % 60)

      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }

    return (
      <div className="bg-black/30 backdrop-blur-lg rounded-xl p-4 w-full">
        <audio ref={audioRef} src={audioUrl} preload="metadata" />

        {/* Affirmation display */}
        {currentAffirmation && (
          <div className="mb-4 text-center">
            <p className="text-sm text-primary animate-pulse">{currentAffirmation}</p>
          </div>
        )}

        <div className="flex items-center gap-4">
          {/* Cover image */}
          <div className="hidden sm:block">
            <div className="w-16 h-16 bg-primary/20 rounded-md flex items-center justify-center">
              {coverImage ? (
                <img
                  src={coverImage || "/placeholder.svg"}
                  alt={title}
                  className="w-full h-full object-cover rounded-md"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/40 to-primary/10 rounded-md flex items-center justify-center">
                  <Volume2 className="h-8 w-8 text-primary/70" />
                </div>
              )}
            </div>
          </div>

          {/* Track info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
              <div className="mb-1 sm:mb-0">
                <h3 className="font-medium text-sm sm:text-base truncate">{title}</h3>
                <p className="text-xs text-gray-400">{artist}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={onToggleFavorite}
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  {isFavorite ? (
                    <Heart className="h-4 w-4 text-primary fill-primary" />
                  ) : (
                    <HeartOff className="h-4 w-4" />
                  )}
                </Button>

                {onDownload && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onDownload} aria-label="Download">
                    <Download className="h-4 w-4" />
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsRepeat(!isRepeat)}
                  aria-label="Repeat"
                >
                  <Repeat className={cn("h-4 w-4", isRepeat ? "text-primary" : "")} />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsShuffle(!isShuffle)}
                  aria-label="Shuffle"
                >
                  <Shuffle className={cn("h-4 w-4", isShuffle ? "text-primary" : "")} />
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-10 text-right">{formatTime(currentTime)}</span>
              <div className="flex-1">
                <Slider
                  value={[currentTime]}
                  min={0}
                  max={duration || 100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="cursor-pointer"
                  aria-label="Seek slider"
                />
              </div>
              <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={toggleMute}
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>

                <div className="w-20 hidden sm:block">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    min={0}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                    aria-label="Volume slider"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={onPrevious}
                  disabled={!onPrevious}
                  aria-label="Previous track"
                >
                  <SkipBack className="h-5 w-5" />
                </Button>

                <Button
                  variant="default"
                  size="icon"
                  className="h-10 w-10 rounded-full"
                  onClick={() => onPlayPause(!isPlaying)}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  onClick={onNext}
                  disabled={!onNext}
                  aria-label="Next track"
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>

              <div className="w-[72px] flex justify-end">
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More options">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
)

AudioPlayer.displayName = "AudioPlayer"
export default AudioPlayer

