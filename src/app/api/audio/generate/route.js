import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import path from "path"
import fs from "fs"
import { v4 as uuidv4 } from "uuid"

export async function POST(request) {
  try {
    // Check authentication (make it optional for development)
    let session
    try {
      session = await getServerSession(authOptions)
    } catch (error) {
      console.warn("Authentication error:", error.message)
      // Continue without authentication for now
    }

    // Parse request body
    const body = await request.json()
    const { musicTrackUrl, affirmations, voiceSettings } = body

    // Validate inputs
    if (!affirmations || !Array.isArray(affirmations) || affirmations.length === 0) {
      return NextResponse.json({ success: false, message: "Missing or invalid affirmations" }, { status: 400 })
    }

    if (!musicTrackUrl) {
      return NextResponse.json({ success: false, message: "Missing music track URL" }, { status: 400 })
    }

    // Validate musicTrackUrl (basic validation)
    let validatedUrl
    try {
      // Fix relative URLs by prepending the host
      if (musicTrackUrl.startsWith("/")) {
        // Get host from request headers
        const host = request.headers.get("host") || "localhost:3000"
        const protocol = host.includes("localhost") ? "http" : "https"
        validatedUrl = `${protocol}://${host}${musicTrackUrl}`
      } else {
        // For absolute URLs, just validate them
        validatedUrl = new URL(musicTrackUrl).toString()
      }
    } catch (error) {
      console.error("URL validation error:", error)
      return NextResponse.json({ success: false, message: "Invalid URL: " + error.message }, { status: 400 })
    }

    // Create temporary directory for processing if it doesn't exist
    const tempDir = path.join(process.cwd(), "public", "temp")
    try {
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true })
      }
    } catch (error) {
      console.error("Error creating temp directory:", error)
      // Continue anyway, we'll handle file operations with try/catch
    }

    // Generate a unique ID for this audio
    const audioId = uuidv4()

    // For now, since we're not actually generating a combined audio file,
    // we'll just return the original music track URL for demonstration
    // In a real implementation, you would process the audio here

    // Just return mock success response with the input URL
    let publicUrl

    // For security, if it's an external URL, we should proxy it or download it and serve it locally
    if (validatedUrl.startsWith("http")) {
      publicUrl = validatedUrl
    } else {
      // For local files
      publicUrl = `/temp/${audioId}.mp3`
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({
      success: true,
      audioUrl: publicUrl,
      message: "Audio generation simulated successfully",
    })
  } catch (error) {
    console.error("Error generating audio:", error)
    return NextResponse.json({ success: false, message: "Failed to generate audio: " + error.message }, { status: 500 })
  }
}

