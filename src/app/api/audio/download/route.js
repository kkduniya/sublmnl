import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json()
    const { audioUrl, name, affirmations, voiceSettings, musicTrack } = body

    // Validate inputs
    if (!audioUrl) {
      return NextResponse.json({ success: false, message: "Missing audio URL" }, { status: 400 })
    }

    // Validate URL
    let validatedUrl
    try {
      // Handle both relative and absolute URLs
      if (audioUrl.startsWith("/")) {
        // Get host from request headers
        const host = request.headers.get("host") || "localhost:3000"
        const protocol = host.includes("localhost") ? "http" : "https"
        validatedUrl = `${protocol}://${host}${audioUrl}`
      } else {
        // For absolute URLs, just validate them
        validatedUrl = new URL(audioUrl).toString()
      }
    } catch (error) {
      console.error("URL validation error:", error)
      return NextResponse.json({ success: false, message: "Invalid URL: " + error.message }, { status: 400 })
    }

    // Create a simple response with the validated URL
    // In a real app, you would save this to your MongoDB database
    const audioRecord = {
      id: `audio_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      name: name || "Untitled Audio",
      audioUrl: validatedUrl,
      affirmations: affirmations || [],
      settings: {
        voice: voiceSettings?.voice || "default",
        volume: voiceSettings?.volume || 0.5,
        repetitionInterval: voiceSettings?.repetitionInterval || 10,
      },
      musicTrack: musicTrack,
      createdAt: new Date().toISOString(),
    }

    // Log the record for debugging
    console.log("Audio record created:", audioRecord.id)

    // Return success response with download URL
    return NextResponse.json({
      success: true,
      audioId: audioRecord.id,
      downloadUrl: validatedUrl, // Return the validated URL for direct download
      message: "Audio ready for download",
    })
  } catch (error) {
    console.error("Error processing audio:", error)
    return NextResponse.json({ success: false, message: "Failed to process audio: " + error.message }, { status: 500 })
  }
}

