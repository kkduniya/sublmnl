"use client"

import { useEffect, useRef, useState } from "react"
import { AlertCircle, Music2, Plus } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import AudioCard from "@/components/audio/AudioCard"
import BottomPlayer from "@/components/audio/BottomPlayer"

export default function AllTracksSection() {
  const [audios, setAudios] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentAudio, setCurrentAudio] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioError, setAudioError] = useState("")
  const [fetchError, setFetchError] = useState("")
  const [favorites, setFavorites] = useState({})
  const [musicVolume, setMusicVolume] = useState(1.0)
  const [frequencyVolume, setFrequencyVolume] = useState(0.5)

  const audioPlayerRef = useRef(null)

  useEffect(() => {
    fetchAudios()

    const savedFavorites = localStorage.getItem("audioFavorites")
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (e) {
        console.error("Error loading favorites:", e)
      }
    }

    const savedMusicVolume = localStorage.getItem("musicVolume")
    if (savedMusicVolume) {
      setMusicVolume(Number.parseFloat(savedMusicVolume))
    }
  }, [])

  const fetchAudios = async () => {
    try {
      setIsLoading(true)
      setFetchError("")
      const response = await fetch("/api/user/audios")
      if (!response.ok) throw new Error(`Failed to fetch audios: ${response.status}`)
      const data = await response.json()
      if (data.success) {
        setAudios(data.audios || [])
      } else {
        setFetchError(data.message || "Failed to fetch audio tracks")
      }
    } catch (error) {
      console.error("Error fetching audios:", error)
      setFetchError(error.message || "Failed to fetch audio tracks")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePlay = (audio, index) => {
    try {
      setAudioError("")
      if (currentAudio && currentAudio.id === audio.id) {
        setIsPlaying(!isPlaying)
      } else {
        setCurrentAudio(audio)
        setCurrentIndex(index)
        setIsPlaying(true)
      }
    } catch (error) {
      console.error("Audio control error:", error)
      setAudioError("Playback error")
      setIsPlaying(false)
    }
  }

  const handleNext = () => {
    if (!audios.length) return
    const nextIndex = (currentIndex + 1) % audios.length
    const nextAudio = audios[nextIndex]
    setCurrentAudio(nextAudio)
    setCurrentIndex(nextIndex)
    setIsPlaying(true)
  }

  const handlePrevious = () => {
    if (!audios.length) return
    const prevIndex = (currentIndex - 1 + audios.length) % audios.length
    const prevAudio = audios[prevIndex]
    setCurrentAudio(prevAudio)
    setCurrentIndex(prevIndex)
    setIsPlaying(true)
  }

  const toggleFavorite = (audio) => {
    const newFavorites = { ...favorites }
    if (newFavorites[audio.id]) {
      delete newFavorites[audio.id]
    } else {
      newFavorites[audio.id] = true
    }
    setFavorites(newFavorites)
    localStorage.setItem("audioFavorites", JSON.stringify(newFavorites))
  }

  const handleDownload = (audio) => {
    const link = document.createElement("a")
    link.href = audio.audioUrl || audio.filePath
    link.download = `${audio.name}.mp3`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleMusicVolumeChange = (volume) => {
    setMusicVolume(volume)
    localStorage.setItem("musicVolume", volume.toString())
  }

  return (
    <div className="w-full">
      {fetchError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{fetchError}</AlertDescription>
        </Alert>
      )}

      {audioError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Playback Error</AlertTitle>
          <AlertDescription>
            Audio playback is not available. Please check your audio file or try again later.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : audios.length === 0 ? (
        <div className="text-center py-16 bg-gray-900/30 rounded-lg">
          <Music2 className="h-12 w-12 mx-auto text-gray-500 mb-4" />
          <h3 className="text-xl font-medium text-gray-300 mb-2">No audio tracks yet</h3>
          <p className="text-gray-400 mb-6">Create your first subliminal audio track to get started</p>
          <Button onClick={() => (window.location.href = "/create")}>Create Your First Audio</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {audios.map((audio, index) => (
            <AudioCard
              key={audio.id || audio._id}
              audio={audio}
              isPlaying={isPlaying && currentAudio && currentAudio.id === audio.id}
              isActive={currentAudio && currentAudio.id === audio.id}
              onPlay={() => handlePlay(audio, index)}
              onDownload={() => handleDownload(audio)}
              onDelete={fetchAudios}
              onNameUpdate={fetchAudios}
            />
          ))}
        </div>
      )}

      {currentAudio && (
        <BottomPlayer
          ref={audioPlayerRef}
          audioUrl={currentAudio.audioUrl || currentAudio.filePath}
          frequencyUrl={currentAudio.frequencyUrl}
          frequencyVolume={currentAudio.frequencyVolume || frequencyVolume}
          onFrequencyVolumeChange={setFrequencyVolume}
          title={currentAudio.name}
          category={currentAudio.category || "General"}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onToggleFavorite={() => toggleFavorite(currentAudio)}
          isFavorite={!!favorites[currentAudio.id]}
          onDownload={() => handleDownload(currentAudio)}
          affirmations={currentAudio.affirmations || []}
          isPlaying={isPlaying}
          onPlayPause={setIsPlaying}
          musicVolume={musicVolume}
          onMusicVolumeChange={handleMusicVolumeChange}
          affirmationsVolume={currentAudio.volume || 0.2}
          repetitionInterval={currentAudio.repetitionInterval || 20}
          voiceSettings={{
            voice: null,
            pitch: 1.0,
            rate: 1.0,
            voiceLanguage: currentAudio.voiceLanguage || "en-US",
            voicePitch: 1,
            voiceSpeed: currentAudio.voiceSpeed || 1.0,
            voiceType: currentAudio.voiceType || "default",
          }}
          onClose={() => setCurrentAudio(null)}
        />
      )}
    </div>
  )
}


