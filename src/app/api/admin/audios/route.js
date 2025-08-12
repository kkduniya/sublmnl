import { NextResponse } from "next/server"
import { connectToDatabase } from "@/server/db"

export async function GET(request) {
  try {
    // In a real app, you would get the user ID from the session
    // For now, we'll use a placeholder user ID
    const userId = "user123" // Replace with actual user ID from session

    // Connect to the database
    const db = await connectToDatabase()

    // Fetch user's audio tracks
    const audios = await db.collection("audios").find({ userId }).sort({ createdAt: -1 }).toArray()

    // Transform the data for the response
    const formattedAudios = audios.map((audio) => ({
      id: audio._id.toString(),
      name: audio.name,
      createdAt: audio.createdAt,
      voiceType: audio.voiceType,
      voiceLanguage: audio.voiceLanguage,
      audioUrl: audio.audioUrl,
    }))

    return NextResponse.json({
      success: true,
      audios: formattedAudios,
    })
  } catch (error) {
    console.error("Error fetching user audios:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user audios",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

