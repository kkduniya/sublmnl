"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NewMusicPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    artist: "",
    category: "relaxation",
  })
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")

  // Check if user is admin
  if (user && user.role !== "admin") {
    router.push("/dashboard")
    return null
  }

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

    if (!file) {
      setError("Please select an audio file")
      return
    }

    setIsUploading(true)
    setError("")

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name)
      formDataToSend.append("artist", formData.artist)
      formDataToSend.append("category", formData.category)
      formDataToSend.append("file", file)

      const response = await fetch("/api/admin/music", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || `Error: ${response.status}`)
      }

      const data = await response.json()

      toast({
        title: "Success",
        description: "Music track uploaded successfully!",
      })

      router.push("/dashboard/music")
    } catch (error) {
      console.error("Upload error:", error)
      setError(error.message || "Failed to upload music track")
      toast({
        title: "Error",
        description: error.message || "Failed to upload music track",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
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
          <CardTitle>Add New Music Track</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-6 text-red-200">{error}</div>}

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
                <Label htmlFor="file">Audio File (MP3, WAV) *</Label>
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
                          <span className="font-medium text-gray-400">Drop files to upload or click to browse</span>
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
                      required
                    />
                  </label>
                </div>
                <p className="mt-2 text-sm text-gray-400">Supported formats: MP3, WAV, OGG. Maximum file size: 10MB</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isUploading} className="w-full md:w-auto">
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Track
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

