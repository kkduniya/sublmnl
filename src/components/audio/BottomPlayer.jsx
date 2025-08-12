"use client"

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Download, Repeat, Settings } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAuth } from "@/context/AuthContext"

const BottomPlayer = forwardRef(
  (
    {
      audioUrl,
      title,
      category = "General",
      onNext,
      onPrevious,
      onToggleFavorite,
      isFavorite = false,
      onDownload,
      affirmations = [],
      isPlaying,
      onPlayPause,
      musicVolume = 0.7,
      onMusicVolumeChange,
      affirmationsVolume = 0.5,
      onAffirmationsVolumeChange,
      repetitionInterval = 10,
      onRepetitionIntervalChange,
      voiceSettings = {
        voice: null,
        pitch: 1.0,
        rate: 1.0,
        voiceLanguage: "en-US",
        voicePitch: 0,
        voiceSpeed: 0,
        voiceType: "en-US-Neural2-F",
      },
      onVoiceSettingsChange,
    },
    ref,
  ) => {
    const {user} = useAuth()
    const [duration, setDuration] = useState(0)
    const [currentTime, setCurrentTime] = useState(0)
    const [isMuted, setIsMuted] = useState(false)
    const [isRepeat, setIsRepeat] = useState(false)
    const [showVolumeSlider, setShowVolumeSlider] = useState(false)
    const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(0)
    const [isAffirmationPlaying, setIsAffirmationPlaying] = useState(false)
    const [availableVoices, setAvailableVoices] = useState([])

    const audioRef = useRef(null)
    const speechSynthesisRef = useRef(null)
    const affirmationTimerRef = useRef(null)
    const affirmationTimeoutRef = useRef(null)

    const isAdmin = user?.role === "admin"

    // Initialize speech synthesis
    useEffect(() => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        speechSynthesisRef.current = window.speechSynthesis

        // Get available voices
        const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices()
          if (voices.length > 0) {
            setAvailableVoices(voices)
          }
        }

        // Chrome loads voices asynchronously
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = loadVoices
        }

        loadVoices()
      }

      return () => {
        // Clean up speech synthesis
        if (speechSynthesisRef.current) {
          speechSynthesisRef.current.cancel()
        }

        // Clear any timers
        if (affirmationTimerRef.current) {
          clearTimeout(affirmationTimerRef.current)
        }

        if (affirmationTimeoutRef.current) {
          clearTimeout(affirmationTimeoutRef.current)
        }
      }
    }, [])

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      play: () => {
        if (audioRef.current) {
          audioRef.current.play().catch((error) => {
            console.error("Error playing audio:", error)
          })
        }
      },
      pause: () => {
        if (audioRef.current) {
          audioRef.current.pause()
        }

        // Stop any ongoing speech
        if (speechSynthesisRef.current) {
          speechSynthesisRef.current.cancel()
        }
      },
      reset: () => {
        if (audioRef.current) {
          audioRef.current.currentTime = 0
        }

        // Reset affirmation index
        setCurrentAffirmationIndex(0)

        // Stop any ongoing speech
        if (speechSynthesisRef.current) {
          speechSynthesisRef.current.cancel()
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

          // Start affirmations if we have them
          if (affirmations.length > 0) {
            startAffirmations()
          }
        } else {
          audioRef.current.pause()

          // Stop any ongoing speech
          if (speechSynthesisRef.current) {
            speechSynthesisRef.current.cancel()
          }

          // Clear any timers
          if (affirmationTimerRef.current) {
            clearTimeout(affirmationTimerRef.current)
          }

          if (affirmationTimeoutRef.current) {
            clearTimeout(affirmationTimeoutRef.current)
          }
        }
      }
    }, [isPlaying, audioUrl, affirmations])

    // Reset audio when URL changes
    useEffect(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        setCurrentAffirmationIndex(0)

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
      }

      const handleEnd = () => {
        // Stop any ongoing speech
        if (speechSynthesisRef.current) {
          speechSynthesisRef.current.cancel()
        }

        // Clear any timers
        if (affirmationTimerRef.current) {
          clearTimeout(affirmationTimerRef.current)
        }

        if (affirmationTimeoutRef.current) {
          clearTimeout(affirmationTimeoutRef.current)
        }

        if (isRepeat) {
          audio.currentTime = 0
          setCurrentAffirmationIndex(0)

          audio.play().catch((error) => {
            console.error("Error replaying audio:", error)
          })

          // Restart affirmations
          if (affirmations.length > 0) {
            startAffirmations()
          }
        } else if (onNext) {
          onNext()
        } else {
          onPlayPause(false)
        }
      }

      // Events
      audio.addEventListener("loadeddata", setAudioData)
      audio.addEventListener("timeupdate", handleTimeUpdate)
      audio.addEventListener("ended", handleEnd)

      // Set initial volume
      audio.volume = musicVolume

      // Cleanup
      return () => {
        audio.removeEventListener("loadeddata", setAudioData)
        audio.removeEventListener("timeupdate", handleTimeUpdate)
        audio.removeEventListener("ended", handleEnd)
      }
    }, [audioUrl, onNext, isRepeat, onPlayPause, musicVolume, affirmations])

    // Function to start affirmations
    const startAffirmations = () => {
      if (!speechSynthesisRef.current || !affirmations.length) return

      // Cancel any ongoing speech first
      speechSynthesisRef.current.cancel()

      // Clear any existing timer
      if (affirmationTimerRef.current) {
        clearTimeout(affirmationTimerRef.current)
      }

      if (affirmationTimeoutRef.current) {
        clearTimeout(affirmationTimeoutRef.current)
      }

      // Start with the first affirmation
      setCurrentAffirmationIndex(0)
      speakAffirmation(affirmations[0], 0)
    }

    // Function to speak an affirmation
    const speakAffirmation = (text, index) => {
      if (!speechSynthesisRef.current || !isPlaying) return

      // Cancel any ongoing speech first
      speechSynthesisRef.current.cancel()

      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text)

      // Apply voice settings if available
      if (voiceSettings) {
        // Set language if provided
        if (voiceSettings.voiceLanguage) {
          utterance.lang = voiceSettings.voiceLanguage
        }

        // Find a voice that matches the selected voice type
        if (voiceSettings.voiceType) {
          const selectedVoice = availableVoices.find((v) => v.name === voiceSettings.voiceType)
          if (selectedVoice) {
            utterance.voice = selectedVoice
          }
        } else if (voiceSettings.voice) {
          const selectedVoice = availableVoices.find((v) => v.name === voiceSettings.voice)
          if (selectedVoice) {
            utterance.voice = selectedVoice
          }
        }

        // Set rate and pitch
        utterance.rate = voiceSettings.voiceSpeed !== undefined ? voiceSettings.voiceSpeed : voiceSettings.rate || 1.0
        utterance.pitch = voiceSettings.voicePitch !== undefined ? voiceSettings.voicePitch : voiceSettings.pitch || 1.0
      }

      // Set volume based on affirmationsVolume
      utterance.volume = affirmationsVolume

      // Set event handlers
      utterance.onstart = () => {
        setCurrentAffirmationIndex(index)
        setIsAffirmationPlaying(true)
      }

      utterance.onend = () => {
        setIsAffirmationPlaying(false)

        // If there are more affirmations, speak the next one
        if (index < affirmations.length - 1 && isPlaying) {
          // Add a small delay between affirmations
          affirmationTimeoutRef.current = setTimeout(() => {
            speakAffirmation(affirmations[index + 1], index + 1)
          }, 1000)
        } else {
          // If we've spoken all affirmations and audio is still playing
          if (isPlaying && audioRef.current && !audioRef.current.ended) {
            // Only schedule repetition if repetitionInterval > 0
            if (repetitionInterval > 0) {
              // Schedule the next round of affirmations after the specified interval
              affirmationTimerRef.current = setTimeout(() => {
                if (isPlaying && audioRef.current && !audioRef.current.ended) {
                  // Reset to the first affirmation
                  speakAffirmation(affirmations[0], 0)
                }
              }, repetitionInterval * 1000)
            } else {
              console.log("Repetition disabled, not scheduling next round")
            }
          }
        }
      }

      utterance.onerror = (e) => {
        // console.error("Speech synthesis error:", e)
        setIsAffirmationPlaying(false)
      }

      // Speak the utterance
      try {
        speechSynthesisRef.current.speak(utterance)
      } catch (error) {
        console.error("Error starting speech synthesis:", error)
      }
    }

    // Handle seeking
    const handleSeek = (value) => {
      const seekTime = value[0]
      setCurrentTime(seekTime)

      if (audioRef.current) {
        audioRef.current.currentTime = seekTime
      }

      // If we're playing and have affirmations, we need to restart them
      if (isPlaying && affirmations.length > 0) {
        // Cancel any current speech
        if (speechSynthesisRef.current) {
          speechSynthesisRef.current.cancel()
        }

        // Clear any pending timers
        if (affirmationTimerRef.current) {
          clearTimeout(affirmationTimerRef.current)
        }

        if (affirmationTimeoutRef.current) {
          clearTimeout(affirmationTimeoutRef.current)
        }

        // Start speaking affirmations again
        startAffirmations()
      }
    }

    // Format time (seconds to MM:SS)
    const formatTime = (time) => {
      if (isNaN(time)) return "00:00"

      const minutes = Math.floor(time / 60)
      const seconds = Math.floor(time % 60)

      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }

    // Handle music volume change
    const handleMusicVolumeChange = (value) => {
      const newVolume = value[0]

      if (audioRef.current) {
        audioRef.current.volume = newVolume
      }

      if (onMusicVolumeChange) {
        onMusicVolumeChange(newVolume)
      }
    }

    // Handle affirmations volume change
    const handleAffirmationsVolumeChange = (value) => {
      const newVolume = value[0]

      if (onAffirmationsVolumeChange) {
        onAffirmationsVolumeChange(newVolume)
      }

      // If we're currently speaking, we need to restart with the new volume
      if (isAffirmationPlaying && speechSynthesisRef.current) {
        // Cancel current speech
        speechSynthesisRef.current.cancel()

        // Clear any pending timers
        if (affirmationTimerRef.current) {
          clearTimeout(affirmationTimerRef.current)
        }

        if (affirmationTimeoutRef.current) {
          clearTimeout(affirmationTimeoutRef.current)
        }

        // Restart affirmations with new volume if we're playing
        if (isPlaying) {
          // Small delay to ensure cancellation completes
          setTimeout(() => {
            startAffirmations()
          }, 100)
        }
      }
    }

    // Handle repetition interval change
    const handleRepetitionIntervalChange = (value) => {
      const newInterval = value[0]

      if (onRepetitionIntervalChange) {
        onRepetitionIntervalChange(newInterval)
      }
    }

    // Handle voice settings change
    const handleVoiceChange = (e) => {
      if (onVoiceSettingsChange) {
        onVoiceSettingsChange({
          ...voiceSettings,
          voice: e.target.value,
        })
      }
    }

    const handlePitchChange = (value) => {
      if (onVoiceSettingsChange) {
        onVoiceSettingsChange({
          ...voiceSettings,
          pitch: value[0],
        })
      }
    }

    const handleRateChange = (value) => {
      if (onVoiceSettingsChange) {
        onVoiceSettingsChange({
          ...voiceSettings,
          rate: value[0],
        })
      }
    }

    // Toggle mute
    const toggleMute = () => {
      if (audioRef.current) {
        const newMuteState = !isMuted
        audioRef.current.muted = newMuteState
        setIsMuted(newMuteState)
      }
    }

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-gray-800 z-50 py-2">
        {/* Hidden audio elements */}
        <audio ref={audioRef} src={audioUrl} preload="metadata" />

        {/* Message about affirmations */}
        {/* {affirmations && affirmations.length > 0 && (
          <div className="text-center py-1 text-sm text-primary">
            {isAffirmationPlaying ? (
              <span>
                Playing: "{affirmations[currentAffirmationIndex]}" ({currentAffirmationIndex + 1}/{affirmations.length})
              </span>
            ) : (
              <span>Subliminal affirmations are ready to play</span>
            )}
          </div>
        )} */}
        <div className="text-center py-1 text-sm text-primary">
          <span>Subliminal affirmations are ready to play</span>
        </div>
        
        <div className="container mx-auto max-w-6xl">
          {/* Progress bar */}
          <div className="w-full">
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

          {/* Player controls */}
          <div className="flex items-center justify-between py-2 px-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-800 rounded-md flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M9 18V6L21 12L9 18Z"
                    stroke="#888888"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium">{title}</h3>
                <p className="text-xs text-gray-400">{category}</p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={onPrevious}
                disabled={!onPrevious}
              >
                <SkipBack className="h-5 w-5" />
              </Button>

              <Button
                variant="default"
                size="icon"
                className="h-10 w-10 rounded-full bg-white text-black hover:bg-gray-200"
                onClick={() => onPlayPause(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </Button>

              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={onNext} disabled={!onNext}>
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
                <span className="text-xs text-gray-500">/</span>
                <span className="text-xs text-gray-400">{formatTime(duration)}</span>
              </div>

              {/* Volume control */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                >
                  {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </Button>

                {showVolumeSlider && (
                  <div className="absolute bottom-full mb-2 p-3 bg-gray-900 rounded-lg shadow-lg w-48">
                    <div className="mb-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-gray-400">Music Volume</span>
                        <span className="text-xs text-gray-400">{Math.round(musicVolume * 100)}%</span>
                      </div>
                      <Slider
                        value={[musicVolume]}
                        min={0}
                        max={1}
                        step={0.01}
                        onValueChange={handleMusicVolumeChange}
                        aria-label="Music Volume"
                      />
                    </div>

                    {affirmations && affirmations.length > 0 && (
                      <div className="mb-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-400">Affirmations Volume</span>
                          <span className="text-xs text-gray-400">{Math.round(affirmationsVolume * 100)}%</span>
                        </div>
                        <Slider
                          value={[affirmationsVolume]}
                          min={0}
                          max={1}
                          step={0.01}
                          onValueChange={handleAffirmationsVolumeChange}
                          aria-label="Affirmations Volume"
                        />
                      </div>
                    )}

                    {affirmations && affirmations.length > 0 && (
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-400">Repeat Interval</span>
                          <span className="text-xs text-gray-400">
                            {repetitionInterval === 0 ? "No Repeat" : `${repetitionInterval}s`}
                          </span>
                        </div>
                        <Slider
                          value={[repetitionInterval]}
                          min={0}
                          max={60}
                          step={5}
                          onValueChange={handleRepetitionIntervalChange}
                          aria-label="Repetition Interval"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Voice settings */}
              {
                isAdmin &&
                  affirmations && affirmations.length > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                          <Settings className="h-5 w-5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm">Voice Settings</h4>

                          <div className="space-y-2">
                            <label className="text-xs text-gray-400">Voice Language</label>
                            <select
                              className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-sm"
                              value={voiceSettings?.voiceLanguage || "en-US"}
                              onChange={(e) => {
                                if (onVoiceSettingsChange) {
                                  onVoiceSettingsChange({
                                    ...voiceSettings,
                                    voiceLanguage: e.target.value,
                                  })
                                }
                              }}
                            >
                              <option value="en-US">English (US)</option>
                              <option value="en-GB">English (UK)</option>
                              <option value="es-ES">Spanish</option>
                              <option value="fr-FR">French</option>
                              <option value="de-DE">German</option>
                              <option value="it-IT">Italian</option>
                              <option value="ja-JP">Japanese</option>
                              <option value="ko-KR">Korean</option>
                              <option value="zh-CN">Chinese (Simplified)</option>
                              <option value="hi-IN">Hindi</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs text-gray-400">Voice Type</label>
                            <select
                              className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-sm"
                              value={voiceSettings?.voiceType || ""}
                              onChange={(e) => {
                                if (onVoiceSettingsChange) {
                                  onVoiceSettingsChange({
                                    ...voiceSettings,
                                    voiceType: e.target.value,
                                  })
                                }
                              }}
                            >
                              <option value="">Default Voice</option>
                              {availableVoices
                                .filter((voice) => voice.lang.startsWith(voiceSettings?.voiceLanguage || "en"))
                                .map((voice) => (
                                  <option key={voice.name} value={voice.name}>
                                    {voice.name} ({voice.lang})
                                  </option>
                                ))}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <label className="text-xs text-gray-400">Voice Pitch</label>
                              <span className="text-xs text-gray-400">
                                {(voiceSettings?.voicePitch !== undefined
                                  ? voiceSettings.voicePitch
                                  : voiceSettings?.pitch || 1.0
                                ).toFixed(1)}
                              </span>
                            </div>
                            <Slider
                              value={[
                                voiceSettings?.voicePitch !== undefined
                                  ? voiceSettings.voicePitch
                                  : voiceSettings?.pitch || 1.0,
                              ]}
                              min={0}
                              max={2.0}
                              step={0.1}
                              onValueChange={(value) => {
                                if (onVoiceSettingsChange) {
                                  onVoiceSettingsChange({
                                    ...voiceSettings,
                                    voicePitch: value[0],
                                  })
                                }
                              }}
                              aria-label="Voice Pitch"
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <label className="text-xs text-gray-400">Voice Speed</label>
                              <span className="text-xs text-gray-400">
                                {(voiceSettings?.voiceSpeed !== undefined
                                  ? voiceSettings.voiceSpeed
                                  : voiceSettings?.rate || 1.0
                                ).toFixed(1)}
                                x
                              </span>
                            </div>
                            <Slider
                              value={[
                                voiceSettings?.voiceSpeed !== undefined
                                  ? voiceSettings.voiceSpeed
                                  : voiceSettings?.rate || 1.0,
                              ]}
                              min={0.5}
                              max={2.0}
                              step={0.1}
                              onValueChange={(value) => {
                                if (onVoiceSettingsChange) {
                                  onVoiceSettingsChange({
                                    ...voiceSettings,
                                    voiceSpeed: value[0],
                                  })
                                }
                              }}
                              aria-label="Voice Speed"
                            />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )
              }

              <Button
                variant="ghost"
                size="icon"
                className={cn("h-9 w-9 rounded-full", isRepeat ? "text-primary" : "")}
                onClick={() => setIsRepeat(!isRepeat)}
              >
                <Repeat className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={onToggleFavorite}>
                {isFavorite ? <Heart className="h-5 w-5 fill-red-500 text-red-500" /> : <Heart className="h-5 w-5" />}
              </Button>

              {/* <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={onDownload}>
                <Download className="h-5 w-5" />
              </Button> */}
            </div>
          </div>
        </div>
      </div>
    )
  },
)

BottomPlayer.displayName = "BottomPlayer"
export default BottomPlayer
