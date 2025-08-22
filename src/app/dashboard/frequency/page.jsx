"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"
import { Plus, Play, Pause, Pencil, Trash2, Activity, Loader2, Waves } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function FrequencyPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [frequencies, setFrequencies] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null)
  const [audioElement, setAudioElement] = useState(null)

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== "admin") {
      router.push("/dashboard")
    }

    const fetchFrequencies = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/admin/frequency")
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

        const data = await response.json()
        if (data.success) {
          setFrequencies(data.audios || [])
        } else {
          throw new Error(data.message || "Failed to fetch frequencies")
        }
      } catch (e) {
        setError(e.message)
        console.error("Could not fetch frequencies:", e)
        toast({
          title: "Error",
          description: `Failed to load frequencies: ${e.message}`,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchFrequencies()

    return () => {
      if (audioElement) {
        audioElement.pause()
        setAudioElement(null)
      }
    }
  }, [user, router])

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this frequency?")) return

    try {
      const response = await fetch(`/api/admin/frequency/${id}`, {
        method: "DELETE",
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
      }

      setFrequencies(frequencies.filter((item) => item._id !== id))
      toast({
        title: "Success",
        description: "Frequency deleted successfully!",
      })
    } catch (e) {
      console.error("Delete error:", e)
      toast({
        title: "Error",
        description: e.message || "Failed to delete frequency.",
        variant: "destructive",
      })
    }
  }

  const handlePlayPreview = (frequency) => {
    try {
      if (currentlyPlaying && currentlyPlaying._id === frequency._id) {
        audioElement.pause()
        setCurrentlyPlaying(null)
        setAudioElement(null)
        return
      }

      if (audioElement) audioElement.pause()

      const audio = new Audio(frequency.path)

      audio.addEventListener("ended", () => {
        setCurrentlyPlaying(null)
        setAudioElement(null)
      })

      audio.play().catch((err) => {
        toast({
          title: "Playback Error",
          description: `Failed to play audio: ${err.message}`,
          variant: "destructive",
        })
      })

      setCurrentlyPlaying(frequency)
      setAudioElement(audio)
    } catch (error) {
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
        <h1 className="text-3xl font-bold">Frequency Library</h1>
        <Link href="/dashboard/frequency/new">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="mr-2 h-4 w-4" />
            Add Frequency
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading frequencies...</span>
        </div>
      ) : frequencies.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <Activity className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">No frequencies found</h3>
            <p className="text-gray-400 mb-6">Add your first frequency to get started</p>
            <Link href="/dashboard/frequency/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Frequency
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {frequencies.map((frequency) => (
            <Card key={frequency._id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-gray-800 p-4 flex items-center">
                  <div
                    className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4 cursor-pointer"
                    onClick={() => handlePlayPreview(frequency)}
                  >
                    {currentlyPlaying && currentlyPlaying._id === frequency._id ? (
                      <Pause className="h-6 w-6 text-primary" />
                    ) : (
                      <Play className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-lg truncate">{frequency.audioName}</h3>
                    <p className="text-gray-400 text-sm truncate">
                      {frequency.area ? frequency.area : "None"}
                    </p>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <Badge variant="outline" className="capitalize">
                      {frequency.area ? frequency.area : "None"}
                    </Badge>
                  </div>

                  <div className="flex justify-between mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/frequency/${frequency._id}/edit`)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(frequency._id)}>
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
