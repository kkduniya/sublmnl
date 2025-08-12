"use client"

import { useState, useEffect, useRef } from "react"

export default function GoalsForm({ formData, updateFormData, onNext }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [showCustomDialog, setShowCustomDialog] = useState(false)
  const [customAffirmation, setCustomAffirmation] = useState("")
  const [customAffirmations, setCustomAffirmations] = useState([])
  const [error, setError] = useState("")
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)
  const [speechSynthesis, setSpeechSynthesis] = useState(null)
  const [voices, setVoices] = useState([])
  const [currentAffirmationIndex, setCurrentAffirmationIndex] = useState(0)
  const [backgroundAudio, setBackgroundAudio] = useState(null)
  const utteranceRef = useRef(null)
  const debugInfoRef = useRef(null)
  const [generatedAffirmations, setGeneratedAffirmations] = useState([])
  const [showVoiceCustomization, setShowVoiceCustomization] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    // Initialize speech synthesis
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setSpeechSynthesis(window.speechSynthesis)

      // Get available voices
      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices()
        setVoices(availableVoices)

        // Debug available voices
        if (availableVoices.length > 0) {
          console.log(
            "Available voices:",
            availableVoices.map((v) => `${v.name} (${v.lang})`),
          )
        } else {
          console.warn("No voices available yet")
        }
      }

      // Chrome loads voices asynchronously
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices
      }

      updateVoices()
    } else {
      console.error("Speech synthesis not supported in this browser")
      setError("Speech synthesis is not supported in your browser.")
    }

    // Cleanup
    return () => {
      if (backgroundAudio) {
        backgroundAudio.pause()
        backgroundAudio.src = ""
      }

      if (speechSynthesis) {
        speechSynthesis.cancel()
      }
    }
  }, [])

  const categories = [
    {
      id: "career",
      name: "Career",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      id: "relationships",
      name: "Relationships",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
    },
    {
      id: "health",
      name: "Health",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
    },
    {
      id: "wealth",
      name: "Wealth",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ]

  const handleCategorySelect = (categoryId) => {
    updateFormData({ category: categoryId })
    setError("")
  }

  const handleGenerateAffirmations = async () => {
    setError("")

    if (!formData.category && !formData.customOnly) {
      setError("Please select a category first")
      return
    }

    if (!formData.goal && !formData.customOnly) {
      setError("Please enter your goal first")
      return
    }

    setIsGenerating(true)

    try {
      // Simulate API call to generate affirmations
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock generated affirmations based on category
      let mockAffirmations = []

      switch (formData.category) {
        case "career":
          mockAffirmations = [
            "I am confident and successful in my career",
            "I attract opportunities that align with my skills and passions",
            "I am worthy of success and recognition in my field",
            "Every day I am becoming more skilled and valuable in my work",
            "I easily overcome challenges and turn them into opportunities",
          ]
          break
        case "relationships":
          mockAffirmations = [
            "I attract healthy and loving relationships into my life",
            "I am worthy of love and respect in all my relationships",
            "I communicate openly and honestly with those around me",
            "I release past relationship pain and welcome new connections",
            "My relationships are balanced, harmonious, and fulfilling",
          ]
          break
        case "health":
          mockAffirmations = [
            "My body is healthy, strong, and full of energy",
            "I make choices that nourish my body and mind",
            "I am committed to my health and well-being",
            "My body heals quickly and efficiently",
            "I love and appreciate my body exactly as it is",
          ]
          break
        case "wealth":
          mockAffirmations = [
            "Money flows to me easily and abundantly",
            "I am worthy of financial prosperity and success",
            "I make wise financial decisions that increase my wealth",
            "I release all limiting beliefs about money",
            "New opportunities for income are constantly coming to me",
          ]
          break
        default:
          mockAffirmations = [
            "I am capable of achieving anything I set my mind to",
            "Every day, in every way, I am getting better and better",
            "I am confident, capable, and strong",
            "I attract positivity and success into my life",
            "I am worthy of all the good things life has to offer",
          ]
      }

      setGeneratedAffirmations(mockAffirmations)
      updateFormData({
        affirmations: mockAffirmations,
      })

      // Show the affirmations and voice customization
      setShowVoiceCustomization(true)
    } catch (error) {
      console.error("Error generating affirmations:", error)
      setError("Failed to generate affirmations. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCustomOnly = () => {
    updateFormData({ customOnly: !formData.customOnly })
    setError("")
    setShowVoiceCustomization(formData.customOnly ? false : customAffirmations.length > 0)
  }

  const handleAddCustomAffirmation = () => {
    setShowCustomDialog(true)
  }

  const handleAddCustomAffirmationSubmit = () => {
    if (customAffirmation.trim() === "") {
      setError("Please enter an affirmation")
      return
    }

    // Create a new array with all existing affirmations plus the new one
    const newAffirmations = [...customAffirmations, customAffirmation]

    // Update both the local state and the form data
    setCustomAffirmations(newAffirmations)
    updateFormData({
      affirmations: newAffirmations,
    })

    // Reset the input and close the dialog
    setCustomAffirmation("")
    setShowCustomDialog(false)
    setError("")

    // Show voice customization if we have at least one affirmation
    if (newAffirmations.length > 0) {
      setShowVoiceCustomization(true)
    }
  }

  const handleContinueWithCustom = () => {
    if (customAffirmations.length === 0) {
      setError("Please add at least one custom affirmation")
      return
    }

    onNext()
  }

  // Function to speak a single affirmation
  const speakAffirmation = (text, index, withMusic = false) => {
    if (!speechSynthesis) {
      setError("Speech synthesis is not available in your browser")
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
      console.log(`Using voice: ${selectedVoice.name} (${selectedVoice.lang})`)
    } else {
      console.warn(`No matching voice found for ${voiceLanguage}. Using default voice.`)
    }

    // Set pitch (convert from our -10 to 10 scale to 0.1 to 2 scale)
    const pitchValue = Number.parseFloat(formData.voicePitch) || 0
    utterance.pitch = 1 + pitchValue / 10

    // Set rate (convert from our -5 to 5 scale to 0.5 to 2 scale)
    const rateValue = Number.parseFloat(formData.voiceSpeed) || 0
    utterance.rate = 1 + rateValue / 10

    // Set volume to maximum
    utterance.volume = 1.0

    // Debug info
    const debugInfo = {
      text,
      voice: selectedVoice ? selectedVoice.name : "default",
      pitch: utterance.pitch,
      rate: utterance.rate,
      volume: utterance.volume,
      index,
    }
    debugInfoRef.current = debugInfo
    console.log("Speaking:", debugInfo)

    // Set event handlers
    utterance.onstart = () => {
      console.log(`Started speaking affirmation ${index + 1}:`, text)
      setCurrentAffirmationIndex(index)
    }

    utterance.onend = () => {
      console.log(`Finished speaking affirmation ${index + 1}`)

      // If there are more affirmations, speak the next one
      const affirmations = formData.customOnly ? customAffirmations : generatedAffirmations

      if (index < affirmations.length - 1) {
        speakAffirmation(affirmations[index + 1], index + 1, withMusic)
      } else {
        // If we've spoken all affirmations
        if (withMusic && backgroundAudio) {
          // If we're using music, let it continue playing
          // We could implement a repeat of affirmations here if needed
          console.log("All affirmations spoken, music continues")

          // Optional: repeat affirmations if music is still playing
          if (!backgroundAudio.ended) {
            console.log("Repeating affirmations after 10 seconds")
            setTimeout(() => {
              if (isPreviewPlaying && backgroundAudio && !backgroundAudio.ended) {
                speakAffirmation(affirmations[0], 0, true)
              }
            }, 10000) // 10 second pause before repeating
          }
        } else {
          // If no music or finished, stop the preview
          setIsPreviewPlaying(false)
          if (backgroundAudio) {
            backgroundAudio.pause()
          }
        }
      }
    }

    utterance.onerror = (e) => {
      console.log("Speech synthesis error:", e.error || "Unknown error")
      setAudioError(true)
      setIsPlaying(false)
    }

    // Speak the utterance
    speechSynthesis.speak(utterance)
  }

  const playVoicePreview = (withMusic = false) => {
    // Stop any currently playing speech and audio
    stopVoicePreview()

    // Get the affirmations to preview
    const affirmations = formData.customOnly ? customAffirmations : generatedAffirmations

    if (affirmations.length === 0) {
      setError("No affirmations to preview")
      return
    }

    setIsPreviewPlaying(true)

    // If we want to play with music
    if (withMusic) {
      // Create background audio - using a sample track for demo
      // In a real app, this would be the selected music track
      const audio = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3")
      audio.volume = 0.3 // Lower volume for background music

      audio.addEventListener("canplaythrough", () => {
        console.log("Music loaded and ready to play")
        audio.play().catch((err) => {
          console.log("Error playing music:", err.message || "Unknown error")
          setError("Could not play background music. " + (err.message || "Unknown error"))
        })

        // Start speaking the first affirmation after a short delay
        setTimeout(() => {
          speakAffirmation(affirmations[0], 0, true)
        }, 1000)
      })

      audio.addEventListener("error", (e) => {
        console.log("Music playback error:", e.message || "Unknown error")
        setError("Could not play background music. Trying voice only.")
        speakAffirmation(affirmations[0], 0, false)
      })

      audio.addEventListener("ended", () => {
        console.log("Music ended")
        setIsPreviewPlaying(false)
        if (speechSynthesis) {
          speechSynthesis.cancel()
        }
      })

      setBackgroundAudio(audio)
    } else {
      // Voice only - start speaking the first affirmation immediately
      speakAffirmation(affirmations[0], 0, false)
    }
  }

  const stopVoicePreview = () => {
    setIsPreviewPlaying(false)

    // Stop speech synthesis
    if (speechSynthesis) {
      speechSynthesis.cancel()
    }

    // Stop background music
    if (backgroundAudio) {
      backgroundAudio.pause()
      backgroundAudio.currentTime = 0
    }
  }

  return (
    <div className="glass-card p-6">
      <div className="flex space-x-4 mb-6">
        <button
          className={`py-2 px-4 rounded-md ${!formData.customOnly ? "bg-primary text-white" : "bg-secondary-light text-gray-300"}`}
          onClick={() => updateFormData({ customOnly: false })}
        >
          AI Generated
        </button>
        <button
          className={`py-2 px-4 rounded-md ${formData.customOnly ? "bg-primary text-white" : "bg-secondary-light text-gray-300"}`}
          onClick={() => updateFormData({ customOnly: true })}
        >
          Custom Only
        </button>
      </div>

      {error && <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-4 text-red-200">{error}</div>}

      {!formData.customOnly ? (
        <>
          {!showVoiceCustomization ? (
            <>
              <h2 className="text-xl font-semibold mb-4">What area of your life do you want to improve?</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`glass-card p-4 flex flex-col items-center justify-center h-24 transition-colors ${
                      formData.category === category.id ? "border-2 border-primary" : "border border-gray-700"
                    }`}
                    onClick={() => handleCategorySelect(category.id)}
                  >
                    <div className={`mb-2 ${formData.category === category.id ? "text-primary" : "text-gray-400"}`}>
                      {category.icon}
                    </div>
                    <span className={formData.category === category.id ? "text-white" : "text-gray-300"}>
                      {category.name}
                    </span>
                  </button>
                ))}
              </div>

              <h2 className="text-xl font-semibold mb-4">Tell us about your goals</h2>
              <p className="text-gray-300 mb-4">
                Be specific about what you want to manifest. Our AI will create powerful affirmations from your goals.
              </p>

              <div className="mb-6">
                <label htmlFor="goal" className="block text-sm font-medium text-gray-300 mb-2">
                  What specific life goal do you want to achieve?
                </label>
                <textarea
                  id="goal"
                  rows={4}
                  className="input-field"
                  placeholder="Example: I want to become a senior software engineer at a tech company within 1 year."
                  value={formData.goal}
                  onChange={(e) => updateFormData({ goal: e.target.value })}
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button className="btn-primary" onClick={handleGenerateAffirmations} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating Affirmations...
                    </>
                  ) : (
                    "Generate Affirmations"
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-4">Your Generated Affirmations</h2>
              <div className="glass-card p-4 mb-6">
                <ul className="space-y-2">
                  {generatedAffirmations.map((affirmation, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 text-primary mt-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="ml-2">{affirmation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Voice Customization</h3>
                <div className="glass-card p-4 border border-gray-700">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Voice Selection</h4>
                    <select
                      value={formData.voiceType}
                      onChange={(e) => updateFormData({ voiceType: e.target.value })}
                      className="w-full px-3 py-2 bg-transparent border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <optgroup label="English">
                        <option value="en-US-Samantha">Samantha (US)</option>
                        <option value="en-US-Nicky">Nicky (US)</option>
                        <option value="en-US-Organ">Organ (US)</option>
                        <option value="en-GB-Martha">Martha (GB)</option>
                        <option value="en-GB-Reed">Reed (GB)</option>
                        <option value="en-GB-Sandy">Sandy (GB)</option>
                        <option value="en-IE-Moira">Moira (IE)</option>
                      </optgroup>
                      <optgroup label="Spanish">
                        <option value="es-ES-Monica">Mónica (Spain)</option>
                        <option value="es-ES-Montse">Montse (Spain)</option>
                        <option value="es-ES-Reed">Reed (Spain)</option>
                        <option value="es-ES-Rocko">Rocko (Spain)</option>
                        <option value="es-MX-Paulina">Paulina (Mexico)</option>
                        <option value="es-MX-Reed">Reed (Mexico)</option>
                        <option value="es-MX-Rocko">Rocko (Mexico)</option>
                      </optgroup>
                      <optgroup label="French">
                        <option value="fr-FR-Marie">Marie (France)</option>
                        <option value="fr-CA-Reed">Reed (Canada)</option>
                        <option value="fr-CA-Rocko">Rocko (Canada)</option>
                        <option value="fr-FR-Reed">Reed (France)</option>
                        <option value="fr-FR-Rocko">Rocko (France)</option>
                      </optgroup>
                      <optgroup label="German">
                        <option value="de-DE-Martin">Martin (Germany)</option>
                        <option value="de-DE-Reed">Reed (Germany)</option>
                        <option value="de-DE-Rocko">Rocko (Germany)</option>
                        <option value="de-DE-Sandy">Sandy (Germany)</option>
                      </optgroup>
                      <optgroup label="Asian Languages">
                        <option value="zh-CN-LiMu">Li-Mu (Chinese)</option>
                        <option value="zh-TW-Meijia">Meijia (Taiwanese)</option>
                        <option value="ja-JP-ORen">O-Ren (Japanese)</option>
                        <option value="vi-VN-Linh">Linh (Vietnamese)</option>
                      </optgroup>
                      <optgroup label="Other European">
                        <option value="el-GR-Melina">Melina (Greek)</option>
                        <option value="fi-FI-Reed">Reed (Finnish)</option>
                        <option value="fi-FI-Rocko">Rocko (Finnish)</option>
                        <option value="it-IT-Reed">Reed (Italian)</option>
                        <option value="it-IT-Rocko">Rocko (Italian)</option>
                        <option value="ru-RU-Milena">Milena (Russian)</option>
                      </optgroup>
                      <optgroup label="Portuguese">
                        <option value="pt-BR-Luciana">Luciana (Brazil)</option>
                        <option value="pt-BR-Reed">Reed (Brazil)</option>
                        <option value="pt-BR-Rocko">Rocko (Brazil)</option>
                      </optgroup>
                      <optgroup label="Arabic">
                        <option value="ar-001-Majed">Majed (Modern Standard)</option>
                      </optgroup>
                      <optgroup label="Nordic">
                        <option value="nb-NO-Nora">Nora (Norwegian)</option>
                      </optgroup>
                    </select>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">
                      Voice Pitch <span className="text-gray-400 text-xs">{formData.voicePitch || "Normal"}</span>
                    </h4>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="1"
                      value={formData.voicePitch || "0"}
                      onChange={(e) => updateFormData({ voicePitch: e.target.value })}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Lower</span>
                      <span>Normal</span>
                      <span>Higher</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">
                      Speaking Rate <span className="text-gray-400 text-xs">{formData.voiceSpeed || "Normal"}</span>
                    </h4>
                    <input
                      type="range"
                      min="-5"
                      max="5"
                      step="1"
                      value={formData.voiceSpeed || "0"}
                      onChange={(e) => updateFormData({ voiceSpeed: e.target.value })}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Slower</span>
                      <span>Normal</span>
                      <span>Faster</span>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-4">
                    <button
                      onClick={() => playVoicePreview(false)}
                      className="flex items-center justify-center px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-md text-primary"
                      disabled={isPreviewPlaying}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Voice Only
                    </button>

                    <button
                      onClick={() => playVoicePreview(true)}
                      className="flex items-center justify-center px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-md text-primary"
                      disabled={isPreviewPlaying}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      With Music
                    </button>

                    {isPreviewPlaying && (
                      <button
                        onClick={stopVoicePreview}
                        className="flex items-center justify-center px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-md text-red-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Stop
                      </button>
                    )}
                  </div>

                  {isPreviewPlaying && (
                    <div className="mt-4 p-2 bg-gray-800 rounded-md">
                      <p className="text-sm text-gray-300">
                        {currentAffirmationIndex >= 0 && generatedAffirmations.length > 0
                          ? `Playing: "${generatedAffirmations[currentAffirmationIndex]}"`
                          : "Playing preview..."}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button className="btn-primary" onClick={onNext}>
                  Continue to Music Selection
                </button>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          {!showVoiceCustomization ? (
            <>
              <h2 className="text-xl font-semibold mb-4">Create Custom Affirmations</h2>
              <p className="text-gray-300 mb-4">
                Add your own custom affirmations to create your subliminal audio track.
              </p>

              <button className="btn-secondary flex items-center mb-6" onClick={handleAddCustomAffirmation}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h
5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Affirmation
              </button>

              {showCustomDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="glass-card p-6 max-w-md w-full">
                    <h3 className="text-xl font-semibold mb-4">Add Custom Affirmation</h3>
                    <textarea
                      rows={4}
                      className="input-field mb-4"
                      placeholder="Enter your affirmation here..."
                      value={customAffirmation}
                      onChange={(e) => setCustomAffirmation(e.target.value)}
                    ></textarea>
                    <div className="flex justify-end space-x-2">
                      <button className="btn-secondary" onClick={() => setShowCustomDialog(false)}>
                        Cancel
                      </button>
                      <button className="btn-primary" onClick={handleAddCustomAffirmationSubmit}>
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="glass-card p-4 mb-6">
                <h3 className="text-lg font-medium mb-4">Your Custom Affirmations</h3>

                {customAffirmations.length === 0 ? (
                  <p className="text-gray-400">No custom affirmations added yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {customAffirmations.map((affirmation, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0 h-6 w-6 text-primary mt-0.5">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="ml-2">{affirmation}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-4">
                  <button
                    className="text-sm text-primary hover:text-primary-light flex items-center"
                    onClick={handleAddCustomAffirmation}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add custom affirmation
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  className="btn-primary"
                  onClick={() => setShowVoiceCustomization(true)}
                  disabled={customAffirmations.length === 0}
                >
                  Continue to Voice Customization
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mb-4">Your Custom Affirmations</h2>
              <div className="glass-card p-4 mb-6">
                <ul className="space-y-2">
                  {customAffirmations.map((affirmation, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 h-6 w-6 text-primary mt-0.5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="ml-2">{affirmation}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Voice Customization</h3>
                <div className="glass-card p-4 border border-gray-700">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">Voice Selection</h4>
                    <select
                      value={formData.voiceType}
                      onChange={(e) => updateFormData({ voiceType: e.target.value })}
                      className="w-full px-3 py-2 bg-transparent border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <optgroup label="English">
                        <option value="en-US-Samantha">Samantha (US)</option>
                        <option value="en-US-Nicky">Nicky (US)</option>
                        <option value="en-US-Organ">Organ (US)</option>
                        <option value="en-GB-Martha">Martha (GB)</option>
                        <option value="en-GB-Reed">Reed (GB)</option>
                        <option value="en-GB-Sandy">Sandy (GB)</option>
                        <option value="en-IE-Moira">Moira (IE)</option>
                      </optgroup>
                      <optgroup label="Spanish">
                        <option value="es-ES-Monica">Mónica (Spain)</option>
                        <option value="es-ES-Montse">Montse (Spain)</option>
                        <option value="es-ES-Reed">Reed (Spain)</option>
                        <option value="es-ES-Rocko">Rocko (Spain)</option>
                        <option value="es-MX-Paulina">Paulina (Mexico)</option>
                        <option value="es-MX-Reed">Reed (Mexico)</option>
                        <option value="es-MX-Rocko">Rocko (Mexico)</option>
                      </optgroup>
                      <optgroup label="French">
                        <option value="fr-FR-Marie">Marie (France)</option>
                        <option value="fr-CA-Reed">Reed (Canada)</option>
                        <option value="fr-CA-Rocko">Rocko (Canada)</option>
                        <option value="fr-FR-Reed">Reed (France)</option>
                        <option value="fr-FR-Rocko">Rocko (France)</option>
                      </optgroup>
                      <optgroup label="German">
                        <option value="de-DE-Martin">Martin (Germany)</option>
                        <option value="de-DE-Reed">Reed (Germany)</option>
                        <option value="de-DE-Rocko">Rocko (Germany)</option>
                        <option value="de-DE-Sandy">Sandy (Germany)</option>
                      </optgroup>
                      <optgroup label="Asian Languages">
                        <option value="zh-CN-LiMu">Li-Mu (Chinese)</option>
                        <option value="zh-TW-Meijia">Meijia (Taiwanese)</option>
                        <option value="ja-JP-ORen">O-Ren (Japanese)</option>
                        <option value="vi-VN-Linh">Linh (Vietnamese)</option>
                      </optgroup>
                      <optgroup label="Other European">
                        <option value="el-GR-Melina">Melina (Greek)</option>
                        <option value="fi-FI-Reed">Reed (Finnish)</option>
                        <option value="fi-FI-Rocko">Rocko (Finnish)</option>
                        <option value="it-IT-Reed">Reed (Italian)</option>
                        <option value="it-IT-Rocko">Rocko (Italian)</option>
                        <option value="ru-RU-Milena">Milena (Russian)</option>
                      </optgroup>
                      <optgroup label="Portuguese">
                        <option value="pt-BR-Luciana">Luciana (Brazil)</option>
                        <option value="pt-BR-Reed">Reed (Brazil)</option>
                        <option value="pt-BR-Rocko">Rocko (Brazil)</option>
                      </optgroup>
                      <optgroup label="Arabic">
                        <option value="ar-001-Majed">Majed (Modern Standard)</option>
                      </optgroup>
                      <optgroup label="Nordic">
                        <option value="nb-NO-Nora">Nora (Norwegian)</option>
                      </optgroup>
                    </select>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">
                      Voice Pitch <span className="text-gray-400 text-xs">{formData.voicePitch || "Normal"}</span>
                    </h4>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="1"
                      value={formData.voicePitch || "0"}
                      onChange={(e) => updateFormData({ voicePitch: e.target.value })}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Lower</span>
                      <span>Normal</span>
                      <span>Higher</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2">
                      Speaking Rate <span className="text-gray-400 text-xs">{formData.voiceSpeed || "Normal"}</span>
                    </h4>
                    <input
                      type="range"
                      min="-5"
                      max="5"
                      step="1"
                      value={formData.voiceSpeed || "0"}
                      onChange={(e) => updateFormData({ voiceSpeed: e.target.value })}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>Slower</span>
                      <span>Normal</span>
                      <span>Faster</span>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-4">
                    <button
                      onClick={() => playVoicePreview(false)}
                      className="flex items-center justify-center px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-md text-primary"
                      disabled={isPreviewPlaying}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Voice Only
                    </button>

                    <button
                      onClick={() => playVoicePreview(true)}
                      className="flex items-center justify-center px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-md text-primary"
                      disabled={isPreviewPlaying}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      With Music
                    </button>

                    {isPreviewPlaying && (
                      <button
                        onClick={stopVoicePreview}
                        className="flex items-center justify-center px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-md text-red-500"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-2"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Stop
                      </button>
                    )}
                  </div>

                  {isPreviewPlaying && (
                    <div className="mt-4 p-2 bg-gray-800 rounded-md">
                      <p className="text-sm text-gray-300">
                        {currentAffirmationIndex >= 0 && customAffirmations.length > 0
                          ? `Playing: "${customAffirmations[currentAffirmationIndex]}"`
                          : "Playing preview..."}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <button className="btn-primary" onClick={onNext}>
                  Continue to Music Selection
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

