import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ObjectId } from "mongodb"
import { createAudio } from "@/server/models/audio"

export async function POST(request) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const {
      name,
      affirmations,
      musicTrack,
      voiceType,
      voiceLanguage = "en-US",
      voicePitch,
      voiceSpeed,
      volume = 0.3,
      audioUrl,
      category,
      repetitionInterval,
      voiceName
    } = await request.json()

    // Validate inputs
    if (!affirmations || !Array.isArray(affirmations) || affirmations.length === 0) {
      return NextResponse.json({ success: false, message: "Affirmations are required" }, { status: 400 })
    }

    if (!musicTrack) {
      return NextResponse.json({ success: false, message: "Music track is required" }, { status: 400 })
    }

    // Validate URL if provided
    if (audioUrl && typeof audioUrl === "string") {
      try {
        // Test if it's a valid URL
        new URL(audioUrl)
      } catch (e) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid audio URL provided",
            error: e.message,
          },
          { status: 400 },
        )
      }
    }

    // Validate music track URL
    if (musicTrack && musicTrack.audioUrl) {
      try {
        new URL(musicTrack.audioUrl)
      } catch (e) {
        // If invalid, try to use path instead
        if (musicTrack.path) {
          try {
            new URL(musicTrack.path)
          } catch (pathError) {
            return NextResponse.json(
              {
                success: false,
                message: "Invalid music track URL",
                error: pathError.message,
              },
              { status: 400 },
            )
          }
        } else {
          return NextResponse.json(
            {
              success: false,
              message: "Invalid music track URL",
              error: e.message,
            },
            { status: 400 },
          )
        }
      }
    }

    // Create audio record in database
    const audioData = {
      userId: new ObjectId(session.user.id),
      name: name || `${musicTrack.name} Affirmations`,
      affirmations,
      musicTrack: {
        id: musicTrack.id,
        name: musicTrack.name,
        path: musicTrack.audioUrl || musicTrack.path || "",
        duration: musicTrack.duration || 0,
        category: musicTrack.category || "Music",
      },
      voiceType,
      voiceLanguage,
      voicePitch: Number.parseFloat(voicePitch || 0),
      voiceSpeed: Number.parseFloat(voiceSpeed || 0),
      voiceName,
      volume,
      audioUrl: audioUrl || musicTrack.audioUrl, // Use provided audioUrl or fallback to music track URL
      category: category || "General",
      repetitionInterval: repetitionInterval || 10,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const createdAudio = await createAudio(audioData)

    return NextResponse.json({
      success: true,
      audio: {
        ...createdAudio,
        id: createdAudio._id.toString(),
      },
    })
  } catch (error) {
    console.error("Error saving audio:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save audio",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

