"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Plus, Play, Pause, Pencil, Trash2, MusicIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDuration } from "@/lib/music-tracks"

export default function MusicPage() {
  const { user, requireAuth } = useAuth()
  const router = useRouter()
  const [music, setMusic] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null)
  const [audioElement, setAudioElement] = useState(null)

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== "admin") {
      router.push("/dashboard")
    }

    const fetchTracks = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/admin/music")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        if (data.success) {
          setMusic(data.tracks || [])
        } else {
          throw new Error(data.message || "Failed to fetch music tracks")
        }
      } catch (e) {
        setError(e.message)
        console.error("Could not fetch music:", e)
        toast({
          title: "Error",
          description: `Failed to load music tracks: ${e.message}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTracks()

    return () => {
      if (audioElement) {
        audioElement.pause()
        setAudioElement(null)
      }
    }
  }, [user, router])

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this track?")) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/admin/music/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      setMusic(music.filter((item) => item._id !== id))
      toast({
        title: "Success",
        description: "Music track deleted successfully!",
      })
    } catch (e) {
      setError(e.message)
      toast({
        title: "Error",
        description: "Failed to delete music track.",
        variant: "destructive",
      })
      console.error("Could not delete music:", e)
    } finally {
      setLoading(false)
    }
  }

  const handlePlayPreview = (track) => {
    try {
      // If we're already playing this track, stop it
      if (currentlyPlaying && currentlyPlaying._id === track._id) {
        audioElement.pause()
        setCurrentlyPlaying(null)
        setAudioElement(null)
        return
      }

      // If we're playing a different track, stop the current one
      if (audioElement) {
        audioElement.pause()
      }

      // Create a new audio element
      const audio = new Audio(track.path)

      // Add event listeners
      audio.addEventListener("ended", () => {
        setCurrentlyPlaying(null)
        setAudioElement(null)
      })

      // Play the audio
      audio.play().catch((err) => {
        console.error("Error playing audio:", err)
        toast({
          title: "Playback Error",
          description: `Failed to play audio: ${err.message}`,
          variant: "destructive",
        })
      })

      // Update state
      setCurrentlyPlaying(track)
      setAudioElement(audio)
    } catch (error) {
      console.error("Error handling audio playback:", error)
      toast({
        title: "Playback Error",
        description: `Audio playback error: ${error.message}`,
        variant: "destructive",
      })
    }
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-900/30 border border-red-500 rounded-md p-4 mb-4 text-red-200">
          <h3 className="text-lg font-semibold mb-2">Error</h3>
          <p>{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Music Library</h1>
        <Link href="/dashboard/music/new">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Music
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading music tracks...</span>
        </div>
      ) : music.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <MusicIcon className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">No music tracks found</h3>
            <p className="text-gray-400 mb-6">Add your first track to get started</p>
            <Link href="/dashboard/music/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Music
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {music.map((track) => (
            <Card key={track._id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gray-800 p-4 flex items-center">
                  <div
                    className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4 cursor-pointer"
                    onClick={() => handlePlayPreview(track)}
                  >
                    {currentlyPlaying && currentlyPlaying._id === track._id ? (
                      <Pause className="h-6 w-6 text-primary" />
                    ) : (
                      <Play className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg truncate">{track.name}</h3>
                    <p className="text-gray-400 text-sm truncate">{track.artist || "Unknown Artist"}</p>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <Badge variant="outline" className="capitalize">
                      {track.category || "Uncategorized"}
                    </Badge>
                    {/* <span className="text-sm text-gray-400">{formatDuration(track.duration || 0)}</span> */}
                  </div>

                  <div className="flex justify-between mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/music/${track._id}/edit`)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(track._id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

