"use client"

import { useState, useEffect, useRef } from "react"
import { Volume2, VolumeX, Loader2 } from "lucide-react"
import { prepareAudio, syncSpeechWithMusic as syncSpeechWithAudio } from "@/lib/audio-sync"
import { useAuth } from "@/context/AuthContext"
import PreviewPopup from "./PreviewPopup"

export default function EnhancedAudioPlayer({
  audioUrl,
  frequencyUrl,
  frequencyVolume = 0.5,
  onFrequencyVolumeChange,
  affirmations = [],
  voiceSettings = null,
  affirmationsVolume = 0.2, // Default to 20%
  onAffirmationsVolumeChange = () => {},
  musicVolume = 1.0,
  onMusicVolumeChange,
  repetitionInterval = 10,
  onRepetitionIntervalChange = () => {},
  onError,
  onPlayStateChange = () => {},
  showControls = true,
  autoPlay = false,
  compact = false,
  hideVolumeControls = false, // New prop to hide volume controls
  showRawAudio = false, // Show raw HTML audio element for debugging
  disableAffirmations = true, // Disable affirmations playback
  isPlaying: externalIsPlaying,
  onPlayPause,
  stopOnSettingsChange = true, // New prop to control stopping on settings change
  speed= 1.0, // Playback speed
  subscriptionStatus,
  handleSaveToLibrary,
  handlePricingForLoggedInUser
}) {
  const { user } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(0)
  const [isAffirmationPlaying, setIsAffirmationPlaying] = useState(false)
  const [isVoiceLoading, setIsVoiceLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSeeking, setIsSeeking] = useState(false) // Track if user is seeking

  const audioRef = useRef(null)
  const frequencyAudioRef = useRef(null) // Add frequency audio ref
  const progressBarRef = useRef(null)
  const affirmationTimerRef = useRef(null)
  const previousSettingsRef = useRef(null)
  const animationRef = useRef(null)
  const isMountedRef = useRef(true)
  const lastUrlRef = useRef("")
  const isPlayingRef = useRef(false)
  const playAffirmationsRef = useRef(false) // Track if affirmations should play
  const audioUrlRef = useRef(audioUrl) // Track the current audio URL
  const frequencyUrlRef = useRef(frequencyUrl) // Track the current frequency URL
  const availableVoicesRef = useRef([])
  const [audioError, setAudioError] = useState(null)
  const seekingRef = useRef(false) // Reference to track seeking state
  const lastSeekTime = useRef(0)
  const affirmationTimeoutRef = useRef(null)
  const preloadedAffirmationAudioRef = useRef(null)
  const [speakAffirmations, setSpeakAffirmations] = useState(true)
  const completedAffirmationsRef = useRef(false) // Track if we've completed all affirmations
  const hasPreviewedRef = useRef(false)
  const previewTimeoutRef = useRef(null)
  const [showPreviewPopup, setShowPreviewPopup] = useState(false)

  const CHATGPT_VOICE_MAP = {
    breeze: "alloy",
    cove: "echo",
    ember: "fable",
    juniper: "onyx",
    arbor: "nova",
    maple: "shimmer",
    sol: "coral",
    spruce: "verse",
    vale: "ballad",
  };

  // Update the ref when the prop changes
  useEffect(() => {
    playAffirmationsRef.current = !disableAffirmations
    audioUrlRef.current = audioUrl
    frequencyUrlRef.current = frequencyUrl

  }, [disableAffirmations, audioUrl, frequencyUrl])

  // Add this function near the top of your component
  const isSpeechSynthesisSupported = () => {
    return typeof window !== "undefined" && "speechSynthesis" in window
  }

  // Add this near the top of the component function
  useEffect(() => {
    console.log("EnhancedAudioPlayer received audioUrl:", audioUrl)
  }, [audioUrl])

  // Fix double slash in URL if present
  const sanitizeUrl = (url) => {
    if (!url) return url
    // Replace double slashes (except after protocol)
    return url.replace(/(https?:\/\/)|(\/\/+)/g, (match, protocol) => {
      return protocol || "/"
    })
  }

  // Initialize audio element
  useEffect(() => {
    if (!audioUrl) {
      setIsLoading(false)
      return
    }

    // Clean up previous audio element if it exists
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.src = ""
    }

    const audio = new Audio(audioUrl)
    audioRef.current = audio

    const setAudioData = () => {
      setDuration(audio.duration)
      setIsLoading(false)
      if (autoPlay) {
        playAudio()
      }
    }

    const updateTimeDisplay = () => {
      if (!seekingRef.current) {
        // Only update time if not seeking
        setCurrentTime(audio.currentTime)
      }
    }

    const handleAudioEnd = () => {
      // Stop frequency audio when main audio ends
      if (frequencyAudioRef.current) {
        frequencyAudioRef.current.pause()
        frequencyAudioRef.current.currentTime = 0
      }

      // Stop all affirmations
      stopAllAffirmations();

      setIsPlaying(false)
      isPlayingRef.current = false
      onPlayStateChange(false)
      setCurrentTime(0)

      if (audioRef.current) {
        audioRef.current.currentTime = 0
      }
    }

    const handleAudioError = (e) => {
      console.error("Audio error:", e, audio.error)
      setError(`Failed to load audio: ${audio.error?.message || "Unknown error"}`)
      setIsLoading(false)
      if (onError) onError(e)
    }

    // Event listeners
    audio.addEventListener("loadedmetadata", setAudioData)
    audio.addEventListener("timeupdate", updateTimeDisplay)
    audio.addEventListener("ended", handleAudioEnd)
    audio.addEventListener("error", handleAudioError)

    // Set volume
    audio.volume = volume
    audio.muted = isMuted

    // Try to load the audio
    try {
      audio.load()
    } catch (err) {
      console.error("Error loading audio:", err)
      setError(`Failed to load audio: ${err.message}`)
      setIsLoading(false)
    }

    // Clean up
    return () => {
      audio.removeEventListener("loadedmetadata", setAudioData)
      audio.removeEventListener("timeupdate", updateTimeDisplay)
      audio.removeEventListener("ended", handleAudioEnd)
      audio.removeEventListener("error", handleAudioError)
      audio.pause()
      audio.src = ""

      // Stop all affirmations
      stopAllAffirmations();
    }
  }, [audioUrl, autoPlay, onError, onPlayStateChange, volume, isMuted])

  // Initialize frequency audio element
  useEffect(() => {
    if (!frequencyUrl) {
      // Clean up previous frequency audio if it exists
      if (frequencyAudioRef.current) {
        frequencyAudioRef.current.pause()
        frequencyAudioRef.current.src = ""
        frequencyAudioRef.current = null
      }
      return
    }

    // Clean up previous frequency audio element if it exists
    if (frequencyAudioRef.current) {
      frequencyAudioRef.current.pause()
      frequencyAudioRef.current.src = ""
    }

    const frequencyAudio = new Audio(frequencyUrl)
    frequencyAudioRef.current = frequencyAudio

    const handleFrequencyAudioError = (e) => {
      console.error("Frequency audio error:", e, frequencyAudio.error)
      // Don't set main error state for frequency audio, just log it
    }

    // Event listeners
    frequencyAudio.addEventListener("error", handleFrequencyAudioError)

    // Set volume (remove loop to prevent continuous playback after main audio ends)
    frequencyAudio.volume = frequencyVolume
    frequencyAudio.muted = isMuted

    // Try to load the frequency audio
    try {
      frequencyAudio.load()
    } catch (err) {
      console.error("Error loading frequency audio:", err)
    }

    // Clean up
    return () => {
      frequencyAudio.removeEventListener("error", handleFrequencyAudioError)
      frequencyAudio.pause()
      frequencyAudio.src = ""
    }
  }, [frequencyUrl, frequencyVolume, isMuted])

  // Add this useEffect after the other useEffects
  useEffect(() => {
    const handleAudioError = () => {
      console.error("Audio failed to load:", audioUrl)
      // Try to reload with a different approach if needed
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.load()
      }
    }

    if (audioRef.current) {
      audioRef.current.addEventListener("error", handleAudioError)
      return () => {
        audioRef.current?.removeEventListener("error", handleAudioError)
      }
    }
  }, [audioUrl])



  // Stop everything when voice settings change
  useEffect(() => {
    if (previousSettingsRef.current && JSON.stringify(previousSettingsRef.current) !== JSON.stringify(voiceSettings)) {
      if (stopOnSettingsChange) {
        stopEverything()
      }
    }
    previousSettingsRef.current = voiceSettings
  }, [voiceSettings, stopOnSettingsChange])

  // Stop playback when affirmations volume changes
  useEffect(() => {
    if (isPlaying && stopOnSettingsChange) {
      stopEverything()
    }
  }, [affirmationsVolume, stopOnSettingsChange])

  // Stop playback when repetition interval changes
  useEffect(() => {
    if (isPlaying && stopOnSettingsChange) {
      stopEverything()
    }
  }, [repetitionInterval, stopOnSettingsChange])

  // Stop playback when music volume changes
  useEffect(() => {
    if (isPlaying && stopOnSettingsChange) {
      stopEverything()
    }
  }, [musicVolume, stopOnSettingsChange])

  const stopEverything = () => {
    // Stop audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    // Stop frequency audio
    if (frequencyAudioRef.current) {
      frequencyAudioRef.current.pause()
      frequencyAudioRef.current.currentTime = 0
    }

    // Stop all affirmations
    stopAllAffirmations();

    setIsPlaying(false)
    setIsAffirmationPlaying(false)
    onPlayStateChange(false)
  }

  const playAudio = () => {
    if (!audioRef.current) return

    audioRef.current.volume = volume
    audioRef.current.muted = isMuted

    const playPromise = audioRef.current.play()

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true)
          onPlayStateChange(true)
          
          // Start frequency audio if available
          if (frequencyAudioRef.current) {
            frequencyAudioRef.current.volume = frequencyVolume
            frequencyAudioRef.current.muted = isMuted
            frequencyAudioRef.current.play().catch((err) => {
              console.error("Frequency audio play error:", err)
            })
          }
          
          // Start affirmations if we have them and they're not disabled
          if (affirmations.length > 0 && !disableAffirmations) {
            startAffirmations()
          }
        })
        .catch((err) => {
          console.error("Play error:", err)
          setError(`Failed to play audio: ${err.message}`)
          if (onError) onError(err)
        })
    }
  }

  const startAffirmations = () => {
    if (!affirmations.length || disableAffirmations || isSeekingRef.current) return;
    
    // Stop any current affirmations first
    stopAllAffirmations();

    // Start with the first affirmation after a small delay
    setTimeout(() => {
      if (isPlayingRef.current && !isSeekingRef.current) {
        speakAffirmation(affirmations[0], 0);
      }
    }, 100);
  }

  // Current playing affirmation audio reference
  const currentAffirmationAudioRef = useRef(null);
  const isSeekingRef = useRef(false);
  const lastSeekTimeRef = useRef(0);
  const currentAbortControllerRef = useRef(null); // For cancelling ChatGPT requests

  const stopAllAffirmations = () => {
    // Cancel any ongoing ChatGPT TTS request
    if (currentAbortControllerRef.current) {
      currentAbortControllerRef.current.abort();
      currentAbortControllerRef.current = null;
    }
    
    // Stop any current affirmation audio immediately
    if (currentAffirmationAudioRef.current) {
      currentAffirmationAudioRef.current.pause();
      currentAffirmationAudioRef.current.currentTime = 0; // Reset to beginning
      currentAffirmationAudioRef.current.src = "";
      currentAffirmationAudioRef.current = null;
    }
    
    // Also stop preloaded affirmation if it exists
    if (preloadedAffirmationAudioRef.current) {
      preloadedAffirmationAudioRef.current.pause();
      preloadedAffirmationAudioRef.current.currentTime = 0; // Reset to beginning
      preloadedAffirmationAudioRef.current.src = "";
      preloadedAffirmationAudioRef.current = null;
    }
    
    // Clear all timers
    if (affirmationTimerRef.current) {
      clearTimeout(affirmationTimerRef.current);
      affirmationTimerRef.current = null;
    }
    
    if (affirmationTimeoutRef.current) {
      clearTimeout(affirmationTimeoutRef.current);
      affirmationTimeoutRef.current = null;
    }
    
    setIsAffirmationPlaying(false);
  };

  const speakAffirmation = async (text, index) => {
    // Check if we should stop (paused, seeking, etc.)
    if (!isPlayingRef.current || disableAffirmations || isSeekingRef.current) {
      return;
    }

    // Stop any current affirmations before starting new one
    stopAllAffirmations();

    // Only use ChatGPT voices now
    if (voiceSettings && CHATGPT_VOICE_MAP[voiceSettings.voice]) {
      try {
        // If we already preloaded this first affirmation, use it
        if (preloadedAffirmationAudioRef.current && index === 0) {
          const audio = preloadedAffirmationAudioRef.current;
          preloadedAffirmationAudioRef.current = null;
          currentAffirmationAudioRef.current = audio;
          
          audio.onplay = () => {
            // Check if main audio is still playing before starting affirmation
            if (!isPlayingRef.current || !audioRef.current || audioRef.current.paused) {
              audio.pause();
              return;
            }
            setCurrentAffirmationIndex(index);
            setIsAffirmationPlaying(true);
          };
          
          audio.onended = () => {
            setIsAffirmationPlaying(false);
            currentAffirmationAudioRef.current = null;
            
            // Only continue if still playing and not seeking and main audio is still playing
            if (!isPlayingRef.current || disableAffirmations || isSeekingRef.current || 
                !audioRef.current || audioRef.current.paused || audioRef.current.ended) {
              return;
            }
            
            const hasMore = index < affirmations.length - 1;
            if (audioRef.current && !audioRef.current.ended) {
              if (hasMore) {
                setTimeout(() => {
                  if (isPlayingRef.current && !isSeekingRef.current) {
                    speakAffirmation(affirmations[index + 1], index + 1);
                  }
                }, 1000);
              } else {
                // Restart from first affirmation (applies to both single and multiple affirmations)
                const delay = repetitionInterval > 0 ? repetitionInterval * 1000 : 10000;
                affirmationTimerRef.current = setTimeout(() => {
                  if (isPlayingRef.current && !isSeekingRef.current && audioRef.current && !audioRef.current.paused && !audioRef.current.ended) {
                    speakAffirmation(affirmations[0], 0);
                  }
                }, delay);
              }
            }
          };
          
          audio.onerror = (err) => {
            console.error("ChatGPT TTS audio error (preloaded):", err);
            setIsAffirmationPlaying(false);
            currentAffirmationAudioRef.current = null;
          };
          
          // Only play if still in playing state
          if (isPlayingRef.current && !isSeekingRef.current) {
            audio.play().catch(err => {
              console.error("Failed to play preloaded affirmation:", err);
            });
          }
          return;
        }
        
        // Create AbortController for this request
        const abortController = new AbortController();
        currentAbortControllerRef.current = abortController;
        
        const resp = await fetch("/api/chatgpt-tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            voice: voiceSettings.voice,
          }),
          signal: abortController.signal, // Add abort signal
        });

        // Clear the abort controller after successful request
        currentAbortControllerRef.current = null;

        if (!resp.ok) throw new Error("ChatGPT TTS failed");

        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        
        // Store reference to current affirmation audio
        currentAffirmationAudioRef.current = audio;

        audio.volume = affirmationsVolume;
        audio.playbackRate = speed;

        audio.onplay = () => {
          // Check if main audio is still playing before starting affirmation
          if (!isPlayingRef.current || !audioRef.current || audioRef.current.paused) {
            audio.pause();
            return;
          }
          setCurrentAffirmationIndex(index);
          setIsAffirmationPlaying(true);
        };

        audio.onended = () => {
          setIsAffirmationPlaying(false);
          currentAffirmationAudioRef.current = null;
          
          // Only continue if still playing and not seeking and main audio is still playing
          if (!isPlayingRef.current || disableAffirmations || isSeekingRef.current || 
              !audioRef.current || audioRef.current.paused || audioRef.current.ended) {
            return;
          }

          // Move to next affirmation or repeat
          if (index < affirmations.length - 1 && audioRef.current && !audioRef.current.ended) {
            setTimeout(() => {
              if (isPlayingRef.current && !isSeekingRef.current) {
                speakAffirmation(affirmations[index + 1], index + 1);
              }
            }, 1000);
          } else if (audioRef.current && !audioRef.current.ended) {
            // Restart from first affirmation (applies to both single and multiple affirmations)
            const delay = repetitionInterval > 0 ? repetitionInterval * 1000 : 10000;
            affirmationTimerRef.current = setTimeout(() => {
              if (isPlayingRef.current && !isSeekingRef.current && audioRef.current && !audioRef.current.paused && !audioRef.current.ended) {
                speakAffirmation(affirmations[0], 0);
              }
            }, delay);
          }
        };

        audio.onerror = (err) => {
          console.error("ChatGPT TTS audio error:", err);
          setIsAffirmationPlaying(false);
          currentAffirmationAudioRef.current = null;
        };
        
        // Only play if still in playing state and not seeking
        if (isPlayingRef.current && !isSeekingRef.current) {
          audio.play().catch(err => {
            console.error("Failed to play affirmation:", err);
          });
        }
      } catch (err) {
        // Clear the abort controller
        currentAbortControllerRef.current = null;
        
        // Don't log error if it was aborted (user seeked/paused)
        if (err.name !== 'AbortError') {
          console.error("ChatGPT TTS fetch error:", err);
        }
        setIsAffirmationPlaying(false);
      }
    }
  };
  
  // const togglePlayPause = () => {
  //   if (!audioRef.current) return
    
  //   if(!user){
  //     handleSaveToLibrary()
  //     return
  //   }
    
  //   if(!subscriptionStatus?.hasActiveSubscription && !subscriptionStatus?.hasOneTimePayments){
  //     handleSaveToLibrary()
  //     return
  //   }

  //   if (isPlaying) {
  //     // If currently playing, pause everything
  //     audioRef.current.pause()

  //     // Stop speech synthesis
  //     if (speechSynthesisRef.current) {
  //       speechSynthesisRef.current.cancel()
  //     }

  //     // Clear all timers
  //     if (affirmationTimerRef.current) {
  //       clearTimeout(affirmationTimerRef.current)
  //       affirmationTimerRef.current = null
  //     }

  //     if (affirmationTimeoutRef.current) {
  //       clearTimeout(affirmationTimeoutRef.current)
  //       affirmationTimeoutRef.current = null
  //     }

  //     setIsPlaying(false)
  //     isPlayingRef.current = false
  //     setIsAffirmationPlaying(false)
  //     onPlayStateChange(false)
  //   } else {
  //     // If not playing, start everything
  //     // Reset the completed affirmations flag when starting playback
  //     completedAffirmationsRef.current = false

  //     // Reset current affirmation index to start from the beginning
  //     setCurrentAffirmationIndex(0)

  //     // Start playback
  //     const playPromise = audioRef.current.play()

  //     if (playPromise !== undefined) {
  //       playPromise
  //         .then(() => {
  //           setIsPlaying(true)
  //           isPlayingRef.current = true
  //           onPlayStateChange(true)
  //           // Start affirmations if we have them and they're not disabled
  //           if (affirmations.length > 0 && !disableAffirmations) {
  //             console.log("enter data")
  //             // Small delay to ensure music starts first
  //             setTimeout(() => {
  //               startAffirmations()
  //             }, 1000)
  //           }
  //         })
  //         .catch((err) => {
  //           console.error("Play error:", err)
  //           setError(`Failed to play audio: ${err.message}`)
  //           if (onError) onError(err)
  //         })
  //     }
  //   }
  // }

  const togglePlayPause = async () => {
    if (!audioRef.current) return

    // Pause if already playing
    if (isPlaying) {
      audioRef.current.pause()

      // Pause frequency audio
      if (frequencyAudioRef.current) {
        frequencyAudioRef.current.pause()
      }

      // Stop all affirmations
      stopAllAffirmations();

      if (previewTimeoutRef.current) {
        clearTimeout(previewTimeoutRef.current)
        previewTimeoutRef.current = null
      }

      setIsPlaying(false)
      isPlayingRef.current = false
      setIsAffirmationPlaying(false)
      onPlayStateChange(false)
      return
    }

    // --- If not playing, start ---
    completedAffirmationsRef.current = false
    setCurrentAffirmationIndex(0)

    // If using ChatGPT voice and affirmations enabled, preload first affirmation before starting
    let firstAffirmationAudio = null
    if (affirmations.length > 0 && !disableAffirmations && voiceSettings && CHATGPT_VOICE_MAP[voiceSettings.voice]) {
      try {
        setIsVoiceLoading(true)
        
        // Create AbortController for preloading
        const preloadAbortController = new AbortController();
        currentAbortControllerRef.current = preloadAbortController;
        
        const resp = await fetch("/api/chatgpt-tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: affirmations[0],
            voice: voiceSettings.voice,
          }),
          signal: preloadAbortController.signal, // Add abort signal
        })
        
        // Clear the abort controller after successful request
        currentAbortControllerRef.current = null;
        
        if (!resp.ok) throw new Error("ChatGPT TTS failed")
        const blob = await resp.blob()
        const url = URL.createObjectURL(blob)
        const audio = new Audio(url)
        audio.volume = affirmationsVolume
        audio.playbackRate = speed
        preloadedAffirmationAudioRef.current = audio
        firstAffirmationAudio = audio
      } catch (e) {
        // Clear the abort controller
        currentAbortControllerRef.current = null;
        
        // Don't log error if it was aborted
        if (e.name !== 'AbortError') {
          console.error("Failed to preload first affirmation:", e);
        }
        preloadedAffirmationAudioRef.current = null
      } finally {
        // we keep loading spinner until music starts to ensure synchronized UX
      }
    }

    const playPromise = audioRef.current.play()

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true)
          isPlayingRef.current = true
          onPlayStateChange(true)

          // Start frequency audio if available
          if (frequencyAudioRef.current) {
            frequencyAudioRef.current.volume = frequencyVolume
            frequencyAudioRef.current.muted = isMuted
            frequencyAudioRef.current.play().catch((err) => {
              console.error("Frequency audio play error:", err)
            })
          }

          if (affirmations.length > 0 && !disableAffirmations) {
            // If we have a preloaded first affirmation, play it immediately; else start normal flow
            if (firstAffirmationAudio) {
              setIsVoiceLoading(false)
              firstAffirmationAudio.onplay = () => {
                // Check if main audio is still playing before starting affirmation
                if (!isPlayingRef.current || !audioRef.current || audioRef.current.paused) {
                  firstAffirmationAudio.pause();
                  return;
                }
                setCurrentAffirmationIndex(0)
                setIsAffirmationPlaying(true)
              }
              firstAffirmationAudio.onended = () => {
                setIsAffirmationPlaying(false)
                // Only continue if still playing and main audio is still playing
                if (affirmations.length > 1 && isPlayingRef.current && !disableAffirmations && 
                    audioRef.current && !audioRef.current.paused && !audioRef.current.ended) {
                  setTimeout(() => speakAffirmation(affirmations[1], 1), 1000)
                } else if (affirmations.length === 1 && isPlayingRef.current && !disableAffirmations &&
                          audioRef.current && !audioRef.current.paused && !audioRef.current.ended) {
                  // Handle single affirmation repetition
                  const delay = repetitionInterval > 0 ? repetitionInterval * 1000 : 10000;
                  affirmationTimerRef.current = setTimeout(() => {
                    if (isPlayingRef.current && !isSeekingRef.current && audioRef.current && !audioRef.current.paused && !audioRef.current.ended) {
                      speakAffirmation(affirmations[0], 0);
                    }
                  }, delay);
                }
              }
              // Small delay to ensure music is audible first
              setTimeout(() => {
                // Music may be paused by preview gating; only play if still playing
                if (audioRef.current && !audioRef.current.paused && isPlayingRef.current) {
                  firstAffirmationAudio.play().catch((err) => {
                    console.error("First affirmation play error:", err)
                  })
                }
              }, 150)
            } else {
              setIsVoiceLoading(false)
              setTimeout(() => {
                startAffirmations()
              }, 1000)
            }
          } else {
            setIsVoiceLoading(false)
          }

          // ---- Guest users only ----
          if (!user) {
            // If already previewed once, block immediately
            if (hasPreviewedRef.current) {
              audioRef.current.pause()
              // Pause frequency audio
              if (frequencyAudioRef.current) {
                frequencyAudioRef.current.pause()
              }
              setIsPlaying(false)
              isPlayingRef.current = false
              onPlayStateChange(false)
              // Persist pending audio for guests
              try {
                if (audioUrl && affirmations && affirmations.length > 0) {
                  const data = {
                    affirmations,
                    musicTrack: null,
                    voiceType: voiceSettings?.voice || "default",
                    voiceName: voiceSettings?.voice || "default",
                    voiceLanguage: "en-US",
                    voicePitch: 0,
                    voiceSpeed: 0,
                    volume: 0.3,
                    audioUrl,
                    category: "General",
                    repetitionInterval: repetitionInterval || 10,
                  }
                  localStorage.setItem("pendingAudioSave", JSON.stringify(data))
                }
              } catch {}
              setShowPreviewPopup(true)
              return
            }

            // First preview → allow 5s
            previewTimeoutRef.current = setTimeout(() => {
              audioRef.current.pause()
              // Pause frequency audio
              if (frequencyAudioRef.current) {
                frequencyAudioRef.current.pause()
              }
              setIsPlaying(false)
              isPlayingRef.current = false
              onPlayStateChange(false)
              hasPreviewedRef.current = true // 🔒 Mark as used
              try {
                if (audioUrl && affirmations && affirmations.length > 0) {
                  const data = {
                    affirmations,
                    musicTrack: null,
                    voiceType: voiceSettings?.voice || "default",
                    voiceName: voiceSettings?.voice || "default",
                    voiceLanguage: "en-US",
                    voicePitch: 0,
                    voiceSpeed: 0,
                    volume: 0.3,
                    audioUrl,
                    category: "General",
                    repetitionInterval: repetitionInterval || 10,
                  }
                  localStorage.setItem("pendingAudioSave", JSON.stringify(data))
                }
              } catch {}
              setShowPreviewPopup(true)
            }, 5000)
            return
          }

          // ---- Logged in users without subscription ----
          const isUnsubscribed =
          !user ||
          (user && (!subscriptionStatus?.hasActiveSubscription && !subscriptionStatus?.hasOneTimePayments))

        if (isUnsubscribed) {
          // If already previewed once, block immediately
          if (hasPreviewedRef.current) {
            audioRef.current.pause()
            // Pause frequency audio
            if (frequencyAudioRef.current) {
              frequencyAudioRef.current.pause()
            }
            setIsPlaying(false)
            isPlayingRef.current = false
            onPlayStateChange(false)
            // Save pending audio info for guests
            try {
              if (audioUrl && affirmations && affirmations.length > 0) {
                const data = {
                  affirmations,
                  musicTrack: null,
                  voiceType: voiceSettings?.voice || "default",
                  voiceName: voiceSettings?.voice || "default",
                  voiceLanguage: "en-US",
                  voicePitch: 0,
                  voiceSpeed: 0,
                  volume: 0.3,
                  audioUrl,
                  category: "General",
                  repetitionInterval: repetitionInterval || 10,
                }
                localStorage.setItem("pendingAudioSave", JSON.stringify(data))
              }
            } catch {}
            // setShowPreviewPopup(true)
            // If user is logged in, trigger pricing popup
            if (user && handlePricingForLoggedInUser) {
              handlePricingForLoggedInUser()
            }
            return
          }

          // First preview attempt → allow 5s
          previewTimeoutRef.current = setTimeout(() => {
            audioRef.current.pause()
            // Pause frequency audio
            if (frequencyAudioRef.current) {
              frequencyAudioRef.current.pause()
            }
            setIsPlaying(false)
            isPlayingRef.current = false
            onPlayStateChange(false)
            hasPreviewedRef.current = true // 🔒 Mark as used
            try {
              if (audioUrl && affirmations && affirmations.length > 0) {
                const data = {
                  affirmations,
                  musicTrack: null,
                  voiceType: voiceSettings?.voice || "default",
                  voiceName: voiceSettings?.voice || "default",
                  voiceLanguage: "en-US",
                  voicePitch: 0,
                  voiceSpeed: 0,
                  volume: 0.3,
                  audioUrl,
                  category: "General",
                  repetitionInterval: repetitionInterval || 10,
                }
                localStorage.setItem("pendingAudioSave", JSON.stringify(data))
              }
            } catch {}
            // setShowPreviewPopup(true)
            // If user is logged in, trigger pricing as well
            if (user && handlePricingForLoggedInUser) {
              handlePricingForLoggedInUser()
            }
          }, 5000)
          return
        }

          // ---- Start affirmations for subscribed users ----
          
        })
        .catch((err) => {
          console.error("Play error:", err)
          setError(`Failed to play audio: ${err.message}`)
          if (onError) onError(err)
          setIsVoiceLoading(false)
        })
    }
  }




  // Modified handleSeek function to handle seeking properly
  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;

    // Set seeking state to true
    isSeekingRef.current = true;
    seekingRef.current = true;
    setIsSeeking(true);

    const seekTime = Number.parseFloat(e.target.value);
    lastSeekTimeRef.current = seekTime;
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);

    // Stop all affirmations immediately when seeking
    stopAllAffirmations();

    // Sync frequency audio position when seeking
    if (frequencyAudioRef.current) {
      if (frequencyAudioRef.current.duration > 0) {
        const frequencyPosition = seekTime % frequencyAudioRef.current.duration;
        frequencyAudioRef.current.currentTime = frequencyPosition;
      }
    }

    // Set seeking state back to false after a delay and restart affirmations
    setTimeout(() => {
      isSeekingRef.current = false;
      seekingRef.current = false;
      setIsSeeking(false);
      
      // Restart affirmations if we're still playing
      if (isPlaying && affirmations.length > 0 && !disableAffirmations) {
        // Wait a bit more before starting affirmations to ensure seek is complete
        setTimeout(() => {
          if (isPlayingRef.current && !isSeekingRef.current) {
            startAffirmations();
          }
        }, 500);
      }
    }, 200);
  }

  const handleVolumeChange = (e) => {
    if (!audioRef.current) return

    const newVolume = Number.parseFloat(e.target.value)
    audioRef.current.volume = newVolume
    setVolume(newVolume)

    if (newVolume === 0) {
      setIsMuted(true)
      audioRef.current.muted = true
    } else if (isMuted) {
      setIsMuted(false)
      audioRef.current.muted = false
    }

    // Stop playback if stopOnSettingsChange is true
    if (stopOnSettingsChange && isPlaying) {
      stopEverything()
    }
  }

  const toggleMute = () => {
    if (!audioRef.current) return

    const newMutedState = !isMuted
    audioRef.current.muted = newMutedState
    setIsMuted(newMutedState)

    // Stop playback if stopOnSettingsChange is true
    if (stopOnSettingsChange && isPlaying) {
      stopEverything()
    }
  }

  const handleAffirmationsVolumeChange = (e) => {
    const newVolume = Number.parseFloat(e.target.value)
    onAffirmationsVolumeChange(newVolume)

    // Stop playback if stopOnSettingsChange is true
    if (stopOnSettingsChange && isPlaying) {
      stopEverything()
    }

    // If we're currently speaking, update volume for current affirmation
    if (isAffirmationPlaying && currentAffirmationAudioRef.current) {
      currentAffirmationAudioRef.current.volume = newVolume;
    }
  }

  const handleFrequencyVolumeChange = (e) => {
    const newVolume = Number.parseFloat(e.target.value)
    if (onFrequencyVolumeChange) {
      onFrequencyVolumeChange(newVolume)
    }
    
    // Update frequency audio volume immediately
    if (frequencyAudioRef.current) {
      frequencyAudioRef.current.volume = newVolume
    }
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





  // Function to retry loading the audio
  const retryLoadAudio = () => {
    if (!audioUrlRef.current) return

    setAudioError(null)
    setIsLoading(true)

    // Create a new audio element
    const newAudio = new Audio()
    newAudio.crossOrigin = "anonymous"

    // Set up event listeners
    newAudio.addEventListener("loadedmetadata", handleLoadedMetadata)
    newAudio.addEventListener("timeupdate", handleTimeUpdate)
    newAudio.addEventListener("ended", handleEnded)
    newAudio.addEventListener("error", (e) => {
      console.error("Retry audio error:", e)
      setAudioError(`Failed to load audio after retry: ${newAudio.error?.message || "Unknown error"}`)
      setIsLoading(false)
    })

    // Set the source and load
    newAudio.src = audioUrlRef.current
    newAudio.load()

    // Replace the reference
    audioRef.current = newAudio

    console.log("Retrying audio load with new element")
  }



  // Handle retry when audio fails to load
  const handleRetry = () => {
    window.location.reload()
  }

  // Clean up function to handle component unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false

      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
      }

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      // Stop all affirmations
      stopAllAffirmations();
    }
  }, [])

  // Update music volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume
    }
  }, [musicVolume])













  return (
    <div className="w-full">
      {error ? (
        <div className="text-center py-4">
          <p className="text-red-500 mb-2">{error}</p>
          <button
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-4">
          <div className="animate-pulse flex space-x-2">
            <div className="h-2 w-2 bg-primary rounded-full"></div>
            <div className="h-2 w-2 bg-primary rounded-full" style={{ animationDelay: "0.2s" }}></div>
            <div className="h-2 w-2 bg-primary rounded-full" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Show raw audio element for debugging if enabled */}
          {showRawAudio && audioUrl && (
            <div className="mb-4 p-2 bg-gray-800 rounded border border-gray-700">
              <p className="text-xs text-gray-400 mb-2">Raw Audio Element (for debugging):</p>
              <audio
                src={audioUrl}
                controls
                className="w-full"
                onPlay={() => console.log("Raw audio play event")}
                onError={(e) => console.error("Raw audio error:", e)}
              />
            </div>
          )}

          {/* Player controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={togglePlayPause}
              className="w-10 h-10 rounded-full bg-[#c1fc75]/40 hover:bg-[#c1fc75]/30 flex items-center justify-center flex-shrink-0"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isVoiceLoading && !isPlaying ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : isPlaying ? (
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

          {/* Volume controls - only show if not hidden */}
          {showControls && !hideVolumeControls && (
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleMute}
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white"
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <div className="flex-grow">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #22c55e ${(isMuted ? 0 : volume) * 100}%, #374151 ${(isMuted ? 0 : volume) * 100}%)`,
                  }}
                  aria-label="Music volume"
                />
              </div>
              <div className="text-sm text-gray-400 flex-shrink-0 w-28 text-right">Music Volume</div>
            </div>
          )}

          {/* Affirmations volume control - only show if not hidden */}
          {showControls && !hideVolumeControls && affirmations.length > 0 && !disableAffirmations && (
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
                    d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071a1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243a1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z"
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
                  value={affirmationsVolume}
                  onChange={handleAffirmationsVolumeChange}
                  className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #22c55e ${affirmationsVolume * 100}%, #374151 ${affirmationsVolume * 100}%)`,
                  }}
                  aria-label="Affirmation volume"
                />
              </div>
              <div className="text-sm text-gray-400 flex-shrink-0 w-28 text-right">Affirmations Volume</div>
            </div>
          )}

          {/* Frequency volume control - only show if frequency audio exists */}
          {showControls && !hideVolumeControls && frequencyUrl && (
            <div className="flex items-center space-x-3 mt-2">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18V5l12-2v13" />
                  <path d="m9 9 12-2" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <div className="flex-grow">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={frequencyVolume}
                  onChange={handleFrequencyVolumeChange}
                  className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #22c55e ${frequencyVolume * 100}%, #374151 ${frequencyVolume * 100}%)`,
                  }}
                  aria-label="Frequency volume"
                />
              </div>
              <div className="text-sm text-gray-400 flex-shrink-0 w-28 text-right">Frequency Volume</div>
            </div>
          )}

          {/* Repetition interval control - only show if not hidden */}
          {showControls && !hideVolumeControls && affirmations.length > 0 && !disableAffirmations && (
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
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 01-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-grow">
                <input
                  type="range"
                  min="0"
                  max="60"
                  step="5"
                  value={repetitionInterval}
                  onChange={(e) => {
                    // Stop playback if settings change
                    if (stopOnSettingsChange && isPlaying) {
                      stopEverything()
                    }
                    onRepetitionIntervalChange(Number(e.target.value))
                  }}
                  className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #22c55e ${(repetitionInterval / 60) * 100}%, #374151 ${(repetitionInterval / 60) * 100}%)`,
                  }}
                  aria-label="Repetition interval"
                />
              </div>
              <div className="text-sm text-gray-400 flex-shrink-0 w-28 text-right">
                {repetitionInterval === 0 ? "No Repeat" : `Repeat every ${repetitionInterval}s`}
              </div>
            </div>
          )}

          {/* Currently playing affirmation */}
          {/* {isAffirmationPlaying && affirmations.length > 0 && !disableAffirmations && (
            <div className="mt-2 p-2 bg-gray-800 rounded-md">
              <p className="text-sm text-gray-300">{`Playing: "${affirmations[currentAffirmationIndex]}"`}</p>
            </div>
          )} */}
        </div>
      )}
      {showRawAudio && (
        <div className="mt-4 p-2 border border-yellow-500 rounded bg-yellow-950/20">
          <p className="text-xs text-yellow-500 mb-2">Debug: Raw Audio Element</p>
          <audio src={audioUrl} controls className="w-full" onError={(e) => console.error("Raw audio error:", e)} />
        </div>
      )}

      {/* Preview Popup */}
      <PreviewPopup
        open={showPreviewPopup}
        onOpenChange={setShowPreviewPopup}
        onCreateAccount={() => {
          setShowPreviewPopup(false)
          // This will be handled by the parent component
          if (handleSaveToLibrary) {
            handleSaveToLibrary()
          }
        }}
        onClose={() => {
          setShowPreviewPopup(false)
          localStorage.removeItem("pendingAudioSave");
          // Do NOT reset hasPreviewedRef here; keep preview locked after first use
        }}
      />
    </div>
  )
}

