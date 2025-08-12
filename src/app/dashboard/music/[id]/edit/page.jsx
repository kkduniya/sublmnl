"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, Loader2, Music } from "lucide-react"
import Link from "next/link"
import { formatDuration } from "@/lib/music-tracks"
import React from "react" // Add this import

export default function EditMusicPage({ params }) {
  // Use React.use() to unwrap the params Promise
  const unwrappedParams = React.use(params)
  const { id } = unwrappedParams

  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    artist: "",
    category: "relaxation",
  })
  const [file, setFile] = useState(null)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard")
    }
  }, [user, router])

  // Fetch the track data
  useEffect(() => {
    const fetchTrack = async () => {
      try {
        setIsLoading(true)
        setError("")

        const response = await fetch(`/api/admin/music/${id}`)

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()

        if (data.success && data.track) {
          setCurrentTrack(data.track)
          setFormData({
            name: data.track.name || "",
            artist: data.track.artist || "",
            category: data.track.category || "relaxation",
          })
        } else {
          throw new Error(data.message || "Failed to fetch track")
        }
      } catch (err) {
        console.error("Error fetching track:", err)
        setError(err.message || "Failed to fetch track")
        toast({
          title: "Error",
          description: `Failed to fetch track: ${err.message}`,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchTrack()
    }
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (value) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      // Check if file is an audio file
      if (!selectedFile.type.startsWith("audio/")) {
        setError("Please select an audio file (MP3, WAV, etc.)")
        return
      }

      // Check file size (limit to 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB")
        return
      }

      setFile(selectedFile)
      setError("")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name) {
      setError("Track name is required")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name)
      formDataToSend.append("artist", formData.artist)
      formDataToSend.append("category", formData.category)

      // Only append file if a new one was selected
      if (file) {
        formDataToSend.append("file", file)
      }

      const response = await fetch(`/api/admin/music/${id}`, {
        method: "PUT",
        body: formDataToSend,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || `Error: ${response.status}`)
      }

      const data = await response.json()

      toast({
        title: "Success",
        description: "Music track updated successfully!",
      })

      router.push("/dashboard/music")
    } catch (error) {
      console.error("Update error:", error)
      setError(error.message || "Failed to update music track")
      toast({
        title: "Error",
        description: error.message || "Failed to update music track",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading track data...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <Link href="/dashboard/music" className="flex items-center text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Music Library
        </Link>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Music Track</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-6 text-red-200">{error}</div>}

          {currentTrack && (
            <div className="mb-6 p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                  <Music className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Current Track</h3>
                  <p className="text-sm text-gray-400">
                    {formatDuration(currentTrack.duration || 0)} • {currentTrack.path}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Track Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter track name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="artist">Artist</Label>
                <Input
                  id="artist"
                  name="artist"
                  value={formData.artist}
                  onChange={handleChange}
                  placeholder="Enter artist name (optional)"
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relaxation">Relaxation</SelectItem>
                    <SelectItem value="focus">Focus</SelectItem>
                    <SelectItem value="sleep">Sleep</SelectItem>
                    <SelectItem value="meditation">Meditation</SelectItem>
                    <SelectItem value="motivation">Motivation</SelectItem>
                    <SelectItem value="energy">Energy</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="file">Replace Audio File (Optional)</Label>
                <div className="mt-1">
                  <label
                    htmlFor="file"
                    className="flex items-center justify-center w-full h-32 px-4 transition bg-gray-800 border-2 border-gray-700 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-500 focus:outline-none"
                  >
                    <span className="flex flex-col items-center space-y-2">
                      {file ? (
                        <>
                          <Upload className="w-6 h-6 text-primary" />
                          <span className="font-medium text-gray-300">
                            {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-gray-400" />
                          <span className="font-medium text-gray-400">
                            Drop a new file to replace the current audio or click to browse
                          </span>
                        </>
                      )}
                    </span>
                    <input
                      id="file"
                      name="file"
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  Leave empty to keep the current audio file. Supported formats: MP3, WAV, OGG. Maximum file size: 10MB
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/music")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Track"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

