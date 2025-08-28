"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, Loader2 } from "lucide-react"
import Link from "next/link"

const AREA_OPTIONS = ["Career", "Relationships", "Health", "Wealth", "Overall"]

export default function NewFrequencyPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: "",
    area: "none", // default None
    description: "",
  })
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const [usedAreas, setUsedAreas] = useState([])

  // Redirect if not admin
  if (user && user.role !== "admin") {
    router.push("/dashboard")
    return null
  }

  useEffect(() => {
    // Fetch existing frequencies to check used areas
    const fetchUsedAreas = async () => {
      try {
        const res = await fetch("/api/admin/frequency")
        const data = await res.json()
        if (data.success) {
          const taken = data.audios
            .map((f) => f.area)
            .filter((a) => a && a !== "none")
          setUsedAreas(taken)
        }
      } catch (err) {
        console.error("Failed to fetch used areas:", err)
      }
    }
    fetchUsedAreas()
  }, [])

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
        setError("Please select an audio file (MP3, WAV, etc.)")
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
    if (!formData.name?.trim()) {
      setError("Frequency name is required")
      return
    }
    if (!file) {
      setError("Please select an audio file")
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      return
    }
    if (!file.type.startsWith("audio/")) {
      setError("Please select a valid audio file")
      return
    }

    setIsUploading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name)
      formDataToSend.append("area", formData.area)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("file", file)

      const response = await fetch("/api/admin/frequency", {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.message || `Upload failed with status: ${response.status}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.message || "Upload failed")
      }

      toast({
        title: "Success",
        description: "Frequency uploaded successfully!",
      })

      router.push("/dashboard/frequency")
    } catch (error) {
      console.error("Upload error:", error)
      const errorMessage = error.message || "Failed to upload frequency"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <Link
          href="/dashboard/frequency"
          className="flex items-center text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Frequency Library
        </Link>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Frequency</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-md p-3 mb-6 text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Frequency Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter frequency name"
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
                        disabled={usedAreas.includes(area)}
                      >
                        {area}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-400 mt-1">
                  You can assign only one audio per area. "None" means no area
                  restriction.
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
                <Label htmlFor="file">Audio File (MP3, WAV) *</Label>
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
                            {file.name} (
                            {(file.size / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-gray-400" />
                          <span className="font-medium text-gray-400">
                            Drop file or click to browse
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
                      required
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isUploading}
                className="w-full md:w-auto"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Frequency
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
