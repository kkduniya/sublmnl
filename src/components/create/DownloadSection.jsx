"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"

export default function DownloadSection({ formData, onBack }) {
  const [isGenerating, setIsGenerating] = useState(true)
  const [audioUrl, setAudioUrl] = useState("")
  const [affirmationsAudioUrl, setAffirmationsAudioUrl] = useState("")
  const [audioError, setAudioError] = useState(false)
  const [audioData, setAudioData] = useState(null)
  const [showAffirmationsOnly, setShowAffirmationsOnly] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(0)
  const [speechSynthesis, setSpeechSynthesis] = useState(null)
  const [voices, setVoices] = useState([])
  const [backgroundAudio, setBackgroundAudio] = useState(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const utteranceRef = useRef(null)
  const audioRef = useRef(null)
  const progressBarRef = useRef(null)
  const affirmationTimerRef = useRef(null)

  useEffect(() => {
    // Initialize speech synthesis
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setSpeechSynthesis(window.speechSynthesis)

      // Get available voices
      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices()
        setVoices(availableVoices)
      }

      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices
      }

      updateVoices()
    }

    // Simulate generating the audio
    const timer = setTimeout(() => {
      setIsGenerating(false)

      // Set audio URLs based on the selected music track
      if (formData.musicTrack) {
        setAudioUrl(formData.musicTrack.audioUrl)
      } else {
        // Default audio if no track selected
        setAudioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3")
      }

      // Set a sample affirmations-only audio URL - in a real app this would be the TTS output
      setAffirmationsAudioUrl("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3")

      // Default to showing music + affirmations first
      setShowAffirmationsOnly(false)

      // Mock audio data that would come from the API
      setAudioData({
        name: formData.customOnly
          ? "Custom Affirmations"
          : formData.category
            ? formData.category.charAt(0).toUpperCase() + formData.category.slice(1) + " Affirmations"
            : "Your Affirmations",
        musicTrack: formData.musicTrack,
        affirmations: formData.affirmations || [],
        repetitionInfo: {
          musicDuration: formData.musicTrack ? convertDurationToSeconds(formData.musicTrack.duration) : 372, // 6:12 in seconds as fallback
          estimatedRepetitions: 5, // Example value
          isRepeating: true,
        },
      })
    }, 3000)

    return () => {
      clearTimeout(timer)

      // Stop any audio playback
      if (backgroundAudio) {
        backgroundAudio.pause()
        backgroundAudio.src = ""
      }

      if (speechSynthesis) {
        speechSynthesis.cancel()
      }

      if (affirmationTimerRef.current) {
        clearTimeout(affirmationTimerRef.current)
      }
    }
  }, [formData])

  // Helper function to convert duration string (e.g., "4:32") to seconds
  const convertDurationToSeconds = (durationString) => {
    if (!durationString) return 0
    const parts = durationString.split(":")
    return Number.parseInt(parts[0]) * 60 + Number.parseInt(parts[1])
  }

  // Helper function to format seconds to MM:SS
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00"

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleAudioError = (error) => {
    console.error("Audio error:", error)
    setAudioError(true)
  }

  const handleDownload = () => {
    // In a real app, this would trigger a download
    alert("Downloading your subliminal audio track...")
  }

  const toggleAffirmationsOnly = () => {
    // Stop any current playback
    if (isPlaying) {
      stopPlayback()
    }

    setShowAffirmationsOnly(!showAffirmationsOnly)
  }

  // Function to speak a single affirmation
  const speakAffirmation = (text, index, withMusic = false) => {
    if (!speechSynthesis) {
      setAudioError(true)
      return
    }

    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text)
    utteranceRef.current = utterance

    // Find a voice that matches the selected voice type
    const voiceLanguage = formData.voiceType.split("-")[0] + "-" + formData.voiceType.split("-")[1]
    const selectedVoice = voices.find((voice) => voice.lang.startsWith(voiceLanguage))

    if (selectedVoice) {
      utterance.voice = selectedVoice
    }

    // Set pitch (convert from our -10 to 10 scale to 0.1 to 2 scale)
    const pitchValue = Number.parseFloat(formData.voicePitch) || 0
    utterance.pitch = 1 + pitchValue / 10

    // Set rate (convert from our -5 to 5 scale to 0.5 to 2 scale)
    const rateValue = Number.parseFloat(formData.voiceSpeed) || 0
    utterance.rate = 1 + rateValue / 10

    // Set volume to maximum
    utterance.volume = 1.0

    // Set event handlers
    utterance.onstart = () => {
      setCurrentAffirmationIndex(index)
    }

    utterance.onerror = (e) => {
      console.log("Speech synthesis error:", e.error || "Unknown error")
      setAudioError(true)
      setIsPlaying(false)
    }

    utterance.onend = () => {
      // If there are more affirmations, speak the next one
      const affirmations = audioData?.affirmations || []

      if (index < affirmations.length - 1) {
        speakAffirmation(affirmations[index + 1], index + 1, withMusic)
      } else {
        // If we've spoken all affirmations and music is still playing
        if (withMusic && backgroundAudio && !backgroundAudio.ended && isPlaying) {
          console.log("All affirmations spoken, scheduling repeat in 10 seconds")

          // Clear any existing timer
          if (affirmationTimerRef.current) {
            clearTimeout(affirmationTimerRef.current)
          }

          // Schedule the next round of affirmations after 10 seconds
          affirmationTimerRef.current = setTimeout(() => {
            if (isPlaying && backgroundAudio && !backgroundAudio.ended) {
              console.log("Repeating affirmations now")
              speakAffirmation(affirmations[0], 0, true)
            }
          }, 10000) // 10 second pause before repeating
        } else if (!withMusic) {
          // If no music, stop the preview
          setIsPlaying(false)
        }
      }
    }

    // Speak the utterance
    speechSynthesis.speak(utterance)
  }

  const playAudio = (withAffirmations = true) => {
    // If already playing, pause instead
    if (isPlaying) {
      stopPlayback()
      return
    }

    setIsPlaying(true)

    if (showAffirmationsOnly || !withAffirmations) {
      // Play affirmations only
      const affirmations = audioData?.affirmations || []
      if (affirmations.length > 0) {
        speakAffirmation(affirmations[0], 0, false)
      } else {
        setAudioError(true)
        setIsPlaying(false)
      }
    } else {
      // Play music with affirmations
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.volume = 0.3 // Lower volume for background music

      audio.addEventListener("loadedmetadata", () => {
        setDuration(audio.duration)
      })

      audio.addEventListener("timeupdate", () => {
        setCurrentTime(audio.currentTime)
      })

      audio.addEventListener("canplaythrough", () => {
        audio.play().catch((err) => {
          console.log("Error playing music:", err.message || "Unknown error")
          setAudioError(true)
          setIsPlaying(false)
        })

        // Start speaking the first affirmation after a short delay
        setTimeout(() => {
          const affirmations = audioData?.affirmations || []
          if (affirmations.length > 0) {
            speakAffirmation(affirmations[0], 0, true)
          }
        }, 1000)
      })

      audio.addEventListener("error", (e) => {
        console.log("Music playback error:", e.message || "Unknown error")
        setAudioError(true)
        setIsPlaying(false)
      })

      audio.addEventListener("ended", () => {
        setIsPlaying(false)
        if (speechSynthesis) {
          speechSynthesis.cancel()
        }
        if (affirmationTimerRef.current) {
          clearTimeout(affirmationTimerRef.current)
        }
      })

      setBackgroundAudio(audio)
    }
  }

  const stopPlayback = () => {
    setIsPlaying(false)

    // Stop speech synthesis
    if (speechSynthesis) {
      speechSynthesis.cancel()
    }

    // Stop background music
    if (backgroundAudio) {
      backgroundAudio.pause()
      backgroundAudio.currentTime = 0
    }

    // Clear any pending timers
    if (affirmationTimerRef.current) {
      clearTimeout(affirmationTimerRef.current)
    }
  }

  const handleSeek = (e) => {
    const seekTime = Number.parseFloat(e.target.value)

    if (backgroundAudio) {
      backgroundAudio.currentTime = seekTime
      setCurrentTime(seekTime)

      // If we're playing, we need to restart the affirmations
      if (isPlaying) {
        // Cancel any current speech
        if (speechSynthesis) {
          speechSynthesis.cancel()
        }

        // Clear any pending timers
        if (affirmationTimerRef.current) {
          clearTimeout(affirmationTimerRef.current)
        }

        // Start speaking affirmations again after a short delay
        setTimeout(() => {
          const affirmations = audioData?.affirmations || []
          if (affirmations.length > 0) {
            speakAffirmation(affirmations[0], 0, true)
          }
        }, 500)
      }
    }
  }

  return (
    <div className="glass-card p-6">
      {isGenerating ? (
        <div className="text-center py-12">
          <svg
            className="animate-spin h-12 w-12 text-primary mx-auto mb-6"
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
          <h2 className="text-xl font-semibold mb-2">Creating Your Subliminal Audio</h2>
          <p className="text-gray-300">We're embedding your affirmations into your chosen music track...</p>
        </div>
      ) : (
        <>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-primary"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Your Subliminal Audio is Ready!</h2>
            <p className="text-gray-300">Your affirmations have been seamlessly embedded into your chosen track.</p>
          </div>

          {audioError && (
            <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4 text-red-200">
              Audio playback is not available in the preview. This would work in the actual application.
            </div>
          )}

          <div className="glass-card p-4 mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold">
                  {audioData?.name || "Your Affirmations"}
                  {audioData?.musicTrack && ` with ${audioData.musicTrack.name}`}
                </h3>
                <p className="text-sm text-gray-400">Created today</p>
              </div>
              <button className="btn-primary flex items-center" onClick={handleDownload}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Download MP3
              </button>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium">Preview</h4>
                <button
                  onClick={toggleAffirmationsOnly}
                  className={`text-xs px-3 py-1 rounded-full ${
                    showAffirmationsOnly ? "bg-primary text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  {showAffirmationsOnly ? "Affirmations Only" : "Music + Affirmations"}
                </button>
              </div>

              <div className="glass-card p-4 border border-gray-700/50">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                      {isPlaying ? (
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
                    </div>
                    <div>
                      <div className="text-sm text-gray-400">
                        {showAffirmationsOnly ? "Affirmations Only" : "Music + Affirmations"}
                      </div>
                      <div className="font-medium">
                        {isPlaying && currentAffirmationIndex >= 0 && audioData?.affirmations?.length > 0
                          ? `Playing: "${audioData.affirmations[currentAffirmationIndex]}"`
                          : "Ready to play"}
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => playAudio(true)}
                      className="px-3 py-1 bg-primary/20 hover:bg-primary/30 text-primary rounded-md text-sm"
                    >
                      {isPlaying ? "Pause" : "Play"}
                    </button>
                  </div>
                </div>

                {/* Audio progress bar */}
                {!showAffirmationsOnly && (
                  <div className="mt-4">
                    <div className="flex items-center space-x-3">
                      <input
                        ref={progressBarRef}
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #22c55e ${(currentTime / (duration || 100)) * 100}%, #374151 ${(currentTime / (duration || 100)) * 100}%)`,
                        }}
                        aria-label="Audio progress"
                      />
                      <div className="text-sm text-gray-400 flex-shrink-0 w-20 text-right">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </div>
                    </div>
                  </div>
                )}

                {isPlaying && (
                  <div className="mt-2 p-2 bg-gray-800 rounded-md">
                    <p className="text-sm text-gray-300">
                      {showAffirmationsOnly ? "Playing affirmations only" : "Playing music with embedded affirmations"}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-2 text-xs text-gray-400">
                <p>
                  {showAffirmationsOnly
                    ? "Currently playing affirmations only. Click the button above to hear with music."
                    : "Currently playing music with embedded affirmations. Click the button above to hear affirmations only."}
                </p>
              </div>
            </div>

            {audioData?.repetitionInfo?.isRepeating && (
              <div className="mt-2 text-xs text-gray-400">
                <p>
                  Your affirmations repeat approximately every 10 seconds throughout the track for maximum
                  effectiveness.
                </p>
              </div>
            )}
          </div>

          <div className="mb-4 glass-card p-3 border border-gray-700/50">
            <h4 className="text-sm font-medium mb-2">Voice Settings</h4>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="flex flex-col">
                <span className="text-gray-400">Voice:</span>
                <span>
                  {formData.voiceType.split("-").slice(-1)[0]} ({formData.voiceType.split("-").slice(0, -1).join("-")})
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400">Pitch:</span>
                <span>{formData.voicePitch === "0" ? "Normal" : formData.voicePitch > 0 ? "Higher" : "Lower"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400">Speed:</span>
                <span>{formData.voiceSpeed === "0" ? "Normal" : formData.voiceSpeed > 0 ? "Faster" : "Slower"}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-4 mb-8">
            <h3 className="font-semibold mb-4">For best results:</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-primary mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="ml-2">Listen to your subliminal audio at least once daily</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-primary mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="ml-2">Use headphones for the most immersive experience</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-primary mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="ml-2">Listen while relaxing, meditating, or before sleep</span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-primary mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="ml-2">
                  Short affirmations will repeat throughout the track for maximum effectiveness
                </span>
              </li>
              <li className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-primary mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="ml-2">Consistency is key - results improve over time</span>
              </li>
            </ul>
          </div>

          <div className="flex justify-between">
            <button className="btn-secondary" onClick={onBack}>
              Back
            </button>
            <Link href="/create" className="btn-primary">
              Create Another
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

