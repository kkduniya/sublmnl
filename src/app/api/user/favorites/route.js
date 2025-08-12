import { NextResponse } from "next/server"
import { connectToDatabase } from "@/server/db"
import { ObjectId } from "mongodb"

export async function GET(request) {
  try {
    // In a real app, you would get the user ID from the session
    // For now, we'll use a placeholder user ID
    const userId = "user123" // Replace with actual user ID from session

    // Connect to the database
    const db = await connectToDatabase()

    // First, get the user to find their favorite audio IDs
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) })

    if (!user || !user.favoriteAudios || user.favoriteAudios.length === 0) {
      return NextResponse.json({
        success: true,
        audios: [],
      })
    }

    // Convert string IDs to ObjectId if needed
    const favoriteIds = user.favoriteAudios.map((id) => (typeof id === "string" ? new ObjectId(id) : id))

    // Fetch the favorite audios
    const audios = await db
      .collection("audios")
      .find({ _id: { $in: favoriteIds } })
      .sort({ createdAt: -1 })
      .toArray()

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
    console.error("Error fetching favorite audios:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch favorite audios",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

