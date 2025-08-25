import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { findUserAudios } from "@/server/models/audio"

export async function GET(request) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }


    // Get user's audio tracks
    const audios = await findUserAudios(session.user.id)

    if (!audios || !Array.isArray(audios)) {
      console.error("Invalid audios result:", audios)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch audio tracks - invalid response format",
        },
        { status: 500 },
      )
    }

    // Format the response
    const formattedAudios = audios.map((audio) => ({
      id: audio._id.toString(),
      name: audio.name,
      category: audio.category,
      affirmations: audio.affirmations,
      musicTrack: audio.musicTrack,
      voiceType: audio.voiceType,
      voiceName: audio.voiceName,
      voiceLanguage: audio.voiceLanguage,
      voicePitch: audio.voicePitch,
      voiceSpeed: audio.voiceSpeed,
      volume: audio.volume,
      audioUrl: audio.audioUrl,
      repetitionInterval: audio.repetitionInterval,
      frequencyUrl: audio.frequencyUrl || null,
      frequencyVolume: audio.frequencyVolume || 0.5,
      createdAt: audio.createdAt,
      updatedAt: audio.updatedAt,
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
        message: "Failed to fetch audio tracks",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

