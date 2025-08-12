import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { getUserAudioSettings, updateUserAudioSettings } from "@/server/models/userSettings"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(request) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions)
    // if (!session) {
    //   return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    // }

    // const userId = session.user.id

    // Get user's audio settings
    const settings = await getUserAudioSettings(null)

    // If no settings found, get default settings from admin
    if (!settings) {
      return NextResponse.json({
        success: true,
        settings: {
          musicVolume: 1.0,
          affirmationsVolume: 0.6,
          repetitionInterval: 10,
          speed:1
        },
      })
    }

    return NextResponse.json({
      success: true,
      settings: {
        musicVolume: settings.musicVolume,
        affirmationsVolume: settings.affirmationsVolume,
        repetitionInterval: settings.repetitionInterval,
        speed:settings.speed,
      },
    })
  } catch (error) {
    console.error("Error fetching user audio settings:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while fetching audio settings" },
      { status: 500 },
    )
  }
}

export async function POST(request) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get settings from request body
    const { musicVolume, affirmationsVolume, repetitionInterval ,speed } = await request.json()

    // Validate settings
    if (musicVolume === undefined || affirmationsVolume === undefined || repetitionInterval === undefined || speed === undefined) {
      return NextResponse.json({ success: false, message: "Missing required settings" }, { status: 400 })
    }

    // Update user audio settings
    let result = await updateUserAudioSettings(userId, {
      musicVolume: Number.parseFloat(musicVolume),
      affirmationsVolume: Number.parseFloat(affirmationsVolume),
      repetitionInterval: Number.parseInt(repetitionInterval),
      speed:Number.parseInt(speed),
    })

    

    // Check if the operation was successful
    if (!result.acknowledged) {
      return NextResponse.json(
        {
          success: false,
          message: "Database operation was not acknowledged",
        },
        { status: 500 },
      )
    }

    // Determine if it was an update or insert
    const operationType =
      result.upsertedCount > 0 ? "inserted" : result.modifiedCount > 0 ? "updated" : "no changes needed"

    return NextResponse.json({
      success: true,
      message: `Audio settings ${operationType} successfully`,
      result: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        upsertedCount: result.upsertedCount,
        upsertedId: result.upsertedId ? result.upsertedId.toString() : null,
      },
    })
  } catch (error) {
    console.error("Error updating user audio settings:", error)
    return NextResponse.json(
      { success: false, message: "An error occurred while updating audio settings" },
      { status: 500 },
    )
  }
}

