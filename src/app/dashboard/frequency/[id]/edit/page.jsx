"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, Loader2, Waves } from "lucide-react"
import Link from "next/link"
import { formatDuration } from "@/lib/music-tracks"

const AREA_OPTIONS = ["Career", "Relationships", "Health", "Wealth", "Overall"]

export default function EditFrequencyPage({ params }) {
  const { id } = use(params)
  const { user } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    audioName: "",
    area: "none",
    description: "",
  })
  const [file, setFile] = useState(null)
  const [currentFrequency, setCurrentFrequency] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [usedAreas, setUsedAreas] = useState([])

  // Only admin can access
  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/dashboard")
    }
  }, [user, router])

  // Fetch frequency data + used areas
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError("")

        // fetch current frequency
        const res = await fetch(`/api/admin/frequency/${id}`)
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
        const data = await res.json()
        if (!data.success || !data.audio) throw new Error(data.message || "Failed to fetch frequency")

        setCurrentFrequency(data.audio)
        setFormData({
          audioName: data.audio.audioName || "",
          area: data.audio.area || "none",
          description: data.audio.description || "",
        })

        // fetch all frequencies to check taken areas
        // fetch all frequencies to check taken areas
        const resAll = await fetch("/api/admin/frequency")
        const dataAll = await resAll.json()
        if (dataAll.success) {
          const taken = dataAll.audios
            .filter((f) => f._id !== id && f.area && f.area !== "none")
            .map((f) => f.area)
          setUsedAreas(taken)
        }
      } catch (err) {
        console.error("Fetch error:", err)
        setError(err.message)
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    if (id) fetchData()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAreaChange = (value) => {
    setFormData((prev) => ({ ...prev, area: value }))
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      if (!selectedFile.type.startsWith("audio/")) {
        setError("Please select a valid audio file (MP3, WAV, etc.)")
        return
      }
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
    
    // Reset error state
    setError("")
    
    // Validation
    if (!formData.audioName?.trim()) {
      setError("Audio name is required")
      return
    }
    
    // Validate file if provided
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB")
        return
      }
      if (!file.type.startsWith("audio/")) {
        setError("Please select a valid audio file")
        return
      }
    }

    setIsSubmitting(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("audioName", formData.audioName)
      formDataToSend.append("area", formData.area || "none")
      formDataToSend.append("description", formData.description)
      if (file) formDataToSend.append("file", file)

      const response = await fetch(`/api/admin/frequency/${id}`, {
        method: "PUT",
        body: formDataToSend,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || `Update failed with status: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message || "Update failed")
      }

      toast({
        title: "Success",
        description: "Frequency audio updated successfully!",
      })
      router.push("/dashboard/frequency")
    } catch (error) {
      console.error("Update error:", error)
      const errorMessage = error.message || "Failed to update frequency audio"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
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
        <span className="ml-2">Loading frequency audio...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto sm:p-6">
      <div className="mb-8">
        <Link href="/dashboard/frequency" className="flex items-center text-primary hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Frequencies
        </Link>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Frequency Audio</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-6 text-red-200">{error}</div>}

          {currentFrequency && (
            <div className="mb-6 p-2 sm:p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center">
                <div className="min-w-12 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                  <Waves className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Current Frequency</h3>
                  <p className="text-sm text-gray-400 break-all">
                    {formatDuration(currentFrequency.duration || 0)} • {currentFrequency.path}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="audioName">Audio Name *</Label>
                <Input
                  id="audioName"
                  name="audioName"
                  value={formData.audioName}
                  onChange={handleChange}
                  placeholder="Enter frequency audio name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="area">Selected Area</Label>
                <Select value={formData.area} onValueChange={handleAreaChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {AREA_OPTIONS.map((area) => (
                      <SelectItem
                        key={area}
                        value={area}
                        disabled={usedAreas.includes(area) && formData.area !== area}
                      >
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-400 mt-1">
                  Only one audio per area is allowed. "None" means no area restriction.
                </p>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter frequency description (optional)"
                />
              </div>

              <div>
                <Label htmlFor="file">Replace Audio File (Optional)</Label>
                <div className="mt-1">
                  <label
                    htmlFor="file"
                    className="flex items-center justify-center w-full h-32 px-4 transition bg-gray-800 border-2 border-gray-700 border-dashed rounded-md cursor-pointer hover:border-gray-500"
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
                            Drop a new file or click to browse
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
                  Leave empty to keep current file. Supported: MP3, WAV, OGG. Max size: 10MB
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/frequency")}
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
                  "Update Frequency"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
